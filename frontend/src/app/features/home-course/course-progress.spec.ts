import { altitudeAt, gainAt, lastCheckpoint, TOTAL_KM } from './course-progress';
import { PROFILE } from './profile.data';

describe('course-progress', () => {
  it('gainAt : 0 au départ, croissant, total au bout', () => {
    expect(gainAt(0)).toBe(0);
    expect(gainAt(44)).toBeGreaterThan(gainAt(20));
    expect(gainAt(TOTAL_KM)).toBe(gainAt(TOTAL_KM + 5));
  });

  it('altitudeAt : bornée aux extrémités du profil', () => {
    expect(altitudeAt(-1)).toBe(PROFILE[0][1]);
    expect(altitudeAt(999)).toBe(PROFILE.at(-1)![1]);
  });

  it('lastCheckpoint : jamais un pointage non atteint', () => {
    expect(lastCheckpoint(0)).toBe('depart');
    expect(lastCheckpoint(43.9)).toBe('p1');
    expect(lastCheckpoint(44)).toBe('p2');
    expect(lastCheckpoint(79.41)).toBe('arrivee');
  });
});
