import { TestBed } from '@angular/core/testing';
import { diagramFor } from './diagrams';

describe('diagramFor', () => {
  it.each(['oltre', 'zotracker', 'gfaim'])('%s : chaque SVG a un role img, un title et un desc non vides', (slug) => {
    const f = TestBed.createComponent(diagramFor(slug)!);
    f.detectChanges();
    const svgs = (f.nativeElement as HTMLElement).querySelectorAll('svg');
    expect(svgs.length).toBe(2);
    svgs.forEach((svg) => {
      expect(svg.getAttribute('role')).toBe('img');
      expect(svg.querySelector('title')?.textContent?.trim()).toBeTruthy();
      expect(svg.querySelector('desc')?.textContent?.trim()).toBeTruthy();
      for (const id of svg.getAttribute('aria-labelledby')!.split(' ')) expect(svg.querySelector(`#${id}`)).toBeTruthy();
    });
  });

  it('aucun schéma pour trading-app ni pour un slug inconnu', () => {
    expect(diagramFor('trading-app')).toBeUndefined();
    expect(diagramFor('constructor')).toBeUndefined();
  });
});
