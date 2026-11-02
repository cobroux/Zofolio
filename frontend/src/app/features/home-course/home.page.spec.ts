import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DeferBlockState } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import fixture from '../../../testing/home.fixture.json';
import { HomePage } from './home.page';

async function render(respond: (req: import('@angular/common/http/testing').TestRequest) => void, expectDefer = true) {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
  const f = TestBed.createComponent(HomePage);
  f.detectChanges();
  respond(TestBed.inject(HttpTestingController).expectOne('/api/fr/home'));
  await f.whenStable();
  f.detectChanges();
  if (expectDefer) {
    const blocks = await f.getDeferBlocks();
    expect(blocks.length).toBe(5); // p1, p2, p3, journal, arrivée
    for (const b of blocks) await b.render(DeferBlockState.Complete);
    await f.whenStable();
    f.detectChanges();
  }
  return f.nativeElement as HTMLElement;
}

describe('HomePage', () => {
  it('rend le hero et les étapes depuis la fixture', async () => {
    const el = await render((r) => r.flush(fixture));
    expect(el.querySelector('h1')?.textContent).toBe('Enzo Leveque');
    expect(el.querySelector('app-bib')?.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('#p1')?.textContent).toContain("Master ILI, Université d'Artois");
    expect(el.querySelector('#p2')?.textContent).toContain('Mission de test');
    expect(el.textContent).toContain('Brancardier aux urgences');
    expect(el.querySelector('a[href="/api/fr/cv"]')).toBeTruthy();
  });

  it('affiche « contenu indisponible » si l’API échoue', async () => {
    const el = await render((r) => r.flush(null, { status: 500, statusText: 'Error' }));
    expect(el.querySelector('h1')).toBeTruthy();
    expect(el.querySelectorAll('[role="status"]').length).toBeGreaterThanOrEqual(3);
  });
});
