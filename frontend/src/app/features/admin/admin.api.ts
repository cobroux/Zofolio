import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ProjectSummary, SportYear } from '../../core/api/api.models';

/** Miroir de plan-v3 §3. Admin en français seul : aucun texte ici n'est marqué `i18n`. */
export type Tr = Record<string, string>;
export interface Decision { title: string; tradeoff: string }
export interface VideoAdmin { name: string; mp4: string | null; poster: string | null; width: number | null; height: number | null; caption: Tr }
export interface ProjectAdmin {
  slug: string | null; tier: string | null; stage: string | null; sortOrder: number | null;
  title: Tr; pitch: Tr; aiTag: string | null; stack: string[]; duration: Tr | null; note: Tr | null;
  githubRepos: string[]; demoUrl: string | null; metaTitle: Tr | null; metaDescription: Tr | null;
  role: Tr | null; problem: Tr | null; decisions: Record<string, Decision[]> | null; wall: Tr | null;
  takeaway: Tr | null; aiNote: Tr | null; video: VideoAdmin | null;
}
export interface RaceAdmin {
  id: number | null; kind: string; date: string | null; name: Tr; distanceKm: number | null; elevationGainM: number | null;
  durationS: number | null; note: Tr | null; personalRecord: boolean; sortOrder: number | null;
}
export interface MediaAdmin { id: number; url: string; kind: 'IMAGE' | 'VIDEO'; contentType: string; bytes: number; width: number | null; height: number | null; createdAt: string; usedBy: string[] }
export interface GithubRepoAdmin { name: string; pushedAt: string | null; commits: number | null; languages: string[]; projects: string[] }

export interface Problem {
  status: number;
  code: string;
  errors: { field: string; code: string }[];
  reason: string | null;
  /** Secondes (en-tête `Retry-After`). */
  retryAfter: number | null;
}

/** Normalise une erreur HTTP : le front traduit par `code`, jamais le `detail` anglais. */
export function problem(e: unknown): Problem {
  const h = e instanceof HttpErrorResponse ? e : null;
  const b = (h?.error ?? {}) as { code?: string; errors?: Problem['errors']; reason?: string };
  const status = h?.status ?? 0;
  const retry = Number(h?.headers.get('Retry-After'));
  return {
    status,
    // 413 : Caddy coupe avant le back (corps > 6 Mo), sans ProblemDetail
    code: status === 413 ? 'MEDIA_REJECTED' : (b.code ?? (status === 0 ? 'NETWORK' : 'INTERNAL_ERROR')),
    errors: b.errors ?? [],
    reason: status === 413 ? 'SIZE' : (b.reason ?? null),
    retryAfter: retry > 0 ? retry : null,
  };
}

/** Appels admin (même origine ; l'intercepteur XSRF natif d'HttpClient envoie `X-XSRF-TOKEN`). */
@Injectable({ providedIn: 'root' })
export class AdminApi {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  /** Brouillon gardé en mémoire de page si la session expire (jamais `localStorage`). */
  readonly drafts = new Map<string, unknown>();
  /** Session confirmée par la garde (pilote la navigation du shell). */
  readonly authed = signal(false);

  session = () => this.http.get<{ authenticated: boolean }>('/api/admin/session').pipe(map((s) => s.authenticated));
  login = (password: string) => this.http.post<void>('/api/admin/login', { password }).pipe(catchError((e: unknown) => throwError(() => problem(e))));
  logout = () => this.http.post<void>('/api/admin/logout', null);

  projects = () => this.call(this.http.get<ProjectAdmin[]>('/api/admin/projects'));
  project = (slug: string) => this.call(this.http.get<ProjectAdmin>(`/api/admin/projects/${encodeURIComponent(slug)}`));
  createProject = (p: ProjectAdmin) => this.call(this.http.post<ProjectAdmin>('/api/admin/projects', p));
  saveProject = (slug: string, p: ProjectAdmin) => this.call(this.http.put<ProjectAdmin>(`/api/admin/projects/${encodeURIComponent(slug)}`, p));
  preview = (lang: 'fr' | 'en', p: ProjectAdmin) => this.call(this.http.post<ProjectSummary>(`/api/admin/preview/${lang}/project`, p));
  githubRepos = () => this.call(this.http.get<GithubRepoAdmin[]>('/api/admin/github-repos'));

  races = () => this.call(this.http.get<RaceAdmin[]>('/api/admin/races'));
  saveRace = (r: RaceAdmin) => this.call(r.id === null ? this.http.post<RaceAdmin>('/api/admin/races', r) : this.http.put<RaceAdmin>(`/api/admin/races/${r.id}`, r));
  deleteRace = (id: number) => this.call(this.http.delete<void>(`/api/admin/races/${id}`));

  sportYears = () => this.call(this.http.get<SportYear[]>('/api/admin/sport-years'));
  saveSportYear = (y: SportYear) => this.call(this.http.put<SportYear>(`/api/admin/sport-years/${y.year}`, y));
  deleteSportYear = (year: number) => this.call(this.http.delete<void>(`/api/admin/sport-years/${year}`));

  media = () => this.call(this.http.get<MediaAdmin[]>('/api/admin/media'));
  upload = (file: File) => {
    const body = new FormData();
    body.append('file', file);
    return this.call(this.http.post<MediaAdmin>('/api/admin/media', body));
  };
  deleteMedia = (id: number) => this.call(this.http.delete<void>(`/api/admin/media/${id}`));

  /** Session expirée : retour à la connexion, avec l'adresse à retrouver ensuite. Toute erreur sort en `Problem`. */
  private call<T>(req: Observable<T>): Observable<T> {
    return req.pipe(
      catchError((e: unknown) => {
        const p = problem(e);
        if (p.code === 'UNAUTHENTICATED') void this.router.navigate(['/admin/connexion'], { queryParams: { retour: this.router.url, expiree: 1 } });
        return throwError(() => p);
      }),
    );
  }
}
