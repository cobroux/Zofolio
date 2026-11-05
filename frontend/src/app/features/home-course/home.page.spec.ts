import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import fixture from '../../../testing/home.fixture.json';
import { HomePage } from './home.page';

async function render(respond: (req: import('@angular/common/http/testing').TestRequest) => void) {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
  });
  const f = TestBed.createComponent(HomePage);
  f.detectChanges();
  const http = TestBed.inject(HttpTestingController);
  respond(http.expectOne('/api/fr/home'));
  http.expectOne('/api/build').flush(null, { status: 404, statusText: 'Not Found' });
  await f.whenStable();
  f.detectChanges();
  return f.nativeElement as HTMLElement;
}

describe('HomePage', () => {
  it('rend le hero et les étapes depuis la fixture', async () => {
    const el = await render((r) => r.flush(fixture));
    expect(el.querySelector('h1')?.textContent).toBe('Enzo Leveque');
    expect(el.querySelector('app-bib .num')?.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('#p1')?.textContent).toContain("Master ILI, Université d'Artois");
    expect(el.querySelector('#p2')?.textContent).toContain('Boursorama');
    expect(el.textContent).toContain('Brancardier aux urgences');
    expect(el.querySelector('a[href="/api/fr/cv"]')).toBeTruthy();
  });

  it('matériel avant P1 ; 3 captures en P1 et en P3', async () => {
    const el = await render((r) => r.flush(fixture));
    const kit = el.querySelector('#equipement')!;
    expect(kit.compareDocumentPosition(el.querySelector('#p1')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(el.querySelectorAll('#p3 app-shots li').length).toBe(3);
    expect(el.querySelectorAll('#p1 app-shots li').length).toBe(3);
  });

  it('affiche « contenu indisponible » si l’API échoue', async () => {
    const el = await render((r) => r.flush(null, { status: 500, statusText: 'Error' }));
    expect(el.querySelector('h1')).toBeTruthy();
    expect(el.querySelectorAll('[role="status"]').length).toBeGreaterThanOrEqual(3);
  });
});
