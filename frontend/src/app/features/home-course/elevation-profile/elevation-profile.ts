import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
} from '@angular/core';
import { CHECKPOINTS } from '../profile.data';
import {
  CHECKPOINT_IDS,
  CourseProgress,
  TOTAL_KM,
  altitudeRatioAt,
  formatKm,
  kmAtScroll,
  profilePath,
} from '../course-progress';

const LABELS = {
  depart: { short: $localize`0`, full: $localize`Départ` },
  p1: { short: $localize`P1`, full: $localize`Fondations` },
  p2: { short: $localize`P2`, full: $localize`Worldline` },
  p3: { short: $localize`P3`, full: $localize`Projets perso` },
  arrivee: { short: $localize`Arr.`, full: $localize`Arrivée` },
};

@Component({
  selector: 'app-elevation-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './elevation-profile.html',
  styleUrl: './elevation-profile.css',
})
export class ElevationProfile {
  protected readonly progress = inject(CourseProgress);
  protected readonly d = profilePath(true);
  protected readonly total = TOTAL_KM;
  protected readonly formatKm = formatKm;
  protected readonly items = CHECKPOINT_IDS.map((id) => ({
    id,
    km: CHECKPOINTS[id],
    ...LABELS[id],
  }));

  constructor() {
    const host: HTMLElement = inject(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.progress.start();
      // Point et jonction orange/gris pilotés par les mêmes valeurs : --p (km / total, axe Y) et --x (altitude, axe X).
      let frame = 0;
      const update = () => {
        frame = 0;
        const mid = innerHeight / 2;
        const anchors = CHECKPOINT_IDS.flatMap((id) => {
          const el = document.getElementById(id);
          return el
            ? [[el.getBoundingClientRect().top + scrollY - mid, CHECKPOINTS[id]] as const]
            : [];
        });
        // En bas de page, l'arrivée ne croise jamais la mi-hauteur : le bas du scroll vaut l'arrivée.
        const atEnd = scrollY >= document.documentElement.scrollHeight - innerHeight - 1;
        const km = atEnd ? TOTAL_KM : anchors.length ? kmAtScroll(scrollY, anchors) : 0;
        host.style.setProperty('--p', String(km / TOTAL_KM));
        host.style.setProperty('--x', String(altitudeRatioAt(km)));
      };
      const schedule = () => (frame ||= requestAnimationFrame(update));
      update();
      addEventListener('scroll', schedule, { passive: true });
      addEventListener('resize', schedule, { passive: true });
      destroyRef.onDestroy(() => {
        cancelAnimationFrame(frame);
        removeEventListener('scroll', schedule);
        removeEventListener('resize', schedule);
      });
    });
  }
}
