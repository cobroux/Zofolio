import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomeResponse } from '../../../core/api/api.models';
import { Aid } from '../../../shared/aid/aid';
import { ChapterPin } from '../../../shared/chapter-pin/chapter-pin';
import { DecisionCard } from '../../../shared/decision-card/decision-card';
import { PhotoPlates, Plate } from '../../../shared/photo-plates/photo-plates';
import { TradingAppDiagram } from '../../projects/diagrams/trading-app.diagram';
import { WorldlineTimeline } from '../../projects/worldline-timeline';
import { WORLDLINE_GATEWAY } from '../content/decision';

/** P2 (Worldline, km 44, la plus longue étape), spec §6 : chapitre épinglé, faits du CV, Décision, plaques, étude ; suivie du ravitaillement R2. */
@Component({
  selector: 'app-p2',
  imports: [Aid, ChapterPin, DecisionCard, PhotoPlates, RouterLink, TradingAppDiagram, WorldlineTimeline],
  template: `
    <section id="p2" class="terrain-deep">
      <app-chapter-pin mark="P2" i18n-title title="Worldline" i18n-meta meta="km 44 · 2023 → 2025" />
      <div class="stage">
        <p class="lead" i18n>
          Chez Worldline, de 2023 à 2025 : 2,5 ans, en stage puis en alternance. L'application permet à des professionnels de la finance d'acheter et de
          vendre des titres en bourse. Ici, une erreur ne se voit pas dans un log : elle se voit dans un ordre.
        </p>
        <ul class="facts">
          <li i18n>Plateforme TOM (Trade Order Management) : elle reçoit, contrôle et transmet aux marchés les ordres de bourse de clients comme Boursorama et Copartis.</li>
          <li i18n>Prototype move2cloud : l'émetteur d'ordres rendu abstrait pour passer de MySQL à une file RabbitMQ, avec des ordres sérialisés en XML.</li>
          <li i18n>Post-marché Copartis : refonte des batchs de fin de journée, paramétrés par place de marché (Europe, États-Unis, Asie), pour intégrer les retours de marché tardifs.</li>
          <li i18n>Contrôles pré-trade Boursorama : trois contrôles (cohérence de prix, collars, présence bid/ask) rendus désactivables par client, testés en JUnit.</li>
          <li i18n>Portail d'administration multi-clients en JavaScript : statut des marchés en temps réel, internationalisation FR/EN.</li>
        </ul>
        <p class="now" i18n>
          Depuis juin 2026 : ingénieur d'études chez Aubay. En mission sur une application d'inventaire en microservices pour les Restos du Cœur,
          j'interviens sur le back end, en Java/Spring Boot et en Python. J'ai aussi monté l'environnement Docker du projet et j'appuie l'équipe sur GitLab.
        </p>
        <app-decision-card [decision]="decision" />
        <app-photo-plates [main]="diagram"><app-trading-app-diagram plate-ui /></app-photo-plates>
        <app-photo-plates [main]="timeline"><app-worldline-timeline plate-ui /></app-photo-plates>
        <a class="study" routerLink="/projets/trading-app" i18n>Lire l'étude de cas<span class="sr"> Worldline</span></a>
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
    .stage > app-decision-card,
    .stage > app-photo-plates {
      align-self: stretch;
    }
    .lead {
      font-size: var(--t-lead);
      line-height: 1.35;
    }
    .facts {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
      max-width: var(--measure);
      margin: 0;
      padding-inline-start: var(--s-5);
    }
    .facts li::marker {
      color: var(--accent);
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
  protected readonly decision = WORLDLINE_GATEWAY;
  // Pas de photo de Worldline : les plaques prennent le schéma et la frise existants (spec §5, repli data-ui).
  protected readonly diagram: Plate = { ui: true, src: '', alt: '', width: 900, height: 330, caption: $localize`:@@p2.plate.diagram:Le parcours d'un ordre de bourse, de la saisie à l'exécution.` };
  protected readonly timeline: Plate = { ui: true, src: '', alt: '', width: 900, height: 330, caption: $localize`:@@p2.plate.timeline:Mars 2023 à septembre 2025 chez Worldline.` };
}
