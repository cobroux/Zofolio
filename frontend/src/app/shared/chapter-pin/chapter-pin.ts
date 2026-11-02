import { Component, input } from '@angular/core';

/** Chapitre épinglé d'une étape (titre = h2 de la section) : sticky à gauche sur ordinateur, barre de 48 px sous 768 px ; `sticky` false = version compacte (P1). */
@Component({
  selector: 'app-chapter-pin',
  template: `
    <div class="pin">
      <span class="mark">{{ mark() }}</span>
      <h2 class="title">{{ title() }}</h2>
      <span class="meta tnum">{{ meta() }}</span>
    </div>
  `,
  styleUrl: './chapter-pin.css',
  // title est une entrée : on retire l'attribut statique de l'hôte pour éviter l'infobulle native.
  host: { '[class.sticky]': 'sticky()', '[attr.title]': 'null' },
})
export class ChapterPin {
  readonly mark = input.required<string>();
  readonly title = input.required<string>();
  readonly meta = input.required<string>();
  readonly sticky = input(true);
}
