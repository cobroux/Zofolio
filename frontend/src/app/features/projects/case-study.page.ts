import { DatePipe, DecimalPipe, NgComponentOutlet } from '@angular/common';
import { Component, RESPONSE_INIT, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { ContentApi } from '../../core/api/content.api';
import { NotFoundPage } from '../../core/layout/not-found.page';
import { DEFAULT_DESCRIPTION, SeoService } from '../../core/seo/seo.service';
import { AiTag } from '../../shared/ai-tag/ai-tag';
import { Clip } from '../../shared/clip/clip';
import { Reveal } from '../../shared/reveal/reveal';
import { formatKm } from '../home-course/course-progress';
import { CHECKPOINTS } from '../home-course/profile.data';
import { diagramFor } from './diagrams/diagrams';

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

const SEGMENTS = {
  P1: $localize`Segment : les fondations`,
  P2: $localize`Segment : Worldline`,
  P3: $localize`Segment : projets nés de la course`,
} as const;

/** Étude de cas `projets/:slug` (DESIGN §10.1). Fiche courte ou slug inconnu : 404 (NotFoundPage) ; API en échec : 503 (Unavailable). */
@Component({
  selector: 'app-case-study',
  imports: [RouterLink, DatePipe, DecimalPipe, NgComponentOutlet, AiTag, Clip, Reveal, NotFoundPage, Unavailable],
  styleUrl: './case-study.page.css',
  template: `
    @if (view(); as v) {
      <div class="wrap">
        @if (v.stage; as s) {
          <a class="back" routerLink="/" [fragment]="s.id" i18n>← Retour au parcours ({{ s.label }})</a>
        } @else {
          <a class="back" routerLink="/" i18n>← Retour au parcours</a>
        }
        <div class="hero">
          <div class="pitch">
            <h1>{{ v.p.title }}</h1>
            <p class="lead">{{ v.p.pitch }}</p>
            <app-ai-tag [tag]="v.p.aiTag" />
          </div>
          <aside class="bib" aria-label="Fiche du projet" i18n-aria-label>
            <i></i>
            @if (v.stage; as s) {
              <p class="stage">{{ s.label }}<small>{{ s.segment }}</small></p>
            }
            <dl>
              @if (v.p.duration) {
                <dt i18n>Durée</dt>
                <dd>{{ v.p.duration }}</dd>
              }
              <dt i18n>Rôle</dt>
              <dd>{{ v.c.role }}</dd>
              @if (v.p.commits !== null) {
                <dt i18n>Commits</dt>
                <dd>{{ v.p.commits | number }}</dd>
              }
              @if (v.p.languages.length) {
                <dt i18n>Langages</dt>
                <dd>{{ v.p.languages.join(' · ') }}</dd>
              }
              @if (v.p.lastPushAt) {
                <dt i18n>Dernier push</dt>
                <dd>{{ v.p.lastPushAt | date: 'mediumDate' }}</dd>
              }
              @if (v.p.stack.length) {
                <dt i18n>Stack</dt>
                <dd>{{ v.p.stack.join(' · ') }}</dd>
              }
            </dl>
            @if (v.p.commits !== null || v.p.languages.length) {
              <p class="note" i18n>Commits et langages : synchro GitHub, 6 h.</p>
            }
          </aside>
          @if (v.p.video; as vid) {
            @if (vid.height > vid.width) {
              <app-clip id="clip" class="clipwrap portrait" [video]="vid" />
            }
          }
        </div>
        @if (v.p.video && v.p.video.height <= v.p.video.width) {
          <app-clip id="clip" class="clipwrap" [video]="v.p.video" />
        }
      </div>

      <section class="blk" aria-labelledby="h-pb" appReveal>
        <div class="wrap grid">
          <h2 id="h-pb" i18n>Le problème</h2>
          <div class="txt"><p>{{ v.c.problem }}</p></div>
        </div>
      </section>

      @if (diagram(); as d) {
        <section class="blk" aria-labelledby="h-arch">
          <div class="wrap grid">
            <h2 id="h-arch" i18n>L'architecture</h2>
            <div class="diagram-wrap"><ng-container [ngComponentOutlet]="d" /></div>
          </div>
        </section>
      }

      <section class="blk" aria-labelledby="h-dec" appReveal>
        <div class="wrap grid">
          <h2 id="h-dec" i18n>Les décisions</h2>
          <div class="decisions">
            @for (d of v.c.decisions; track d.title) {
              <article>
                <h3>{{ d.title }}</h3>
                <p class="tradeoff">
                  <b i18n>Compromis :</b> {{ d.tradeoff }}
                </p>
              </article>
            }
          </div>
        </div>
      </section>

      <section class="wall" aria-labelledby="h-wall">
        <div class="wrap grid">
          <p class="km tnum" aria-hidden="true" i18n>km 60</p>
          <div class="txt">
            <h2 id="h-wall" i18n>Le mur du 60e km</h2>
            <p>{{ v.c.wall }}</p>
          </div>
        </div>
      </section>

      <section class="blk" aria-labelledby="h-ret" appReveal>
        <div class="wrap grid">
          <h2 id="h-ret" i18n>Ce que j'en retire</h2>
          <div class="txt">
            <p>{{ v.c.takeaway }}</p>
            @if (v.c.aiNote) {
              <p>{{ v.c.aiNote }}</p>
            }
          </div>
        </div>
      </section>

      <section class="blk" aria-labelledby="h-liens">
        <div class="wrap grid">
          <h2 id="h-liens" i18n>Liens</h2>
          <div class="txt">
            <ul class="links">
              @for (r of v.c.repos; track r.url) {
                <li><a [href]="r.url" rel="noopener" i18n>{{ r.name }} sur GitHub</a></li>
              }
              @if (v.p.demoUrl) {
                <li><a [href]="v.p.demoUrl" rel="noopener" i18n>Voir la démo</a></li>
              }
              @if (v.p.video) {
                <li><a routerLink="." fragment="clip" i18n>Revoir le clip</a></li>
              }
            </ul>
            <a class="cta" routerLink="/" fragment="arrivee" i18n>Me contacter</a>
          </div>
        </div>
      </section>
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
  private readonly slug = toSignal(inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('slug') ?? '')), { requireSync: true });
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
    if (!p?.caseStudy) return null;
    const id = p.stage?.toLowerCase() as keyof typeof CHECKPOINTS | undefined;
    const stage = p.stage && id ? { id, label: $localize`${p.stage} · km ${formatKm(CHECKPOINTS[id])}`, segment: SEGMENTS[p.stage] } : null;
    return { p, c: p.caseStudy, stage };
  });
  protected readonly down = computed(() => this.project() === 'down');
  protected readonly diagram = computed(() => diagramFor(this.slug()));

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
      const title = v ? (v.p.metaTitle ?? `${v.p.title}, Enzo Leveque`) : $localize`Page introuvable`;
      this.title.setTitle(title);
      this.seo.update(this.router.url, v ? (v.p.metaDescription ?? v.p.pitch) : DEFAULT_DESCRIPTION, !v, title);
    });
  }
}
