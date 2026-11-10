import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomeResponse } from '../../../core/api/api.models';
import { CAPTURES } from '../project-index/project-index';
import { Aid } from '../../../shared/aid/aid';
import { ChapterPin } from '../../../shared/chapter-pin/chapter-pin';
import { ContourField } from '../../../shared/contour-field/contour-field';
import { PhotoPlates, Plate } from '../../../shared/photo-plates/photo-plates';

/** P1 (Les fondations, km 20), compacte (spec §6) : une bande, puis l'index des projets d'école ; suivie du ravitaillement R1. `home` null = API en échec. */
@Component({
  selector: 'app-p1',
  imports: [Aid, ChapterPin, ContourField, PhotoPlates, RouterLink],
  template: `
    <section id="p1" class="terrain-paper">
      <app-chapter-pin
        mark="P1"
        i18n-title
        title="Les fondations"
        i18n-meta
        meta="km 20 · 2020 → 2025"
        [sticky]="false"
      />
      @if (home(); as h) {
        <div class="body">
          @if (master(); as m) {
            <p>
              <strong>{{ m.title }}</strong> {{ m.body }}
            </p>
          }
          @if (studies().length) {
            <ol class="frise" i18n-aria-label aria-label="Études">
              @for (e of studies(); track e.title) {
                <li [style.flex-grow]="e.years">
                  <span class="tnum">{{ e.period }}</span>
                  <span>{{ e.title }}</span>
                </li>
              }
            </ol>
          }
        </div>
        <div class="aside">
          <picture class="badge">
            <source
              type="image/webp"
              srcset="img/univ-artois-320.webp 320w, img/univ-artois-640.webp 640w"
              sizes="10rem"
            />
            <img
              src="img/univ-artois-320.jpg"
              sizes="10rem"
              width="320"
              height="176"
              loading="lazy"
              decoding="async"
              i18n-alt="@@p1.univ.alt"
              alt="Logo de l'Université d'Artois."
            />
          </picture>
          <app-photo-plates [main]="promo" />
        </div>
        @if (projects().length) {
          <p class="index-title" i18n>Projets d'école :</p>
          <ul class="index">
            @for (p of projects(); track p.slug) {
              <li class="card">
                <span class="thumb" aria-hidden="true">
                  @if (thumbs[p.slug] ?? captures[p.slug]; as src) {
                    <img [src]="src" alt="" loading="lazy" />
                  } @else {
                    <app-contour-field [levels]="6 + ($index % 5)" />
                    <span class="mark">{{
                      p.languages[0] ?? p.stack[0] ?? p.title.charAt(0)
                    }}</span>
                  }
                </span>
                @if (p.tier === 'CASE_STUDY') {
                  <a class="name" [routerLink]="['/projets', p.slug]">{{ p.title }}</a>
                } @else if (p.repoUrl) {
                  <a class="name" [href]="p.repoUrl" rel="noopener">{{ p.title }}</a>
                } @else {
                  <span class="name">{{ p.title }}</span>
                }
                @if (p.languages[0] ?? p.stack[0]; as lang) {
                  <span class="lang">{{ lang }}</span>
                }
              </li>
            }
          </ul>
        }
        <p class="small note" i18n>
          Voie romaine sur le GR3 : c'est à peu près ici que le trail devient sérieux.
        </p>
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
      gap: var(--s-5) var(--gutter);
      padding: var(--s-6) var(--margin);
    }
    .body {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }
    p {
      max-width: 62ch;
    }
    .aside {
      display: grid;
      grid-template-columns: 10rem minmax(0, 14rem);
      align-items: start;
      gap: var(--s-5);
    }
    /* Logo de l'université : plaque blanche droite (fond du fichier officiel), sans recadrage. */
    .badge img {
      display: block;
      width: 10rem;
      height: auto;
    }
    /* Mini-frise : un segment par diplôme, longueur proportionnelle à la durée. */
    .frise {
      display: flex;
      gap: var(--s-1);
      margin: 0;
      padding: 0;
      list-style: none;
      font-size: var(--t-small);
    }
    .frise li {
      flex: 1 1 0;
      display: flex;
      flex-direction: column;
      gap: var(--s-1);
      min-width: 0;
      padding-block-start: var(--s-3);
      border-block-start: 6px solid var(--line-muted);
    }
    .frise li:last-child {
      border-color: var(--accent);
    }
    .frise .tnum {
      font-weight: 600;
    }
    .index-title {
      margin: 0;
      font-weight: 700;
    }
    .index-title {
      margin: 0;
      font-weight: 700;
    }
    /* Projets d'école : cartes, une carte = un lien. Vignette si capture, sinon aplat. */
    .index {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
      gap: var(--s-4);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .card {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--s-1);
      min-width: 0;
    }
    .thumb {
      position: relative;
      isolation: isolate;
      display: flex;
      align-items: flex-end;
      aspect-ratio: 16 / 10;
      overflow: hidden;
      background: color-mix(in srgb, var(--ink) 8%, transparent);
    }
    /* Sans capture : courbes de niveau (densité variable par carte) et langage en grand, plutôt qu'un aplat vide. */
    .thumb app-contour-field {
      opacity: 0.22;
    }
    .thumb .mark {
      padding: var(--s-3);
      color: var(--ink-2);
      font: 800 clamp(2rem, 3.5vw, 3rem) / 0.9 var(--font-display);
      font-stretch: 72%;
      letter-spacing: -0.02em;
    }
    .thumb img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top;
    }
    .name {
      display: inline-flex;
      align-items: center;
      min-height: var(--target);
      color: var(--ink);
      font: 800 1.25rem / 1.1 var(--font-display);
      font-stretch: 72%;
    }
    /* Mobile : index compact en deux colonnes, vignettes plus basses, pour ne pas repousser Worldline de plusieurs écrans. */
    @media (max-width: 767px) {
      .index {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--s-3);
      }
      .thumb {
        aspect-ratio: 3 / 2;
      }
      .thumb .mark {
        padding: var(--s-2);
        font-size: 1.75rem;
      }
      .name {
        font-size: 1.0625rem;
      }
    }
    .name::after {
      content: '';
      position: absolute;
      inset: 0;
    }
    .lang {
      font-size: var(--t-small);
      color: var(--ink-2);
    }
    .small {
      color: var(--ink-2);
      font-size: var(--t-small);
    }
    @media (min-width: 1100px) {
      section {
        grid-template-columns: repeat(12, minmax(0, 1fr));
        align-items: start;
      }
      app-chapter-pin {
        grid-column: 1 / span 3;
      }
      .body {
        grid-column: 4 / span 5;
      }
      .aside {
        grid-column: 9 / -1;
        grid-template-columns: 8rem minmax(0, 10rem);
      }
      .badge img {
        width: 8rem;
      }
      .index-title,
      .index,
      .note,
      .unavailable {
        grid-column: 1 / -1;
      }
    }
  `,
})
export class P1Section {
  readonly home = input<HomeResponse | null | undefined>();
  private readonly education = computed(
    () => this.home()?.experiences.filter((e) => e.stage === 'P1' && e.kind === 'EDUCATION') ?? [],
  );
  protected readonly master = computed(() => this.education()[0]);
  /** Ordre chronologique ; « 2020-2023 » → 3 ans (sinon 1). */
  protected readonly studies = computed(() =>
    this.education()
      .filter((e) => e.period)
      .map((e) => {
        const [from, to] = (e.period ?? '').split('-').map(Number);
        return { title: e.title, period: e.period, years: to > from ? to - from : 1 };
      })
      .sort((a, b) => (a.period! < b.period! ? -1 : 1)),
  );
  protected readonly aid = computed(() => this.home()?.experiences.find((e) => e.stage === 'R1'));
  protected readonly promo: Plate = {
    src: 'img/promo-ili-640.jpg',
    alt: $localize`:@@p1.promo.alt:La promo ILI en sweats bleu ciel, sur l'escalier d'un bâtiment de l'université.`,
    caption: $localize`:@@p1.promo.caption:La promo ILI 2024-2025.`,
    width: 640,
    height: 853,
  };
  protected readonly captures = CAPTURES;
  /** Vignettes 480 px des cartes (les captures pleine taille pèsent jusqu'à 138 Ko et pénalisaient le LCP mobile). */
  protected readonly thumbs: Record<string, string> = {
    gfaim: 'media/gfaim-shot-1-480.png',
    'cin-folie': 'media/cinfolie-shot-v2-480.webp',
    'calculateur-dpe': 'media/dpe-shot-480.webp',
  };
  protected readonly projects = computed(
    () => this.home()?.projects.filter((p) => p.stage === 'P1') ?? [],
  );
}
