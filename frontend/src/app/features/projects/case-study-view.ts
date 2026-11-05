import { DatePipe, DecimalPipe, NgComponentOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectSummary } from '../../core/api/api.models';
import { Clip } from '../../shared/clip/clip';
import { Reveal } from '../../shared/reveal/reveal';
import { formatKm } from '../home-course/course-progress';
import { CHECKPOINTS } from '../home-course/profile.data';
import { diagramFor, diagramTitle } from './diagrams/diagrams';
import { WorldlineTimeline } from './worldline-timeline';
import { DecisionCard } from '../../shared/decision-card/decision-card';
import { WORLDLINE_GATEWAY } from '../home-course/content/decision';

const SEGMENTS = {
  P1: $localize`Segment : les fondations`,
  P2: $localize`Segment : Worldline`,
  P3: $localize`Segment : projets nés de la course`,
} as const;

/** Gabarit d'une étude de cas (DESIGN §10.1), partagé par la page publique et l'aperçu de l'admin. Exige `project.caseStudy`. */
@Component({
  selector: 'app-case-study-view',
  imports: [RouterLink, DatePipe, DecimalPipe, NgComponentOutlet, Clip, Reveal, WorldlineTimeline, DecisionCard],
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
          @if (v.p.slug === 'trading-app') {
            <img class="logo" src="img/worldline.svg" alt="Worldline" width="196" height="20" />
          }
          <h1>{{ v.p.title }}</h1>
          <p class="lead">{{ v.p.pitch }}</p>
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
        @if (v.p.slug === 'trading-app') {
          <app-worldline-timeline class="timeline" />
        }
      </div>
      @if (v.p.video && v.p.video.height <= v.p.video.width) {
        <app-clip id="clip" class="clipwrap" [video]="v.p.video" />
      }
    </div>

    @if (v.p.slug === 'trading-app') {
    <section class="blk" aria-labelledby="h-mis" appReveal>
      <div class="wrap grid">
        <h2 id="h-mis" i18n>Missions</h2>
            <ul class="txt facts">
              <li i18n>Plateforme TOM (Trade Order Management) : elle reçoit, contrôle et transmet aux marchés les ordres de bourse de clients comme Boursorama et Copartis.</li>
              <li i18n>Prototype move2cloud : l'émetteur d'ordres rendu abstrait pour passer de MySQL à une file RabbitMQ, avec des ordres sérialisés en XML.</li>
              <li i18n>Post-marché Copartis : refonte des batchs de fin de journée, paramétrés par place de marché (Europe, États-Unis, Asie), pour intégrer les retours de marché tardifs.</li>
              <li i18n>Contrôles pré-trade Boursorama : trois contrôles (cohérence de prix, collars, présence bid/ask) rendus désactivables par client, testés en JUnit.</li>
              <li i18n>Portail d'administration multi-clients en JavaScript : statut des marchés en temps réel, internationalisation FR/EN.</li>
            </ul>
      </div>
      <div class="wrap">
        <app-decision-card [decision]="worldlineDecision" />
      </div>
    </section>
    }

    <section class="blk" aria-labelledby="h-ctx" appReveal>
      <div class="wrap grid">
        <h2 id="h-ctx" i18n>Contexte et contraintes</h2>
        <div class="txt">
          <p>{{ v.c.problem }}</p>
          @if (v.c.wall?.trim()) {
            <p>{{ v.c.wall }}</p>
          }
        </div>
      </div>
    </section>

    @if (v.c.decisions.length) {
    <section class="blk" aria-labelledby="h-dec" appReveal>
      <div class="wrap grid">
        <h2 id="h-dec" i18n>Décision et alternative écartée</h2>
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
    }

    @if (diagram(); as d) {
      <section class="blk" aria-labelledby="h-arch">
        <div class="wrap grid">
          <h2 id="h-arch">{{ diagramTitle(v.p.slug) }}</h2>
          <div class="diagram-wrap"><ng-container [ngComponentOutlet]="d" /></div>
        </div>
      </section>
    }

    @if (v.c.contribution?.trim()) {
      <section class="blk" aria-labelledby="h-own" appReveal>
        <div class="wrap grid">
          <h2 id="h-own" i18n>Ce que j'ai porté</h2>
          <div class="txt"><p>{{ v.c.contribution }}</p></div>
        </div>
      </section>
    }

    @if (v.c.takeaway?.trim()) {
      <section class="blk" aria-labelledby="h-res" appReveal>
        <div class="wrap grid">
          <h2 id="h-res" i18n>Résultat</h2>
          <div class="txt"><p>{{ v.c.takeaway }}</p></div>
        </div>
      </section>
    }

    @if (v.c.hindsight?.trim()) {
      <section class="blk" aria-labelledby="h-redo" appReveal>
        <div class="wrap grid">
          <h2 id="h-redo" i18n>Ce que je referais</h2>
          <div class="txt"><p>{{ v.c.hindsight }}</p></div>
        </div>
      </section>
    }

    @if (v.c.repos.length || v.p.demoUrl || v.p.video) {
      <section class="blk" aria-labelledby="h-code">
        <div class="wrap grid">
          <h2 id="h-code" i18n>Code</h2>
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
          </div>
        </div>
      </section>
    }

    <div class="wrap">
      <a class="cta" routerLink="/" fragment="arrivee" i18n>Me contacter</a>
    </div>
    }
  `,
})
export class CaseStudyView {
  protected readonly worldlineDecision = WORLDLINE_GATEWAY;
  readonly project = input.required<ProjectSummary>();
  protected readonly view = computed(() => {
    const p = this.project();
    if (!p.caseStudy) return null;
    const id = p.stage?.toLowerCase() as keyof typeof CHECKPOINTS | undefined;
    const stage = p.stage && id ? { id, label: $localize`${p.stage} · km ${formatKm(CHECKPOINTS[id])}`, segment: SEGMENTS[p.stage] } : null;
    return { p, c: p.caseStudy, stage };
  });
  protected readonly diagram = computed(() => diagramFor(this.project().slug));
  protected readonly diagramTitle = diagramTitle;
}
