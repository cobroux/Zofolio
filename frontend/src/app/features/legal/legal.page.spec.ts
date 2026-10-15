import { TestBed } from '@angular/core/testing';
import { LegalPage } from './legal.page';

describe('LegalPage', () => {
  it('ne contient plus de [À FOURNIR] et n\'imbrique pas de <main>', () => {
    const f = TestBed.createComponent(LegalPage);
    f.detectChanges();
    const el: HTMLElement = f.nativeElement;
    expect(el.textContent).not.toContain('À FOURNIR');
    expect(el.querySelector('main')).toBeNull();
    expect(el.querySelectorAll('h2').length).toBe(7);
  });
});
