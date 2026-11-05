import { contourPaths } from './contours';

describe('contourPaths', () => {
  it('déterministe, un chemin par niveau, dans la boîte', () => {
    const a = contourPaths(12, 1000, 600);
    expect(a).toHaveLength(12);
    expect(contourPaths(12, 1000, 600)).toEqual(a);
    const n = a.join(' ').match(/-?\d+(\.\d+)?/g)!.map(Number);
    expect(Math.min(...n)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...n)).toBeLessThanOrEqual(1000);
  });
});
