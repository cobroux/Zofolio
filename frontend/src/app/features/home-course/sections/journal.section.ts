import { Component, computed, input } from '@angular/core';
import { Reveal } from '../../../shared/reveal/reveal';
import { Race } from '../../../core/api/api.models';

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

const ELEVATION = new Intl.NumberFormat('fr-FR');

/** Pas de classement : uniquement des chiffres. Les lignes `INDEX`/`CLUB` ne sont pas des courses. */
@Component({
  selector: 'app-journal-section',
  imports: [Reveal],
  template: `
    <section id="journal" aria-labelledby="journal-title">
      <h2 id="journal-title" appReveal i18n>Journal de course</h2>
      <figure [appReveal]="1">
        <picture>
          <source type="image/avif" srcset="img/finisher-cote-d-opale-640.avif 640w, img/finisher-cote-d-opale-1280.avif 1280w" sizes="(min-width: 768px) 352px, 100vw" />
          <source type="image/webp" srcset="img/finisher-cote-d-opale-640.webp 640w, img/finisher-cote-d-opale-1280.webp 1280w" sizes="(min-width: 768px) 352px, 100vw" />
          <img
            src="img/finisher-cote-d-opale-640.jpg"
            srcset="img/finisher-cote-d-opale-640.jpg 640w, img/finisher-cote-d-opale-1280.jpg 1280w"
            sizes="(min-width: 768px) 352px, 100vw"
            width="1280"
            height="1600"
            loading="lazy"
            decoding="async"
            i18n-alt
            alt="Enzo montre sa médaille de finisher devant l'affiche du Trail Côte d'Opale"
          />
        </picture>
      </figure>
      <div class="intro" [appReveal]="1">
        @for (r of others(); track r.name) {
          <p class="other">{{ r.name }}</p>
        }
        <p class="fun" i18n>Un chiffre, pas un classement.</p>
      </div>
      @if (rows(); as list) {
        <table [appReveal]="2">
          <caption class="sr" i18n>Courses terminées</caption>
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
                    {{ r.date.slice(0, 4) }}
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
      } @else {
        <p class="unavailable" role="status" i18n>Contenu indisponible pour le moment.</p>
      }
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
    h2 {
      grid-column: 1 / -1;
      margin: 0;
      font-family: var(--font-display);
      font-size: var(--t-display);
    }
    figure {
      margin: 0;
      max-width: 22rem;
    }
    figure img {
      width: 100%;
      height: auto;
      aspect-ratio: 4 / 5;
    }
    table, .unavailable {
      grid-column: 1 / -1;
    }
    .intro {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }
    .other, .fun, .unavailable {
      margin: 0;
      color: var(--ink-2);
      font-size: var(--t-small);
    }
    table {
      border-collapse: collapse;
      font-variant-numeric: tabular-nums;
    }
    th, td {
      padding: var(--s-3) var(--s-3);
      text-align: left;
      font-weight: 400;
      vertical-align: top;
    }
    thead th {
      color: var(--ink-2);
      font-size: var(--t-small);
      font-weight: 600;
    }
    tbody tr {
      border-top: 1px solid var(--line-muted);
    }
    tbody th {
      font-weight: 600;
    }
    .num {
      text-align: right;
      white-space: nowrap;
    }
    .time {
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
    .sr {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
    }
    /* Mobile : une carte par course, libellés issus de data-label. */
    @media (max-width: 1023px) {
      thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
      table, tbody, tr, td, tbody th { display: block; }
      tbody tr { padding: var(--s-3) 0; }
      td, tbody th { display: flex; justify-content: space-between; gap: var(--s-4); }
      td::before, tbody th::before { content: attr(data-label); color: var(--ink-2); font-weight: 400; }
      td:empty { display: none; }
    }
    @media (min-width: 768px) {
      section { grid-template-columns: minmax(0, 22rem) minmax(0, 1fr); align-items: start; }
    }
  `,
})
export class JournalSection {
  /** `null` = API en échec. */
  readonly races = input<Race[] | null>(null);
  readonly rows = computed(() => this.races()?.filter((r) => r.kind === 'RACE') ?? null);
  readonly others = computed(() => this.races()?.filter((r) => r.kind !== 'RACE') ?? []);
  protected readonly label = {
    date: $localize`Date`,
    course: $localize`Course`,
    distance: $localize`Distance`,
    gain: $localize`D+`,
    temps: $localize`Temps`,
    note: $localize`Note`,
  };
  readonly distance = formatDistance;
  readonly duration = formatDuration;
  readonly elevation = (m: number) => `${ELEVATION.format(m)} m`;
}
