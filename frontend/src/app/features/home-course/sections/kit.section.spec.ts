import { TestBed } from '@angular/core/testing';
import { KitSection } from './kit.section';

describe('KitSection', () => {
  it('chaque techno porte la preuve de ses projets, sans logo de marque', () => {
    const f = TestBed.createComponent(KitSection);
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    const items = [...el.querySelectorAll('#equipement li')];
    expect(items.map((li) => li.querySelector('.name')!.textContent)).toContain('Spring Boot');
    expect(items.length).toBe(12);
    for (const li of items) expect(li.querySelector('.where')!.textContent!.trim()).not.toBe('');
    expect(el.querySelector('img')).toBeNull();
  });
});
