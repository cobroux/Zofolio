export type Terrain = 'night' | 'paper' | 'deep' | 'accent';

export interface Pair {
  bg: string;
  surface: string;
  ink: string;
  ink2: string;
  accent: string;
  onAccent: string;
  focus: string;
}

// Mêmes valeurs que les classes .terrain-* de src/styles/tokens.css (spec §5).
const NIGHT: Pair = { bg: '#0e1626', surface: '#16213a', ink: '#edeff4', ink2: '#a9b1c3', accent: '#ff8a2b', onAccent: '#0e1626', focus: '#edeff4' };
const DEEP: Pair = { ...NIGHT, bg: '#0a1120' };

export const TERRAINS: Record<Terrain, { light: Pair; dark: Pair }> = {
  night: { light: NIGHT, dark: NIGHT },
  paper: {
    light: { bg: '#f6f3ec', surface: '#ece8de', ink: '#14161a', ink2: '#4a4d55', accent: '#c2410c', onAccent: '#ffffff', focus: '#14161a' },
    dark: { ...NIGHT, bg: '#16203a', surface: '#1e2b4a' },
  },
  deep: { light: DEEP, dark: DEEP },
  accent: {
    light: { bg: '#c2410c', surface: '#9a3412', ink: '#ffffff', ink2: '#ffffff', accent: '#ffffff', onAccent: '#c2410c', focus: '#ffffff' },
    dark: { bg: '#ff8a2b', surface: '#ffb36b', ink: '#0e1626', ink2: '#0e1626', accent: '#0e1626', onAccent: '#ff8a2b', focus: '#0e1626' },
  },
};

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Ratio de contraste WCAG 2.x entre deux couleurs #rrggbb. */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
