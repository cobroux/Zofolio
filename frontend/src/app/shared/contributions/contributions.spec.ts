import { TestBed } from '@angular/core/testing';
import fixture from '../../../testing/home.fixture.json';
import { Contributions } from '../../core/api/api.models';
import { ContributionsGraph, weeklyBars, weeklyTotals } from './contributions';

describe('weekly', () => {
  it('somme par semaine de 7 jours, dernière partielle comprise', () => {
    expect(weeklyTotals([1, 1, 1, 1, 1, 1, 1, 2, 3])).toEqual([7, 5]);
  });

  it('hauteur linéaire, plancher, repos en trait, tons par quartiles', () => {
    const bars = weeklyBars([0, 1, 10, 20, 30, 90]);
    expect(bars[0]).toMatchObject({ tone: 0, h: 3, y: 117 });
    expect(bars[5]).toMatchObject({ tone: 4, h: 90, y: 30, x: 70 });
    expect(bars[1].h).toBe(6); // 1/90*90 = 1 -> plancher
    expect(bars.map((b) => b.tone)).toEqual([0, 1, 1, 2, 3, 4]);
  });
});

describe('ContributionsGraph', () => {
  function render(data: Contributions | null) {
    const f = TestBed.createComponent(ContributionsGraph);
    f.componentRef.setInput('data', data);
    f.detectChanges();
    return f.nativeElement as HTMLElement;
  }

  it('rend une barre par semaine, un résumé texte et un titre SVG', () => {
    const el = render(fixture.contributions as Contributions);
    expect(el.querySelectorAll('svg[role="img"] rect').length).toBe(Math.ceil(fixture.contributions.counts.length / 7));
    expect(el.querySelector('.sum')?.textContent).toMatch(/^812 contributions sur 12 mois · \d+ semaines actives sur \d+ · meilleure semaine : \d+$/);
    expect(el.querySelector('title')?.textContent).toContain('par semaine');
    expect(el.querySelector('.legend')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('null ou vide : rien', () => {
    expect(render(null).querySelector('.carnet')).toBeNull();
    expect(render({ start: '2025-10-12', counts: [], total: 0, syncedAt: '' }).querySelector('.carnet')).toBeNull();
  });
});
