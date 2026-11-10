import { Component, computed, input } from '@angular/core';
import { SportYear } from '../../../core/api/api.models';
import { CountUp } from '../../../shared/count-up/count-up';
import { Reveal } from '../../../shared/reveal/reveal';

const FIRST_YEAR = 2023;
const NUMBER = new Intl.NumberFormat($localize`:@@numberLocale:fr-FR`);
/** Séries secondaires de l'API, dans l'ordre d'affichage. */
const EXTRAS = [
  { key: 'elevationGainM', unit: $localize`m D+` },
  { key: 'hours', unit: $localize`h` },
  { key: 'activities', unit: $localize`sorties` },
] as const;

/** Totaux annuels d'endurance : km en grand avec sa barre, puis D+, heures et sorties. De vraies séries, jamais estimées (spec §6). */
@Component({
  selector: 'app-endurance-twice',
  imports: [CountUp, Reveal],
  template: `
    <div class="endurance">
      <h2 id="endurance-title" appReveal i18n>L'endurance, année après année</h2>
      <ol [appCountUp]="number" aria-labelledby="endurance-title">
        @for (r of rows(); track r.year) {
          <li class="row" [class.now]="r.year === thisYear">
            <p class="yr">
              {{ r.year }}
              @if (r.year === thisYear) {
                <span class="small" i18n>en cours</span>
              }
            </p>
            <div class="cell">
              <span class="val" aria-hidden="true" [attr.data-count]="r.km">{{
                number(r.km)
              }}</span>
              <span class="small"
                ><span class="sr">{{ number(r.km) }} </span>km</span
              >
              <span class="bar km" aria-hidden="true" [style.--k]="r.km / maxKm()"></span>
            </div>
            @if (r.extras.length) {
              <ul class="extras">
                @for (x of r.extras; track x.unit) {
                  <li>
                    @if (x.value !== null) {
                      <b>{{ number(x.value) }}</b> {{ x.unit }}
                    }
                  </li>
                }
              </ul>
            }
          </li>
        }
      </ol>
      <p class="small note" i18n>
        Totaux annuels seulement : ni tracé, ni fréquence cardiaque, ni donnée de santé. Km : course
        et vélo.
      </p>
    </div>
  `,
  styles: `
    .endurance {
      display: flex;
      flex-direction: column;
      gap: var(--s-7);
    }
    h2 {
      margin: 0;
      font-family: var(--font-display);
      font-size: clamp(3rem, 7vw, 6rem);
      text-wrap: balance;
    }
    ol,
    ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    ol {
      display: flex;
      flex-direction: column;
      gap: var(--s-6);
    }
    .row {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--s-3);
    }
    .yr {
      display: flex;
      align-items: baseline;
      gap: var(--s-3);
      margin: 0;
      font: 800 1.5rem / 1 var(--font-display);
      font-stretch: 75%;
    }
    .cell {
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: baseline;
      gap: 0 var(--s-3);
    }
    .val {
      font: 800 clamp(2.25rem, 13vw, 4.5rem) / 0.95 var(--font-display);
      font-stretch: 72%;
      font-variant-numeric: tabular-nums lining-nums;
    }
    .small {
      color: var(--ink-2);
      font-size: var(--t-small);
      font-weight: 400;
    }
    .bar {
      grid-column: 1 / -1;
      height: 8px;
      margin-top: var(--s-2);
      background: var(--ink);
      transform: scaleX(calc(var(--k) * var(--p, 1)));
      transform-origin: left;
    }
    .now .bar {
      background: var(--accent);
    }
    /* Séries secondaires : une ligne sous le km en mobile, des colonnes alignées à droite dès 768 px. */
    .extras {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-1) var(--s-5);
      color: var(--ink-2);
      font-variant-numeric: tabular-nums lining-nums;
    }
    .extras li:empty {
      display: none;
    }
    .extras b {
      color: var(--ink);
      font-weight: 600;
    }
    .note {
      max-width: 60ch;
      margin: 0;
    }
    .sr {
      position: absolute;
      width: 1px;
      height: 1px; /* taste-skill-ignore : masquage visuel pour lecteur d écran */
      overflow: hidden;
      clip-path: inset(50%);
    }
    @media (min-width: 768px) {
      .row {
        grid-template-columns: 6rem minmax(0, 1fr) auto;
        gap: var(--gutter);
        align-items: end;
      }
      .yr {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--s-1);
      }
      .val {
        font-size: clamp(2.5rem, 5vw, 4.5rem);
      }
      .extras {
        display: grid;
        grid-template-columns: 12ch 6ch 11ch;
        gap: var(--gutter);
        text-align: end;
      }
      /* Une valeur absente garde sa colonne vide : les autres restent alignées. */
      .extras li:empty {
        display: block;
      }
    }
  `,
})
export class EnduranceTwice {
  readonly sportYears = input<SportYear[]>([]);
  protected readonly thisYear = new Date().getFullYear();
  protected readonly number = (n: number) => NUMBER.format(n);
  /** Une série entièrement absente retire sa colonne au lieu d'afficher des vides. */
  private readonly extras = computed(() =>
    EXTRAS.filter((x) => this.sportYears().some((y) => y[x.key] !== null)),
  );
  /** De 2023 à l'année courante, chronologique ; une année sans km est retirée. */
  protected readonly rows = computed(() =>
    this.sportYears()
      .filter((y) => y.distanceKm !== null && y.year >= FIRST_YEAR && y.year <= this.thisYear)
      .sort((a, b) => a.year - b.year)
      .map((y) => ({
        year: y.year,
        km: y.distanceKm!,
        extras: this.extras().map((x) => ({ unit: x.unit, value: y[x.key] })),
      })),
  );
  protected readonly maxKm = computed(() => Math.max(1, ...this.rows().map((r) => r.km)));
}
