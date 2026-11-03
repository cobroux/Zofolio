import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BuildInfo } from '../../../core/api/api.models';
import { Bib } from '../../../shared/bib/bib';
import { FinishSection } from '../sections/finish.section';
import { LiveColophon } from './live-colophon';

const full: BuildInfo = {
  commit: 'abcdef1',
  deployedAt: '2026-11-03T10:00:00Z',
  ci: { conclusion: 'success', url: 'https://github.com/cobroux/Zofolio/actions/runs/1' },
};
const empty: BuildInfo = { commit: null, deployedAt: null, ci: { conclusion: null, url: null } };

function render(info: BuildInfo | null) {
  const f = TestBed.createComponent(LiveColophon);
  f.componentRef.setInput('info', info);
  f.detectChanges();
  return f.nativeElement as HTMLElement;
}

describe('LiveColophon', () => {
  it('données absentes : lignes retirées, contact toujours là', () => {
    const el = render(empty);
    expect(el.querySelector('[data-row="commit"]')).toBeNull();
    expect(el.querySelector('[data-row="deployed"]')).toBeNull();
    expect(el.querySelector('[data-row="ci"]')).toBeNull();
    expect(el.querySelector('a[href^="mailto:"]')).toBeTruthy();
    expect(render(null).querySelector('a[href^="mailto:"]')).toBeTruthy();
  });

  it('commit présent : lien vers le commit GitHub', () => {
    expect(render(full).querySelector('a[href="https://github.com/cobroux/Zofolio/commit/abcdef1"]')).toBeTruthy();
  });

  it('déploiement et CI', () => {
    const el = render(full);
    expect(el.querySelector('[data-row="deployed"] time')!.getAttribute('datetime')).toBe('2026-11-03T10:00:00Z');
    expect(el.querySelector('[data-row="ci"]')!.textContent).toContain('CI verte');
    expect(el.querySelector('[data-row="ci"] a')!.getAttribute('href')).toBe(full.ci.url);
    const red = render({ ...full, ci: { conclusion: 'failure', url: null } });
    expect(red.querySelector('[data-row="ci"]')!.textContent).toContain('CI rouge');
    expect(red.querySelector('[data-row="ci"] a')).toBeNull();
  });
});

describe('Bib face arrière', () => {
  it('projette son contenu', () => {
    @Component({ imports: [Bib], template: `<app-bib face="back"><p id="x">colophon</p></app-bib>` })
    class Host {}
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('#x')!.textContent).toBe('colophon');
    expect(el.querySelector('.num')).toBeNull();
  });
});

describe('FinishSection', () => {
  function finish() {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const f = TestBed.createComponent(FinishSection);
    f.detectChanges();
    TestBed.inject(HttpTestingController).match('/api/build').forEach((r) => r.flush(empty));
    f.detectChanges();
    return f.nativeElement as HTMLElement;
  }

  it('arrivée : chrono officiel et 4 pointages', () => {
    const el = finish();
    expect(el.textContent).toContain('13 h 35 min 53 s');
    expect(el.querySelectorAll('.splits tbody tr')).toHaveLength(4);
    expect(el.querySelector('.splits')!.textContent).toContain('20:05:52');
  });

  it('terrain nuit, contact avant le formulaire, dos du dossard', () => {
    const el = finish();
    expect(el.querySelector('section')!.classList).toContain('terrain-night');
    const mail = el.querySelector('.contact a[href^="mailto:"]')!;
    const form = el.querySelector('app-contact-form')!;
    expect(mail.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(el.querySelector('app-bib app-live-colophon')).toBeTruthy();
    expect(el.textContent).toContain('Prochain objectif');
  });
});
