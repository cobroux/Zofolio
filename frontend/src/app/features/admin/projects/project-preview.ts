import { Component, ElementRef, afterNextRender, effect, input, output, viewChild } from '@angular/core';
import { ProjectSummary } from '../../../core/api/api.models';
import { CaseStudyView } from '../../projects/case-study-view';

/** Aperçu plein écran (DESIGN §11.1) : le vrai gabarit public. `<dialog>` modal : Esc, focus piégé, focus rendu au bouton d'origine. */
@Component({
  selector: 'app-project-preview',
  imports: [CaseStudyView],
  template: `
    <dialog #dlg class="prev" aria-label="Aperçu du projet" (close)="closed.emit()">
      @if (project(); as p) {
        <div class="prev-bar">
          <span>Aperçu · {{ lang().toUpperCase() }} · non enregistré</span>
          <button type="button" class="btn" (click)="dlg.close()">Fermer</button>
        </div>
        <div [attr.lang]="lang()"><app-case-study-view [project]="p" /></div>
      }
    </dialog>
  `,
})
export class ProjectPreview {
  readonly project = input<ProjectSummary | null>(null);
  readonly lang = input<'fr' | 'en'>('fr');
  readonly closed = output();
  private readonly dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  constructor() {
    // lecture seule : un clic sur un lien ne doit pas quitter le formulaire non enregistré
    afterNextRender(() => this.dlg().nativeElement.addEventListener('click', (e) => (e.target as Element).closest('a') && e.preventDefault()));
    effect(() => {
      const d = this.dlg().nativeElement;
      if (this.project() && !d.open) d.showModal();
    });
  }
}
