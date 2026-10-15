import { TestBed } from '@angular/core/testing';
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
    expect(el.querySelector('tbody tr')?.textContent).toContain('13 h 35 min 53 s');
    expect(el.textContent).toContain('UTMB index 459');
    expect(el.textContent?.toLowerCase()).not.toContain('classement :');
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
  it('rend les projets P3 avec lien dépôt', () => {
    const f = TestBed.createComponent(P3Section);
    f.componentRef.setInput('projects', home.projects);
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelectorAll('article').length).toBe(1);
    expect(el.querySelector('a')?.getAttribute('href')).toBe('https://github.com/cobroux/oltre');
    expect(el.textContent).toContain('Commencé à la main, puis IA');
  });

  it("affiche l'état indisponible si l'API échoue", () => {
    const f = TestBed.createComponent(P3Section);
    f.detectChanges();
    expect((f.nativeElement as HTMLElement).textContent).toContain('Contenu indisponible');
  });
});
