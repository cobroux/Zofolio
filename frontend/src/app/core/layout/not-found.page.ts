import { Component, inject, RESPONSE_INIT } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <h1 i18n>Page introuvable</h1>
    <p i18n>Vous êtes hors parcours. Le balisage reprend à l'accueil.</p>
    <a routerLink="/" i18n>Retour au départ</a>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--s-5);
      padding: var(--s-9) var(--margin);
    }
    a {
      display: inline-flex;
      align-items: center;
      min-height: var(--target);
    }
  `,
})
export class NotFoundPage {
  constructor() {
    const init = inject(RESPONSE_INIT, { optional: true });
    if (init) init.status = 404;
  }
}
