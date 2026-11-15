import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import fixture from '../../../../testing/home.fixture.json';
import { HomeResponse } from '../../../core/api/api.models';
import { P2Section } from './p2.section';

const home = fixture as HomeResponse;

describe('P2Section', () => {
  function render(h: HomeResponse | null = home) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const f = TestBed.createComponent(P2Section);
    f.componentRef.setInput('home', h);
    f.detectChanges();
    return f.nativeElement as HTMLElement;
  }

  it('étape reine : résumé, stack, une ligne par mission de l’API, Décision', () => {
    const el = render();
    const missions = home.experiences.filter((e) => e.stage === 'P2' && e.kind === 'MISSION');
    expect([...el.querySelectorAll('#p2 .stack li')].map((li) => li.textContent)).toEqual(['Java', 'Spring Boot', 'RabbitMQ', 'Hibernate']);
    const rows = [...el.querySelectorAll('#p2 ol.passes > li')];
    expect(rows.map((li) => li.querySelector('h3')!.textContent)).toEqual(missions.map((m) => m.title));
    expect(rows[0].querySelector('.when')!.textContent).toBe(missions[0].period);
    expect(el.querySelector('#p2 app-decision-card')).toBeTruthy();
  });

  it('mission sans date ni note : rien d’inventé à la place', () => {
    const m = { ...home.experiences.find((e) => e.stage === 'P2')!, period: null, note: null };
    const row = render({ ...home, experiences: [m] }).querySelector('#p2 ol.passes > li')!;
    expect(row.querySelector('.when')).toBeNull();
    expect(row.querySelector('.small')).toBeNull();
  });

  it('API en échec : pas de liste vide, le chapitre garde son texte et le poste actuel', () => {
    const el = render(null);
    expect(el.querySelector('#p2 ol.passes')).toBeNull();
    expect(el.querySelector('#p2 .lead')).toBeTruthy();
    expect(el.querySelector('#p2 .now h3')!.textContent).toBe('Aubay');
  });

  it("le lien mène à l'étude Worldline", () => {
    const a = render().querySelector('a.study') as HTMLAnchorElement;
    expect(a.getAttribute('href')).toBe('/projets/trading-app');
    expect(a.textContent!.replace(/\s+/g, ' ').trim()).toBe("Voir la frise et l'architecture de Worldline");
  });
});
