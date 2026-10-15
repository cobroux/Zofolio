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
          <p class="small" i18n>Voie romaine sur le GR3 : c'est à peu près ici que le trail devient sérieux.</p>
        </div>
        <div class="cards" [appReveal]="2">
          @for (p of cards(); track p.slug; let first = $first) {
            <app-segment-card [project]="p" [large]="first" [class.first]="first" />
          }
        </div>
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
      gap: var(--s-7) var(--gutter);
      padding: var(--s-9) var(--margin);
    }
    .head {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: var(--s-2) var(--s-5);
    }
    .stage {
      color: var(--accent);
      font: 800 clamp(1.75rem, 4vw, 2.5rem) / 0.9 var(--font-display);
      font-stretch: 72%;
    }
    .intro,
    .cards {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
    }
    .master {
      font-size: 1.625rem;
      font-weight: 600;
      line-height: 1.3;
    }
    .small {
      color: var(--ink-2);
      font-size: var(--t-small);
    }
    @media (min-width: 1100px) {
      section {
        grid-template-columns: repeat(12, minmax(0, 1fr));
        padding-block: var(--s-10) var(--s-9);
      }
      .head {
        grid-column: 1 / -1;
      }
      .intro {
        grid-column: 1 / span 5;
      }
      .cards {
        display: grid;
        grid-column: 7 / span 6;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--s-5);
      }
      .cards .first {
        grid-column: 1 / span 2;
      }
    }
  `,
})
export class P1Section {
  readonly home = input<HomeResponse | null | undefined>();
  protected readonly master = computed(() => this.home()?.experiences.find((e) => e.stage === 'P1'));
  protected readonly aid = computed(() => this.home()?.experiences.find((e) => e.stage === 'R1'));
  protected readonly cards = computed(() => this.home()?.projects.filter((p) => p.stage === 'P1') ?? []);
}
