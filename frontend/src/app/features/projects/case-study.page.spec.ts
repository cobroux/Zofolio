import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RESPONSE_INIT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import oltre from '../../../testing/project-oltre.fixture.json';
import trading from '../../../testing/project-trading-app.fixture.json';
import { CaseStudyPage } from './case-study.page';

async function render(slug: string, reply: (r: import('@angular/common/http/testing').TestRequest) => void) {
  const init = { status: 200 };
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ slug })) } },
      { provide: RESPONSE_INIT, useValue: init },
    ],
  });
  const f = TestBed.createComponent(CaseStudyPage);
  f.detectChanges();
  reply(TestBed.inject(HttpTestingController).expectOne(`/api/fr/projects/${slug}`));
  await f.whenStable();
  f.detectChanges();
  return { el: f.nativeElement as HTMLElement, init };
}

describe('CaseStudyPage', () => {
  it('Oltre : dossard, clip, schéma, décisions, mur et dépôts', async () => {
    const { el, init } = await render('oltre', (r) => r.flush(oltre));
    expect(init.status).toBe(200);
    expect(el.querySelectorAll('h1').length).toBe(1);
    expect(el.querySelector('h1')?.textContent).toBe('Oltre');
    expect(el.querySelector('aside dl')?.textContent).toContain('412');
    expect(el.querySelector('aside dl')?.textContent).toContain('Java · TypeScript · HTML');
    expect(el.querySelector('app-clip figure, app-clip img')).toBeTruthy();
    expect(el.querySelector('#h-arch')).toBeTruthy();
    expect(el.querySelector('svg title')?.textContent).toContain('Oltre');
    expect(el.querySelectorAll('.decisions article').length).toBe(2);
    expect(el.querySelector('#h-wall')?.textContent).toBe('Le mur du 60e km');
    expect(el.querySelectorAll('.links a[href^="https://github.com"]').length).toBe(2);
  });

  it('Worldline : logo, frise et parcours d\'ordre ; ni dépôt, ni clip, ni commits', async () => {
    const { el } = await render('trading-app', (r) => r.flush(trading));
    expect(el.querySelector('h1')?.textContent).toBe('Trading app');
    expect(el.querySelector('img.logo')?.getAttribute('alt')).toBe('Worldline');
    expect(el.querySelectorAll('app-worldline-timeline li').length).toBe(4);
    expect(el.querySelector('#h-arch')?.textContent).toBe("Le parcours d'un ordre");
    expect(el.querySelector('app-clip')).toBeNull();
    expect(el.querySelector('.links a[href^="https://github.com"]')).toBeNull();
    expect(el.querySelector('aside')?.textContent).not.toContain('Commits');
    expect(el.querySelector('aside')?.textContent).not.toContain('Langages');
  });

  it('fiche courte (caseStudy nul) : 404', async () => {
    const { el, init } = await render('histoquiz', (r) => r.flush({ ...oltre, slug: 'histoquiz', caseStudy: null }));
    expect(init.status).toBe(404);
    expect(el.querySelector('h1')?.textContent).toBe('Page introuvable');
  });

  it('API en panne (5xx) : 503 + Retry-After, pas de 404', async () => {
    const { el, init } = await render('oltre', (r) => r.flush(null, { status: 503, statusText: 'Unavailable' }));
    expect(init.status).toBe(503);
    expect(new Headers((init as { headers?: HeadersInit }).headers).get('Retry-After')).toBe('30');
    expect(el.querySelector('h1')?.textContent).toBe('Contenu momentanément indisponible');
  });

  it('slug inconnu (404 de l\'API) : 404', async () => {
    const { init } = await render('inconnu', (r) => r.flush(null, { status: 404, statusText: 'Not Found' }));
    expect(init.status).toBe(404);
  });
});
