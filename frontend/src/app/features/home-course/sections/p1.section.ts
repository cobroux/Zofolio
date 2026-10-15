import { Component, computed, input } from '@angular/core';
import { HomeResponse } from '../../../core/api/api.models';
import { Aid } from '../../../shared/aid/aid';
import { Reveal } from '../../../shared/reveal/reveal';
import { SegmentCard } from '../../../shared/segment-card/segment-card';

/** P1 (Les fondations, km 20) suivi du ravitaillement R1. `home` null = API en échec. */
@Component({
  selector: 'app-p1',
  imports: [Aid, Reveal, SegmentCard],
  template: `
    <section id="p1" aria-labelledby="p1-title">
      <div class="head" appReveal>
        <span class="stage d tnum" i18n>P1 · km 20</span>
        <h2 id="p1-title" i18n>Les fondations</h2>
      </div>
      @if (home(); as h) {
        <div class="intro" [appReveal]="1">
          @if (master(); as m) {
            <p class="master">{{ m.title }}</p>
            <p>{{ m.body }}</p>
          }
          @if (studies().length) {
            <ol class="frise" i18n-aria-label aria-label="Études">
              @for (e of studies(); track e.title) {
                <li [style.flex-grow]="e.years">
                  <span class="tnum">{{ e.period }}</span>
                  <span>{{ e.title }}</span>
                </li>
              }
            </ol>
          }
          <p class="small" i18n>Voie romaine sur le GR3 : c'est à peu près ici que le trail devient sérieux.</p>
        </div>
        @for (p of cards(); track p.slug; let i = $index) {
          <app-segment-card [project]="p" [large]="i === 0" [appReveal]="2" />
        }
      } @else if (home() === null) {
        <p class="unavailable" role="status" i18n>Contenu indisponible pour le moment.</p>
      }
    </section>
    <app-aid km="32" [aid]="aid()" />
  `,
  styles: `
    :host {
      display: block;
    }
    section {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--s-5) var(--gutter);
      padding: var(--s-9) var(--margin);
    }
    .head {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: var(--s-2) var(--s-5);
      margin-block-end: var(--s-5);
    }
    .stage {
      color: var(--accent);
      font: 800 clamp(1.75rem, 4vw, 2.5rem) / 0.9 var(--font-display);
      font-stretch: 72%;
    }
    .intro {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
      margin-block-end: var(--s-5);
    }
    .master {
      font-size: 1.625rem;
      font-weight: 600;
      line-height: 1.3;
    }
    p {
      max-width: 52ch;
    }
    /* Mini-frise : un segment par diplôme, longueur proportionnelle à la durée. */
    .frise {
      display: flex;
      gap: var(--s-1);
      margin: var(--s-2) 0;
      padding: 0;
      list-style: none;
      font-size: var(--t-small);
    }
    .frise li {
      flex: 1 1 0;
      display: flex;
      flex-direction: column;
      gap: var(--s-1);
      min-width: 0;
      padding-block-start: var(--s-3);
      border-block-start: 6px solid var(--line-muted);
    }
    .frise li:last-child {
      border-color: var(--accent);
    }
    .frise .tnum {
      font-weight: 600;
    }
    .small {
      color: var(--ink-2);
      font-size: var(--t-small);
    }
    @media (min-width: 768px) {
      section {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .head,
      .intro,
      .large {
        grid-column: 1 / -1;
      }
    }
    /* Desktop : Master et carte principale côte à côte, puis les deux autres cartes ; les rangées s'étirent, pas de vide. */
    @media (min-width: 1100px) {
      section {
        grid-template-columns: repeat(12, minmax(0, 1fr));
        padding-block: var(--s-10) var(--s-9);
      }
      .intro {
        grid-column: 1 / span 5;
        margin-block-end: 0;
        padding-inline-end: var(--s-5);
      }
      .large {
        grid-column: 6 / span 7;
      }
      app-segment-card:not(.large) {
        grid-column: span 6;
      }
    }
  `,
})
export class P1Section {
  readonly home = input<HomeResponse | null | undefined>();
  private readonly education = computed(() => this.home()?.experiences.filter((e) => e.stage === 'P1' && e.kind === 'EDUCATION') ?? []);
  protected readonly master = computed(() => this.education()[0]);
  /** Ordre chronologique ; « 2020-2023 » → 3 ans (sinon 1). */
  protected readonly studies = computed(() =>
    this.education()
      .filter((e) => e.period)
      .map((e) => {
        const [from, to] = (e.period ?? '').split('-').map(Number);
        return { title: e.title, period: e.period, years: to > from ? to - from : 1 };
      })
      .sort((a, b) => (a.period! < b.period! ? -1 : 1)),
  );
  protected readonly aid = computed(() => this.home()?.experiences.find((e) => e.stage === 'R1'));
  protected readonly cards = computed(() => this.home()?.projects.filter((p) => p.stage === 'P1') ?? []);
}
