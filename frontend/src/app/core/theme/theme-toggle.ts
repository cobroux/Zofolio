import { Component, inject } from '@angular/core';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button type="button" [attr.aria-label]="label()" (click)="theme.cycle()">
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="currentColor">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2" />
        <circle class="i-light" cx="12" cy="12" r="4" />
        <path class="i-dark" d="M12 4a8 8 0 0 0 0 16z" />
        <path class="i-system" d="M12 4a8 8 0 0 1 0 16z" />
      </svg>
    </button>
    <span class="sr-only" role="status">{{ label() }}</span>
  `,
  styles: `
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--target);
      height: var(--target);
      padding: 0;
      border: 0;
      background: none;
      color: inherit;
      cursor: pointer;
      transition: transform 140ms var(--ease-out);
    }
    button:active {
      transform: scale(0.97);
    }
    /* icône pilotée par data-theme (posé par le script inline) : identique en SSR et après hydratation */
    .i-light, .i-dark { display: none; }
    :root[data-theme='light'] .i-light, :root[data-theme='dark'] .i-dark { display: inline; }
    :root[data-theme] .i-system { display: none; }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  `,
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);

  protected label() {
    const m = this.theme.mode();
    return m === 'system' ? $localize`Thème : système` : m === 'light' ? $localize`Thème : clair` : $localize`Thème : sombre`;
  }
}
