export type Terrain = 'night' | 'paper' | 'deep' | 'accent';

export interface Pair {
  bg: string;
  ink: string;
  ink2: string;
}

// Mêmes valeurs que les classes .terrain-* de src/styles/tokens.css (spec §5).
const NIGHT: Pair = { bg: '#0e1626', ink: '#edeff4', ink2: '#a9b1c3' };
const DEEP: Pair = { bg: '#0a1120', ink: '#edeff4', ink2: '#a9b1c3' };

export const TERRAINS: Record<Terrain, { light: Pair; dark: Pair }> = {
  night: { light: NIGHT, dark: NIGHT },
  paper: {
    light: { bg: '#f6f3ec', ink: '#14161a', ink2: '#4a4d55' },
    dark: { bg: '#16203a', ink: '#edeff4', ink2: '#a9b1c3' },
  },
  deep: { light: DEEP, dark: DEEP },
  accent: {
    light: { bg: '#c2410c', ink: '#ffffff', ink2: '#ffffff' },
    dark: { bg: '#ff8a2b', ink: '#0e1626', ink2: '#0e1626' },
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
