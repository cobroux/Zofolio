import { Component } from '@angular/core';
import { ContactForm } from '../../contact/contact-form';

/** Statique (D3) : ne dépend pas de l'API. */
@Component({
  selector: 'app-finish-section',
  imports: [ContactForm],
  template: `
    <section id="arrivee" aria-labelledby="arrivee-title">
      <div class="intro">
        <p class="chronos" i18n>Dossard 1592 · 79,4 km · 3 160 m D+ · 13 h 35 min 53 s</p>
        <h2 id="arrivee-title" i18n>Prochain objectif : 100 km… et un nouveau poste</h2>
        <p class="lead" i18n>Je cherche un poste d'ingénieur fullstack Java / Spring Boot et Angular. Recherche basée à Paris.</p>
        <ul>
          <li><ng-container i18n>E-mail</ng-container> : <a href="mailto:enzo.lvq12@gmail.com">enzo.lvq12@gmail.com</a></li>
          <li><a href="https://github.com/cobroux" rel="noopener">GitHub</a></li>
          <li><a href="https://www.linkedin.com/in/enzo-leveque1" rel="noopener">LinkedIn</a></li>
          <li><a class="cv" href="/api/fr/cv" i18n>Télécharger le CV</a></li>
        </ul>
        <p i18n>Français, anglais (TOEIC 910)</p>
      </div>
      <app-contact-form />
      <p class="foot" i18n>13 h 35 min 53 s. Phidippides aurait signé.</p>
    </section>
  `,
  styles: `
    section {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--s-7) var(--s-9);
      padding: var(--s-10) var(--margin) var(--s-9);
      background: var(--accent);
      color: var(--on-accent);
    }
    .intro { display: flex; flex-direction: column; gap: var(--s-5); align-items: flex-start; }
    h2 { margin: 0; font-family: var(--font-display); font-size: var(--t-display); }
    p { margin: 0; }
    .chronos { font-variant-numeric: tabular-nums; font-size: var(--t-small); }
    .lead { font-size: var(--t-lead); font-weight: 600; max-width: 28ch; }
    ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: var(--s-2); }
    a { color: inherit; display: inline-flex; align-items: center; min-height: var(--target); }
    a:focus-visible { outline: 3px solid currentColor; outline-offset: 2px; }
    .cv { padding: 0 var(--s-5); background: var(--bg); color: var(--ink); font-weight: 600; text-decoration: none; }
    .foot { grid-column: 1 / -1; font-size: var(--t-small); }
    /* Le formulaire reste lisible sur l'aplat : champs et bouton posés sur --bg / --ink. */
    @media (min-width: 1100px) {
      section { grid-template-columns: minmax(0, 6fr) minmax(0, 5fr); }
    }
  `,
})
export class FinishSection {}
