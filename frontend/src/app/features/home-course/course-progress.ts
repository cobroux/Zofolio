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

/** Interpolation linéaire de y sur une suite de points [x, y] à x croissant (bornée aux extrémités). */
function lerp(x: number, pts: readonly (readonly [number, number])[]): number {
  if (x <= pts[0][0]) return pts[0][1];
  const i = pts.findIndex(([px]) => px >= x);
  if (i < 0) return pts.at(-1)![1];
  const [[x0, y0], [x1, y1]] = [pts[i - 1], pts[i]];
  return x1 === x0 ? y1 : y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
}

/** Altitude en m au km donné (bornée aux extrémités). */
export const altitudeAt = (km: number) => lerp(km, PROFILE);

/** D+ cumulé en m jusqu'au km donné : somme des montées, dernier segment au prorata. */
export function gainAt(km: number): number {
  let sum = 0;
  for (let i = 1; i < PROFILE.length && PROFILE[i - 1][0] < km; i++) {
    const [[k0, e0], [k1, e1]] = [PROFILE[i - 1], PROFILE[i]];
    const up = Math.max(0, e1 - e0);
    sum += km >= k1 ? up : (up * (km - k0)) / (k1 - k0);
  }
  return sum;
}

/** Dernier pointage dont le km est ≤ `km`. Comparé au dixième, comme le km affiché : 79,41 vaut 79,4, sinon l'arrivée ne serait jamais « passée ». */
export const lastCheckpoint = (km: number): CheckpointId =>
  CHECKPOINT_IDS.filter((id) => r(CHECKPOINTS[id]) <= km).at(-1) ?? 'depart';

/** Abscisse du tracé vertical au km donné, de 0 (altitude min) à 1 (max) : même échelle que `profilePath(true)`. */
export const altitudeRatioAt = (km: number) => (lerp(km, PROFILE) - MIN) / (MAX - MIN);

/** km à la position `pos` (ligne de référence, en coordonnées document) : linéaire entre les ancres [haut de section, km du checkpoint], borné aux extrémités. */
export const kmAtScroll = (pos: number, anchors: readonly (readonly [number, number])[]) =>
  lerp(pos, anchors);

/** « 79,4 » (fr) / « 79.4 » (en) : km au dixième, séparateur de la locale. `digits` = décimales imposées (« 44,0 »). */
export const formatKm = (km: number, digits = 0) =>
  r(km).toLocaleString($localize`:@@numberLocale:fr-FR`, { minimumFractionDigits: digits });

/** Checkpoint actif = section qui croise la mi-hauteur du viewport (IntersectionObserver, aucun calcul de layout). */
@Injectable({ providedIn: 'root' })
export class CourseProgress {
  readonly active = signal<CheckpointId>('depart');
  readonly km = computed(() => CHECKPOINTS[this.active()]);
  /** km courant du scroll, au dixième : source unique du libellé ; le point du profil est placé sur la même valeur. Le signal ignore les `set` identiques. */
  readonly scrollKm = signal(0);
  readonly ratio = computed(() => this.km() / TOTAL_KM);
  private io?: IntersectionObserver;

  /** Navigateur seulement. Réobserve les sections courantes (la page d'accueil peut être recréée). Sans section, l'état reste « depart ». */
  start(): void {
    if (typeof IntersectionObserver === 'undefined') return;
    this.io?.disconnect();
    const io = (this.io = new IntersectionObserver(
      (entries) =>
        entries
          .filter((e) => e.isIntersecting)
          .forEach((e) => this.active.set(e.target.id as CheckpointId)),
      { rootMargin: '-33% 0px -67% 0px' },
    ));
    CHECKPOINT_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }
}
