import { Component, input } from '@angular/core';
import { ProjectSummary } from '../../core/api/api.models';
import { AiTag } from '../ai-tag/ai-tag';
import { Split } from '../split/split';

/** Carte segment (DESIGN §6) : `large` pour la carte dominante. Carrée, sans ombre. */
@Component({
  selector: 'app-segment-card',
  imports: [AiTag, Split],
  host: { '[class.large]': 'large()' },
  template: `
    <article>
      <header>
        <h3>{{ project().title }}</h3>
        <app-ai-tag [tag]="project().aiTag" />
      </header>
      <p>{{ project().pitch }}</p>
      <app-split [duration]="project().duration" [stack]="project().stack" [commits]="project().commits" [note]="project().note" />
      @if (project().repoUrl) {
        <a [href]="project().repoUrl" rel="noopener" i18n>Voir le dépôt<span class="sr"> {{ project().title }}</span></a>
      }
    </article>
  `,
  styles: `
    :host {
      display: block;
    }
    article {
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
      height: 100%;
      padding: var(--s-5);
      background: var(--surface);
    }
    :host(.large) article {
      gap: var(--s-3);
      padding: var(--s-6);
    }
    header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: var(--s-4);
    }
    h3 {
      font-size: 2rem;
    }
    :host(.large) h3 {
      font-size: 2.75rem;
    }
    a {
      display: inline-flex;
      align-items: center;
      align-self: flex-start;
      margin-block-start: auto;
      min-height: var(--target);
      transition: transform 140ms var(--ease-out);
    }
    a:active {
      transform: scale(0.97);
    }
    .sr {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
    }
  `,
})
export class SegmentCard {
  readonly project = input.required<ProjectSummary>();
  readonly large = input(false);
}
