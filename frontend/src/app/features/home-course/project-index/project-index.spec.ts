import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import fixture from '../../../../testing/home.fixture.json';
import { HomeResponse, ProjectSummary } from '../../../core/api/api.models';
import { ProjectIndex } from './project-index';

const home = fixture as HomeResponse;
const bySlug = (s: string) => home.projects.find((p) => p.slug === s)!;
// gfaim : étude sans vidéo ni dépôt dans la fixture ; oltre : étude + vidéo + dépôt ; histoquiz : dépôt seul, aucun média.
const projects: ProjectSummary[] = [bySlug('gfaim'), bySlug('oltre'), bySlug('histoquiz')];

let el: HTMLElement;
let fix: ReturnType<typeof TestBed.createComponent<ProjectIndex>>;

function render(list: ProjectSummary[] | null, opts: { reduced?: boolean } = {}) {
  vi.stubGlobal('matchMedia', () => ({ matches: !!opts.reduced }));
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

  it('chaque ligne : lien vers l’étude, sinon vers le dépôt ; lien code si dépôt ; stack et commits sur la ligne', () => {
    render([bySlug('oltre'), bySlug('histoquiz'), bySlug('gfaim')]);
    const [oltre, histo, gfaim] = rows();
    expect(oltre.querySelector('h3 a')?.getAttribute('href')).toBe('/projets/oltre');
    expect(oltre.querySelector('a.code')?.getAttribute('href')).toBe(
      'https://github.com/cobroux/oltre',
    );
    expect(oltre.textContent).toContain('Java 21, Spring Boot, Angular · 412 commits');
    expect(histo.querySelector('h3 a')?.getAttribute('href')).toBe(
      'https://github.com/cobroux/histoquiz',
    );
    expect(histo.querySelector('a.code')).toBeNull();
    expect(gfaim.querySelector('h3 a')?.getAttribute('href')).toBe('/projets/gfaim');
    expect(gfaim.querySelector('a.code')).toBeNull();
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
    // Ni vidéo ni capture : le titre occupe le cadre plutôt qu'un aplat.
    expect(previewFor(projects[2]).textContent).toContain('HistoQuiz');
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
});
