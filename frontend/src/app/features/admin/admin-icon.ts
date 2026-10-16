import { Component, input } from '@angular/core';

/** Icônes de l'admin : toujours accompagnées d'un texte (jamais la couleur ni l'icône seules). */
@Component({
  selector: 'app-icon',
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true">
      @switch (name()) {
        @case ('error') { <circle cx="12" cy="12" r="9" /><path d="M12 7v6m0 3.5v.01" /> }
        @case ('hidden') { <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" /><circle cx="12" cy="12" r="2.5" /><path d="M4 4l16 16" /> }
        @case ('published') { <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" /><circle cx="12" cy="12" r="2.5" /> }
      }
    </svg>
  `,
  host: { class: 'ico' },
})
export class Icon {
  readonly name = input.required<'error' | 'hidden' | 'published'>();
}
