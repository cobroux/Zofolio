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

  it('chaque projet une seule fois : capture réelle en plaque, sinon ligne de texte', () => {
    const el = render(home);
    const names = [...el.querySelectorAll('#p1 .index .name')].map((n) => n.textContent);
    expect(names.sort()).toEqual(school.map((p) => p.title).sort());
    const shots = [...el.querySelectorAll('#p1 .shots li')];
    expect(shots.length).toBeGreaterThan(0);
    for (const li of shots) {
      const img = li.querySelector('img')!;
      expect(img.getAttribute('src')).toMatch(/^media\//);
      expect(img.getAttribute('width')).toBe('480');
    }
    expect(el.querySelectorAll('#p1 .others li').length).toBe(school.length - shots.length);
  });

  it('aucune tuile de remplissage pour un projet sans capture', () => {
    const el = render(home);
    expect(el.querySelector('#p1 app-contour-field, #p1 .index .mark, #p1 .thumb')).toBeNull();
    expect(el.querySelector('#p1 .others img')).toBeNull();
  });

  it('API en échec : message, aucun index', () => {
    const el = render(null);
    expect(el.querySelector('#p1 .index')).toBeNull();
    expect(el.textContent).toContain('Contenu indisponible');
  });
});
