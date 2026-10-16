import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { catchError, map, of, tap } from 'rxjs';
import { AdminShell } from './admin-shell';
import { AdminApi } from './admin.api';

/** `GET /session` : sans session, retour à la connexion (la liste des écrans n'est jamais montée). */
export const adminGuard: CanActivateFn = () => {
  const api = inject(AdminApi);
  const login = inject(Router).parseUrl('/admin/connexion');
  return api.session().pipe(
    catchError(() => of(false)),
    tap((ok) => api.authed.set(ok)),
    map((ok) => ok || login),
  );
};

const SUFFIX = ' · Zofolio admin';
const page = (title: string, loadComponent: NonNullable<Routes[number]['loadComponent']>) => ({ title: title + SUFFIX, loadComponent });

// `data.noindex` est hérité par les enfants (chemins vides) : le SeoService pose `robots: noindex`.
export default [
  {
    path: '',
    component: AdminShell,
    data: { noindex: true },
    children: [
      { path: 'connexion', ...page('Connexion', () => import('./login.page').then((m) => m.LoginPage)) },
      {
        path: '',
        canActivate: [adminGuard],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'projets' },
          { path: 'projets', ...page('Projets', () => import('./projects/project-list.page').then((m) => m.ProjectListPage)) },
          { path: 'projets/nouveau', ...page('Nouveau projet', () => import('./projects/project-form.page').then((m) => m.ProjectFormPage)) },
          { path: 'projets/:slug', ...page('Projet', () => import('./projects/project-form.page').then((m) => m.ProjectFormPage)) },
          { path: 'courses', ...page('Courses', () => import('./races/race-admin.page').then((m) => m.RaceAdminPage)) },
          { path: 'stats', ...page('Stats', () => import('./stats/sport-year-admin.page').then((m) => m.SportYearAdminPage)) },
          { path: 'medias', ...page('Médias', () => import('./media/media.page').then((m) => m.MediaPage)) },
          { path: '**', redirectTo: 'projets' },
        ],
      },
    ],
  },
] satisfies Routes;
