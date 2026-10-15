import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('cycle système, clair, sombre, système et pose data-theme', () => {
    const s = TestBed.inject(ThemeService);
    const root = document.documentElement;
    expect(s.mode()).toBe('system');
    s.cycle();
    expect([s.mode(), root.dataset['theme'], localStorage.getItem('theme')]).toEqual(['light', 'light', 'light']);
    s.cycle();
    expect([s.mode(), root.dataset['theme'], s.dark()]).toEqual(['dark', 'dark', true]);
    s.cycle();
    expect([s.mode(), root.dataset['theme'], localStorage.getItem('theme')]).toEqual(['system', undefined, null]);
  });

  it('ne lève pas si localStorage lève', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const s = TestBed.inject(ThemeService);
    expect(() => s.cycle()).not.toThrow();
    expect(s.mode()).toBe('light');
  });
});
