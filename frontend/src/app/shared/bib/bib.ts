import { Component } from '@angular/core';

/** Dossard 1592, purement décoratif : le nom reste le h1 (DESIGN §6). La taille se règle par `font-size` sur l'hôte. */
@Component({
  selector: 'app-bib',
  host: { 'aria-hidden': 'true' },
  template: `1592`,
  styleUrl: './bib.css',
})
export class Bib {}
