import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { P1Section } from './p1.section';
import fixture from '../../../../testing/home.fixture.json';
import { HomeResponse } from '../../../core/api/api.models';
import { JournalSection, formatDistance, formatDuration } from './journal.section';
import { P3Section } from './p3.section';

const home = fixture as HomeResponse;

describe('formats', () => {
  it('durée', () => {
    expect(formatDuration(48953)).toBe('13 h 35 min 53 s');
    expect(formatDuration(27159)).toBe('7 h 32 min 39 s');
    expect(formatDuration(4560)).toBe('1 h 16 min');
    expect(formatDuration(null)).toBe('—');
  });
  it('distance', () => {
    expect(formatDistance(79.4)).toBe('79,4 km');
    expect(formatDistance(42.195)).toBe('42,195 km');
    expect(formatDistance(null)).toBe('—');
  });
});

describe('JournalSection', () => {
  function render(races: HomeResponse['races'] | null) {
    const f = TestBed.createComponent(JournalSection);
    f.componentRef.setInput('races', races);
    f.detectChanges();
    return f.nativeElement as HTMLElement;
  }

  it('rend un vrai tableau, une ligne par course, badge PR avec texte, sans classement', () => {
    const el = render(home.races);
    expect(el.querySelectorAll('tbody tr').length).toBe(7);
    expect(el.querySelectorAll('.latest tbody tr').length).toBe(3);
    expect(el.querySelectorAll('details.more:not([open]) .races tbody tr').length).toBe(4);
    expect(el.querySelectorAll('.pr').length).toBe(1);
    expect(el.querySelector('.pr')?.textContent).toContain('Record personnel');
    expect(el.querySelector('tbody tr')?.textContent).toContain('7 h 32 min 39 s');
    expect(el.querySelector('tbody th')?.textContent).toContain('Côte d\'Opale');
    expect(el.textContent!.replace('Un chiffre, pas un classement.', '')).not.toMatch(/classement|rang|place/i);
    expect(el.querySelectorAll('tbody td:first-child')[5].textContent).toContain('Date non renseignée'); // dates NULL du seed
  });

  it('ordre chronologique décroissant, mois et année affichés, sans date en dernier', () => {
    const el = render(home.races);
    const dates = [...el.querySelectorAll('tbody td:first-child')].map((c) => c.textContent!.trim());
    expect(dates.slice(0, 5)).toEqual(['sept. 2026', 'avr. 2026', 'oct. 2025', 'sept. 2025', 'mai 2025']);
    expect([...el.querySelectorAll('tbody th')][1].textContent).toContain('Marathon de Paris');
  });

  it('graphe de contributions : rendu si présent, rien si null', () => {
    const f = TestBed.createComponent(JournalSection);
    f.componentRef.setInput('races', home.races);
    f.componentRef.setInput('contributions', home.contributions);
    f.detectChanges();
    expect(f.nativeElement.querySelector('app-contributions .carnet')).toBeTruthy();
    f.componentRef.setInput('contributions', null);
    f.detectChanges();
    expect(f.nativeElement.querySelector('app-contributions .carnet')).toBeNull();
  });

  it("« L'endurance, deux fois » ouvre le Journal et remplace « Les années en chiffres »", () => {
    const f = TestBed.createComponent(JournalSection);
    f.componentRef.setInput('races', home.races);
    f.componentRef.setInput('sportYears', [{ year: 2025, distanceKm: 2140, elevationGainM: 1, hours: 1, activities: 1 }]);
    f.componentRef.setInput('contributionYears', [{ year: 2025, total: 700 }]);
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('section')!.firstElementChild!.tagName).toBe('APP-ENDURANCE-TWICE');
    expect(el.querySelector('app-endurance-twice [data-count="700"]')).toBeTruthy();
    expect(el.textContent).not.toContain('Les années en chiffres');
    expect(el.querySelector('.stats')).toBeNull();
  });

  it('photo des Baudets en plaque, logo du club à côté du nom, rien de replié sauf courses et contributions', () => {
    const f = TestBed.createComponent(JournalSection);
    f.componentRef.setInput('races', home.races);
    f.componentRef.setInput('contributions', home.contributions);
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('app-photo-plates img')?.getAttribute('src')).toBe('img/baudets-nuit-1280.jpg');
    expect(el.querySelector('.club')?.textContent).toContain('Les Baudets Dhinges');
    expect(el.querySelector('.club img')?.getAttribute('src')).toBe('img/logo-baudets-320.jpg');
    expect(el.querySelector('details.more:not([open]) app-contributions')).toBeTruthy();
    expect(el.querySelector('figure img[src*="finisher-cote-d-opale"]')).toBeTruthy();
  });

  it('affiche une course sans date sans planter', () => {
    const el = render([{ ...home.races[0], date: null }]);
    expect(el.querySelector('tbody td')?.textContent).toContain('Date non renseignée');
  });

  it("affiche l'état indisponible si l'API échoue", () => {
    const el = render(null);
    expect(el.querySelector('table')).toBeNull();
    expect(el.textContent).toContain('Contenu indisponible');
  });
});

describe('P3Section', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('terrain accent, index des seuls projets P3 : étude pour Oltre, dépôt pour HistoQuiz', () => {
    const f = TestBed.createComponent(P3Section);
    f.componentRef.setInput('projects', home.projects);
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('section')!.classList).toContain('terrain-accent');
    const [oltre, histo] = Array.from(el.querySelectorAll('ol.rows > li'));
    expect(el.querySelectorAll('ol.rows > li').length).toBe(2);
    expect(oltre.querySelector('a.study')?.getAttribute('href')).toBe('/projets/oltre');
    expect(oltre.textContent).toContain('412 commits');
    expect(histo.querySelector('a.study')).toBeNull();
    expect(histo.querySelector('a')?.getAttribute('href')).toBe('https://github.com/cobroux/histoquiz');
    expect(histo.textContent).not.toContain('commits');
    expect(el.textContent).not.toContain('puis IA');
  });

  it("affiche l'état indisponible si l'API échoue", () => {
    const f = TestBed.createComponent(P3Section);
    f.detectChanges();
    expect((f.nativeElement as HTMLElement).textContent).toContain('Contenu indisponible');
  });
});

describe('P1Section', () => {
  it('bande compacte non sticky, index en une ligne : étude de cas en lien interne, sinon le dépôt, ni carte ni image', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const f = TestBed.createComponent(P1Section);
    f.componentRef.setInput('home', home);
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    expect([...el.querySelectorAll('.index a')].map((a) => a.getAttribute('href'))).toEqual([
      '/projets/gfaim',
      'https://github.com/cobroux/cin-folie',
      'https://github.com/cobroux/lambda-calcul',
    ]);
    expect(el.querySelector('.badge img')?.getAttribute('src')).toBe('img/badge-promo-ili-320.jpg');
    expect(el.querySelector('app-photo-plates img')?.getAttribute('src')).toBe('img/promo-ili-640.jpg');
    expect(el.querySelector('app-chapter-pin')?.classList).not.toContain('sticky');
    expect(el.querySelector('h2')?.textContent).toContain('Les fondations');
  });
});
