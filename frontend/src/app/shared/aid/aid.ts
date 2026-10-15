import { Component, computed, input } from '@angular/core';
import { Experience } from '../../core/api/api.models';

/** Ravitaillement : bande basse entre deux étapes, hors profil (DESIGN §6). */
@Component({
  selector: 'app-aid',
  template: `
    <aside>
      <p class="d tnum">Ravito · km {{ km() }}</p>
      @if (aid(); as a) {
        <div>
          <p>
            <strong>{{ a.title }}</strong> {{ a.body }}
          </p>
          @if (meta(); as m) {
            <p class="small">{{ m }}</p>
          }
        </div>
      } @else {
        <p role="status" i18n>Contenu indisponible pour le moment.</p>
      }
    </aside>
  `,
  styles: `
    :host {
      display: block;
    }
    aside {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: var(--s-3) var(--s-7);
      padding: var(--s-7) var(--margin);
      background: var(--surface);
    }
    .d {
      font: 800 2.25rem / 0.9 var(--font-display);
      font-stretch: 72%;
      letter-spacing: -0.02em;
    }
    div {
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
    }
    p {
      max-width: 62ch;
    }
    .small {
      color: var(--ink-2);
      font-size: var(--t-small);
    }
  `,
})
export class Aid {
  readonly km = input.required<string>();
  readonly aid = input<Experience | undefined>();
  protected readonly meta = computed(() => [this.aid()?.period, this.aid()?.note].filter((x) => x).join(' · '));
}
