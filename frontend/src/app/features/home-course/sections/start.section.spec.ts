import { TestBed } from '@angular/core/testing';
import { StartSection } from './start.section';

function render() {
  const f = TestBed.createComponent(StartSection);
  f.detectChanges();
  return f.nativeElement as HTMLElement;
}

describe('StartSection', () => {
  it('h1 = le nom, puis phrase métier, ligne de preuve, CV, contact', () => {
    const el = render();
    expect(el.querySelector('h1')!.textContent!.trim()).toBe('Enzo Leveque');
    expect(el.textContent).toContain('Java/Spring + Angular');
    expect(el.querySelector('.proof')!.textContent).toContain('move2cloud');
    expect(el.querySelector('a[href$="/cv"]')).toBeTruthy();
    expect(el.querySelector('app-bib')!.textContent).toContain('1592');
  });

  it('dossard avant : course, distance et heure de départ ; terrain nuit', () => {
    const el = render();
    expect(el.querySelector('app-bib')!.textContent).toContain(
      "Grand Trail d'Auvergne · 79,4 km · départ 6 h 30",
    );
    expect(el.querySelector('section')!.classList).toContain('terrain-night');
    expect(el.querySelector('.plate app-bib')).toBeTruthy();
  });
});
