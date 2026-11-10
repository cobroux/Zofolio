import { PROFILE } from '../../features/home-course/profile.data';

const ELE = PROFILE.map(([, e]) => e);
const [MIN, MAX] = [Math.min(...ELE), Math.max(...ELE)];
const KM = PROFILE.at(-1)![0];
// Décor à 6-8 % d'opacité : un point sur trois, arrondi à l'unité (boîte 1000 × 600), suffit à la forme.
// Le HTML SSR passe de ~140 Ko à ~30 Ko de tracés (7 champs sur l'accueil), ce qui compte pour le LCP mobile.
const r = Math.round;
const STRIDE = 3;
const POINTS = PROFILE.filter((_, j) => j % STRIDE === 0 || j === PROFILE.length - 1);

/** Un chemin par niveau : le profil réel (km en X, altitude en Y), décalé verticalement de niveau en niveau. Sans aléatoire. */
export function contourPaths(levels: number, width: number, height: number): string[] {
  const amp = height * 0.4;
  const step = levels > 1 ? (height - amp) / (levels - 1) : 0;
  return Array.from({ length: levels }, (_, i) =>
    POINTS.map(([km, ele], j) => {
      const y = i * step + (1 - (ele - MIN) / (MAX - MIN)) * amp;
      return `${j ? 'L' : 'M'}${r((km / KM) * width)},${r(y)}`;
    }).join(''),
  );
}
