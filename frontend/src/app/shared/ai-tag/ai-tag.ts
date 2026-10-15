import { Component, computed, input } from '@angular/core';
import { ProjectSummary } from '../../core/api/api.models';

const LABELS: Record<ProjectSummary['aiTag'], string> = {
  HAND: $localize`Écrit à la main`,
  HAND_THEN_AI: $localize`Commencé à la main, puis IA`,
  AI: $localize`Conçu avec IA`,
};

/** Étiquette carrée, texte explicite, jamais orange (DESIGN §6). */
@Component({
  selector: 'app-ai-tag',
  template: `{{ label() }}`,
  styles: `
    :host {
      display: inline-block;
      align-self: flex-start;
      padding: 2px 10px;
      border: 1.5px solid var(--ink);
      font-size: var(--t-small);
      font-weight: 600;
      line-height: 1.5;
    }
  `,
})
export class AiTag {
  readonly tag = input.required<ProjectSummary['aiTag']>();
  protected readonly label = computed(() => LABELS[this.tag()]);
}
