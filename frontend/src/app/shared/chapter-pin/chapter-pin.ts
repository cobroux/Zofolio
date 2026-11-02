import { Component, input } from '@angular/core';

/** Chapitre épinglé d'une étape : sticky à gauche sur ordinateur, barre de 48 px sous 768 px, jamais sticky si `sticky` vaut false. */
@Component({
  selector: 'app-chapter-pin',
  template: `
    <div class="pin" [class.sticky]="sticky()">
      <span class="mark">{{ mark() }}</span>
      <span class="title">{{ title() }}</span>
      <span class="meta tnum">{{ meta() }}</span>
    </div>
  `,
  styleUrl: './chapter-pin.css',
})
export class ChapterPin {
  readonly mark = input.required<string>();
  readonly title = input.required<string>();
  readonly meta = input.required<string>();
  readonly sticky = input(true);
}
