import { Component } from '@angular/core';
import { Reveal } from '../../shared/reveal/reveal';

/** Frise des 2,5 ans chez Worldline, dans le hero de l'étude (pas de clip ici). Faits repris de l'étude, aucun client ni fonctionnalité nommés (SPEC). */
@Component({
  selector: 'app-worldline-timeline',
  imports: [Reveal],
  template: `
    <h2 class="sr" i18n>Mes 2,5 ans chez Worldline</h2>
    <ol>
      <li appReveal="0"><b class="tnum" i18n>Mars 2023</b><span i18n>Arrivée, développeur back-end</span></li>
      <li appReveal="1"><b i18n>Puis</b><span i18n>Passage fullstack, en équipe Scrum, du besoin à la mise en production</span></li>
      <li appReveal="2"><b i18n>Dernière année</b><span i18n>Une fonctionnalité portée seul, maquette validée avec le Product Owner</span></li>
      <li appReveal="3"><b class="tnum" i18n>Sept. 2025</b><span i18n>Fin de mission, 2,5 ans plus tard</span></li>
    </ol>
  `,
  styles: `
    :host {
      display: block;
    }
    .sr {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
    ol {
      display: grid;
      align-content: start;
      gap: var(--s-5);
      margin: 0;
      padding: 0 0 0 var(--s-5);
      border-inline-start: 2px solid var(--ink);
      list-style: none;
    }
    li {
      position: relative;
      display: grid;
      gap: var(--s-1);
      max-width: 40ch;
    }
    /* Borne kilométrique : carré orange sur la ligne */
    li::before {
      content: '';
      position: absolute;
      inset: 0.55em auto auto calc(-1 * var(--s-5) - 7px);
      width: 12px;
      height: 12px;
      background: var(--accent);
    }
    b {
      color: var(--accent);
      font: 900 clamp(1.5rem, 2.4vw, 2rem) / 1 var(--font-display);
      font-stretch: 62%;
    }
  `,
})
export class WorldlineTimeline {}
