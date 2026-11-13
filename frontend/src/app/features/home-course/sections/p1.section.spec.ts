import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import fixture from '../../../../testing/home.fixture.json';
import { HomeResponse } from '../../../core/api/api.models';
import { P1Section } from './p1.section';

const home = fixture as HomeResponse;

function render(h: HomeResponse | null) {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const f = TestBed.createComponent(P1Section);
  f.componentRef.setInput('home', h);
  f.detectChanges();
  return f.nativeElement as HTMLElement;
}

describe('P1Section (projets d’école)', () => {
  const school = home.projects.filter((p) => p.stage === 'P1');

  it('les projets sont tous dans l’index compact, une ligne et un seul lien chacun', () => {
    const el = render(home);
    const rows = [...el.querySelectorAll('#p1 app-project-index.compact ol.rows > li')];
    expect(rows.map((r) => r.querySelector('h3')!.textContent!.trim())).toEqual(
      school.map((p) => p.title),
    );
    expect(el.querySelectorAll('#p1 .index a').length).toBeLessThanOrEqual(school.length);
    expect(el.querySelector('#p1 app-contour-field, #p1 .index .mark, #p1 .thumb')).toBeNull();
  });

  it('API en échec : message, aucun index', () => {
    const el = render(null);
    expect(el.querySelector('#p1 .index')).toBeNull();
    expect(el.textContent).toContain('Contenu indisponible');
  });
});
