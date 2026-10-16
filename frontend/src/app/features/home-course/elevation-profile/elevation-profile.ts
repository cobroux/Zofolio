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
      let anchors: (readonly [number, number])[] = [];
      let stale = true;
      const measure = () => {
        // Position document de chaque section ; le départ est ramené à la ligne de référence du scroll 0 pour valoir km 0 en haut.
        const line = innerHeight / 3;
        anchors = CHECKPOINT_IDS.flatMap((id) => {
          const el = document.getElementById(id);
          return el ? [[el.getBoundingClientRect().top + scrollY, CHECKPOINTS[id]] as const] : [];
        });
        if (anchors.length) anchors[0] = [Math.max(anchors[0][0], line), anchors[0][1]];
        stale = false;
      };
      const update = () => {
        frame = 0;
        if (stale) measure();
        // En bas de page, l'arrivée ne croise jamais la ligne de référence : le bas du scroll vaut l'arrivée.
        const atEnd = scrollY >= document.documentElement.scrollHeight - innerHeight - 1;
        const km = atEnd ? TOTAL_KM : anchors.length ? kmAtScroll(scrollY + innerHeight / 3, anchors) : 0;
        const shown = Math.round(km * 10) / 10;
        this.progress.scrollKm.set(shown);
        host.style.setProperty('--p', String(shown / TOTAL_KM));
        host.style.setProperty('--x', String(altitudeRatioAt(shown)));
      };
      const schedule = () => (frame ||= requestAnimationFrame(update));
      const remeasure = () => {
        stale = true;
        schedule();
      };
      // La hauteur du document change aussi sans resize de fenêtre (polices, images).
      const ro = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(remeasure);
      ro?.observe(document.body);
      update();
      addEventListener('scroll', schedule, { passive: true });
      addEventListener('resize', remeasure, { passive: true });
      destroyRef.onDestroy(() => {
        cancelAnimationFrame(frame);
        removeEventListener('scroll', schedule);
        removeEventListener('resize', remeasure);
        ro?.disconnect();
      });
    });
  }
}
