import { DatePipe, DecimalPipe, NgComponentOutlet } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ContentApi } from '../../core/api/content.api';
import { NotFoundPage } from '../../core/layout/not-found.page';
import { DEFAULT_DESCRIPTION, SeoService } from '../../core/seo/seo.service';
import { AiTag } from '../../shared/ai-tag/ai-tag';
import { Clip } from '../../shared/clip/clip';
import { Reveal } from '../../shared/reveal/reveal';
import { formatKm } from '../home-course/course-progress';
import { CHECKPOINTS } from '../home-course/profile.data';
import { diagramFor } from './diagrams/diagrams';

const SEGMENTS = {
  P1: $localize`Segment : les fondations`,
  P2: $localize`Segment : Worldline`,
  P3: $localize`Segment : projets nés de la course`,
} as const;

/** Étude de cas `projets/:slug` (DESIGN §10.1). Fiche courte, slug inconnu ou API en échec : page 404 (statut posé par NotFoundPage). */
@Component({
  selector: 'app-case-study',
  imports: [RouterLink, DatePipe, DecimalPipe, NgComponentOutlet, AiTag, Clip, Reveal, NotFoundPage],
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
        </div>
        @if (v.p.video) {
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
    }
  `,
})
export class CaseStudyPage {
  private readonly api = inject(ContentApi);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private readonly title = inject(Title);
  private readonly slug = toSignal(inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('slug') ?? '')), { requireSync: true });
  private readonly project = rxResource({ params: () => this.slug(), stream: ({ params }) => this.api.project(params) });

  /** `undefined` = chargement ; `null` = 404 (API en échec, slug inconnu ou fiche courte). */
  protected readonly view = computed(() => {
    if (this.project.status() !== 'resolved') return undefined;
    const p = this.project.value();
    if (!p?.caseStudy) return null;
    const id = p.stage?.toLowerCase() as keyof typeof CHECKPOINTS | undefined;
    const stage = p.stage && id ? { id, label: $localize`${p.stage} · km ${formatKm(CHECKPOINTS[id])}`, segment: SEGMENTS[p.stage] } : null;
    return { p, c: p.caseStudy, stage };
  });
  protected readonly diagram = computed(() => diagramFor(this.slug()));

  constructor() {
    effect(() => {
      const v = this.view();
      if (v === undefined) return;
      const title = v ? `${v.p.title}, Enzo Leveque` : $localize`Page introuvable`;
      this.title.setTitle(title);
      this.seo.update(this.router.url, v ? v.p.pitch : DEFAULT_DESCRIPTION, !v, title);
    });
  }
}
