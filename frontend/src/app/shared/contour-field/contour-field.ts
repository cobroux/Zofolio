import { Component, computed, input } from '@angular/core';
import { contourPaths } from './contours';

const W = 1000;
const H = 600;

/** Courbes de niveau décoratives tirées du profil : statiques (jamais animées), derrière le contenu de la section hôte (position: relative; isolation: isolate). */
@Component({
  selector: 'app-contour-field',
  template: `
    <svg aria-hidden="true" [attr.viewBox]="'0 0 ' + W + ' ' + H" preserveAspectRatio="none">
      @for (d of paths(); track $index) {
        <path [attr.d]="d" />
      }
    </svg>
  `,
  styles: `
    :host { position: absolute; inset: 0; z-index: -1; pointer-events: none; opacity: 0.06; }
    svg { width: 100%; height: 100%; fill: none; stroke: var(--ink); stroke-width: 1.5; }
    path { vector-effect: non-scaling-stroke; }
    @media (prefers-color-scheme: dark) { :host-context(:root:not([data-theme='light'])) { opacity: 0.08; } }
    :host-context(:root[data-theme='dark']) { opacity: 0.08; }
  `,
})
export class ContourField {
  readonly levels = input(12);
  protected readonly W = W;
  protected readonly H = H;
  protected readonly paths = computed(() => contourPaths(this.levels(), W, H));
}
