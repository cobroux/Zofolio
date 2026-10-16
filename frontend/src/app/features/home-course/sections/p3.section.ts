import { Component, computed, input } from '@angular/core';
import { ProjectSummary } from '../../../core/api/api.models';
import { RouterLink } from '@angular/router';
import { Reveal } from '../../../shared/reveal/reveal';
import { Clip } from '../../../shared/clip/clip';
import { Split } from '../../../shared/split/split';
import { AiTag } from '../../../shared/ai-tag/ai-tag';

/** Mosaïque : le premier projet (Oltre) en grand avec son emplacement vidéo, les autres empilés à droite ; aucune case vide. */
@Component({
  selector: 'app-p3-section',
  imports: [AiTag, Clip, Reveal, RouterLink, Split],
  template: `
    <section id="p3" aria-labelledby="p3-title">
      <header appReveal>
        <span class="km" i18n>P3 · km 58,2</span>
        <h2 id="p3-title" i18n>Nés de la course</h2>
      </header>
      @if (items(); as list) {
        @for (p of list; track p.slug; let i = $index, last = $last) {
          <article
            [class.lead]="i === 0"
            [class.wide]="i > 0 && last && list.length % 2 === 0"
            [style.--span]="i === 0 ? stacked() : null"
            [appReveal]="i === 0 ? 1 : 2"
          >
            @if (i === 0) {
              <app-clip class="poster" [video]="p.video" />
            }
            <div class="head">
              <h3>{{ p.title }}</h3>
              <app-ai-tag [tag]="p.aiTag" />
            </div>
            <p>{{ p.pitch }}</p>
            <app-split [duration]="p.duration" [stack]="p.stack" [commits]="p.commits" [languages]="p.languages" [lastPushAt]="p.lastPushAt" [note]="p.note" />
            <div class="links">
              @if (p.tier === 'CASE_STUDY') {
                <a class="study" [routerLink]="['/projets', p.slug]" i18n>Lire l'étude de cas<span class="sr"> {{ p.title }}</span></a>
              }
              @if (p.repoUrl) {
                <a [href]="p.repoUrl" rel="noopener" i18n>Voir le dépôt<span class="sr"> {{ p.title }}</span></a>
              }
            </div>
          </article>
        } @empty {
          <p class="unavailable" i18n>Contenu indisponible pour le moment.</p>
        }
      } @else {
        <p class="unavailable" i18n>Contenu indisponible pour le moment.</p>
      }
    </section>
  `,
  styles: `
    section {
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      gap: var(--s-5) var(--gutter);
      padding: var(--s-10) var(--margin) var(--s-9);
    }
    header {
      grid-column: 1 / -1;
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: var(--s-3) var(--s-5);
      margin-block-end: var(--s-5);
    }
    .km {
      color: var(--accent);
      font: 800 clamp(1.75rem, 4vw, 2.5rem) / 0.9 var(--font-display);
      font-stretch: 72%;
      font-variant-numeric: tabular-nums;
    }
    h2 {
      margin: 0;
      font-family: var(--font-display);
      font-size: var(--t-display);
    }
    h3 {
      margin: 0;
      font-family: var(--font-display);
      font-size: clamp(1.75rem, 3vw, 2.75rem);
    }
    article {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--s-3);
      padding: var(--s-5);
      background: var(--surface);
    }
    /* Projet phare : ouvert, sans aplat, l'affiche vidéo porte le poids. */
    .lead {
      padding: 0;
      background: none;
    }
    .lead h3 {
      font-size: clamp(2.25rem, 4vw, 3.5rem);
    }
    .poster {
      display: block;
      width: 100%;
      margin-block-end: var(--s-3);
    }
    p {
      margin: 0;
      max-width: 52ch;
    }
    .links {
      display: flex;
      flex-wrap: wrap;
      gap: 0 var(--s-5);
      margin-block-start: auto;
    }
    .study {
      text-decoration: underline;
      text-underline-offset: 0.2em;
    }
    .head {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: var(--s-3);
      width: 100%;
    }
    a {
      display: inline-flex;
      align-items: center;
      min-height: var(--target);
      color: var(--ink);
      transition: transform 140ms var(--ease-out);
    }
    a:active {
      transform: scale(0.97);
    }
    .sr {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
    }
    .unavailable {
      grid-column: 1 / -1;
      color: var(--ink-2);
    }
    /* Tablette : phare en pleine largeur, les autres par deux ; le dernier s'élargit s'il est seul. */
    @media (min-width: 768px) {
      article { grid-column: span 6; }
      .lead, .wide { grid-column: 1 / -1; }
    }
    /* Desktop : phare sur 7 colonnes à côté d'une pile paire de cartes sur 5 ; l'éventuelle carte restante passe en bandeau. */
    @media (min-width: 1100px) {
      .lead { grid-column: 1 / span 7; grid-row: span var(--span, 1); padding-inline-end: var(--s-5); }
      article:not(.lead) { grid-column: 8 / span 5; }
      article.wide { grid-column: 1 / -1; }
    }
  `,
})
export class P3Section {
  /** `null` = API en échec. */
  readonly projects = input<ProjectSummary[] | null>(null);
  readonly items = computed(() => this.projects()?.filter((p) => p.stage === 'P3') ?? null);
  /** Cartes empilées à côté du phare : un nombre pair (la dernière d'un nombre impair passe en bandeau). */
  protected readonly stacked = computed(() => {
    const n = (this.items()?.length ?? 1) - 1;
    return Math.max(1, n % 2 ? n - 1 : n);
  });
}
