import { HttpClient } from '@angular/common/http';
import { Injectable, LOCALE_ID, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { HomeResponse, ProjectSummary, Race } from './api.models';

/** Lectures du contenu ; toute erreur (réseau, timeout, 404) devient `null` : la section affiche « contenu indisponible ». */
@Injectable({ providedIn: 'root' })
export class ContentApi {
  private readonly http = inject(HttpClient);
  private readonly lang = inject(LOCALE_ID).slice(0, 2);

  home = () => this.get<HomeResponse>('home');
  races = () => this.get<Race[]>('races');
  projects = () => this.get<ProjectSummary[]>('projects');
  /** 404 -> `null` (slug inconnu) ; toute autre erreur (réseau, 5xx, timeout) est propagée : « API indisponible » n'est pas un 404. */
  project = (slug: string) =>
    this.http.get<ProjectSummary>(`/api/${this.lang}/projects/${encodeURIComponent(slug)}`).pipe(
      catchError((e: unknown) => (e instanceof HttpErrorResponse && e.status === 404 ? of(null) : throwError(() => e))),
    );

  private get<T>(path: string): Observable<T | null> {
    return this.http.get<T>(`/api/${this.lang}/${path}`).pipe(catchError(() => of(null)));
  }
}
