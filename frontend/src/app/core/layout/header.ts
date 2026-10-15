import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeToggle } from '../theme/theme-toggle';

@Component({
  selector: 'app-header',
  imports: [RouterLink, ThemeToggle],
  template: `
    <a class="skip" href="#contenu" (click)="skip($event)" i18n>Aller au contenu</a>
    <header>
      <a class="wordmark" routerLink="/" i18n-aria-label aria-label="E. Leveque, accueil">E. Leveque</a>
      <div class="tools"><!-- Bascule FR/EN masquée (D6). --><app-theme-toggle /></div>
    </header>
  `,
  styles: `
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 64px;
      padding-inline: var(--margin);
    }
    @media (min-width: 1100px) {
      header {
        padding-inline-end: calc(var(--margin) + 72px);
      }
    }
    .wordmark {
      display: inline-flex;
      align-items: center;
      min-height: var(--target);
      font: 800 1.5rem / 1 var(--font-display);
      font-stretch: 72%;
      letter-spacing: -0.02em;
      text-decoration: none;
    }
    .tools {
      display: flex;
      gap: var(--s-2);
    }
    .skip {
      position: absolute;
      inset-block-start: var(--s-2);
      inset-inline-start: var(--s-2);
      z-index: 10;
      padding: var(--s-3) var(--s-4);
      background: var(--ink);
      color: var(--bg);
      transform: translateY(-200%);
    }
    .skip:focus {
      transform: none;
    }
  `,
})
export class Header {
  // Le href="#contenu" seul pointerait vers la racine du <base href="/fr/">.
  skip(event: Event) {
    event.preventDefault();
    document.getElementById('contenu')?.focus();
  }
}
