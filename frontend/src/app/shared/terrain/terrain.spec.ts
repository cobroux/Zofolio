import { contrast, TERRAINS } from './terrain';

describe('terrains', () => {
  it('contrast() suit WCAG', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 0);
    expect(contrast('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
  });
  it.each(Object.entries(TERRAINS))('%s : encres ≥ 4,5:1 en clair et en sombre', (_, t) => {
    for (const p of [t.light, t.dark]) {
      expect(contrast(p.bg, p.ink)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(p.bg, p.ink2)).toBeGreaterThanOrEqual(4.5);
      // Texte sur la surface (repli vidéo, cartes) et jetons cohérents : CTA, focus et accent visibles.
      expect(contrast(p.surface, p.ink)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(p.surface, p.ink2)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(p.accent, p.onAccent)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(p.bg, p.focus)).toBeGreaterThanOrEqual(3);
      expect(contrast(p.surface, p.focus)).toBeGreaterThanOrEqual(3);
      expect(contrast(p.bg, p.accent)).toBeGreaterThanOrEqual(3);
    }
  });
  it('valeurs de la spec §5', () => {
    expect(TERRAINS.paper.light.bg).toBe('#f6f3ec');
    expect(TERRAINS.paper.dark.bg).toBe('#16203a');
    expect(TERRAINS.deep.light.bg).toBe('#0a1120');
    expect(TERRAINS.accent.light.bg).toBe('#c2410c');
    expect(TERRAINS.accent.light.ink).toBe('#ffffff');
    expect(TERRAINS.accent.dark.bg).toBe('#ff8a2b');
    expect(TERRAINS.accent.dark.ink).toBe('#0e1626');
  });
});
