import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { ContactForm, validate } from './contact-form';
import { ContactApi, ContactResult } from './contact.api';

const ok = { name: 'Ada', email: 'ada@example.com', company: '', message: 'Bonjour' };

describe('validate', () => {
  it('accepte une saisie valide', () => expect(validate(ok)).toEqual({}));
  it('applique les règles §4.3', () => {
    expect(validate({ ...ok, name: ' ', email: '', message: '' })).toEqual({ name: 'NotBlank', email: 'NotBlank', message: 'NotBlank' });
    expect(validate({ ...ok, name: 'a\nb' }).name).toBe('Pattern');
    expect(validate({ ...ok, name: 'a'.repeat(101) }).name).toBe('Size');
    expect(validate({ ...ok, email: 'nope' }).email).toBe('Email');
    expect(validate({ ...ok, company: 'a'.repeat(101) }).company).toBe('Size');
    expect(validate({ ...ok, message: 'a'.repeat(5001) }).message).toBe('Size');
  });
});

describe('ContactForm', () => {
  let sent: unknown[];
  function setup(result: ContactResult | null) {
    sent = [];
    TestBed.configureTestingModule({
      providers: [{ provide: ContactApi, useValue: { send: (b: unknown): Observable<ContactResult> => (sent.push(b), of(result!)) } }],
    });
    const f = TestBed.createComponent(ContactForm);
    f.componentInstance.v.set(ok);
    f.detectChanges();
    return f;
  }
  const submit = (f: ReturnType<typeof setup>) => {
    f.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
    f.detectChanges();
    return f.nativeElement as HTMLElement;
  };
  const fail = (status: number, code: Extract<ContactResult, { ok: false }>['code'], extra = {}): ContactResult => ({
    ok: false, status, code, errors: [], retryAfterS: null, ...extra,
  });

  it('succès : honeypot envoyé vide, message de confirmation', () => {
    const el = submit(setup({ ok: true }));
    expect(sent).toEqual([{ ...ok, company: null, website: '' }]);
    expect(el.querySelector('[role=status]')?.textContent).toContain('Message envoyé');
  });

  it('ne poste rien si la validation client échoue, et relie les erreurs par aria-describedby', () => {
    const f = setup({ ok: true });
    f.componentInstance.v.set({ ...ok, email: 'x' });
    const el = submit(f);
    expect(sent.length).toBe(0);
    const input = el.querySelector('#c-email')!;
    expect(input.getAttribute('aria-describedby')).toBe('c-email-err');
    expect(el.querySelector('#c-email-err')?.textContent).toContain("n'a pas l'air valide");
  });

  it('400 : erreurs par champ', () => {
    const el = submit(setup(fail(400, 'VALIDATION_FAILED', { errors: [{ field: 'name', code: 'Size' }] })));
    expect(el.querySelector('#c-name-err')?.textContent).toContain('100 caractères');
    expect(el.querySelector('[role=status]')?.textContent).toContain('champs sont à corriger');
  });

  it('429 : minutes issues de Retry-After', () => {
    const el = submit(setup(fail(429, 'RATE_LIMITED', { retryAfterS: 1800 })));
    expect(el.querySelector('[role=status]')?.textContent).toContain('30 min');
  });

  it('503 : message enregistré', () => {
    const el = submit(setup(fail(503, 'MAIL_DELIVERY_FAILED')));
    expect(el.querySelector('[role=status]')?.textContent).toContain('est enregistré');
  });

  it('honeypot masqué hors accessibilité', () => {
    const hp = submit(setup({ ok: true })).querySelector('.hp')!;
    const input = hp.querySelector('input')!;
    expect(hp.getAttribute('aria-hidden')).toBe('true');
    expect(input.getAttribute('tabindex')).toBe('-1');
    expect(input.getAttribute('autocomplete')).toBe('off');
  });
});

describe('ContactApi', () => {
  it('mappe une erreur HTTP en ContactResult', async () => {
    const { HttpClient } = await import('@angular/common/http');
    const e = new HttpErrorResponse({ status: 429, headers: new HttpHeaders({ 'Retry-After': '120' }), error: { code: 'RATE_LIMITED' } });
    TestBed.configureTestingModule({
      providers: [{ provide: HttpClient, useValue: { post: () => new Observable((s) => s.error(e)) } }],
    });
    const r = await new Promise<ContactResult>((res) => TestBed.inject(ContactApi).send({ ...ok, company: null, website: '' }).subscribe(res));
    expect(r).toMatchObject({ ok: false, status: 429, code: 'RATE_LIMITED', retryAfterS: 120 });
  });
});
