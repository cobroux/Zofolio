import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomeResponse } from '../../../core/api/api.models';
import { Aid } from '../../../shared/aid/aid';
import { ChapterPin } from '../../../shared/chapter-pin/chapter-pin';
import { DecisionCard } from '../../../shared/decision-card/decision-card';
import { WORLDLINE_GATEWAY } from '../content/decision';

/** P2 (Worldline, km 44, la plus longue étape) : le chapitre le plus dense de l'accueil. Résumé, missions en pointages (API), Décision, lien vers l'étude (frise, schéma), puis le poste actuel ; suivie du ravitaillement R2. */
@Component({
  selector: 'app-p2',
  imports: [Aid, ChapterPin, DecisionCard, RouterLink],
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
        @if (missions().length) {
          <ol class="passes" i18n-aria-label aria-label="Missions chez Worldline">
            @for (m of missions(); track m.title) {
              <li>
                @if (m.period) {
                  <p class="when tnum">{{ m.period }}</p>
                }
                <div class="what">
                  <h3>{{ m.title }}</h3>
                  <p>{{ m.body }}</p>
                  @if (m.note) {
                    <p class="small">{{ m.note }}</p>
                  }
                </div>
              </li>
            }
          </ol>
        }
        <app-decision-card [decision]="decision" />
        <a class="study" routerLink="/projets/trading-app" i18n
          >Voir la frise et l'architecture<span class="sr"> de Worldline</span></a
        >
        <div class="passes now">
          <p class="when tnum" i18n>Depuis juin 2026</p>
          <div class="what">
            <h3>Aubay</h3>
            <p i18n>Ingénieur d'études, back end Java/Spring Boot pour les Restos du Cœur.</p>
          </div>
        </div>
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
      max-width: var(--measure);
      font-size: var(--t-lead);
      line-height: 1.35;
    }
    .stack {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-2);
      margin: 0;
      padding: 0;
      list-style: none;
      /* Stack en texte séparé par des points médians : pas de pilules (charte : 0 arrondi). */
      color: var(--ink-2);
    }
    .stack li + li::before {
      content: '·';
      margin-inline-end: var(--s-2);
    }
    /* Pointages : la date à gauche, le fait à droite, comme le tableau des temps de l'Arrivée. Ni carte ni filet. */
    .passes {
      display: flex;
      flex-direction: column;
      gap: var(--s-6);
      align-self: stretch;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .passes li,
    .now {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: var(--s-2) var(--gutter);
    }
    .when {
      color: var(--ink-2);
      font-size: var(--t-small);
      font-weight: 600;
    }
    /* Le poste actuel : seul repère en accent du chapitre, comme l'année en cours de l'endurance. */
    .now .when {
      color: var(--accent);
    }
    .what {
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
    }
    .what h3 {
      font-size: var(--t-lead);
      line-height: 1.05;
    }
    .what p {
      max-width: var(--measure);
    }
    .small {
      color: var(--ink-2);
      font-size: var(--t-small);
    }
    app-decision-card {
      align-self: stretch;
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
    @media (min-width: 768px) {
      .passes li,
      .now {
        grid-template-columns: 12rem minmax(0, 1fr);
      }
      /* Une mission sans date garde sa colonne : les faits restent alignés. */
      .what {
        grid-column: 2;
      }
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
  /** API en échec ou vide : la liste est retirée, le reste du chapitre (texte fixe) tient seul. */
  protected readonly missions = computed(
    () => this.home()?.experiences.filter((e) => e.stage === 'P2' && e.kind === 'MISSION') ?? [],
  );
  protected readonly aid = computed(() => this.home()?.experiences.find((e) => e.stage === 'R2'));
  protected readonly decision = WORLDLINE_GATEWAY;
}
