import { ChangeDetectionStrategy, Component, afterNextRender, inject, viewChild, ElementRef } from '@angular/core';
import { CHECKPOINTS } from '../profile.data';
import { CHECKPOINT_IDS, CourseProgress, TOTAL_KM, formatKm, profilePath } from '../course-progress';

const STEPS = {
  depart: { name: $localize`Départ`, line: $localize`Ingénieur fullstack, Java et Angular.` },
  p1: { name: $localize`P1 · Fondations`, line: $localize`Les bases du métier, posées à la main.` },
  p2: { name: $localize`P2 · Worldline`, line: $localize`La plus longue étape : trading et production.` },
  p3: { name: $localize`P3 · Projets perso`, line: $localize`Ce que j'ai construit pour le plaisir.` },
  arrivee: { name: $localize`Arrivée`, line: $localize`Parlons-en : contact, CV, GitHub.` },
};

@Component({
  selector: 'app-road-book',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './road-book.html',
  styleUrl: './road-book.css',
})
export class RoadBook {
  protected readonly progress = inject(CourseProgress);
  protected readonly d = profilePath(false);
  protected readonly formatKm = formatKm;
  protected readonly total = TOTAL_KM;
  protected readonly steps = CHECKPOINT_IDS.map((id) => ({ id, km: CHECKPOINTS[id], ...STEPS[id] }));
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  constructor() {
    afterNextRender(() => this.progress.start());
  }

  protected open(): void {
    this.dialog().nativeElement.showModal();
  }

  protected close(): void {
    this.dialog().nativeElement.close();
  }

  /** Appelé à tout `close` (Esc, tap sur une étape, bouton) : le focus revient au déclencheur. */
  protected restoreFocus(): void {
    this.trigger().nativeElement.focus({ preventScroll: true });
  }
}
