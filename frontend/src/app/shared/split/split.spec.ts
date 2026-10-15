import { splitParts } from './split';

describe('splitParts', () => {
  it('assemble durée, stack et commits au format FR', () => {
    expect(splitParts('fr', { duration: '8 mois', stack: ['Java 21', 'Spring Boot'], commits: 1412 })).toEqual([
      '8 mois',
      'Java 21, Spring Boot',
      '1 412 commits',
    ]);
  });

  it('ignore les champs absents', () => {
    expect(splitParts('fr', { duration: null, stack: [], commits: null })).toEqual([]);
  });
});
