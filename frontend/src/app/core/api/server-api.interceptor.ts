import { HttpInterceptorFn } from '@angular/common/http';
import { PLATFORM_ID, inject, InjectionToken } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { timeout } from 'rxjs';

export const API_INTERNAL_URL = new InjectionToken<string>('API_INTERNAL_URL', {
  factory: () => (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env['API_INTERNAL_URL'] ?? 'http://localhost:8080',
});

/** Côté serveur seulement (ADR 0002) : préfixe `/api` par l'URL interne du back, timeout 2 s. */
export const serverApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isPlatformServer(inject(PLATFORM_ID)) || !req.url.startsWith('/api/')) return next(req);
  return next(req.clone({ url: inject(API_INTERNAL_URL) + req.url })).pipe(timeout(2000));
};
