import { Component, input } from '@angular/core';

/**
 * Dossard 1592, objet imprimé (spec §5) : avant = couverture, arrière = contenu projeté (colophon de l'Arrivée).
 * La taille se règle par `width` sur l'hôte ; le rectangle 5:3 et ses textes suivent (unités cqi).
 */
@Component({
  selector: 'app-bib',
  template: `
    <div class="face">
      @if (face() === 'front') {
        <span class="num tnum" aria-hidden="true">1592</span>
        <span class="race tnum" i18n>Grand Trail d'Auvergne · 79,4 km · départ 6 h 30</span>
      } @else {
        <ng-content />
      }
    </div>
  `,
  styleUrl: './bib.css',
})
export class Bib {
  readonly face = input<'front' | 'back'>('front');
}
