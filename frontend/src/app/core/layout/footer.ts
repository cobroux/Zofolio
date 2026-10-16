import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer>
      <p>
        Enzo Leveque ·
        <a href="https://github.com/cobroux" rel="noopener">GitHub</a> ·
        <a href="https://www.linkedin.com/in/enzo-leveque1" rel="noopener">LinkedIn</a>
      </p>
      <nav aria-label="Pied de page" i18n-aria-label>
        <a routerLink="/colophon" i18n>Colophon</a>
        <a routerLink="/mentions-legales" i18n>Mentions légales</a>
      </nav>
    </footer>
  `,
  styles: `
    footer {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-4) var(--s-6);
      align-items: center;
      justify-content: space-between;
      padding: var(--s-7) var(--margin);
      background: var(--surface);
      color: var(--ink-2);
      font-size: var(--t-small);
    }
    @media (min-width: 1100px) {
      footer {
        padding-inline-end: calc(var(--margin) + 72px);
      }
    }
    nav {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-4) var(--s-6);
    }
    a {
      display: inline-flex;
      align-items: center;
      min-height: var(--target);
      color: inherit;
    }
  `,
})
export class Footer {}
