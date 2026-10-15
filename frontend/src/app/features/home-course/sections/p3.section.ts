import { Component, computed, input } from '@angular/core';
import { ProjectSummary } from '../../../core/api/api.models';
import { AiTag } from '../../../shared/ai-tag/ai-tag';

/** Mosaïque asymétrique 7/5, 5/7, 12 (classes `.m1` à `.m3` cycliques). */
@Component({
  selector: 'app-p3-section',
  imports: [AiTag],
  template: `
    <section id="p3" aria-labelledby="p3-title">
      <header>
        <span class="km" i18n>P3 · km 58,2</span>
        <h2 id="p3-title" i18n>Nés de la course</h2>
      </header>
      @if (items(); as list) {
        @for (p of list; track p.slug; let i = $index) {
          <article [class]="'m' + (i % 3)">
            <div class="head">
              <h3>{{ p.title }}</h3>
              <app-ai-tag [tag]="p.aiTag" />
            </div>
            <p>{{ p.pitch }}</p>
            <p class="stack">{{ p.stack.join(' · ') }}@if (p.commits) { · {{ p.commits }} <ng-container i18n>commits</ng-container> }</p>
            @if (p.repoUrl) {
              <a [href]="p.repoUrl" rel="noopener" i18n>Voir le projet<span class="sr"> {{ p.title }}</span></a>
            }
          </article>
        } @empty {
          <p class="unavailable" i18n>Contenu indisponible pour le moment.</p>
        }
      } @else {
        <p class="unavailable" i18n>Contenu indisponible pour le moment.</p>
      }
    </section>
  `,
  styles: `
    section {
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      gap: var(--s-5) var(--gutter);
      padding: var(--s-10) var(--margin) var(--s-9);
    }
    header {
      grid-column: 1 / -1;
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: var(--s-3) var(--s-5);
    }
    .km {
      font-family: var(--font-display);
      font-variant-numeric: tabular-nums;
      color: var(--accent);
      font-size: var(--t-lead);
    }
    h2 {
      margin: 0;
      font-family: var(--font-display);
      font-size: var(--t-display);
    }
    h3 {
      margin: 0;
      font-family: var(--font-display);
      font-size: clamp(1.75rem, 4vw, 2.75rem);
    }
    article {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--s-3);
      padding: var(--s-5);
      background: var(--surface);
    }
    p {
      margin: 0;
      max-width: 52ch;
    }
    .stack {
      color: var(--ink-2);
      font-size: var(--t-small);
      font-variant-numeric: tabular-nums;
    }
    .head {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: var(--s-3);
      width: 100%;
    }
    a {
      display: inline-flex;
      align-items: center;
      min-height: var(--target);
      color: var(--ink);
    }
    .sr {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
    }
    .unavailable {
      grid-column: 1 / -1;
      color: var(--ink-2);
    }
    @media (min-width: 768px) {
      .m0 { grid-column: span 7; }
      .m1 { grid-column: span 5; }
      .m2 { grid-column: span 12; }
    }
  `,
})
export class P3Section {
  /** `null` = API en échec. */
  readonly projects = input<ProjectSummary[] | null>(null);
  readonly items = computed(() => this.projects()?.filter((p) => p.stage === 'P3') ?? null);
}
