import { Injectable, computed, signal } from '@angular/core';
import { CHECKPOINTS, PROFILE } from './profile.data';

export type CheckpointId = keyof typeof CHECKPOINTS;
export const CHECKPOINT_IDS = Object.keys(CHECKPOINTS) as CheckpointId[];
export const TOTAL_KM = CHECKPOINTS.arrivee;

const ELE = PROFILE.map(([, e]) => e);
const [MIN, MAX] = [Math.min(...ELE), Math.max(...ELE)];
const r = (n: number) => Math.round(n * 10) / 10;

/** km -> coordonnée sur un axe de `size` unités (0 au départ). */
export const kmToCoord = (km: number, size = 1000) => (km / TOTAL_KM) * size;

/** Tracé unique : vertical = km en Y, altitude en X (viewBox 0 0 100 1000) ; sinon km en X (viewBox 0 0 1000 100). */
export function profilePath(vertical: boolean): string {
  return PROFILE.map(([km, ele], i) => {
    const a = r(kmToCoord(km));
    const b = r(((ele - MIN) / (MAX - MIN)) * 100);
    return `${i ? 'L' : 'M'}${vertical ? `${b},${a}` : `${a},${100 - b}`}`;
  }).join('');
}

/** « 79,4 » : km au dixième, virgule française. */
export const formatKm = (km: number) => String(r(km)).replace('.', ',');

/** Checkpoint actif = section qui croise la mi-hauteur du viewport (IntersectionObserver, aucun calcul de layout). */
@Injectable({ providedIn: 'root' })
export class CourseProgress {
  readonly active = signal<CheckpointId>('depart');
  readonly km = computed(() => CHECKPOINTS[this.active()]);
  readonly ratio = computed(() => this.km() / TOTAL_KM);
  private io?: IntersectionObserver;

  /** Navigateur seulement. Réobserve les sections courantes (la page d'accueil peut être recréée). Sans section, l'état reste « depart ». */
  start(): void {
    if (typeof IntersectionObserver === 'undefined') return;
    this.io?.disconnect();
    const io = (this.io = new IntersectionObserver(
      (entries) => entries.filter((e) => e.isIntersecting).forEach((e) => this.active.set(e.target.id as CheckpointId)),
      { rootMargin: '-50% 0px -50% 0px' },
    ));
    CHECKPOINT_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }
}
