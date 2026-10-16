import { TestBed } from '@angular/core/testing';
import { ColophonPage, isAtLimit } from './colophon.page';

describe('ColophonPage', () => {
  it('rend un h1, les tables avec caption et garde les trous visibles', () => {
    const f = TestBed.createComponent(ColophonPage);
    f.detectChanges();
    const el: HTMLElement = f.nativeElement;
    expect(el.querySelectorAll('h1').length).toBe(1);
    expect(el.querySelector('main')).toBeNull();
    expect(el.querySelectorAll('table caption').length).toBe(2);
    expect(el.querySelectorAll('tbody tr').length).toBe(9 + 4);
    expect(el.textContent).toContain('[À MESURER : prod]');
    expect(el.textContent).toContain('[À recompter avant publication]');
    expect(el.querySelectorAll('.links a').length).toBe(3);
  });

  it('note « limite » seulement à moins de 2 points au-dessus du seuil', () => {
    expect(isAtLimit(90, 90)).toBe(true);
    expect(isAtLimit(92, 90)).toBe(true);
    expect(isAtLimit(93, 90)).toBe(false);
    expect(isAtLimit(null, 90)).toBe(false);
  });
});
