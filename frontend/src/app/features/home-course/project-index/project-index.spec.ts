import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import fixture from '../../../../testing/home.fixture.json';
import { HomeResponse, ProjectSummary } from '../../../core/api/api.models';
import { ProjectIndex } from './project-index';

const home = fixture as HomeResponse;
const bySlug = (s: string) => home.projects.find((p) => p.slug === s)!;
// gfaim : étude sans vidéo ni dépôt dans la fixture ; oltre : étude + vidéo + dépôt ; cin-folie : dépôt seul, aucun média ni capture.
const projects: ProjectSummary[] = [bySlug('gfaim'), bySlug('oltre'), bySlug('cin-folie')];

let el: HTMLElement;
let fix: ReturnType<typeof TestBed.createComponent<ProjectIndex>>;

function render(list: ProjectSummary[] | null, opts: { reduced?: boolean; touch?: boolean } = {}) {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('reduce') ? !!opts.reduced : !opts.touch,
  }));
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  fix = TestBed.createComponent(ProjectIndex);
  fix.componentRef.setInput('projects', list);
  fix.detectChanges();
  TestBed.tick();
  el = fix.nativeElement as HTMLElement;
  return el;
}
const rows = () => Array.from(el.querySelectorAll<HTMLElement>('ol.rows > li'));
const preview = () => el.querySelector<HTMLElement>('.preview .shot.on')!;
function focusRow(i: number) {
  const link = rows()[i].querySelector('a')!;
  link.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
  fix.detectChanges();
}
function hoverRow(i: number) {
  rows()[i].dispatchEvent(new Event('pointerenter'));
  fix.detectChanges();
}
function previewFor(p: ProjectSummary) {
  render([p]);
  return preview();
}

describe('ProjectIndex', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('null : message d’indisponibilité, rien de cassé', () => {
    expect(render(null).textContent).toContain('indisponible');
  });

  it('liste vide : même message, pas de cadre vide', () => {
    expect(render([]).textContent).toContain('indisponible');
    expect(el.querySelector('.preview')).toBeNull();
  });

  it('chaque ligne : un seul lien, vers l’étude sinon vers le dépôt ; stack et commits sur la ligne', () => {
    render([bySlug('oltre'), bySlug('histoquiz'), bySlug('gfaim')]);
    const [oltre, histo, gfaim] = rows();
    expect(oltre.querySelector('h3 a')?.getAttribute('href')).toBe('/projets/oltre');
    expect(oltre.textContent).toContain('Java 21, Spring Boot, Angular · 412 commits');
    expect(histo.querySelector('h3 a')?.getAttribute('href')).toBe(
      'https://github.com/cobroux/histoquiz',
    );
    expect(gfaim.querySelector('h3 a')?.getAttribute('href')).toBe('/projets/gfaim');
    for (const row of [oltre, histo, gfaim]) expect(row.querySelectorAll('a').length).toBe(1);
  });

  it('focus clavier = même aperçu que le survol', () => {
    render(projects);
    expect(preview().getAttribute('data-slug')).toBe(projects[0].slug);
    focusRow(1);
    expect(preview().getAttribute('data-slug')).toBe(projects[1].slug);
    hoverRow(2);
    expect(preview().getAttribute('data-slug')).toBe(projects[2].slug);
    expect(el.querySelectorAll('.preview .shot.on').length).toBe(1);
    expect(rows()[2].classList).toContain('on');
  });

  it('sans vidéo : poster ou capture, jamais un cadre vide', () => {
    expect(previewFor({ ...projects[0], video: null }).querySelector('img, video')).toBeTruthy();
    expect(previewFor(projects[1]).querySelector('img')?.getAttribute('src')).toBe(
      'media/oltre-1.webp',
    );
  });

  it('ni vidéo ni capture : aucune plaque, cadre marqué vide quand la ligne est active', () => {
    render(projects);
    expect(el.querySelector('.preview .plate')).toBeNull();
    expect(el.querySelector('.preview')!.classList).not.toContain('empty');
    hoverRow(2);
    expect(el.querySelector<HTMLElement>('.preview .shot.on')!.children.length).toBe(0);
    expect(el.querySelector('.preview')!.classList).toContain('empty');
    hoverRow(1);
    expect(el.querySelector('.preview')!.classList).not.toContain('empty');
  });

  it('vidéo seulement sur la ligne active engagée, jamais en mouvement réduit', () => {
    render(projects);
    expect(el.querySelector('.preview video')).toBeNull(); // pas de lecture avant survol ou focus
    focusRow(1);
    const v = el.querySelector<HTMLVideoElement>('.preview .shot.on video')!;
    expect(v.muted).toBe(true);
    expect(v.hasAttribute('loop')).toBe(true);
    render(projects, { reduced: true });
    focusRow(1);
    expect(el.querySelector('.preview video')).toBeNull();
  });

  it('écran tactile ou étroit : le cadre est masqué, sa vidéo ne se charge jamais', () => {
    render(projects, { touch: true });
    hoverRow(1);
    expect(el.querySelector('.preview video')).toBeNull();
    focusRow(0); // un toucher sur un titre passe aussi par le focus
    expect(el.querySelector('.preview video')).toBeNull();
  });

  it('sans média mais avec preuves GitHub : chiffre, langages et dernier push dans le cadre, version compacte en ligne', () => {
    const histo = {
      ...bySlug('cin-folie'),
      commits: 1234,
      languages: ['Java', 'TypeScript'],
      lastPushAt: '2026-10-14T09:35:08Z',
    };
    render([histo]);
    const proof = el.querySelector('.preview .shot.on .proof')!;
    expect(proof.querySelector('.big')!.textContent).toMatch(/^1[,\u00a0\u202f. ]?234$/);
    expect(proof.textContent).toContain('Java, TypeScript');
    expect(proof.textContent).toMatch(/2026/);
    expect(el.querySelector('.preview')!.classList).not.toContain('empty');
    expect(el.querySelector('p.facts')!.textContent).toContain('Java, TypeScript');
  });

  it('sans média ni données : pas de preuve, pas de « 0 », cadre vide', () => {
    render([bySlug('cin-folie')]);
    expect(el.querySelector('.proof')).toBeNull();
    expect(el.querySelector('p.facts')).toBeNull();
    expect(el.querySelector('.preview')!.classList).toContain('empty');
  });
});
