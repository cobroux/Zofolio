import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, firstValueFrom } from 'rxjs';
import { AdminApi, ProjectAdmin, problem } from './admin.api';
import { adminGuard } from './admin.routes';
import { errorMap, fieldError, fieldId, mediaReason } from './admin.errors';
import { validateProject } from './projects/project-form.page';

const base = (over: Partial<ProjectAdmin> = {}): ProjectAdmin => ({
  slug: 'demo', tier: 'HIDDEN', stage: null, sortOrder: null, title: { fr: 'T' }, pitch: { fr: 'P' }, aiTag: 'HAND', stack: [], duration: null, note: null,
  githubRepos: [], demoUrl: null, metaTitle: null, metaDescription: null, role: null, problem: null, decisions: null, wall: null, takeaway: null, aiNote: null, video: null, ...over,
});

describe('garde admin', () => {
  function run(authenticated: boolean) {
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: AdminApi, useValue: { session: () => of(authenticated), authed: { set: () => undefined } } }] });
    return TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));
  }
  it('redirige vers la connexion si authenticated: false', async () => {
    const r = await firstValueFrom(run(false) as ReturnType<typeof of>);
    expect(TestBed.inject(Router).serializeUrl(r as never)).toBe('/admin/connexion');
  });
  it('laisse passer si authenticated: true', async () => {
    expect(await firstValueFrom(run(true) as ReturnType<typeof of>)).toBe(true);
  });
});

describe('erreurs admin', () => {
  it('problem() lit code, champs, raison et Retry-After', () => {
    const e = new HttpErrorResponse({ status: 429, headers: new HttpHeaders({ 'Retry-After': '600' }), error: { code: 'LOGIN_LOCKED' } });
    expect(problem(e)).toMatchObject({ code: 'LOGIN_LOCKED', retryAfter: 600 });
    expect(problem(new HttpErrorResponse({ status: 413 }))).toMatchObject({ code: 'MEDIA_REJECTED', reason: 'SIZE' });
    expect(problem(new HttpErrorResponse({ status: 0 })).code).toBe('NETWORK');
  });
  it('mappe les champs pointés vers un message FR et un identifiant de champ', () => {
    expect(fieldError('metaDescription.fr', 'Size')).toBe('Description de la page (français) : 160 caractères maximum.');
    expect(fieldError('decisions.en[1].title', 'Size')).toContain('Décision 2 (anglais), titre');
    expect(fieldError('stack[2]', 'Size')).toBe('Stack, élément 3 : vide ou trop long.');
    expect(fieldId('decisions.en[1].title')).toBe('f-decisions-en-1-title');
    expect(fieldId('video.caption.fr')).toBe('f-video-caption-fr');
    expect(fieldId('stack[2]')).toBe('f-stack');
    expect(errorMap([{ field: 'title.fr', code: 'NotBlank' }])).toEqual({ 'title.fr': 'NotBlank' });
  });
  it("traduit les raisons d'upload du back", () => {
    for (const r of ['TYPE', 'SIZE', 'DIMENSIONS', 'METADATA', 'DECODE']) expect(mediaReason(r)).not.toBe('Fichier refusé.');
  });
});

describe('validateProject (aligné sur le back)', () => {
  it('accepte un projet minimal', () => expect(validateProject(base(), true)).toEqual({}));
  it('metaDescription ≤ 160, slug, https, 3 décisions, fr obligatoire si en', () => {
    const e = validateProject(
      base({ slug: 'Pas Valide', metaDescription: { fr: 'x'.repeat(161) }, demoUrl: 'javascript:alert(1)', title: { en: 'only' }, decisions: { fr: Array(4).fill({ title: 'a', tradeoff: 'b' }), en: [{ title: '', tradeoff: 'b' }] } }),
      true,
    );
    expect(e).toMatchObject({ slug: 'Pattern', 'metaDescription.fr': 'Size', demoUrl: 'Pattern', 'title.fr': 'NotBlank', 'decisions.fr': 'Size', 'decisions.en[0].title': 'Size' });
  });
  it("le slug n'est pas revalidé en édition", () => expect(validateProject(base({ slug: 'X' }), false)).toEqual({}));
});
