import { DatePipe, DecimalPipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  LOCALE_ID,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectSummary } from '../../../core/api/api.models';
import { Clip, calm } from '../../../shared/clip/clip';
import { splitParts } from '../../../shared/split/split';

/** Captures d'interface réelles (spec §5 bis) pour un projet sans vidéo. */
export const CAPTURES: Record<string, string> = {
  gfaim: 'media/gfaim-shot-1.png',
  // v2 : recadrée sous la barre du site (filtre « NSFW », connexion) ; nouveau nom car /media est mis en cache un an.
  'cin-folie': 'media/cinfolie-shot-v2.webp',
  'calculateur-dpe': 'media/dpe-shot.webp',
  oltre: 'media/oltre-1.webp',
  zotracker: 'media/zotracker-1.webp',
  histoquiz: 'media/histoquiz-shot.webp',
};
/** Vignettes 480 px pour l'image en ligne (tactile) : les captures pleine taille pèsent jusqu'à 138 Ko et pénalisaient le LCP mobile. */
const THUMBS: Record<string, string> = {
  gfaim: 'media/gfaim-shot-1-480.png',
  'cin-folie': 'media/cinfolie-shot-v2-480.webp',
  'calculateur-dpe': 'media/dpe-shot-480.webp',
};

/**
 * Index P3 avec aperçu (signature, spec §6) : une ligne par projet, en très grand titre, qui mène à l'étude (ou au dépôt).
 * Survol ou focus d'une ligne = son aperçu dans un cadre fixe ; la vidéo ne tourne que pendant ce survol/focus, à l'écran, hors mouvement réduit.
 * Sans pointeur fin (ou sous 768 px) : poster en ligne, vidéo au toucher du bouton.
 * `compact` (projets d'école, P1) : une ligne par projet (titre, langage) ; sous pointeur fin, le pitch et les données passent sous le cadre, et un projet sans capture y affiche son pitch en grand.
 */
