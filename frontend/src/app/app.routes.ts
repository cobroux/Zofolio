import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '**',
    data: { noindex: true },
    title: $localize`Page introuvable`,
    loadComponent: () => import('./core/layout/not-found.page').then((m) => m.NotFoundPage),
  },
];
