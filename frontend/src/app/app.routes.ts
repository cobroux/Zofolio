import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: $localize`Enzo Leveque, ingénieur fullstack Java / Spring Boot et Angular`,
    loadComponent: () => import('./features/home-course/home.page').then((m) => m.HomePage),
  },
  {
    path: 'projets/:slug',
    title: $localize`Étude de cas, Enzo Leveque`,
    loadComponent: () => import('./features/projects/case-study.page').then((m) => m.CaseStudyPage),
  },
  {
    path: 'mentions-legales',
    title: $localize`Mentions légales, Enzo Leveque`,
    data: { description: $localize`Éditeur, hébergeur, données du formulaire de contact, conservation et droits RGPD.` },
    loadComponent: () => import('./features/legal/legal.page').then((m) => m.LegalPage),
  },
  {
    path: 'colophon',
    title: $localize`Colophon : comment ce site a été construit`,
    data: { description: $localize`Stack, développement agentique, CI et scores Lighthouse : comment Enzo Leveque a construit son portfolio, sans rien cacher.` },
    loadComponent: () => import('./features/colophon/colophon.page').then((m) => m.ColophonPage),
  },
  // D39 : admin en FR seul (sans marqueur i18n), chargé à la demande, rendu client uniquement (app.routes.server.ts)
  { path: 'admin', loadChildren: () => import('./features/admin/admin.routes') },
  {
    path: '**',
    data: { noindex: true },
    title: $localize`Page introuvable`,
    loadComponent: () => import('./core/layout/not-found.page').then((m) => m.NotFoundPage),
  },
];