@Component({
  selector: 'app-project-index',
  imports: [Clip, RouterLink, DatePipe, DecimalPipe],
  host: { '[class.compact]': 'compact()' },
  template: `
    @if (rows(); as list) {
      @if (list.length) {
        <div class="index">
          <ol class="rows" (pointerleave)="engaged.set(false)" (focusout)="leave($event)">
            @for (r of list; track r.p.slug; let i = $index) {
              <li
                [class.on]="i === active()"
                [class.pic]="compact() && !!r.thumb"
                (pointerenter)="show(i)"
                (focusin)="show(i)"
              >
                <div class="line">
                  <h3>
                    @if (r.study) {
                      <a class="study" [routerLink]="['/projets', r.p.slug]">{{ r.p.title }}</a>
                    } @else if (r.p.repoUrl) {
                      <a [href]="r.p.repoUrl" rel="noopener">{{ r.p.title }}</a>
                    } @else {
                      {{ r.p.title }}
                    }
                  </h3>
                  @if (compact() ? r.lang : r.meta; as m) {
                    <span class="meta">{{ m }}</span>
                  }
                  @if (compact()) {
                    <span class="arrow" aria-hidden="true">→</span>
                  }
                </div>
                <p class="pitch">{{ r.p.pitch }}</p>
                <!-- Le titre mène déjà à l'étude (sinon au dépôt) : ici seulement les destinations qu'il ne couvre pas. -->
                @if (!compact() && (r.p.demoUrl || (r.study && r.p.repoUrl))) {
                  <p class="links">
                    @if (r.p.demoUrl) {
                      <a [href]="r.p.demoUrl" rel="noopener" i18n>En ligne</a>
                    }
                    @if (r.study && r.p.repoUrl) {
                      <a [href]="r.p.repoUrl" rel="noopener" i18n>Code</a>
                    }
                  </p>
                }
                @if (r.p.video && !compact()) {
                  <app-clip class="inline" [video]="r.p.video" [autoplay]="false" />
                } @else if (r.shot) {
                  <img
                    class="inline"
                    [src]="r.thumb"
                    alt=""
                    width="640"
                    height="400"
                    loading="lazy"
                  />
                } @else if (r.facts) {
                  <p class="inline facts">{{ r.facts }}</p>
                }
              </li>
            }
          </ol>
          <div class="side">
            <div
              class="preview"
              [class.empty]="
                !compact() &&
                !list[active()]?.shot &&
                !list[active()]?.p?.video &&
                !list[active()]?.proof
              "
              aria-hidden="true"
            >
              @for (r of list; track r.p.slug; let i = $index) {
                <div class="shot" [class.on]="i === active()" [attr.data-slug]="r.p.slug">
                  @if (r.shot) {
                    <img [src]="r.shot" alt="" width="640" height="400" loading="lazy" />
                  } @else if (compact()) {
                    <div class="say">{{ r.p.pitch }}</div>
                  } @else if (r.proof) {
                    <div class="proof">
                      @if (r.p.commits) {
                        <span class="big">{{ r.p.commits | number }}</span>
                        <span class="label" i18n>commits</span>
                      }
                      @if (r.p.languages.length) {
                        <span class="label">{{ r.p.languages.join(', ') }}</span>
                      }
                      @if (r.p.lastPushAt) {
                        <span class="label"
                          ><ng-container i18n>dernier push</ng-container>
                          {{ r.p.lastPushAt | date: 'mediumDate' }}</span
                        >
                      }
                    </div>
                  }
                  @if (r.p.video; as v) {
                    @if (i === active() && live()) {
                      <video muted [muted]="true" autoplay loop playsinline [poster]="v.poster">
                        <source [src]="v.mp4" type="video/mp4" />
                        @if (v.webm) {
                          <source [src]="v.webm" type="video/webm" />
                        }
                      </video>
                    }
                  }
                </div>
              }
            </div>
            @if (compact()) {
              <!-- Doublon visuel du pitch (déjà sur la ligne, lu par les lecteurs d'écran) et des données. -->
              <div class="caps" aria-hidden="true">
                @for (r of list; track r.p.slug; let i = $index) {
                  <div class="cap" [class.on]="i === active()">
                    @if (r.shot) {
                      <p>{{ r.p.pitch }}</p>
                    }
                    @if (r.data && r.data !== r.lang) {
                      <p class="facts">{{ r.data }}</p>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>
      } @else {
        <p class="unavailable" i18n>Contenu indisponible pour le moment.</p>
      }
    } @else {
      <p class="unavailable" i18n>Contenu indisponible pour le moment.</p>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .rows {
      display: flex;
      flex-direction: column;
      gap: var(--s-6);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--s-2);
    }
    .line {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--s-1);
    }
    h3 {
      margin: 0;
      /* Interligne 1 : les jambages (g, p de « garmin-mcp ») ne touchent plus la ligne de méta. */
      font: 800 clamp(2.5rem, 7vw, 5.5rem) / 1 var(--font-display);
      font-stretch: 72%;
    }
    h3 a {
      color: var(--ink);
      text-decoration: none;
    }
    /* Toute la ligne est cliquable (un seul lien par projet) ; le clip passe au-dessus. */
    h3 a::after {
      content: '';
      position: absolute;
      inset: 0;
    }
    /* Ligne active : soulignée, sans bouger (spec §1) ni atténuer les autres (contraste conservé). */
    .on h3 a,
    h3 a:hover {
      text-decoration: underline;
      text-decoration-thickness: 0.06em;
      text-underline-offset: 0.1em;
    }
    .meta {
      font-size: var(--t-small);
      font-variant-numeric: tabular-nums lining-nums;
    }
    .pitch {
      margin: 0;
      max-width: 60ch;
      overflow-wrap: break-word;
    }
    .links {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-2) var(--s-5);
      margin: 0;
    }
    .links a {
      display: inline-flex;
      align-items: center;
      min-height: var(--target);
    }
    .inline,
    .links {
      position: relative;
      z-index: 1;
    }
    app-clip.inline,
    img.inline {
      width: 100%;
      margin-block-start: var(--s-3);
    }
    img.inline {
      display: block;
      height: auto;
      max-height: 16rem;
      object-fit: contain;
      object-position: left;
    }
    .facts {
      margin: 0;
      font-size: var(--t-small);
    }
    .sr {
      position: absolute;
      width: 1px;
      height: 1px; /* taste-skill-ignore : masquage visuel pour lecteur d écran */
      overflow: hidden;
      clip-path: inset(50%);
    }
    .side,
    .arrow {
      display: none;
    }
    /* Compacte : une ligne par projet (titre, langage), filets entre les lignes ; le pitch passe en dessous, en petit. */
    :host(.compact) .rows {
      gap: 0;
    }
    :host(.compact) li {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: baseline;
      gap: var(--s-1) var(--s-3);
      padding-block: var(--s-3);
      border-block-start: 2px solid var(--line-muted);
    }
    :host(.compact) li:last-child {
      border-block-end: 2px solid var(--line-muted);
    }
    :host(.compact) .line {
      display: contents;
    }
    :host(.compact) h3 {
      font-size: clamp(1.5rem, 2.8vw, 2.25rem);
      line-height: 1.1;
    }
    /* Tactile : aucune ligne n'est « active », le soulignement de la première ligne n'aurait pas de sens. */
    :host(.compact) .on h3 a {
      text-decoration: none;
    }
    :host(.compact) .meta {
      justify-self: end;
      color: var(--ink-2);
    }
    :host(.compact) .pitch,
    :host(.compact) .inline {
      grid-column: 1 / -1;
    }
    :host(.compact) .pitch {
      font-size: var(--t-small);
    }
    /* Tactile : la capture en vignette à droite du pitch, pour que huit projets tiennent en un écran environ. */
    :host(.compact) .pic .pitch {
      grid-column: 1;
    }
    :host(.compact) img.inline {
      grid-column: 2;
      align-self: start;
      width: 7rem;
      margin: 0;
      aspect-ratio: 16 / 10;
      object-fit: cover;
      object-position: top;
    }
    .unavailable {
      margin: 0;
      color: var(--ink);
    }
    /* Ordinateur à pointeur fin : lignes à gauche, cadre fixe à droite ; les posters en ligne disparaissent. */
    @media (min-width: 768px) and (hover: hover) and (pointer: fine) {
      .index {
        display: grid;
        grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
        gap: var(--gutter);
        align-items: start;
      }
      .inline,
      img.inline {
        display: none;
      }
      .side {
        display: block;
        position: sticky;
        top: var(--s-9);
      }
      .preview {
        position: relative;
        display: grid;
        aspect-ratio: 16 / 10;
        overflow: hidden;
        background: #0e1626;
        transition: opacity 240ms var(--ease-out);
      }
      /* Ligne sans média : tout le cadre s'efface, aucun aplat vide ne reste. */
      .preview.empty {
        opacity: 0;
      }
      .shot {
        display: grid;
        grid-area: 1 / 1;
        opacity: 0;
        transition: opacity 240ms var(--ease-out);
      }
      .shot.on {
        opacity: 1;
      }
      /* Preuves GitHub : chiffre monumental comme le dossard, texte clair fixe sur le cadre sombre (≥ 4,5:1 dans les deux thèmes). */
      .proof {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: var(--s-2);
        padding: var(--s-6);
        color: #f6f3ec;
      }
      .big {
        font: 800 clamp(5rem, 11vw, 9rem) / 0.8 var(--font-display);
        font-stretch: 62%;
        font-variant-numeric: lining-nums;
      }
      .label {
        font-size: var(--t-small);
      }
      /* Compacte : cadre plus large que la liste ; flèche sur la ligne active ; pitch et données sous le cadre, superposés (hauteur stable d'une ligne à l'autre). */
      :host(.compact) .index {
        grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
      }
      :host(.compact) li {
        grid-template-columns: minmax(0, 1fr) auto auto;
      }
      :host(.compact) .on h3 a {
        text-decoration: underline;
      }
      :host(.compact) .pitch {
        position: absolute;
        width: 1px;
        height: 1px; /* taste-skill-ignore : masquage visuel, le pitch est affiché sous le cadre */
        overflow: hidden;
        clip-path: inset(50%);
      }
      .arrow {
        display: block;
        color: var(--accent);
        font: 800 1.5rem / 1 var(--font-display);
        opacity: 0;
        transition: opacity 160ms var(--ease-out);
      }
      .on .arrow {
        opacity: 1;
      }
      .say {
        display: flex;
        align-items: center;
        padding: var(--s-6);
        color: #f6f3ec;
        font: 800 clamp(1.75rem, 3.2vw, 3rem) / 1.1 var(--font-display);
        font-stretch: 72%;
        text-wrap: balance;
      }
      .caps {
        display: grid;
        margin-block-start: var(--s-3);
      }
      .cap {
        display: flex;
        flex-direction: column;
        grid-area: 1 / 1;
        gap: var(--s-1);
        opacity: 0;
        transition: opacity 240ms var(--ease-out);
      }
      .cap.on {
        opacity: 1;
      }
      .cap p {
        margin: 0;
        max-width: 60ch;
      }
      .cap .facts {
        color: var(--ink-2);
        font-variant-numeric: tabular-nums lining-nums;
      }
      /* Absolu : une capture portrait ne pousse plus la hauteur du cadre (sinon l'image active sort du cadre visible). */
      .shot > * {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .shot,
      .preview,
      .cap,
      .arrow {
        transition: none;
      }
    }
  `,
})
export class ProjectIndex {
  /** `null` = API en échec. */
  readonly projects = input<ProjectSummary[] | null>(null);
  readonly compact = input(false, { transform: booleanAttribute });
  private readonly locale = inject(LOCALE_ID);
  protected readonly rows = computed(
    () =>
      this.projects()?.map((p) => ({
        p,
        study: p.tier === 'CASE_STUDY',
        meta: splitParts(this.locale, { stack: p.stack, commits: p.commits || null }).join(' · '),
        shot: p.video?.poster ?? CAPTURES[p.slug] ?? null,
        thumb: THUMBS[p.slug] ?? p.video?.poster ?? CAPTURES[p.slug] ?? null,
        lang: p.languages[0] ?? p.stack[0] ?? null,
        // Ligne de données sous le cadre (compacte) : uniquement ce que l'API renvoie.
        data: splitParts(this.locale, {
          duration: p.duration,
          stack: p.stack,
          commits: p.commits || null,
          lastPushAt: p.lastPushAt,
        }).join(' · '),
        // Preuves de la synchro GitHub : rien d'inventé, absentes = ligne comme avant.
        proof: !!p.commits || p.languages.length > 0,
        facts: splitParts(this.locale, { languages: p.languages, lastPushAt: p.lastPushAt }).join(
          ' · ',
        ),
      })) ?? null,
  );
  protected readonly active = signal(0);
  /** Une ligne est survolée ou a le focus : seule condition de lecture (rien ne bouge sans action du visiteur). */
  protected readonly engaged = signal(false);
  private readonly motion = signal(false);
  private readonly onScreen = signal(false);
  protected readonly live = computed(() => this.motion() && this.engaged() && this.onScreen());

  constructor() {
    const host: HTMLElement = inject(ElementRef).nativeElement;
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      // Cadre masqué (tactile ou étroit) : sa vidéo ne doit jamais se monter ni se télécharger.
      this.motion.set(
        !calm() && matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)').matches,
      );
      if (typeof IntersectionObserver === 'undefined') return this.onScreen.set(true);
      // Hors écran, la vidéo est retirée : elle ne tourne jamais pour personne.
      const io = new IntersectionObserver(([e]) => this.onScreen.set(e.isIntersecting));
      io.observe(host);
      destroy.onDestroy(() => io.disconnect());
    });
  }

  protected show(i: number) {
    this.active.set(i);
    this.engaged.set(true);
  }

  protected leave(e: FocusEvent) {
    if (!(e.currentTarget as Node).contains(e.relatedTarget as Node | null))
      this.engaged.set(false);
  }
}
