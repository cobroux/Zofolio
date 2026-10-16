import { FetchBackend, HttpBackend } from '@angular/common/http';
import { ApplicationConfig, EnvironmentInjector, inject, mergeApplicationConfig, runInInjectionContext } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverApiInterceptor } from './core/api/server-api.interceptor';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // L'URL interne du back est posée sous le cache de transfert : sa clé reste `/api/...`, identique côté navigateur (pas de requête ni de page blanche à l'hydratation).
    {
      provide: HttpBackend,
      useFactory: () => {
        const backend = inject(FetchBackend);
        const injector = inject(EnvironmentInjector);
        return { handle: (req) => runInInjectionContext(injector, () => serverApiInterceptor(req, (r) => backend.handle(r))) } satisfies HttpBackend;
      },
    },
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
