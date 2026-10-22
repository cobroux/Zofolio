import { TestBed } from '@angular/core/testing';
import { ColophonPage } from './colophon.page';

describe('ColophonPage', () => {
  it('rend un h1, les tables avec caption et aucun gabarit de brouillon', () => {
    const f = TestBed.createComponent(ColophonPage);
    f.detectChanges();
    const el: HTMLElement = f.nativeElement;
    expect(el.querySelectorAll('h1').length).toBe(1);
    expect(el.querySelector('main')).toBeNull();
    expect(el.querySelectorAll('table caption').length).toBe(1);
    expect(el.querySelectorAll('tbody tr').length).toBe(9);
    expect(el.textContent).not.toMatch(/\[À |\(conditionnel\)/);
    expect(el.querySelectorAll('.links a').length).toBe(3);
  });
});
