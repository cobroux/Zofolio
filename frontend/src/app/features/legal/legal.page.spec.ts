import { TestBed } from '@angular/core/testing';
import { LegalPage } from './legal.page';

describe('LegalPage', () => {
  it('ne contient plus de [À FOURNIR] et n\'imbrique pas de <main>', () => {
    const f = TestBed.createComponent(LegalPage);
    f.detectChanges();
    const el: HTMLElement = f.nativeElement;
    expect(el.textContent).not.toContain('À FOURNIR');
    expect(el.querySelector('main')).toBeNull();
    expect(el.querySelectorAll('h2').length).toBe(8);
    // LCEN 6-III-1 : l'hébergeur réel (VM Oracle), avec son téléphone.
    expect(el.textContent).toContain('Oracle France SAS');
    expect(el.textContent).toContain('+33 1 57 60 20 20');
    expect(el.textContent).not.toContain('Hetzner');
  });
});
