import { TestBed } from '@angular/core/testing';
import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('rend les trois icônes sans état (pilotées par data-theme) et un aria-label sans aria-pressed', async () => {
    const f = TestBed.createComponent(ThemeToggle);
    await f.whenStable();
    const el: HTMLElement = f.nativeElement;
    const button = el.querySelector('button')!;
    expect(['.i-light', '.i-dark', '.i-system'].map((c) => !!el.querySelector(c))).toEqual([true, true, true]);
    expect(button.hasAttribute('aria-pressed')).toBe(false);
    expect(button.getAttribute('aria-label')).toBe('Thème : système');
    button.click();
    await f.whenStable();
    expect(button.getAttribute('aria-label')).toBe('Thème : clair');
  });
});
