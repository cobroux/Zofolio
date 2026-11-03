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

const ROWS = (['p1', 'p2', 'p3', 'arrivee'] as const).map((id) => ({ id, km: CHECKPOINTS[id], ...SPLITS[id] }));

/** Arrivée (terrain nuit, spec §6) : chrono officiel, pointages, contact puis formulaire, dos du dossard. Le build vient de /api/build ; absent, le colophon retire ses lignes. */
@Component({
  selector: 'app-finish-section',
  imports: [Bib, ContactForm, ContourField, LiveColophon, Reveal],
  template: `
    <section id="arrivee" class="terrain-night" aria-labelledby="arrivee-title">
      <app-contour-field [levels]="12" />
      <div class="intro">
        <h2 id="arrivee-title" appReveal><time datetime="PT13H35M53S">{{ finishTime }}</time></h2>
        <p class="line" [appReveal]="1" i18n>Ligne d'arrivée du Grand Trail d'Auvergne, km 79,4. Prochain objectif : 100 km.</p>
        <table class="splits tnum" [appReveal]="1">
          <caption class="sr-only" i18n>Pointages officiels</caption>
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
                <th scope="row">{{ name(r.id) }} <span>{{ km(r.km) }}</span></th>
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
        <p class="actions">
          <a class="mail" href="mailto:enzo.lvq12@gmail.com">enzo.lvq12&#64;gmail.com</a>
          <a class="cv" [href]="cv" i18n>Télécharger le CV</a>
          <a href="https://www.linkedin.com/in/enzo-leveque1" rel="noopener">LinkedIn</a>
          <a href="https://github.com/cobroux" rel="noopener">GitHub</a>
        </p>
        <p class="small" i18n>En poste chez Aubay, ouvert aux opportunités à Paris. Français, anglais (TOEIC 910).</p>
      </div>
      <div class="form" [appReveal]="2"><app-contact-form /></div>
      <p class="foot" i18n>Phidippides a couru de Marathon à Athènes pour porter un message. Ici, un formulaire suffit.</p>
      <app-bib face="back" class="back"><app-live-colophon [info]="build.value() ?? null" /></app-bib>
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
    .intro { container-type: inline-size; display: flex; flex-direction: column; gap: var(--s-5); align-items: flex-start; }
    p { margin: 0; }
    /* Chrono monumental : le temps officiel, une seule fois sur le site à cette taille. */
    h2 { margin: 0; font: 800 clamp(2.75rem, 12cqi, 7rem) / 0.95 var(--font-display); font-stretch: 72%; font-variant-numeric: tabular-nums lining-nums; }
    .line { font-size: var(--t-small); max-width: 44ch; }
    .splits { width: 100%; max-width: 40rem; border-collapse: collapse; font-size: var(--t-small); font-variant-numeric: tabular-nums lining-nums; }
    .splits th, .splits td { padding: var(--s-2) var(--s-3) var(--s-2) 0; text-align: left; font-weight: 400; white-space: nowrap; }
    .splits thead th { color: var(--ink-2); }
    .splits tbody th { font-weight: 600; }
    .splits tbody th span { color: var(--ink-2); font-weight: 400; }
    .splits tbody tr { border-top: 1px solid color-mix(in srgb, var(--ink) 25%, transparent); }
    /* Téléphone : les cellules passent à la ligne, aucune colonne n'est rognée à 320 px. */
    @media (max-width: 480px) {
      .splits th, .splits td { white-space: normal; overflow-wrap: normal; padding-right: var(--s-2); }
    }
    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    .contact { display: flex; flex-direction: column; gap: var(--s-4); align-items: flex-start; }
    .lead { font-size: var(--t-lead); font-weight: 600; line-height: 1.3; max-width: 24ch; }
    .small { font-size: var(--t-small); max-width: 44ch; }
    .actions { display: flex; flex-wrap: wrap; gap: var(--s-2) var(--s-6); align-items: center; }
    a { color: inherit; display: inline-flex; align-items: center; min-height: var(--target); }
    a:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }
    .mail { font-size: var(--t-lead); font-weight: 600; }
    .cv { padding: 0 var(--s-6); min-height: 48px; background: var(--accent); color: var(--on-accent); font-weight: 600; text-decoration: none; transition: transform 140ms var(--ease-out); }
    .cv:active { transform: scale(0.97); }
    .foot { max-width: 44ch; font-size: var(--t-small); }
    .back { width: min(100%, 38rem); justify-self: start; }
    @media (min-width: 1100px) {
      section { grid-template-columns: repeat(12, minmax(0, 1fr)); }
      .intro { grid-column: 1 / span 7; grid-row: 1; }
      .contact { grid-column: 1 / span 7; grid-row: 2; }
      .form { grid-column: 8 / span 5; grid-row: 1 / span 3; align-self: start; }
      .foot { grid-column: 1 / span 7; grid-row: 3; align-self: end; }
      .back { grid-column: 1 / -1; grid-row: 4; }
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
