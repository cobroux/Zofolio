import { Component, computed, input } from '@angular/core';
import { HomeResponse } from '../../../core/api/api.models';
import { RouterLink } from '@angular/router';
import { Aid } from '../../../shared/aid/aid';
import { Reveal } from '../../../shared/reveal/reveal';
import { Split } from '../../../shared/split/split';

/** P2 (Worldline, km 44, la plus longue étape) suivi du ravitaillement R2. `home` null = API en échec. */
@Component({
  selector: 'app-p2',
  imports: [Aid, Reveal, RouterLink, Split],
  template: `
    <section id="p2" aria-labelledby="p2-title">
      <div class="head" appReveal>
        <span class="stage d tnum" i18n>P2 · km 44 · la plus longue étape</span>
        <h2 id="p2-title" i18n>2,5 ans sur une appli de trading</h2>
      </div>
      <div class="intro">
      <p class="lead" [appReveal]="1" i18n>
        Chez Worldline, de 2023 à 2025 : 2,5 ans d'expérience professionnelle. L'application permet à des professionnels de la finance d'acheter et de
        vendre des titres en bourse. Ici, une erreur ne se voit pas dans un log : elle se voit dans un ordre.
      </p>
      <a class="study" routerLink="/projets/trading-app" i18n>Lire l'étude de cas<span class="sr"> Worldline</span></a>
      <p class="now" [appReveal]="1" i18n>
        Depuis juin 2026 : ingénieur d'études chez Aubay. En mission sur une application d'inventaire en microservices pour les Restos du Cœur,
        j'interviens sur le back end en Python. J'ai aussi monté l'environnement Docker du projet et j'appuie l'équipe sur GitLab.
      </p>
      </div>
      @if (home() === null) {
        <p class="unavailable" role="status" i18n>Contenu indisponible pour le moment.</p>
      } @else {
        <ol [appReveal]="2">
          @for (m of missions(); track m.title) {
            <li>
              <h3>{{ m.title }}</h3>
              <p>{{ m.body }}</p>
              <app-split [duration]="m.period" [stack]="m.stack" [note]="m.note" />
            </li>
          }
        </ol>
      }
    </section>
    <app-aid km="51" [aid]="aid()" />
  `,
  styles: `
    :host {
      display: block;
    }
    section {
      --split-ink: light-dark(#a9b1c3, var(--ink-2));
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--s-8) var(--gutter);
      padding: var(--s-9) var(--margin);
      /* Aplat inversé : encre en clair, surface en sombre (DESIGN §3). */
      /* sombre : un cran au-dessus de --surface pour garder la respiration de P2 (décision Enzo, revue T34 m10) */
      background: light-dark(var(--ink), #1b2a48);
      color: light-dark(var(--bg), var(--ink));
    }
    .head {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
    }
    .stage {
      color: light-dark(#ff8a2b, var(--accent));
      font: 800 clamp(1.75rem, 4vw, 2.5rem) / 0.9 var(--font-display);
      font-stretch: 72%;
    }
    .intro {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    .lead {
      font-size: var(--t-lead);
      line-height: 1.35;
    }
    .now {
      margin-block-start: var(--s-6);
      max-width: var(--measure);
    }
    .study {
      display: inline-flex;
      align-items: center;
      min-height: var(--target);
      color: inherit;
      text-decoration: underline;
      text-underline-offset: 0.2em;
    }
    .sr {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
    }
    ol {
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
      gap: var(--s-3);
      padding-inline-start: var(--s-6);
    }
    /* Frise : un repère carré par mission sur un trait vertical. */
    li::before {
      content: '';
      position: absolute;
      inset-block: 0 calc(var(--s-7) * -1);
      inset-inline-start: 5px;
      width: 2px;
      background: light-dark(#a9b1c3, var(--line-muted));
    }
    li:last-child::before {
      inset-block-end: 0;
    }
    li::after {
      content: '';
      position: absolute;
      inset-block-start: 0.5em;
      inset-inline-start: 0;
      width: 12px;
      height: 12px;
      background: light-dark(#ff8a2b, var(--accent));
    }
    h3 {
      font-size: 2.75rem;
    }
    @media (min-width: 768px) {
      section {
        min-height: 160svh;
      }
    }
    @media (min-width: 1100px) {
      section {
        grid-template-columns: repeat(12, minmax(0, 1fr));
        align-content: start;
        padding-block: var(--s-10);
      }
      .head {
        grid-column: 1 / -1;
      }
      .head h2 {
        max-width: 12ch;
      }
      /* Le texte d'intro accompagne la lecture de la frise au lieu de laisser une colonne vide. */
      .intro {
        grid-column: 1 / span 6;
        position: sticky;
        top: var(--s-9);
        align-self: start;
      }
      ol,
      .unavailable {
        grid-column: 7 / span 6;
      }
    }
  `,
})
export class P2Section {
  readonly home = input<HomeResponse | null | undefined>();
  protected readonly missions = computed(() => this.home()?.experiences.filter((e) => e.stage === 'P2') ?? []);
  protected readonly aid = computed(() => this.home()?.experiences.find((e) => e.stage === 'R2'));
}
