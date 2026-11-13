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

  it('les projets sont tous dans la même liste, une fois chacun', () => {
    const el = render(home);
    const names = [...el.querySelectorAll('#p1 .list .name')].map((n) => n.textContent);
    expect(names).toEqual(school.map((p) => p.title));
  });

  it('plaque : une image par capture réelle, légendée par les noms, sans lien en double ni tuile de remplissage', () => {
    const el = render(home);
    const imgs = [...el.querySelectorAll('#p1 .shots img')];
    expect(imgs.length).toBeGreaterThan(0);
    expect(imgs.length).toBeLessThan(school.length);
    for (const img of imgs) {
      expect(img.getAttribute('src')).toMatch(/^media\//);
      expect(img.getAttribute('width')).toBe('480');
    }
    const caption = el.querySelector('#p1 .shots figcaption')!.textContent!;
    expect(caption.split(', ').length).toBe(imgs.length);
    expect(el.querySelector('#p1 .shots a')).toBeNull();
    expect(el.querySelector('#p1 app-contour-field, #p1 .index .mark, #p1 .thumb')).toBeNull();
  });

  it('API en échec : message, aucun index', () => {
    const el = render(null);
    expect(el.querySelector('#p1 .index')).toBeNull();
    expect(el.textContent).toContain('Contenu indisponible');
  });
});
