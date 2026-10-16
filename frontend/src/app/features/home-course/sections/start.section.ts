import { Component, LOCALE_ID, inject } from '@angular/core';
import { Bib } from '../../../shared/bib/bib';

/** Départ (DESIGN §5) : textes d'interface statiques (D3), aucune donnée d'API. */
@Component({
  selector: 'app-start',
  imports: [Bib],
  template: `
    <section id="depart">
      <svg class="contours" aria-hidden="true" viewBox="0 0 800 600" preserveAspectRatio="none">
        <path d="M0,420 C160,360 260,470 420,400 S700,330 800,380" />
        <path d="M0,460 C170,400 270,510 430,440 S710,370 800,420" />
        <path d="M0,500 C180,440 280,550 440,480 S720,410 800,460" />
        <path d="M0,540 C190,480 290,590 450,520 S730,450 800,500" />
      </svg>
      <div class="text">
        <p class="small tnum" i18n>Départ 6 h 30 · km 0</p>
        <h1>Enzo Leveque</h1>
        <p class="title" i18n>Ingénieur fullstack Java / Spring Boot + Angular</p>
        <p class="lead" i18n>2,5 ans sur une application de trading critique chez Worldline.</p>
        <p class="keyfact small" i18n>2,5 ans · Worldline · trading</p>
        <p class="stack small" i18n>Java · Spring Boot · Angular · Docker · SQL</p>
        <div class="cta">
          <a class="primary" [href]="cv" i18n>Télécharger le CV</a>
          <a class="secondary" href="#arrivee" i18n>Me contacter</a>
        </div>
      </div>
      <app-bib />
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
    </section>
  `,
  styleUrl: './start.section.css',
})
export class StartSection {
  protected readonly cv = `/api/${inject(LOCALE_ID).slice(0, 2)}/cv`;
}
