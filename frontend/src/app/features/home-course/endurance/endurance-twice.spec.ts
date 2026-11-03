import { TestBed } from '@angular/core/testing';
import { ContributionYear, SportYear } from '../../../core/api/api.models';
import { EnduranceTwice } from './endurance-twice';

const y = (year: number, distanceKm: number | null): SportYear => ({ year, distanceKm, elevationGainM: null, hours: null, activities: null });
const c = (year: number, total: number): ContributionYear => ({ year, total });

function render(sport: SportYear[], contrib: ContributionYear[]) {
  const f = TestBed.createComponent(EnduranceTwice);
  f.componentRef.setInput('sportYears', sport);
  f.componentRef.setInput('contributionYears', contrib);
  f.detectChanges();
  const el = f.nativeElement as HTMLElement;
  const rows = [...el.querySelectorAll('li.row')].map((li) => {
    const [km, commits] = [...li.querySelectorAll('.cell')];
    const val = (cell: Element) => cell.querySelector('[data-count]')?.textContent ?? cell.textContent!.trim();
    return { year: li.querySelector('.yr')!.textContent!.trim().slice(0, 4), km: val(km), commits: val(commits) };
  });
  return Object.assign(rows, { el });
}

describe('EnduranceTwice', () => {
  const thisYear = new Date().getFullYear();

  it('ordre chronologique et appariement par année', () => {
    const rows = render([y(2026, 4748), y(2023, 347)], [c(2023, 120), c(2026, 900)]);
    expect(rows.map((r) => r.year).slice(0, 2)).toEqual(['2023', '2024']);
    expect(rows.map((r) => r.year).at(-1)).toBe(String(thisYear));
    expect(rows[0].commits).toBe('120');
    expect(rows[0].km).toBe('347');
    expect(rows.find((r) => r.year === '2026')!.km).toBe('4 748');
  });

  it('commits absents pour une année : « non renseigné », pas de zéro', () => {
    const rows = render([y(2024, 2191)], []);
    const r = rows.find((x) => x.year === '2024')!;
    expect(r.commits).toContain('non renseigné');
    expect(rows.el.querySelectorAll('[data-count="0"]').length).toBe(0);
  });

  it('km absents (null) : « non renseigné » aussi, et la phrase et le titre sont là', () => {
    const rows = render([y(2023, null)], [c(2023, 5)]);
    expect(rows[0].km).toContain('non renseigné');
    expect(rows.el.querySelector('h2')!.textContent).toContain("L'endurance, deux fois");
    expect(rows.el.textContent).toContain('Ce n\'est pas une coïncidence, c\'est une méthode.');
  });

  it('année en cours marquée ; valeurs finales dans le DOM (SSR, animation réduite)', () => {
    const rows = render([y(thisYear, 10)], [c(thisYear, 20)]);
    expect(rows.el.querySelectorAll('li.now').length).toBe(1);
    expect(rows.el.querySelector('li.now')!.textContent).toContain('en cours');
    expect(rows.el.querySelector('li.now [data-count="20"]')!.textContent).toBe('20');
  });
});
