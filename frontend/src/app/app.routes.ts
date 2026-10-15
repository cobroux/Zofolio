import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: $localize`Enzo Leveque, ingénieur fullstack Java / Spring Boot et Angular`,
    loadComponent: () => import('./features/home-course/home.page').then((m) => m.HomePage),
  },
  {
    path: 'mentions-legales',
    title: $localize`Mentions légales, Enzo Leveque`,
    data: { description: $localize`Éditeur, hébergeur, données du formulaire de contact, conservation et droits RGPD.` },
    loadComponent: () => import('./features/legal/legal.page').then((m) => m.LegalPage),
  },
  {
    path: '**',
    data: { noindex: true },
    title: $localize`Page introuvable`,
    loadComponent: () => import('./core/layout/not-found.page').then((m) => m.NotFoundPage),
  },
];
