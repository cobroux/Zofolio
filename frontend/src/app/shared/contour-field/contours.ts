import { PROFILE } from '../../features/home-course/profile.data';

const ELE = PROFILE.map(([, e]) => e);
const [MIN, MAX] = [Math.min(...ELE), Math.max(...ELE)];
const KM = PROFILE.at(-1)![0];
const r = (n: number) => Math.round(n * 10) / 10;

/** Un chemin par niveau : le profil réel (km en X, altitude en Y), décalé verticalement de niveau en niveau. Sans aléatoire. */
export function contourPaths(levels: number, width: number, height: number): string[] {
  const amp = height * 0.4;
  const step = levels > 1 ? (height - amp) / (levels - 1) : 0;
  return Array.from({ length: levels }, (_, i) =>
    PROFILE.map(([km, ele], j) => {
      const y = i * step + (1 - (ele - MIN) / (MAX - MIN)) * amp;
      return `${j ? 'L' : 'M'}${r((km / KM) * width)},${r(y)}`;
    }).join(''),
  );
}
