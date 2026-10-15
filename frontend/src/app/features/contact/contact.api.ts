import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { ContactRequest, ProblemDetail } from '../../core/api/api.models';

export type ContactResult =
  | { ok: true }
  | { ok: false; status: number; code: ProblemDetail['code'] | 'NETWORK'; errors: { field: string; code: string }[]; retryAfterS: number | null };

/** POST /api/contact (plan §4.3). Jamais d'exception : toute issue devient un `ContactResult`. */
@Injectable({ providedIn: 'root' })
export class ContactApi {
  private readonly http = inject(HttpClient);

  send(body: ContactRequest): Observable<ContactResult> {
    return this.http.post('/api/contact', body, { observe: 'response' }).pipe(
      map((): ContactResult => ({ ok: true })),
      catchError((e: HttpErrorResponse) => {
        const p = e.error as Partial<ProblemDetail> | null;
        const retry = Number(e.headers?.get('Retry-After'));
        return of<ContactResult>({
          ok: false,
          status: e.status,
          code: e.status === 0 ? 'NETWORK' : (p?.code ?? 'INTERNAL_ERROR'),
          errors: p?.errors ?? [],
          retryAfterS: retry > 0 ? retry : null,
        });
      }),
    );
  }
}
