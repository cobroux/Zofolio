import { ChangeDetectionStrategy, Component, computed, inject, viewChild, ElementRef } from '@angular/core';
import { CHECKPOINTS } from '../profile.data';
import { CHECKPOINT_IDS, CourseProgress, formatKm } from '../course-progress';
import { liveValues } from '../live-values';

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
  protected readonly formatKm = formatKm;
  protected readonly steps = CHECKPOINT_IDS.map((id) => ({ id, km: CHECKPOINTS[id], ...STEPS[id] }));
  /** Sur mobile le bandeau ne montre que le km : le road book donne toutes les valeurs en direct. */
  protected readonly live = computed(() => liveValues(this.progress.scrollKm()));
  private target: string | null = null;
  private opener: HTMLElement | null = null;
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  /** Ouvert par le bouton « Parcours » du bandeau de suivi : `opener` reprend le focus à la fermeture. */
  open(opener: HTMLElement): void {
    this.opener = opener;
    this.dialog().nativeElement.showModal();
  }

  /** `target` : section visée par un lien d'étape, qui reçoit le focus à la fermeture. */
  protected close(target: string | null = null): void {
    this.target = target;
    this.dialog().nativeElement.close();
  }

  /** Appelé à tout `close` : le focus va à la section choisie, sinon (Esc, bouton) revient au déclencheur. */
  protected restoreFocus(): void {
    const section = this.target ? document.getElementById(this.target) : null;
    this.target = null;
    if (section) section.tabIndex = -1;
    (section ?? this.opener)?.focus({ preventScroll: true });
  }
}
