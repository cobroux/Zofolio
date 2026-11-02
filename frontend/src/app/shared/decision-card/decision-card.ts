import { Component, input } from '@angular/core';
import { Decision } from '../../features/home-course/content/decision';

/** Encadré Problème / Options / Choix / Résultat (spec §8). Une rubrique vide est retirée, jamais remplie. */
@Component({
  selector: 'app-decision-card',
  template: `
    <section>
      <h3 i18n>Décision</h3>
      <dl>
        @if (decision().problem) {
          <div>
            <dt i18n>Problème</dt>
            <dd>{{ decision().problem }}</dd>
          </div>
        }
        @if (decision().options.length) {
          <div>
            <dt i18n>Options</dt>
            <dd>{{ decision().options.join(', ') }}</dd>
          </div>
        }
        @if (decision().choice) {
          <div>
            <dt i18n>Choix</dt>
            <dd>{{ decision().choice }}</dd>
          </div>
        }
        @if (decision().result) {
          <div>
            <dt i18n>Résultat</dt>
            <dd>{{ decision().result }}</dd>
          </div>
        }
      </dl>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
    /* Un ton au-dessus du terrain (--surface), sans bordure ni ombre. */
    section {
      display: flex;
      flex-direction: column;
      gap: var(--s-5);
      padding: var(--s-6);
      background: var(--surface);
    }
    h3 {
      color: var(--accent);
      font-size: clamp(2rem, 4vw, 2.75rem);
    }
    dl {
      display: grid;
      gap: var(--s-4);
      margin: 0;
    }
    div {
      display: grid;
      gap: var(--s-1);
    }
    dt {
      font-weight: 700;
    }
    dd {
      margin: 0;
      max-width: var(--measure);
    }
    @media (min-width: 600px) {
      div {
        grid-template-columns: 8rem minmax(0, 1fr);
        gap: var(--s-4);
      }
    }
  `,
})
export class DecisionCard {
  readonly decision = input.required<Decision>();
}
