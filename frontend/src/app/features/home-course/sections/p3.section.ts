import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Contributions, ProjectSummary } from '../../../core/api/api.models';
import { ContributionsGraph } from '../../../shared/contributions/contributions';
import { Clip } from '../../../shared/clip/clip';
import { Reveal } from '../../../shared/reveal/reveal';
import { CAPTURES } from '../project-index/project-index';

/** P3 (km 58,2), terrain accent : les projets nés de la course en parcours vertical, une étape par projet. */
@Component({
  selector: 'app-p3-section',
  imports: [RouterLink, DatePipe, Clip, Reveal, ContributionsGraph],
  template: `
    <section id="p3" class="terrain-accent" aria-labelledby="p3-title">
      <header appReveal>
        <span class="km" i18n>P3 · km 58,2</span>
        <h2 id="p3-title" i18n>Nés de la course</h2>
      </header>
      @if (steps(); as list) {
        <ol class="path">
          @for (r of list; track r.p.slug; let i = $index) {
            <li [class.short]="!r.study" [appReveal]="i + 1">
              <span class="dot" aria-hidden="true"></span>
              <article>
                <h3>
                  @if (r.study) {
                    <a class="study" [routerLink]="['/projets', r.p.slug]">{{ r.p.title }}</a>
                  } @else if (r.p.repoUrl) {
                    <a [href]="r.p.repoUrl" rel="noopener">{{ r.p.title }}</a>
                  } @else {
                    {{ r.p.title }}
                  }
                </h3>
                <p class="pitch">{{ r.p.pitch }}</p>
                @if (r.p.commits || r.p.lastPushAt) {
                  <p class="activity">
                    @if (r.p.commits) {
                      <span i18n>{r.p.commits, plural,
                        =1 {1 commit}
                        other {{{ r.p.commits }} commits}
                      }</span>
                    }
                    @if (r.p.lastPushAt) {
                      <span i18n>dernier push {{ r.p.lastPushAt | date: 'mediumDate' }}</span>
                    }
                  </p>
                }
                @if (r.study) {
                  @if (r.p.video) {
                    <app-clip [video]="r.p.video" [autoplay]="false" />
                  } @else if (r.shot) {
                    <img [src]="r.shot" alt="" loading="lazy" />
                  }
                }
                <p class="links">
                  @if (r.study) {
                    <a [routerLink]="['/projets', r.p.slug]" i18n>Étude de cas</a>
                  }
                  @if (r.p.demoUrl) {
                    <a [href]="r.p.demoUrl" rel="noopener" i18n>En ligne</a>
                  }
                  @if (r.p.repoUrl) {
                    <a [href]="r.p.repoUrl" rel="noopener" i18n>Code</a>
                  }
                </p>
              </article>
            </li>
          }
        </ol>
      } @else {
        <p class="unavailable" i18n>Contenu indisponible pour le moment.</p>
      }
      <app-contributions [data]="contributions()" />
    </section>
  `,
  styles: `
    section {
      display: flex;
      flex-direction: column;
      gap: var(--s-5);
      padding: var(--s-10) var(--margin) var(--s-8);
    }
    header {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: var(--s-3) var(--s-5);
      margin-block-end: var(--s-5);
    }
    .km {
      color: var(--ink);
      font: 800 clamp(1.75rem, 4vw, 2.5rem) / 0.9 var(--font-display);
      font-stretch: 72%;
      font-variant-numeric: tabular-nums;
    }
    h2 {
      margin: 0;
      font-family: var(--font-display);
      font-size: var(--t-display);
    }
    .path {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--s-8);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .path::before {
      content: '';
      position: absolute;
      inset-block: 0.5rem 0;
      inset-inline-start: 0.5rem;
      width: 2px;
      background: var(--line-muted);
    }
    li {
      position: relative;
      display: grid;
      grid-template-columns: 2rem minmax(0, 1fr);
    }
    .dot {
      position: absolute;
      inset-block-start: 0.5rem;
      inset-inline-start: 0.25rem;
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 50%;
      background: var(--accent);
    }
    article {
      grid-column: 2;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--s-3);
      max-width: 52rem;
    }
    h3 {
      margin: 0;
      font-family: var(--font-display);
      font-size: var(--t-lead);
    }
    h3 a {
      color: var(--ink);
    }
    .short h3 {
      font-size: var(--t-body);
    }
    .unavailable {
      margin: 0;
    }
    .pitch {
      margin: 0;
      color: var(--ink-2);
    }
    .activity {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-1) var(--s-3);
      margin: 0;
      color: var(--ink-2);
      font-variant-numeric: tabular-nums;
    }
    .activity span + span::before {
      content: '· ';
    }
    article img,
    app-clip {
      width: 100%;
      height: auto;
    }
    .links {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-2) var(--s-5);
      margin: 0;
    }
    a:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 3px;
    }
  `,
})
export class P3Section {
  readonly contributions = input<Contributions | null>(null);
  /** `null` = API en échec. */
  readonly projects = input<ProjectSummary[] | null>(null);
  readonly items = computed(() => this.projects()?.filter((p) => p.stage === 'P3') ?? null);
  /** `null` si l'API échoue ou si aucun projet P3 : message « indisponible ». */
  protected readonly steps = computed(() =>
    this.items()?.length
      ? this.items()!.map((p) => ({
          p,
          study: p.tier === 'CASE_STUDY',
          shot: CAPTURES[p.slug] ?? null,
        }))
      : null,
  );
}
