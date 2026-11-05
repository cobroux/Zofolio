import { Component, computed, input } from '@angular/core';
import { ProjectSummary } from '../../../core/api/api.models';
import { Reveal } from '../../../shared/reveal/reveal';
import { ProjectIndex } from '../project-index/project-index';

/** P3 (km 58,2), terrain accent : les projets nés de la course en index avec aperçu (spec §6). */
@Component({
  selector: 'app-p3-section',
  imports: [ProjectIndex, Reveal],
  template: `
    <section id="p3" class="terrain-accent" aria-labelledby="p3-title">
      <header appReveal>
        <span class="km" i18n>P3 · km 58,2</span>
        <h2 id="p3-title" i18n>Nés de la course</h2>
      </header>
      <app-project-index [projects]="items()" />
    </section>
  `,
  styles: `
    section {
      display: flex;
      flex-direction: column;
      gap: var(--s-5);
      padding: var(--s-10) var(--margin) var(--s-8);
    }
    header {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: var(--s-3) var(--s-5);
      margin-block-end: var(--s-5);
    }
    .km {
      color: var(--ink);
      font: 800 clamp(1.75rem, 4vw, 2.5rem) / 0.9 var(--font-display);
      font-stretch: 72%;
      font-variant-numeric: tabular-nums;
    }
    h2 {
      margin: 0;
      font-family: var(--font-display);
      font-size: var(--t-display);
    }
  `,
})
export class P3Section {
  /** `null` = API en échec. */
  readonly projects = input<ProjectSummary[] | null>(null);
  readonly items = computed(() => this.projects()?.filter((p) => p.stage === 'P3') ?? null);
}
