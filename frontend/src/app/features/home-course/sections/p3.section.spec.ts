import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import fixture from '../../../../testing/home.fixture.json';
import { HomeResponse, ProjectSummary } from '../../../core/api/api.models';
import { P3Section } from './p3.section';

const home = fixture as HomeResponse;
const bySlug = (s: string) => home.projects.find((p) => p.slug === s)!;

function render(list: ProjectSummary[] | null) {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const f = TestBed.createComponent(P3Section);
  f.componentRef.setInput('projects', list);
  f.detectChanges();
  return f.nativeElement as HTMLElement;
}

describe('P3Section (parcours)', () => {
  it('une étape par projet P3, sans carte ni aperçu', () => {
    const p3 = home.projects.filter((p) => p.stage === 'P3');
    const el = render(home.projects);
    expect(el.querySelectorAll('ol.path > li > article').length).toBe(p3.length);
    expect(el.querySelector('app-project-index, .preview')).toBeNull();
  });

  it('étude de cas : titre et lien « Étude de cas » mènent à /projets/{slug}', () => {
    const oltre = bySlug('oltre');
    const el = render([{ ...oltre, stage: 'P3', tier: 'CASE_STUDY' }]);
    expect(el.querySelector('h3 a.study')!.getAttribute('href')).toBe('/projets/oltre');
    const links = [...el.querySelectorAll('.links a')].map((a) => a.textContent!.trim());
    expect(links).toContain('Étude de cas');
  });

  it('court : titre vers le dépôt, aucun lien inventé sans dépôt ni démo', () => {
    const base = {
      ...bySlug('oltre'),
      stage: 'P3',
      tier: 'SHORT',
      video: null,
      repoUrl: null,
      demoUrl: null,
      commits: null,
      lastPushAt: null,
    } as ProjectSummary;
    const el = render([base, { ...base, slug: 'x', repoUrl: 'https://github.com/a/b' }]);
    const steps = el.querySelectorAll('ol.path > li');
    expect(steps[0].querySelector('h3 a')).toBeNull();
    expect(steps[0].querySelector('.links a')).toBeNull();
    expect(steps[0].querySelector('.activity')).toBeNull();
    expect(steps[1].querySelector('h3 a')!.getAttribute('href')).toBe('https://github.com/a/b');
  });

  it('API en échec : aucune liste', () => {
    const el = render(null);
    expect(el.querySelector('ol.path')).toBeNull();
    expect(el.textContent).toContain('Contenu indisponible');
  });
});
