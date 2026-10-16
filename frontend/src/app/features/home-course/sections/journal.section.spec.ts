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

  it('lien interne pour Oltre, externe pour HistoQuiz, commits/langages/push depuis la synchro, rien si null', () => {
    const f = TestBed.createComponent(P3Section);
    f.componentRef.setInput('projects', home.projects);
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    const [oltre, histo] = Array.from(el.querySelectorAll('article'));
    expect(oltre.querySelector('a.study')?.getAttribute('href')).toBe('/projets/oltre');
    expect(oltre.textContent).toContain('412 commits');
    expect(oltre.textContent).toContain('Java, TypeScript, HTML');
    expect(oltre.textContent).toMatch(/dernier push : oct\.? 2026/);
    expect(histo.querySelector('a.study')).toBeNull();
    expect(histo.querySelector('a')?.getAttribute('href')).toBe('https://github.com/cobroux/histoquiz');
    expect(histo.textContent).not.toContain('commits');
  });

  it('rend les projets P3 avec lien dépôt', () => {
    const f = TestBed.createComponent(P3Section);
    f.componentRef.setInput('projects', home.projects);
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelectorAll('article').length).toBe(2);
    expect(el.querySelector('a[href="https://github.com/cobroux/oltre"]')).toBeTruthy();
    expect(el.textContent).toContain('Commencé à la main, puis IA');
  });

  it("affiche l'état indisponible si l'API échoue", () => {
    const f = TestBed.createComponent(P3Section);
    f.detectChanges();
    expect((f.nativeElement as HTMLElement).textContent).toContain('Contenu indisponible');
  });
});

describe('P1Section', () => {
  it('GFaim en carte avec étude de cas, fiches courtes en une ligne', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const f = TestBed.createComponent(P1Section);
    f.componentRef.setInput('home', home);
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('app-segment-card a.study')?.getAttribute('href')).toBe('/projets/gfaim');
    expect(el.querySelectorAll('.shorts li').length).toBe(2);
    expect(el.querySelector('.shorts a')?.getAttribute('href')).toBe('https://github.com/cobroux/cin-folie');
  });
});
