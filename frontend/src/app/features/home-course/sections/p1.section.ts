import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomeResponse } from '../../../core/api/api.models';
import { Aid } from '../../../shared/aid/aid';
import { ChapterPin } from '../../../shared/chapter-pin/chapter-pin';

/** P1 (Les fondations, km 20), compacte (spec §6) : une bande, puis l'index des projets d'école ; suivie du ravitaillement R1. `home` null = API en échec. */
@Component({
  selector: 'app-p1',
  imports: [Aid, ChapterPin, RouterLink],
  template: `
    <section id="p1" class="terrain-paper">
      <app-chapter-pin mark="P1" i18n-title title="Les fondations" i18n-meta meta="km 20 · 2020 → 2025" [sticky]="false" />
      @if (home(); as h) {
        <div class="body">
          @if (master(); as m) {
            <p><strong>{{ m.title }}</strong> {{ m.body }}</p>
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
        @if (projects().length) {
          <p class="index">
            <span class="label" i18n>Projets d'école :</span>
            @for (p of projects(); track p.slug) {
              @if (p.tier === 'CASE_STUDY') {
                <a class="study" [routerLink]="['/projets', p.slug]">{{ p.title }}</a>
              } @else if (p.repoUrl) {
                <a [href]="p.repoUrl" rel="noopener">{{ p.title }}</a>
              } @else {
                <span>{{ p.title }}</span>
              }
              @if (p.languages[0] ?? p.stack[0]; as lang) {
                <span class="lang">({{ lang }})</span>
              }
            }
          </p>
        }
        <p class="small note" i18n>Voie romaine sur le GR3 : c'est à peu près ici que le trail devient sérieux.</p>
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
      padding: var(--s-8) var(--margin);
    }
    .body {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }
    p {
      max-width: 62ch;
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
    /* Index : une ligne dense de liens (nom et langage), qui devient un paragraphe sur mobile. */
    .index {
      max-width: none;
      line-height: 1.9;
    }
    .index .label {
      font-weight: 700;
    }
    .index a,
    .index .label {
      margin-inline-end: var(--s-1);
    }
    .lang {
      margin-inline-end: var(--s-4);
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
        grid-column: 4 / -1;
      }
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
  private readonly education = computed(() => this.home()?.experiences.filter((e) => e.stage === 'P1' && e.kind === 'EDUCATION') ?? []);
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
  protected readonly projects = computed(() => this.home()?.projects.filter((p) => p.stage === 'P1') ?? []);
}
