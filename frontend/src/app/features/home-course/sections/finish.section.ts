import { Component, LOCALE_ID, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ContentApi } from '../../../core/api/content.api';
import { Bib } from '../../../shared/bib/bib';
import { ContourField } from '../../../shared/contour-field/contour-field';
import { Reveal } from '../../../shared/reveal/reveal';
import { ContactForm } from '../../contact/contact-form';
import { LiveColophon } from '../live-colophon/live-colophon';
import { passName } from '../live-values';
import { CHECKPOINTS, SPLITS } from '../profile.data';
import { formatDistance, formatDuration } from './journal.section';

const ROWS = (['p1', 'p2', 'p3', 'arrivee'] as const).map((id) => ({
  id,
  km: CHECKPOINTS[id],
  ...SPLITS[id],
}));

/** Arrivée (terrain nuit, spec §6) : chrono officiel, pointages, contact puis formulaire, dos du dossard. Le build vient de /api/build ; absent, le colophon retire ses lignes. */
@Component({
  selector: 'app-finish-section',
  imports: [Bib, ContactForm, ContourField, LiveColophon, Reveal],
  template: `
    <section id="arrivee" class="terrain-night" aria-labelledby="arrivee-title">
      <app-contour-field [levels]="12" />
      <div class="intro">
        <h2 id="arrivee-title" appReveal>
          <time datetime="PT13H35M53S">{{ finishTime }}</time>
        </h2>
        <p class="line" [appReveal]="1" i18n>
          Ligne d'arrivée du Grand Trail d'Auvergne, km 79,4. Prochain objectif : 100 km.
        </p>
        <table class="splits tnum" [appReveal]="1">
          <caption class="sr-only" i18n>
            Pointages officiels
          </caption>
          <thead>
            <tr>
              <th scope="col" i18n>Pointage</th>
              <th scope="col" i18n>Heure</th>
              <th scope="col" i18n>Course</th>
              <th scope="col" i18n>Tronçon</th>
            </tr>
          </thead>
          <tbody>
            @for (r of rows; track r.id) {
              <tr>
                <th scope="row">
                  {{ name(r.id) }} <span>{{ km(r.km) }}</span>
                </th>
                <td>{{ r.clock }}</td>
                <td>{{ dur(r.raceS) }}</td>
                <td>{{ dur(r.legS) }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <div class="contact" [appReveal]="1">
        <p class="lead" i18n>Et de nouveaux projets. Parlons-en.</p>
        <p class="foot" i18n>
          Phidippides a couru de Marathon à Athènes pour porter un message. Ici, un formulaire
          suffit.
        </p>
        <p class="actions">
          <a class="mail" href="mailto:enzo.lvq12@gmail.com">enzo.lvq12&#64;gmail.com</a>
          <a class="btn" [href]="cv" i18n>Télécharger le CV</a>
          <a class="btn" href="https://www.linkedin.com/in/enzo-leveque1" rel="noopener"
            ><svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
              /></svg
            >LinkedIn</a
          >
          <a class="btn" href="https://github.com/cobroux" rel="noopener"
            ><svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              /></svg
            >GitHub</a
          >
        </p>
        <p class="small" i18n>
          En poste chez Aubay, ouvert aux opportunités à Paris. Français, anglais (TOEIC 910).
        </p>
      </div>
      <div class="form" [appReveal]="2"><app-contact-form /></div>
      <app-bib face="back" class="back"
        ><app-live-colophon [info]="build.value() ?? null"
      /></app-bib>
    </section>
  `,
  styles: `
    section {
      position: relative;
      isolation: isolate;
      overflow: hidden;
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--s-7) var(--gutter);
      padding: var(--s-10) var(--margin) var(--s-9);
    }
    .intro {
      container-type: inline-size;
      display: flex;
      flex-direction: column;
      gap: var(--s-5);
      align-items: flex-start;
    }
    p {
      margin: 0;
    }
    /* Chrono monumental : le temps officiel, une seule fois sur le site à cette taille. */
    h2 {
      margin: 0;
      font: 800 clamp(2.75rem, 12cqi, 7rem) / 0.95 var(--font-display);
      font-stretch: 72%;
      font-variant-numeric: tabular-nums lining-nums;
    }
    .line {
      font-size: var(--t-small);
      max-width: 44ch;
    }
    .splits {
      width: 100%;
      max-width: 40rem;
      border-collapse: collapse;
      font-size: var(--t-small);
      font-variant-numeric: tabular-nums lining-nums;
    }
    .splits th,
    .splits td {
      padding: var(--s-2) var(--s-3) var(--s-2) 0;
      text-align: left;
      font-weight: 400;
      white-space: nowrap;
    }
    .splits thead th {
      color: var(--ink-2);
    }
    .splits tbody th {
      font-weight: 600;
    }
    .splits tbody th span {
      color: var(--ink-2);
      font-weight: 400;
    }
    .splits tbody tr {
      border-top: 1px solid color-mix(in srgb, var(--ink) 25%, transparent);
    }
    /* Téléphone : les cellules passent à la ligne, aucune colonne n'est rognée à 320 px. */
    @media (max-width: 480px) {
      .splits th,
      .splits td {
        white-space: normal;
        overflow-wrap: normal;
        padding-right: var(--s-2);
      }
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
    .contact {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
      align-items: flex-start;
    }
    .lead {
      font-size: var(--t-lead);
      font-weight: 600;
      line-height: 1.3;
      max-width: 24ch;
    }
    .small {
      font-size: var(--t-small);
      max-width: 44ch;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-2);
      align-items: center;
      width: 100%;
    }
    a {
      color: inherit;
      display: inline-flex;
      align-items: center;
      min-height: var(--target);
    }
    a:focus-visible {
      outline: 3px solid var(--focus);
      outline-offset: 2px;
    }
    .mail {
      font-size: var(--t-lead);
      font-weight: 600;
      flex-basis: 100%;
    }
    .btn {
      flex: 1 1 10rem;
      justify-content: center;
      gap: var(--s-2);
      padding: 0 var(--s-6);
      min-height: 48px;
      background: var(--accent);
      color: var(--on-accent);
      font-weight: 600;
      text-decoration: none;
      transition: transform 140ms var(--ease-out);
    }
    .btn:active {
      transform: scale(0.97);
    }
    .foot {
      max-width: 44ch;
      font-size: var(--t-small);
    }
    .back {
      width: min(100%, 38rem);
      justify-self: start;
      aspect-ratio: auto;
    }
    @media (min-width: 1100px) {
      section {
        grid-template-columns: repeat(12, minmax(0, 1fr));
      }
      .intro {
        grid-column: 1 / span 7;
        grid-row: 1;
      }
      .contact {
        grid-column: 1 / span 7;
        grid-row: 2;
      }
      .form {
        grid-column: 8 / span 5;
        grid-row: 1 / span 2;
        align-self: start;
      }
      /* Dossard en bande pleine largeur sous les deux colonnes, hauteur au contenu. */
      .back {
        grid-column: 1 / -1;
        grid-row: 3;
        width: 100%;
        justify-self: stretch;
      }
    }
  `,
})
export class FinishSection {
  protected readonly cv = `/api/${inject(LOCALE_ID).slice(0, 2)}/cv`;
  private readonly api = inject(ContentApi);
  protected readonly build = rxResource({ stream: () => this.api.build() });
  protected readonly rows = ROWS;
  /** Chrono officiel : secondes entières du tableau officiel, jamais une horloge recalculée. */
  protected readonly finishTime = formatDuration(SPLITS.arrivee.raceS);
  protected readonly name = passName;
  protected readonly km = formatDistance;
  protected readonly dur = formatDuration;
}
