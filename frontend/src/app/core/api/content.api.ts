import { HttpClient } from '@angular/common/http';
import { Injectable, LOCALE_ID, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { HomeResponse, ProjectSummary, Race } from './api.models';

/** Lectures du contenu ; toute erreur (réseau, timeout, 404) devient `null` : la section affiche « contenu indisponible ». */
@Injectable({ providedIn: 'root' })
export class ContentApi {
  private readonly http = inject(HttpClient);
  private readonly lang = inject(LOCALE_ID).slice(0, 2);

  home = () => this.get<HomeResponse>('home');
  races = () => this.get<Race[]>('races');
  projects = () => this.get<ProjectSummary[]>('projects');
  project = (slug: string) => this.get<ProjectSummary>(`projects/${encodeURIComponent(slug)}`);

  private get<T>(path: string): Observable<T | null> {
    return this.http.get<T>(`/api/${this.lang}/${path}`).pipe(catchError(() => of(null)));
  }
}
