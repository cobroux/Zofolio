import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomeResponse } from '../../../core/api/api.models';
import { CAPTURES } from '../project-index/project-index';
import { Aid } from '../../../shared/aid/aid';
import { ChapterPin } from '../../../shared/chapter-pin/chapter-pin';
import { PhotoPlates, Plate } from '../../../shared/photo-plates/photo-plates';

/** P1 (Les fondations, km 20), compacte (spec §6) : une bande, puis l'index des projets d'école (captures réelles en plaque, les autres en ligne de texte, aucune tuile de remplissage) ; suivie du ravitaillement R1. `home` null = API en échec. */
@Component({
  selector: 'app-p1',
  imports: [Aid, ChapterPin, NgTemplateOutlet, PhotoPlates, RouterLink],
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
          <div class="index">
            <p class="index-title" i18n>Projets d'école :</p>
            @if (shown().length) {
              <ul class="shots">
                @for (r of shown(); track r.p.slug) {
                  <li>
                    <img [src]="r.src" alt="" width="480" height="300" loading="lazy" />
                    <ng-container
                      *ngTemplateOutlet="name; context: { $implicit: r.p }"
                    ></ng-container>
                  </li>
                }
              </ul>
            }
            @if (listed().length) {
              <ul class="others">
                @for (p of listed(); track p.slug) {
                  <li>
                    <ng-container
                      *ngTemplateOutlet="name; context: { $implicit: p }"
                    ></ng-container>
                  </li>
                }
              </ul>
            }
          </div>
          <ng-template #name let-p>
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
          </ng-template>
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
    .index {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--s-4) var(--gutter);
    }
    .index-title {
      margin: 0;
      font-weight: 700;
    }
    .index ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    /* Plaque des captures réelles : une carte = un lien. */
    .shots {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--s-3);
    }
    .shots li {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--s-1);
      min-width: 0;
    }
    .shots img {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 16 / 10;
      object-fit: cover;
      object-position: top;
    }
    .shots .name::after {
      content: '';
      position: absolute;
      inset: 0;
    }
    /* Projets sans capture : une ligne de texte, pas de vignette inventée. */
    .others {
      display: flex;
      flex-wrap: wrap;
      align-content: start;
      gap: 0 var(--s-6);
    }
    .others li {
      display: flex;
      align-items: baseline;
      gap: var(--s-2);
    }
    .name {
      display: inline-flex;
      align-items: center;
      min-height: var(--target);
      color: var(--ink);
      font: 800 1.25rem / 1.1 var(--font-display);
      font-stretch: 72%;
    }
    @media (max-width: 767px) {
      .name {
        font-size: 1.0625rem;
      }
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
      .index,
      .note,
      .unavailable {
        grid-column: 1 / -1;
      }
      /* Plaque à gauche, ligne d'index à droite : la rangée occupe toute la largeur. */
      .index {
        grid-template-columns: repeat(12, minmax(0, 1fr));
      }
      .index-title {
        grid-column: 1 / -1;
      }
      .shots {
        grid-column: 1 / span 7;
      }
      .others {
        grid-column: 8 / -1;
        flex-direction: column;
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
  private readonly shot = (slug: string) => this.thumbs[slug] ?? this.captures[slug];
  protected readonly shown = computed(() =>
    this.projects().flatMap((p) => (this.shot(p.slug) ? [{ p, src: this.shot(p.slug) }] : [])),
  );
  protected readonly listed = computed(() => this.projects().filter((p) => !this.shot(p.slug)));
}
