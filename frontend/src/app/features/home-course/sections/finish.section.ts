import { Component, LOCALE_ID, inject } from '@angular/core';
import { Reveal } from '../../../shared/reveal/reveal';
import { ContactForm } from '../../contact/contact-form';

/** Statique (D3) : ne dépend pas de l'API. */
@Component({
  selector: 'app-finish-section',
  imports: [ContactForm, Reveal],
  template: `
    <section id="arrivee" aria-labelledby="arrivee-title">
      <div class="intro">
        <p class="small tnum" appReveal i18n>Arrivée 20 h 05 · km 79,4</p>
        <h2 id="arrivee-title" appReveal i18n>Prochain objectif :<br />100 km.</h2>
        <p class="lead" [appReveal]="1" i18n>Et un nouveau poste. Parlons-en.</p>
        <a class="cv" [href]="cv" [appReveal]="1" i18n>Télécharger le CV</a>
        <div class="contact" [appReveal]="2">
          <p>
            <a href="mailto:enzo.lvq12@gmail.com">enzo.lvq12@gmail.com</a> ·
            <a href="https://github.com/cobroux" rel="noopener">GitHub</a> ·
            <a href="https://www.linkedin.com/in/enzo-leveque1" rel="noopener">LinkedIn</a>
          </p>
          <p i18n>Recherche basée à Paris. Français, anglais (TOEIC 910).</p>
        </div>
      </div>
      <app-contact-form [appReveal]="2" />
      <p class="foot" i18n>Phidippides a couru de Marathon à Athènes pour porter un message. Ici, un formulaire suffit.</p>
    </section>
  `,
  styles: `
    section {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--s-7) var(--gutter);
      padding: var(--s-10) var(--margin) var(--s-9);
      background: var(--accent);
      color: var(--on-accent);
    }
    .intro {
      container-type: inline-size;
      display: flex;
      flex-direction: column;
      gap: var(--s-5);
      align-items: flex-start;
    }
    /* Deux lignes imposées ; la taille suit la largeur de la colonne pour que « Prochain objectif : » tienne sur la première. */
    h2 {
      margin: 0;
      font-family: var(--font-display);
      font-size: clamp(2.5rem, 15cqi, 8rem);
    }
    p { margin: 0; }
    .small, .contact { font-size: var(--t-small); }
    .lead { font-size: var(--t-lead); font-weight: 600; line-height: 1.3; max-width: 24ch; }
    .contact { display: flex; flex-direction: column; gap: var(--s-1); }
    a { color: inherit; }
    .contact a { display: inline-flex; align-items: center; min-height: var(--target); }
    a:focus-visible { outline: 3px solid currentColor; outline-offset: 2px; }
    .cv {
      display: inline-flex;
      align-items: center;
      min-height: 48px;
      padding: 0 var(--s-6);
      background: var(--bg);
      color: var(--ink);
      font-weight: 600;
      text-decoration: none;
      transition: transform 140ms var(--ease-out);
    }
    .cv:active { transform: scale(0.97); }
    .foot { max-width: 44ch; font-size: var(--t-small); }
    @media (min-width: 1100px) {
      section { grid-template-columns: repeat(12, minmax(0, 1fr)); }
      /* Formulaire sur deux rangées ; la phrase de Phidippides ferme la colonne gauche, au niveau du bouton d'envoi. */
      .intro { grid-column: 1 / span 6; grid-row: 1; }
      app-contact-form { grid-column: 8 / span 5; grid-row: 1 / span 2; }
      .foot { grid-column: 1 / span 6; grid-row: 2; align-self: end; }
    }
  `,
})
export class FinishSection {
  protected readonly cv = `/api/${inject(LOCALE_ID).slice(0, 2)}/cv`;
}
