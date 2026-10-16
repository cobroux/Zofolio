import { HttpInterceptorFn } from '@angular/common/http';
import { PLATFORM_ID, inject, InjectionToken } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { timeout } from 'rxjs';

export const API_INTERNAL_URL = new InjectionToken<string>('API_INTERNAL_URL', {
  factory: () => (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env['API_INTERNAL_URL'] ?? 'http://localhost:8080',
});

/**
 * Côté serveur seulement (ADR 0002) : réécrit `/api/...` vers l'URL interne du back, timeout 2 s.
 * Branché comme HttpBackend (app.config.server.ts), donc après le cache de transfert et la mise en absolu des URL relatives par le SSR.
 */
export const serverApiInterceptor: HttpInterceptorFn = (req, next) => {
  const url = new URL(req.url, 'http://localhost');
  if (!isPlatformServer(inject(PLATFORM_ID)) || !url.pathname.startsWith('/api/')) return next(req);
  return next(req.clone({ url: inject(API_INTERNAL_URL) + url.pathname + url.search })).pipe(timeout(2000));
};
