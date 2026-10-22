import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { ContributionsGraph } from '../../../shared/contributions/contributions';
import { Contributions, Race, SportYear } from '../../../core/api/api.models';
import { Reveal } from '../../../shared/reveal/reveal';

/** 79.4 → « 79,4 km ». */
export function formatDistance(km: number | null): string {
  return km === null ? '—' : `${String(km).replace('.', ',')} km`;
}

/** 48953 → « 13 h 35 min 53 s » ; les unités nulles de tête sont omises, pas celles du milieu. */
export function formatDuration(s: number | null): string {
  if (s === null) return '—';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h ? `${h} h` : '', h || m ? `${m} min` : '', sec || (!h && !m) ? `${sec} s` : ''].filter(Boolean).join(' ');
}

const ELEVATION = new Intl.NumberFormat($localize`:@@numberLocale:fr-FR`);

/** Pas de classement : uniquement des chiffres. Les lignes `INDEX`/`CLUB` ne sont pas des courses. */
@Component({
  selector: 'app-journal-section',
  imports: [ContributionsGraph, Reveal, DatePipe, NgTemplateOutlet],
  template: `
    <section id="journal" aria-labelledby="journal-title">
      <div class="side">
        <div class="lede">
          <h2 id="journal-title" appReveal i18n>Journal de course</h2>
          <p [appReveal]="1" i18n>32 courses terminées, toujours un peu plus loin. Même méthode qu'au travail : mesurer, ajuster, recommencer.</p>
          <p class="index" [appReveal]="1">
            <span class="big">459</span>
            <span class="small" i18n>UTMB Index. Un chiffre, pas un classement.</span>
          </p>
          <app-contributions [data]="contributions()" [appReveal]="2" />
          @for (r of others(); track r.name) {
            <p class="small">{{ r.name }}</p>
          }
        </div>
      </div>
      @if (rows(); as list) {
        <div class="latest" [appReveal]="2">
          <ng-container *ngTemplateOutlet="racesTable; context: { $implicit: list.slice(0, shown), caption: label.latestRaces }" />
        </div>
      } @else {
        <p class="unavailable" role="status" i18n>Contenu indisponible pour le moment.</p>
      }
      <div class="years">
      <figure [appReveal]="2">
        <picture>
          <source type="image/avif" srcset="img/finisher-cote-d-opale-640.avif 640w, img/finisher-cote-d-opale-1280.avif 1280w" sizes="(min-width: 768px) 40vw, 360px" />
          <source type="image/webp" srcset="img/finisher-cote-d-opale-640.webp 640w, img/finisher-cote-d-opale-1280.webp 1280w" sizes="(min-width: 768px) 40vw, 360px" />
          <img
            src="img/finisher-cote-d-opale-640.jpg"
            srcset="img/finisher-cote-d-opale-640.jpg 640w, img/finisher-cote-d-opale-1280.jpg 1280w"
            sizes="(min-width: 768px) 40vw, 360px"
            width="1280"
            height="1600"
            loading="lazy"
            decoding="async"
            i18n-alt
            alt="Enzo montre sa médaille de finisher devant l'affiche du Trail Côte d'Opale"
          />
        </picture>
      </figure>
      @if (sportYears().length || (rows()?.length ?? 0) > shown) {
      <details class="more">
        <summary i18n>Voir le détail : les années en chiffres et les autres courses</summary>
      @if (sportYears().length) {
        <div class="stats">
        <h3 id="stats-title" i18n>Les années en chiffres</h3>
        <p i18n>Course, vélo et natation, année par année, d'après ma montre.</p>
        <p class="small" i18n>Totaux annuels seulement : ni tracé, ni fréquence cardiaque, ni donnée de santé. Km et dénivelé : course et vélo (les km en natation, peu fiables, sont exclus). Année en cours incluse.</p>
        <div class="scroll" role="region" tabindex="0" aria-labelledby="stats-title">
          <table>
            <caption class="sr" i18n>Totaux annuels d'endurance</caption>
            <thead>
              <tr>
                <th scope="col" i18n>Année</th>
                <th scope="col" class="num km" i18n>Kilomètres (km)</th>
                <th scope="col" class="num" i18n>Dénivelé (m D+)</th>
                <th scope="col" class="num" i18n>Heures (h)</th>
                <th scope="col" class="num" i18n>Activités</th>
              </tr>
            </thead>
            <tbody>
              @for (y of sportYears(); track y.year) {
                <tr>
                  <th scope="row"><span class="yr">{{ y.year }}</span>@if (y.year === thisYear) { <span class="small" i18n>en cours</span> }</th>
                  <ng-container *ngTemplateOutlet="cell; context: { $implicit: y.distanceKm, bar: true, year: y.year }" />
                  <ng-container *ngTemplateOutlet="cell; context: { $implicit: y.elevationGainM }" />
                  <ng-container *ngTemplateOutlet="cell; context: { $implicit: y.hours }" />
                  <ng-container *ngTemplateOutlet="cell; context: { $implicit: y.activities }" />
                </tr>
              }
            </tbody>
          </table>
        </div>
        <ng-template #cell let-v let-bar="bar" let-year="year">
          <td class="num" [class.km]="bar">
          @if (v === null) {
              <span aria-hidden="true">—</span><span class="sr" i18n>non renseigné</span>
            } @else {
              {{ number(v) }}
              @if (bar) {
                <!-- Décoratif : les km sont déjà en texte. Longueur = km / max des années. -->
                <span class="bar" aria-hidden="true" [class.now]="year === thisYear" [style.--k]="v / maxKm()"></span>
              }
            }
          </td>
        </ng-template>
        </div>
      }
      @if (rows(); as list) {
        @if (list.length > shown) {
          <ng-container *ngTemplateOutlet="racesTable; context: { $implicit: list.slice(shown), caption: label.otherRaces }" />
        }
      }
      </details>
      }
      </div>
      <ng-template #racesTable let-list let-caption="caption">
        <table class="races">
          <caption class="sr">{{ caption }}</caption>
          <thead>
            <tr>
              <th scope="col" i18n>Date</th>
              <th scope="col" i18n>Course</th>
              <th scope="col" class="num" i18n>Distance</th>
              <th scope="col" class="num" i18n>D+</th>
              <th scope="col" class="num" i18n>Temps</th>
              <th scope="col" i18n>Note</th>
            </tr>
          </thead>
          <tbody>
            @for (r of list; track $index) {
              <tr>
                <td [attr.data-label]="label.date">
                  @if (r.date) {
                    {{ r.date | date: 'MMM y' }}
                  } @else {
                    <span aria-hidden="true">—</span><span class="sr" i18n>Date non renseignée</span>
                  }
                </td>
                <th scope="row" [attr.data-label]="label.course">
                  {{ r.name }}
                  @if (r.personalRecord) {
                    <span class="pr">
                      <svg aria-hidden="true" viewBox="0 0 12 12" width="12" height="12"><path d="M6 0l1.8 4.2L12 4.6 8.8 7.5 9.7 12 6 9.6 2.3 12l.9-4.5L0 4.6l4.2-.4z" fill="currentColor" /></svg>
                      <ng-container i18n>Record personnel</ng-container>
                    </span>
                  }
                </th>
                <td class="num" [attr.data-label]="label.distance">{{ distance(r.distanceKm) }}</td>
                <td class="num" [attr.data-label]="label.gain">{{ r.elevationGainM === null ? '—' : elevation(r.elevationGainM) }}</td>
                <td class="num time" [attr.data-label]="label.temps">{{ duration(r.durationS) }}</td>
                <td [attr.data-label]="label.note">{{ r.note }}</td>
              </tr>
            }
          </tbody>
        </table>
      </ng-template>
    </section>
  `,
  styles: `
    section {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--s-7) var(--gutter);
      padding: var(--s-9) var(--margin);
      background: var(--surface);
    }
    .side,
    .lede {
      display: flex;
      flex-direction: column;
      gap: var(--s-5);
    }
    h2 {
      margin: 0;
      font-family: var(--font-display);
      font-size: clamp(3rem, 7vw, 6rem);
      text-wrap: balance;
    }
    p {
      margin: 0;
      max-width: 44ch;
    }
    .index {
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
    }
    .big {
      color: var(--accent);
      font: 800 clamp(4rem, 8vw, 6rem) / 0.85 var(--font-display);
      font-stretch: 72%;
      font-variant-numeric: tabular-nums lining-nums;
    }
    .small,
    .unavailable {
      color: var(--ink-2);
      font-size: var(--t-small);
    }
    figure {
      position: relative;
      order: 1;
      margin: 0;
    }
    .years { display: flex; flex-direction: column; gap: var(--s-7); }
    figure img {
      display: block;
      width: 100%;
      height: 100%;
      aspect-ratio: 4 / 5;
      object-fit: cover;
      object-position: center 12%;
    }
    .races {
      border-collapse: collapse;
      font-variant-numeric: tabular-nums;
    }
    .races th,
    .races td {
      padding: var(--s-4) var(--s-3);
      text-align: left;
      font-weight: 400;
      vertical-align: top;
    }
    .races thead th {
      color: var(--ink-2);
      font-size: var(--t-small);
      font-weight: 600;
    }
    .races tbody tr {
      border-top: 1px solid var(--line-muted);
    }
    .races tbody th {
      font-weight: 600;
    }
    .races td:first-child,
    .races .num {
      white-space: nowrap;
    }
    .races .num {
      text-align: right;
    }
    .races .time {
      font-weight: 600;
    }
    .pr {
      display: inline-flex;
      align-items: center;
      gap: var(--s-1);
      margin-left: var(--s-2);
      color: var(--ink);
      font-size: var(--t-small);
      font-weight: 600;
    }
    .pr svg {
      color: var(--accent);
    }
    .stats { display: flex; flex-direction: column; gap: var(--s-3); }
    .more { display: flex; flex-direction: column; gap: var(--s-7); }
    .more summary { display: flex; align-items: center; min-height: var(--target); font-weight: 600; text-decoration: underline; cursor: pointer; }
    .stats h3 { margin: 0; font: 800 clamp(1.25rem, 2vw, 1.625rem) / 1.05 var(--font-display); font-stretch: 75%; letter-spacing: -0.02em; }
    .stats .scroll { overflow-x: auto; }
    .stats table { border-collapse: collapse; width: 100%; font-variant-numeric: tabular-nums lining-nums; }
    .stats th, .stats td { padding: var(--s-3) var(--s-3) var(--s-3) 0; text-align: left; font-weight: 400; }
    .stats thead th { color: var(--ink-2); font-size: var(--t-small); font-weight: 600; vertical-align: bottom; }
    .stats th.num, .stats td.num { text-align: right; white-space: nowrap; }
    /* Barre par année, proportionnelle aux km : la progression se lit d'un coup d'œil (décoratif, aria-hidden). */
    .stats th.km, .stats td.km { text-align: left; width: 40%; min-width: 5.5rem; }
    .bar { display: block; height: 6px; margin-top: var(--s-2); background: var(--ink-2); transform: scaleX(var(--k)); transform-origin: left; }
    .bar.now { background: var(--accent); }
    /* le body a overflow-wrap: anywhere : sans cela la colonne Année s'écrase chiffre par chiffre à 390 */
    .stats th { overflow-wrap: normal; }
    .stats tbody th { white-space: nowrap; }
    .stats tbody th .small { display: block; }
    .stats .yr { font: 800 1.5rem / 1 var(--font-display); font-stretch: 75%; margin-inline-end: var(--s-2); }
    .sr {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
    }
    /* Sous 1280 px (le tableau à 6 colonnes n'a pas la place à côté de la photo) : une fiche par course (nom, puis date/distance et D+/temps en 2 colonnes, puis la note). */
    @media (max-width: 1279px) {
      .races thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
      .races, .races tbody { display: block; }
      .races tbody tr { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--s-3) var(--s-4); padding: var(--s-5) 0; }
      .races td, .races tbody th { display: flex; flex-direction: column; gap: 2px; padding: 0; text-align: left; white-space: normal; }
      .races tbody th { grid-column: 1 / -1; order: -1; font-size: 1.125rem; }
      .races td.num { text-align: left; }
      .races td::before { content: attr(data-label); color: var(--ink-2); font-size: var(--t-small); font-weight: 400; }
      .races td:last-child { grid-column: 1 / -1; }
      .races td:empty { display: none; }
    }
    @media (min-width: 768px) {
      /* Photo à gauche, chiffres à droite : aucune moitié vide. */
      .years { display: grid; grid-template-columns: minmax(0, 14rem) minmax(0, 1fr); gap: var(--gutter); align-items: start; }
      figure { order: 0; }
    }
    @media (min-width: 768px) and (max-width: 1279px) {
      .races tbody tr { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    }
    /* Desktop : à gauche titre, intro, 459, contributions ; à droite les dernières courses, puis la photo et le détail replié. */
    @media (min-width: 1280px) {
      section { grid-template-columns: repeat(12, minmax(0, 1fr)); padding-block: var(--s-10); }
      .side { grid-column: 1 / span 5; grid-row: 1 / span 2; }
      .latest, .unavailable { grid-column: 6 / span 7; grid-row: 1; align-self: start; }
      .years { grid-column: 6 / span 7; grid-row: 2; }
    }
  `,
})
export class JournalSection {
  /** `null` = API en échec. */
  readonly races = input<Race[] | null>(null);
  /** `null` = pas encore de synchro GitHub : le graphe n'est pas rendu. */
  readonly contributions = input<Contributions | null>(null);
  /** Année décroissante ; `[]` : le bloc n'est pas rendu. */
  readonly sportYears = input<SportYear[]>([]);
  protected readonly thisYear = new Date().getFullYear();
  protected readonly number = (n: number) => ELEVATION.format(n);
  /** Plus grand total annuel : échelle commune des barres. */
  protected readonly maxKm = computed(() => Math.max(1, ...this.sportYears().map((y) => y.distanceKm ?? 0)));
  /** Les dernières courses restent visibles ; le reste et les années en chiffres sont repliés (conseil du 2026-10-21). */
  protected readonly shown = 3;
  readonly rows = computed(() => this.races()?.filter((r) => r.kind === 'RACE') ?? null);
  readonly others = computed(() => this.races()?.filter((r) => r.kind !== 'RACE') ?? []);
  protected readonly label = {
    date: $localize`Date`,
    course: $localize`Course`,
    distance: $localize`Distance`,
    gain: $localize`D+`,
    temps: $localize`Temps`,
    note: $localize`Note`,
    latestRaces: $localize`Dernières courses terminées`,
    otherRaces: $localize`Autres courses terminées`,
  };
  readonly distance = formatDistance;
  readonly duration = formatDuration;
  readonly elevation = (m: number) => `${ELEVATION.format(m)} m`;
}
