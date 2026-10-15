import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import fixture from '../../../testing/home.fixture.json';
import { HomeResponse } from './api.models';
import { ContentApi } from './content.api';
import { API_INTERNAL_URL, serverApiInterceptor } from './server-api.interceptor';

function setup(platform: 'browser' | 'server') {
  TestBed.configureTestingModule({
    providers: [
      { provide: PLATFORM_ID, useValue: platform },
      { provide: API_INTERNAL_URL, useValue: 'http://backend:8080' },
      provideHttpClient(withInterceptors([serverApiInterceptor])),
      provideHttpClientTesting(),
    ],
  });
  return { api: TestBed.inject(ContentApi), http: TestBed.inject(HttpTestingController) };
}

describe('ContentApi', () => {
  it("appelle l'URL relative côté navigateur", async () => {
    const { api, http } = setup('browser');
    const res = firstValueFrom(api.home());
    http.expectOne((r) => r.url === '/api/fr/home').flush(fixture as HomeResponse);
    expect((await res)?.races.length).toBe(8);
  });

  it("appelle l'URL absolue côté serveur", () => {
    const { api, http } = setup('server');
    api.races().subscribe();
    http.expectOne((r) => r.url === 'http://backend:8080/api/fr/races').flush([]);
  });

  it('renvoie null sur erreur', async () => {
    const { api, http } = setup('browser');
    const res = firstValueFrom(api.project('x'));
    http.expectOne('/api/fr/projects/x').flush(null, { status: 404, statusText: 'Not Found' });
    expect(await res).toBeNull();
  });
});
