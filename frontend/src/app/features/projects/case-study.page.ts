import { Component, RESPONSE_INIT, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { ContentApi } from '../../core/api/content.api';
import { NotFoundPage } from '../../core/layout/not-found.page';
import { DEFAULT_DESCRIPTION, SeoService } from '../../core/seo/seo.service';
import { CaseStudyView } from './case-study-view';

/** API momentanément indisponible : 503 + Retry-After, jamais `noindex` (la page existe). */
@Component({
  selector: 'app-unavailable',
  imports: [RouterLink],
  template: `
    <h1 i18n>Contenu momentanément indisponible</h1>
    <p i18n>Réessayez dans quelques instants.</p>
    <a routerLink="/" i18n>Retour au départ</a>
  `,
  styles: `
    :host { display: flex; flex-direction: column; align-items: flex-start; gap: var(--s-5); padding: var(--s-9) var(--margin); }
    a { display: inline-flex; align-items: center; min-height: var(--target); }
  `,
})
export class Unavailable {
  constructor() {
    const init = inject(RESPONSE_INIT, { optional: true });
    if (init) {
      init.status = 503;
      init.headers = new Headers(init.headers);
      init.headers.set('Retry-After', '30');
    }
  }
}

/** Étude de cas `projets/:slug` (DESIGN §10.1). Fiche courte ou slug inconnu : 404 (NotFoundPage) ; API en échec : 503 (Unavailable). */
@Component({
  selector: 'app-case-study',
  imports: [CaseStudyView, NotFoundPage, Unavailable],
  template: `
    @if (view(); as v) {
      <app-case-study-view [project]="v" />
    } @else if (view() === null) {
      <app-not-found />
    } @else if (down()) {
      <app-unavailable />
    }
  `,
})
export class CaseStudyPage {
  private readonly api = inject(ContentApi);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private readonly title = inject(Title);
  // Requête émise dès le constructeur (et non dans un effet) : la réponse SSR du TransferState est alors réutilisée à l'hydratation, sans page blanche.
  private readonly project = toSignal(
    inject(ActivatedRoute).paramMap.pipe(
      map((p) => p.get('slug') ?? ''),
      switchMap((slug) => this.api.project(slug).pipe(catchError(() => of('down' as const)))),
    ),
  );

  /** `undefined` = chargement ; `null` = 404 (slug inconnu ou fiche courte). */
  protected readonly view = computed(() => {
    const p = this.project();
    if (p === undefined || p === 'down') return undefined;
    return p?.caseStudy ? p : null;
  });
  protected readonly down = computed(() => this.project() === 'down');

  constructor() {
    effect(() => {
      const v = this.view();
      if (this.down()) {
        const t = $localize`Contenu momentanément indisponible`;
        this.title.setTitle(t);
        this.seo.update(this.router.url, DEFAULT_DESCRIPTION, false, t);
        return;
      }
      if (v === undefined) return;
      const title = v ? (v.metaTitle ?? `${v.title}, Enzo Leveque`) : $localize`Page introuvable`;
      this.title.setTitle(title);
      this.seo.update(this.router.url, v ? (v.metaDescription ?? v.pitch) : DEFAULT_DESCRIPTION, !v, title);
    });
  }
}
