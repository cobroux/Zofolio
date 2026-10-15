import { CHECKPOINTS, PROFILE } from './profile.data';

describe('PROFILE', () => {
  it('a 180-220 points, des km croissants et finit à 79.41', () => {
    expect(PROFILE.length).toBeGreaterThanOrEqual(180);
    expect(PROFILE.length).toBeLessThanOrEqual(220);
    PROFILE.slice(1).forEach(([km], i) => expect(km).toBeGreaterThan(PROFILE[i][0]));
    expect(PROFILE[0][0]).toBe(0);
    expect(PROFILE.at(-1)![0]).toBe(79.41);
    expect(CHECKPOINTS.arrivee).toBe(79.41);
  });

  it('reste entre 407 et 1369 m', () => {
    const ele = PROFILE.map(([, e]) => e);
    expect(Math.min(...ele)).toBe(407);
    expect(Math.max(...ele)).toBe(1369);
  });
});
