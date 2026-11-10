import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomeResponse } from '../../../core/api/api.models';
import { Aid } from '../../../shared/aid/aid';
import { ChapterPin } from '../../../shared/chapter-pin/chapter-pin';

/** P2 (Worldline, km 44, la plus longue étape), spec §6 : chapitre épinglé, résumé court + stack, lien vers l'étude (missions, Décision, frise) ; suivie du ravitaillement R2. */
@Component({
  selector: 'app-p2',
  imports: [Aid, ChapterPin, RouterLink],
  template: `
    <section id="p2" class="terrain-deep">
      <app-chapter-pin
        mark="P2"
        i18n-title
        title="Worldline"
        i18n-meta
        meta="km 44 · 2023 → 2025"
      />
      <div class="stage">
        <p class="lead" i18n>
          2,5 ans sur une plateforme d'ordres de bourse (Boursorama, Copartis), en stage puis en
          alternance. Ici, une erreur ne se voit pas dans un log : elle se voit dans un ordre.
        </p>
        <ul class="stack" i18n-aria-label aria-label="Stack Worldline">
          <li>Java</li>
          <li>Spring Boot</li>
          <li>RabbitMQ</li>
          <li>Hibernate</li>
        </ul>
        <p class="now" i18n>
          Depuis juin 2026 : ingénieur d'études chez Aubay, back end Java/Spring Boot pour les
          Restos du Cœur.
        </p>
        <a class="study" routerLink="/projets/trading-app" i18n
          >Voir la frise et l'architecture<span class="sr"> de Worldline</span></a
        >
      </div>
    </section>
    <app-aid km="51" [aid]="aid()" />
  `,
  styles: `
    :host {
      display: block;
    }
    section {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--s-6) var(--gutter);
      padding: var(--s-9) var(--margin);
    }
    /* Sans align-self: start l'hôte s'étire sur toute la rangée et le sticky n'a aucune course. */
    app-chapter-pin {
      align-self: start;
    }
    .stage {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--s-7);
    }
    .lead {
      font-size: var(--t-lead);
      line-height: 1.35;
    }
    .lead {
      max-width: var(--measure);
    }
    .stack {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-2);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    /* Stack en texte séparé par des points médians : pas de pilules (charte : 0 arrondi). */
    .stack {
      color: var(--ink-2);
    }
    .stack li + li::before {
      content: '·';
      margin-inline-end: var(--s-2);
    }
    .study {
      display: inline-flex;
      align-items: center;
      min-height: var(--target);
    }
    .sr {
      position: absolute;
      width: 1px;
      height: 1px; /* taste-skill-ignore : masquage visuel pour lecteur d écran */
      overflow: hidden;
      clip-path: inset(50%);
    }
    @media (min-width: 1100px) {
      section {
        grid-template-columns: repeat(12, minmax(0, 1fr));
        padding-block: var(--s-10);
      }
      app-chapter-pin {
        grid-column: 1 / span 4;
      }
      .stage {
        grid-column: 5 / -1;
      }
    }
  `,
})
export class P2Section {
  readonly home = input<HomeResponse | null | undefined>();
  protected readonly aid = computed(() => this.home()?.experiences.find((e) => e.stage === 'R2'));
}
