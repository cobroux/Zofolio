import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import fixture from '../../../../testing/home.fixture.json';
import { HomeResponse, ProjectSummary } from '../../../core/api/api.models';
import { P3Section } from './p3.section';

const home = fixture as HomeResponse;

function render(list: ProjectSummary[] | null) {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const f = TestBed.createComponent(P3Section);
  f.componentRef.setInput('projects', list);
  f.detectChanges();
  return f.nativeElement as HTMLElement;
}

describe('P3Section (index avec aperçu)', () => {
  it('une ligne par projet P3, et seulement eux', () => {
    const p3 = home.projects.filter((p) => p.stage === 'P3');
    const el = render(home.projects);
    expect(el.querySelectorAll('#p3 app-project-index ol.rows > li').length).toBe(p3.length);
    expect(el.querySelector('ol.path')).toBeNull();
  });

  it('API en échec : message, aucune ligne', () => {
    const el = render(null);
    expect(el.querySelector('ol.rows')).toBeNull();
    expect(el.textContent).toContain('Contenu indisponible');
  });
});
