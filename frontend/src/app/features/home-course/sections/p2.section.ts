import { Component, computed, input } from '@angular/core';
import { HomeResponse } from '../../../core/api/api.models';
import { Aid } from '../../../shared/aid/aid';
import { Split } from '../../../shared/split/split';

/** P2 (Worldline, km 44, la plus longue étape) suivi du ravitaillement R2. `home` null = API en échec. */
@Component({
  selector: 'app-p2',
  imports: [Aid, Split],
  template: `
    <section id="p2">
      <div class="head">
        <span class="stage d tnum" i18n>P2 · km 44 · la plus longue étape</span>
        <h2 i18n>2,5 ans sur une appli de trading</h2>
      </div>
      <p class="lead" i18n>
        De mars 2023 à septembre 2025, chez Worldline, à Seclin : d'abord développeur back-end, puis développeur fullstack dans une équipe Scrum. Une
        application de trading de titres, où une erreur ne se voit pas dans un log : elle se voit dans un ordre.
      </p>
      @if (home() === null) {
        <p class="unavailable" role="status" i18n>Contenu indisponible pour le moment.</p>
      } @else {
        <ol>
          @for (m of missions(); track m.title) {
            <li>
              <h3>{{ m.title }}</h3>
              <p>{{ m.body }}</p>
              <app-split [duration]="m.period" [stack]="m.stack" [note]="m.note" />
            </li>
          }
        </ol>
      }
    </section>
    <app-aid km="51" [aid]="aid()" />
  `,
  styles: `
    :host {
      display: block;
    }
    section {
      --split-ink: light-dark(#a9b1c3, var(--ink-2));
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--s-8) var(--gutter);
      padding: var(--s-9) var(--margin);
      /* Aplat inversé : encre en clair, surface en sombre (DESIGN §3). */
      background: light-dark(var(--ink), var(--surface));
      color: light-dark(var(--bg), var(--ink));
    }
    .head {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
    }
    .stage {
      color: light-dark(#ff8a2b, var(--accent));
      font: 800 clamp(1.75rem, 4vw, 2.5rem) / 0.9 var(--font-display);
      font-stretch: 72%;
    }
    .lead {
      font-size: var(--t-lead);
      line-height: 1.35;
    }
    ol {
      display: flex;
      flex-direction: column;
      gap: var(--s-7);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
      padding-inline-start: var(--s-6);
    }
    /* Frise : un repère carré par mission sur un trait vertical. */
    li::before {
      content: '';
      position: absolute;
      inset-block: 0 calc(var(--s-7) * -1);
      inset-inline-start: 5px;
      width: 2px;
      background: light-dark(#a9b1c3, var(--line-muted));
    }
    li:last-child::before {
      inset-block-end: 0;
    }
    li::after {
      content: '';
      position: absolute;
      inset-block-start: 0.5em;
      inset-inline-start: 0;
      width: 12px;
      height: 12px;
      background: light-dark(#ff8a2b, var(--accent));
    }
    h3 {
      font-size: 2.75rem;
    }
    @media (min-width: 768px) {
      section {
        min-height: 160svh;
      }
    }
    @media (min-width: 1100px) {
      section {
        grid-template-columns: repeat(12, minmax(0, 1fr));
        align-content: start;
        padding-block: var(--s-10);
      }
      .head {
        grid-column: 1 / -1;
      }
      .head h2 {
        max-width: 12ch;
      }
      .lead {
        grid-column: 1 / span 6;
      }
      ol,
      .unavailable {
        grid-column: 7 / span 6;
      }
    }
  `,
})
export class P2Section {
  readonly home = input<HomeResponse | null | undefined>();
  protected readonly missions = computed(() => this.home()?.experiences.filter((e) => e.stage === 'P2') ?? []);
  protected readonly aid = computed(() => this.home()?.experiences.find((e) => e.stage === 'R2'));
}
