import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { ContributionsGraph } from '../../../shared/contributions/contributions';
import { Contributions, ContributionYear, Race, SportYear } from '../../../core/api/api.models';
import { Reveal } from '../../../shared/reveal/reveal';
import { PhotoPlates, Plate } from '../../../shared/photo-plates/photo-plates';
import { EnduranceTwice } from '../endurance/endurance-twice';

/** 79.4 → « 79,4 km ». */
export function formatDistance(km: number | null): string {
  return km === null ? '—' : `${km.toLocaleString($localize`:@@numberLocale:fr-FR`)} km`;
}

/** 48953 → « 13 h 35 min 53 s » ; les unités nulles de tête sont omises, pas celles du milieu. */
export function formatDuration(s: number | null): string {
  if (s === null) return '—';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h ? `${h} h` : '', h || m ? `${m} min` : '', sec || (!h && !m) ? `${sec} s` : '']
    .filter(Boolean)
    .join(' ');
}

const ELEVATION = new Intl.NumberFormat($localize`:@@numberLocale:fr-FR`);

/** Pas de classement : uniquement des chiffres. Les lignes `INDEX`/`CLUB` ne sont pas des courses. */
@Component({
  selector: 'app-journal-section',
  imports: [ContributionsGraph, Reveal, PhotoPlates, EnduranceTwice, DatePipe, NgTemplateOutlet],
  template: `
    <section id="journal" aria-labelledby="journal-title">
      <app-endurance-twice
        class="endurance"
        [sportYears]="sportYears()"
        [contributionYears]="contributionYears()"
      />
      <div class="side">
        <div class="lede">
          <h2 id="journal-title" appReveal i18n>Journal de course</h2>
          <p [appReveal]="1" i18n>
            32 courses terminées, toujours un peu plus loin. Même méthode qu'au travail : mesurer,
            ajuster, recommencer.
          </p>
          <p class="index" [appReveal]="1">
            <span class="big">459</span>
            <span class="small" i18n>UTMB Index. Un chiffre, pas un classement.</span>
          </p>
          @for (r of others(); track r.name) {
            <p class="small">{{ r.name }}</p>
          }
          <p class="club">
            <picture>
              <source type="image/avif" srcset="img/logo-baudets-320.avif" />
              <source type="image/webp" srcset="img/logo-baudets-320.webp" />
              <img
                src="img/logo-baudets-320.jpg"
                width="320"
                height="320"
                loading="lazy"
                decoding="async"
                alt=""
              />
            </picture>
            <span i18n>Club : Les Baudets Dhinges</span>
          </p>
        </div>
      </div>
      @if (rows(); as list) {
        <div class="latest" [appReveal]="2">
          <ng-container
            *ngTemplateOutlet="
              racesTable;
              context: { $implicit: list.slice(0, shown), caption: label.latestRaces }
            "
          />
        </div>
      } @else {
        <p class="unavailable" role="status" i18n>Contenu indisponible pour le moment.</p>
      }
      <app-photo-plates class="night" [main]="night" [appReveal]="2" />
      <figure [appReveal]="2">
        <picture>
          <source
            type="image/avif"
            srcset="
              img/finisher-cote-d-opale-640.avif   640w,
              img/finisher-cote-d-opale-1280.avif 1280w
            "
            sizes="(min-width: 768px) 40vw, 360px"
          />
          <source
            type="image/webp"
            srcset="
              img/finisher-cote-d-opale-640.webp   640w,
              img/finisher-cote-d-opale-1280.webp 1280w
            "
            sizes="(min-width: 768px) 40vw, 360px"
          />
          <img
            src="img/finisher-cote-d-opale-640.jpg"
            srcset="
              img/finisher-cote-d-opale-640.jpg   640w,
              img/finisher-cote-d-opale-1280.jpg 1280w
            "
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
      @if (contributions(); as c) {
        <app-contributions class="contrib" [appReveal]="2" [data]="c" />
      }
      @if (rows(); as list) {
        @if (list.length > shown) {
          <details class="more">
            <summary i18n>Voir le détail : les autres courses</summary>
            <div class="body">
              <ng-container
                *ngTemplateOutlet="
                  racesTable;
                  context: { $implicit: list.slice(shown), caption: label.otherRaces }
                "
              />
            </div>
          </details>
        }
      }
      <ng-template #racesTable let-list let-caption="caption">
        <table class="races">
          <caption class="sr">
            {{
              caption
            }}
          </caption>
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
                    <span aria-hidden="true">—</span
                    ><span class="sr" i18n>Date non renseignée</span>
                  }
                </td>
                <th scope="row" [attr.data-label]="label.course">
                  {{ r.name }}
                  @if (r.personalRecord) {
                    <span class="pr">
                      <svg aria-hidden="true" viewBox="0 0 12 12" width="12" height="12">
                        <path
                          d="M6 0l1.8 4.2L12 4.6 8.8 7.5 9.7 12 6 9.6 2.3 12l.9-4.5L0 4.6l4.2-.4z"
                          fill="currentColor"
                        />
                      </svg>
                      <ng-container i18n>Record personnel</ng-container>
                    </span>
                  }
                </th>
                <td class="num" [attr.data-label]="label.distance">{{ distance(r.distanceKm) }}</td>
                <td class="num" [attr.data-label]="label.gain">
                  {{ r.elevationGainM === null ? '—' : elevation(r.elevationGainM) }}
                </td>
                <td class="num time" [attr.data-label]="label.temps">
                  {{ duration(r.durationS) }}
                </td>
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
      max-width: 22rem;
      margin: 0;
    }
    .body {
      display: flex;
      flex-direction: column;
      gap: var(--s-7);
    }
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
    .more {
      display: flex;
      flex-direction: column;
      gap: var(--s-7);
    }
    .club {
      display: flex;
      align-items: center;
      gap: var(--s-3);
      color: var(--ink-2);
      font-size: var(--t-small);
    }
    .club img {
      display: block;
      width: 3rem;
      height: 3rem;
      object-fit: cover;
    }
    .night {
      max-width: 48rem;
    }
    .more summary {
      display: flex;
      align-items: center;
      min-height: var(--target);
      font-weight: 600;
      text-decoration: underline;
      cursor: pointer;
    }
    .sr {
      position: absolute;
      width: 1px;
      height: 1px; /* taste-skill-ignore : masquage visuel pour lecteur d écran */
      overflow: hidden;
      clip-path: inset(50%);
    }
    /* Sous 1280 px (le tableau à 6 colonnes n'a pas la place à côté de la photo) : une fiche par course (nom, puis date/distance et D+/temps en 2 colonnes, puis la note). */
    @media (max-width: 1279px) {
      .races thead {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
      }
      .races,
      .races tbody {
        display: block;
      }
      .races tbody tr {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--s-3) var(--s-4);
        padding: var(--s-5) 0;
      }
      .races td,
      .races tbody th {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 0;
        text-align: left;
        white-space: normal;
      }
      .races tbody th {
        grid-column: 1 / -1;
        order: -1;
        font-size: 1.125rem;
      }
      .races td.num {
        text-align: left;
      }
      .races td::before {
        content: attr(data-label);
        color: var(--ink-2);
        font-size: var(--t-small);
        font-weight: 400;
      }
      .races td:last-child {
        grid-column: 1 / -1;
      }
      .races td:empty {
        display: none;
      }
    }
    @media (min-width: 768px) and (max-width: 1279px) {
      .races tbody tr {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }
    /* Desktop : endurance | intro et dernières courses | plaques ; détail replié en pleine largeur. */
    @media (min-width: 1280px) {
      section {
        grid-template-columns: repeat(12, minmax(0, 1fr));
        padding-block: var(--s-10);
      }
      .endurance {
        grid-column: 1 / -1;
        grid-row: 1;
      }
      .side {
        grid-column: 1 / span 5;
        grid-row: 2;
      }
      .latest,
      .unavailable {
        grid-column: 6 / span 7;
        grid-row: 2;
        align-self: start;
      }
      .night {
        grid-column: 1 / span 7;
        grid-row: 3;
        max-width: none;
      }
      figure {
        grid-column: 9 / span 4;
        grid-row: 3;
        max-width: none;
      }
      figure img {
        aspect-ratio: 4 / 3;
      }
      .contrib {
        grid-column: 1 / -1;
        grid-row: 4;
      }
      .more {
        grid-column: 1 / -1;
        grid-row: 5;
      }
    }
  `,
})
export class JournalSection {
  /** `null` = API en échec. */
  readonly races = input<Race[] | null>(null);
  /** `null` = pas encore de synchro GitHub : le graphe n'est pas rendu. */
  readonly contributions = input<Contributions | null>(null);
  /** Ordre libre ; mis en regard des commits par année dans « L'endurance, deux fois ». */
  readonly sportYears = input<SportYear[]>([]);
  readonly contributionYears = input<ContributionYear[]>([]);
  protected readonly night: Plate = {
    src: 'img/baudets-nuit-1280.jpg',
    alt: $localize`:@@journal.night.alt:Le groupe du club Les Baudets rassemblé de nuit sur une place, frontales allumées, Enzo en selfie au premier plan`,
    caption: $localize`Sortie de nuit du club Les Baudets`,
    width: 1280,
    height: 960,
  };
  /** Les dernières courses restent visibles ; le reste est replié ; le graphe de contributions est visible (retour d'Enzo, vague 3). */
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
