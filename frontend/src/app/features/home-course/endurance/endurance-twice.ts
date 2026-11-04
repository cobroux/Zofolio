import { Component, computed, input } from '@angular/core';
import { ContributionYear, SportYear } from '../../../core/api/api.models';
import { CountUp } from '../../../shared/count-up/count-up';
import { Reveal } from '../../../shared/reveal/reveal';

const FIRST_YEAR = 2023;
const NUMBER = new Intl.NumberFormat($localize`:@@numberLocale:fr-FR`);

/** Km courus et contributions GitHub, année par année : deux vraies séries, jamais estimées (spec §6). */
@Component({
  selector: 'app-endurance-twice',
  imports: [CountUp, Reveal],
  template: `
    <div class="endurance">
      <h2 id="endurance-title" appReveal i18n>L'endurance, deux fois</h2>
      <ol [appCountUp]="number" aria-labelledby="endurance-title" [style.--cols]="hasKm() && hasCommits() ? 2 : 1">
        @for (r of rows(); track r.year) {
          <li class="row" [class.now]="r.year === thisYear">
            <p class="yr">{{ r.year }}@if (r.year === thisYear) { <span class="small" i18n>en cours</span> }</p>
            @if (hasKm()) {
            <div class="cell">
              @if (r.km !== null) {
                <span class="val" aria-hidden="true" [attr.data-count]="r.km">{{ number(r.km) }}</span>
                <span class="small"><span class="sr">{{ number(r.km) }} </span>km</span>
                <span class="bar km" aria-hidden="true" [style.--k]="r.km / maxKm()"></span>
              }
            </div>
            }
            @if (hasCommits()) {
            <div class="cell">
              @if (r.commits !== null) {
                <span class="val" aria-hidden="true" [attr.data-count]="r.commits">{{ number(r.commits) }}</span>
                <span class="small"><span class="sr">{{ number(r.commits) }} </span><ng-container i18n>contributions GitHub</ng-container></span>
                <span class="bar commits" aria-hidden="true" [style.--k]="r.commits / maxCommits()"></span>
              }
            </div>
            }
          </li>
        }
      </ol>
      @if (hasKm() && hasCommits()) {
      <p class="line" [appReveal]="1" i18n>Les deux courbes montent. Ce n'est pas une coïncidence, c'est une méthode.</p>
      }
      <p class="small note" i18n>Totaux annuels seulement : ni tracé, ni fréquence cardiaque, ni donnée de santé. Km : course et vélo. Contributions GitHub : commits, demandes de fusion, tickets et revues, année en cours incluse.</p>
    </div>
  `,
  styles: `
    .endurance { display: flex; flex-direction: column; gap: var(--s-7); }
    h2 { margin: 0; font-family: var(--font-display); font-size: clamp(3rem, 7vw, 6rem); text-wrap: balance; }
    ol { display: flex; flex-direction: column; gap: var(--s-6); margin: 0; padding: 0; list-style: none; }
    .row { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--s-3); }
    .yr { display: flex; align-items: baseline; gap: var(--s-3); margin: 0; font: 800 1.5rem / 1 var(--font-display); font-stretch: 75%; }
    .cell { display: grid; grid-template-columns: auto 1fr; align-items: baseline; gap: 0 var(--s-3); }
    .val { font: 800 clamp(2.25rem, 13vw, 4.5rem) / 0.95 var(--font-display); font-stretch: 72%; font-variant-numeric: tabular-nums lining-nums; }
    .small { color: var(--ink-2); font-size: var(--t-small); font-weight: 400; }
    .bar { grid-column: 1 / -1; height: 8px; margin-top: var(--s-2); background: var(--ink); transform: scaleX(calc(var(--k) * var(--p, 1))); transform-origin: left; }
    .bar.commits { background: var(--ink-2); }
    .now .bar { background: var(--accent); }
    .note { max-width: 60ch; margin: 0; }
    .line { max-width: 44ch; margin: 0; font-weight: 600; }
    .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
    @media (min-width: 768px) {
      .row { grid-template-columns: 6rem repeat(var(--cols, 2), minmax(0, 1fr)); gap: var(--gutter); align-items: end; }
      .yr { flex-direction: column; align-items: flex-start; gap: var(--s-1); }
      .val { font-size: clamp(2.5rem, 5vw, 4.5rem); }
    }
  `,
})
export class EnduranceTwice {
  readonly sportYears = input<SportYear[]>([]);
  readonly contributionYears = input<ContributionYear[]>([]);
  protected readonly thisYear = new Date().getFullYear();
  protected readonly number = (n: number) => NUMBER.format(n);
  /** De 2023 à l'année courante, chronologique ; une valeur absente donne `null` (cellule vide), une année sans aucune donnée est retirée. */
  protected readonly rows = computed(() => {
    const km = new Map(this.sportYears().map((y) => [y.year, y.distanceKm]));
    const commits = new Map(this.contributionYears().map((y) => [y.year, y.total]));
    return Array.from({ length: this.thisYear - FIRST_YEAR + 1 }, (_, i) => {
      const year = FIRST_YEAR + i;
      return { year, km: km.get(year) ?? null, commits: commits.get(year) ?? null };
    }).filter((r) => r.km !== null || r.commits !== null);
  });
  /** Une série entièrement absente (synchro vide) retire sa colonne au lieu d'afficher des tirets. */
  protected readonly hasKm = computed(() => this.sportYears().length > 0);
  protected readonly hasCommits = computed(() => this.contributionYears().length > 0);
  protected readonly maxKm = computed(() => Math.max(1, ...this.rows().map((r) => r.km ?? 0)));
  protected readonly maxCommits = computed(() => Math.max(1, ...this.rows().map((r) => r.commits ?? 0)));
}
