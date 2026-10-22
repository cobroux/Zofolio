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
        <p class="chrono" appReveal>
          <time datetime="PT13H35M53S">13:35:53</time>
          <span i18n>Arrivée 20 h 05 · km 79,4</span>
        </p>
        <h2 id="arrivee-title" appReveal i18n>Prochain objectif :<br />100 km.</h2>
        <div class="gauge" [appReveal]="1" role="img" i18n-aria-label aria-label="79,4 km parcourus sur 100">
          <div class="track" aria-hidden="true"><span class="fill"></span></div>
          <p class="tnum"><span i18n>79,4 km</span><span i18n>100 km</span></p>
        </div>
        <p class="lead" [appReveal]="1" i18n>Et de nouveaux projets. Parlons-en.</p>
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
      <div class="card" [appReveal]="2"><app-contact-form /><i></i></div>
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
    .contact { font-size: var(--t-small); }
    /* Chrono d'arrivée : le temps de la GTA en display tabulaire, la ligne d'origine en légende. */
    .chrono { display: flex; flex-direction: column; gap: var(--s-2); }
    .chrono time { font: 800 clamp(2.5rem, 6cqi, 4rem) / 0.9 var(--font-display); font-stretch: 72%; font-variant-numeric: tabular-nums lining-nums; }
    .chrono span { font-size: var(--t-small); }
    /* Jauge d'objectif : 79,4 / 100, remplie une seule fois à l'entrée dans le viewport. */
    .gauge { width: 100%; max-width: 28rem; display: flex; flex-direction: column; gap: var(--s-2); }
    .track { height: 3px; background: color-mix(in srgb, var(--on-accent) 30%, transparent); }
    .fill { display: block; height: 100%; background: var(--on-accent); transform: scaleX(0.794); transform-origin: left; transition: transform 600ms var(--ease-out); }
    :host-context(html.js) .gauge:not(.in) .fill { transform: scaleX(0); }
    .gauge p { display: flex; justify-content: space-between; font-size: var(--t-small); font-weight: 600; font-variant-numeric: tabular-nums lining-nums; }
    @media (prefers-reduced-motion: reduce) {
      .fill { transition: none; }
      :host-context(html.js) .gauge:not(.in) .fill { transform: scaleX(0.794); }
    }
    /* Dossard : papier sur l'orange, 4 trous d'épingle comme le dossard de segment des pages projet. */
    .card { position: relative; align-self: start; padding: var(--s-8) var(--s-6) var(--s-7); background: var(--bg); color: var(--ink); }
    .card::before, .card::after, .card i::before, .card i::after { content: ''; position: absolute; width: 12px; height: 12px; border-radius: 50%; background: var(--accent); }
    .card::before { inset: 12px auto auto 12px; }
    .card::after { inset: 12px 12px auto auto; }
    .card i::before { inset: auto auto 12px 12px; }
    .card i::after { inset: auto 12px 12px auto; }
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
      .card { grid-column: 8 / span 5; grid-row: 1 / span 2; }
      .foot { grid-column: 1 / span 6; grid-row: 2; align-self: end; }
    }
  `,
})
export class FinishSection {
  protected readonly cv = `/api/${inject(LOCALE_ID).slice(0, 2)}/cv`;
}
