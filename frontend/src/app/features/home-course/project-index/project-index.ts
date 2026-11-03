import {
  Component,
  DestroyRef,
  ElementRef,
  LOCALE_ID,
  afterNextRender,
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
const CAPTURES: Record<string, string> = { gfaim: 'media/gfaim-shot-1.png' };

/**
 * Index P3 avec aperçu (signature, spec §6) : une ligne par projet, en très grand titre, qui mène à l'étude (ou au dépôt).
 * Survol ou focus d'une ligne = son aperçu dans un cadre fixe ; la vidéo ne tourne que pendant ce survol/focus, à l'écran, hors mouvement réduit.
 * Sans pointeur fin (ou sous 768 px) : poster en ligne, vidéo au toucher du bouton.
 */
@Component({
  selector: 'app-project-index',
  imports: [Clip, RouterLink],
  template: `
    @if (rows(); as list) {
      @if (list.length) {
        <div class="index">
          <ol class="rows" (pointerleave)="engaged.set(false)" (focusout)="leave($event)">
            @for (r of list; track r.p.slug; let i = $index) {
              <li [class.on]="i === active()" (pointerenter)="show(i)" (focusin)="show(i)">
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
                  @if (r.meta) {
                    <span class="meta">{{ r.meta }}</span>
                  }
                </div>
                <p class="pitch">{{ r.p.pitch }}</p>
                @if (r.study && r.p.repoUrl) {
                  <a class="code" [href]="r.p.repoUrl" rel="noopener" i18n
                    >Code<span class="sr"> de {{ r.p.title }}</span></a
                  >
                }
                @if (r.p.video) {
                  <app-clip class="inline" [video]="r.p.video" [autoplay]="false" />
                } @else if (r.shot) {
                  <img class="inline" [src]="r.shot" alt="" loading="lazy" />
                }
              </li>
            }
          </ol>
          <div class="preview" [class.empty]="!list[active()]?.shot && !list[active()]?.p?.video" aria-hidden="true">
            @for (r of list; track r.p.slug; let i = $index) {
              <div class="shot" [class.on]="i === active()" [attr.data-slug]="r.p.slug">
                @if (r.shot) {
                  <img [src]="r.shot" alt="" loading="lazy" />
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
      gap: var(--s-7);
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
      flex-wrap: wrap;
      align-items: baseline;
      gap: var(--s-2) var(--s-5);
    }
    h3 {
      margin: 0;
      font: 800 clamp(2.5rem, 7vw, 5.5rem) / 0.92 var(--font-display);
      font-stretch: 72%;
    }
    h3 a {
      color: var(--ink);
      text-decoration: none;
    }
    /* Toute la ligne est cliquable ; le lien code et le clip passent au-dessus. */
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
    }
    .code,
    .inline {
      position: relative;
      z-index: 1;
    }
    .code {
      display: inline-flex;
      align-items: center;
      min-height: var(--target);
      color: var(--ink);
      text-underline-offset: 0.2em;
    }
    app-clip.inline,
    img.inline {
      width: 100%;
      margin-block-start: var(--s-3);
    }
    img.inline {
      display: block;
      height: auto;
    }
    .sr {
      position: absolute;
      width: 1px;
      height: 1px; /* taste-skill-ignore : masquage visuel pour lecteur d écran */
      overflow: hidden;
      clip-path: inset(50%);
    }
    .preview {
      display: none;
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
      .inline {
        display: none;
      }
      .preview {
        position: sticky;
        top: var(--s-9);
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
      .shot > * {
        grid-area: 1 / 1;
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .shot,
      .preview {
        transition: none;
      }
    }
  `,
})
export class ProjectIndex {
  /** `null` = API en échec. */
  readonly projects = input<ProjectSummary[] | null>(null);
  private readonly locale = inject(LOCALE_ID);
  protected readonly rows = computed(
    () =>
      this.projects()?.map((p) => ({
        p,
        study: p.tier === 'CASE_STUDY',
        meta: splitParts(this.locale, { stack: p.stack, commits: p.commits }).join(' · '),
        shot: p.video?.poster ?? CAPTURES[p.slug] ?? null,
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
      this.motion.set(!calm() && matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)').matches);
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
