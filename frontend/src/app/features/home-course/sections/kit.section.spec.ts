import { TestBed } from '@angular/core/testing';
import { KitSection } from './kit.section';

describe('KitSection', () => {
  it('chaque techno a un logo local et la preuve de ses projets', () => {
    const f = TestBed.createComponent(KitSection);
    f.detectChanges();
    const items = [...(f.nativeElement as HTMLElement).querySelectorAll('#equipement li')];
    expect(items.map((li) => li.querySelector('.name')!.textContent)).toContain('Spring Boot');
    expect(items.length).toBe(12);
    for (const li of items) {
      expect(li.querySelector('img')!.getAttribute('src')).toMatch(/^img\/stack\/[a-z]+\.svg$/);
      expect(li.querySelector('.where')!.textContent!.trim()).not.toBe('');
    }
  });
});
