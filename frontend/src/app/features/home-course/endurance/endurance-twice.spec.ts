import { TestBed } from '@angular/core/testing';
import { SportYear } from '../../../core/api/api.models';
import { EnduranceTwice } from './endurance-twice';

const y = (year: number, distanceKm: number | null): SportYear => ({
  year,
  distanceKm,
  elevationGainM: null,
  hours: null,
  activities: null,
});

function render(sport: SportYear[]) {
  const f = TestBed.createComponent(EnduranceTwice);
  f.componentRef.setInput('sportYears', sport);
  f.detectChanges();
  const el = f.nativeElement as HTMLElement;
  const rows = [...el.querySelectorAll('li.row')].map((li) => ({
    year: li.querySelector('.yr')!.textContent!.trim().slice(0, 4),
    km: li.querySelector('[data-count]')?.textContent ?? '',
  }));
  return Object.assign(rows, { el });
}

describe('EnduranceTwice', () => {
  const thisYear = new Date().getFullYear();

  it('ordre chronologique, km par année, aucune colonne de contributions', () => {
    const rows = render([y(2026, 4748), y(2023, 347)]);
    expect(rows.map((r) => r.year)).toEqual(['2023', '2026']);
    expect(rows[0].km).toBe('347');
    expect(rows.find((r) => r.year === '2026')!.km).toBe('4\u202f748');
    expect(rows.el.querySelectorAll('.cell').length).toBe(2);
    expect(rows.el.textContent).not.toContain('contributions GitHub');
  });

  it('km absents (null) : année sans donnée retirée, titre là', () => {
    const rows = render([y(2023, null), y(2024, 10)]);
    expect(rows.map((r) => r.year)).toEqual(['2024']);
    expect(rows.el.querySelector('h2')!.textContent).toContain("L'endurance, année après année");
  });

  it('D+, heures et sorties : affichés quand l’API les donne, colonne retirée si la série est vide', () => {
    const full = { ...y(2025, 3619), elevationGainM: 29136, hours: 268, activities: 200 };
    const extras = (el: HTMLElement) =>
      [...el.querySelectorAll('li.row')].map((li) =>
        [...li.querySelectorAll('.extras li')].map((x) => x.textContent!.replace(/\s+/g, ' ').trim()),
      );
    // 2024 n'a pas d'heures : sa case reste vide, jamais « 0 ». (\s+ replie aussi l'espace fine des milliers.)
    expect(extras(render([full, { ...y(2024, 2191), elevationGainM: 13675, activities: 164 }]).el)).toEqual([
      ['13 675 m D+', '', '164 sorties'],
      ['29 136 m D+', '268 h', '200 sorties'],
    ]);
    expect(render([y(2024, 10)]).el.querySelector('.extras')).toBeNull();
  });

  it('année en cours marquée ; valeur finale dans le DOM (SSR, animation réduite)', () => {
    const rows = render([y(thisYear, 10)]);
    expect(rows.el.querySelectorAll('li.now').length).toBe(1);
    expect(rows.el.querySelector('li.now')!.textContent).toContain('en cours');
    expect(rows.el.querySelector('li.now [data-count="10"]')!.textContent).toBe('10');
  });
});
