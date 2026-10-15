// Usage: node scripts/gpx-to-profile.mjs <fichier.gpx>
// Génère src/app/features/home-course/profile.data.ts : [km, ele] sans lat/lon (D10).
import { readFileSync, writeFileSync } from 'node:fs';

const OFFICIAL_KM = 79.41;
const TARGET = 200; // 180-220 accepté
const out = new URL('../src/app/features/home-course/profile.data.ts', import.meta.url);

const gpx = readFileSync(process.argv[2], 'utf8');
const pts = [...gpx.matchAll(/<trkpt lat="([-\d.]+)" lon="([-\d.]+)">\s*<ele>([-\d.]+)<\/ele>/g)].map((m) => [+m[1], +m[2], +m[3]]);
if (pts.length < 2) throw new Error('aucun <trkpt> trouvé');

const rad = Math.PI / 180;
const hav = ([a, b], [c, d]) => {
  const h = Math.sin(((c - a) * rad) / 2) ** 2 + Math.cos(a * rad) * Math.cos(c * rad) * Math.sin(((d - b) * rad) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};
let acc = 0;
const raw = pts.map((p, i) => [i ? (acc += hav(pts[i - 1], p)) : 0, p[2]]);
const k = OFFICIAL_KM / acc; // recalage sur la distance officielle
const line = raw.map(([km, ele]) => [km * k, ele]);

// Ramer-Douglas-Peucker ; x mis à l'échelle (1 km = 25 m) pour que les deux axes pèsent autant
const S = 25;
function rdp(a, eps) {
  const keep = new Uint8Array(a.length);
  keep[0] = keep[a.length - 1] = 1;
  const stack = [[0, a.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop();
    const [x1, y1] = [a[s][0] * S, a[s][1]];
    const [dx, dy] = [a[e][0] * S - x1, a[e][1] - y1];
    const len = Math.hypot(dx, dy) || 1;
    let max = 0, idx = -1;
    for (let i = s + 1; i < e; i++) {
      const d = Math.abs(dy * (a[i][0] * S - x1) - dx * (a[i][1] - y1)) / len;
      if (d > max) [max, idx] = [d, i];
    }
    if (max > eps) { keep[idx] = 1; stack.push([s, idx], [idx, e]); }
  }
  return a.filter((_, i) => keep[i]);
}
let lo = 0, hi = 500, res = line;
for (let i = 0; i < 40; i++) {
  const mid = (lo + hi) / 2;
  res = rdp(line, mid);
  if (res.length > TARGET) lo = mid; else hi = mid;
}
res = rdp(line, hi);
const prof = res.map(([km, ele], i) => [i === res.length - 1 ? OFFICIAL_KM : Math.round(km * 100) / 100, Math.round(ele)]);

const body = `// Généré par scripts/gpx-to-profile.mjs depuis le GPX officiel. Ne pas éditer.
export const PROFILE: readonly (readonly [km: number, ele: number])[] = [
${prof.map(([a, b]) => `  [${a}, ${b}],`).join('\n')}
];

export const CHECKPOINTS = { depart: 0, p1: 20, p2: 44, p3: 58.2, arrivee: 79.41 } as const;
`;
writeFileSync(out, body);
console.log(`${prof.length} points, ${acc.toFixed(2)} km -> ${OFFICIAL_KM}`);
