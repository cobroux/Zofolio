import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';
import { CHECKPOINTS } from '../profile.data';
import { CHECKPOINT_IDS, CourseProgress, TOTAL_KM, formatKm, profilePath } from '../course-progress';

const LABELS = {
  depart: { short: '0', full: $localize`Départ` },
  p1: { short: 'P1', full: $localize`Fondations` },
  p2: { short: 'P2', full: $localize`Worldline` },
  p3: { short: 'P3', full: $localize`Projets perso` },
  arrivee: { short: 'Arr.', full: $localize`Arrivée` },
};

@Component({
  selector: 'app-elevation-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './elevation-profile.html',
  styleUrl: './elevation-profile.css',
  host: { '[style.--p]': 'progress.ratio()' },
})
export class ElevationProfile {
  protected readonly progress = inject(CourseProgress);
  protected readonly d = profilePath(true);
  protected readonly total = TOTAL_KM;
  protected readonly formatKm = formatKm;
  protected readonly items = CHECKPOINT_IDS.map((id) => ({ id, km: CHECKPOINTS[id], ...LABELS[id] }));

  constructor() {
    afterNextRender(() => this.progress.start());
  }
}
