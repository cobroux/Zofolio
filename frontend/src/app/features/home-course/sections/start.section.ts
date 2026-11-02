import { Component, LOCALE_ID, inject } from '@angular/core';
import { Bib } from '../../../shared/bib/bib';
import { ContourField } from '../../../shared/contour-field/contour-field';

/** Départ (spec §6) : textes d'interface statiques (D3), aucune donnée d'API. */
@Component({
  selector: 'app-start',
  imports: [Bib, ContourField],
  template: `
    <section id="depart" class="terrain-night">
      <app-contour-field [levels]="12" />
      <div class="text">
        <h1>Enzo <span>Leveque</span></h1>
        <p class="title" i18n>Ingénieur fullstack Java/Spring + Angular, chez Aubay après 2,5 ans de trading chez Worldline</p>
        <p class="proof tnum" i18n>2,5 ans sur une plateforme d'ordres de bourse en production · migration move2cloud vers RabbitMQ · Angular SSR et Spring Boot 4 en production ici même</p>
        <div class="cta">
          <a class="primary" [href]="cv" i18n>Télécharger le CV</a>
          <a class="secondary" href="#arrivee" i18n>Me contacter</a>
        </div>
      </div>
      <div class="plate">
        <picture>
          <source type="image/avif" srcset="img/portrait-480.avif 480w, img/portrait-800.avif 800w, img/portrait-1200.avif 1200w" sizes="(min-width: 1100px) 40vw, 100vw" />
          <source type="image/webp" srcset="img/portrait-480.webp 480w, img/portrait-800.webp 800w, img/portrait-1200.webp 1200w" sizes="(min-width: 1100px) 40vw, 100vw" />
          <img
            src="img/portrait-800.jpg"
            srcset="img/portrait-480.jpg 480w, img/portrait-800.jpg 800w, img/portrait-1200.jpg 1200w"
            sizes="(min-width: 1100px) 40vw, 100vw"
            width="1200"
            height="1600"
            fetchpriority="high"
            i18n-alt
            alt="Enzo Leveque en tenue de trail, devant un ciel bleu."
          />
        </picture>
        <app-bib />
      </div>
    </section>
  `,
  styleUrl: './start.section.css',
})
export class StartSection {
  protected readonly cv = `/api/${inject(LOCALE_ID).slice(0, 2)}/cv`;
}
