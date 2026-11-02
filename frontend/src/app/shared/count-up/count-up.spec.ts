import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CountUp, STEP_MS, steps } from './count-up';

@Component({
  imports: [CountUp],
  template: `<table [appCountUp]="fmt">
    <tr><td><span data-count="347">347</span><span class="bar"></span></td></tr>
    <tr><td><span data-count="2191">2191</span><span class="bar"></span></td></tr>
  </table>`,
})
class Host {
  fmt = (n: number) => String(n);
}

describe('steps', () => {
  it("remplit chaque élément à son tour, sans chevauchement", () => {
    expect(steps(0, 3)).toEqual([0, 0, 0]);
    const mid = steps(STEP_MS / 2, 3);
    expect(mid[0]).toBeGreaterThan(0);
    expect(mid[0]).toBeLessThan(1);
    expect(mid.slice(1)).toEqual([0, 0]);
    expect(steps(STEP_MS, 3)).toEqual([1, 0, 0]);
    expect(steps(STEP_MS * 3, 3)).toEqual([1, 1, 1]);
  });

  it('progresse sans jamais reculer', () => {
    let prev = -1;
    for (let t = 0; t <= STEP_MS; t += 16) {
      const [p] = steps(t, 1);
      expect(p).toBeGreaterThanOrEqual(prev);
      prev = p;
    }
  });
});

describe('CountUp', () => {
  afterEach(() => vi.unstubAllGlobals());

  function setup(reduce: boolean) {
    let cb: IntersectionObserverCallback | undefined;
    vi.stubGlobal('IntersectionObserver', class {
      constructor(c: IntersectionObserverCallback) { cb = c; }
      observe = vi.fn();
      disconnect = vi.fn();
    });
    vi.stubGlobal('matchMedia', () => ({ matches: reduce }));
    const frames: FrameRequestCallback[] = [];
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    const counts = () => [...f.nativeElement.querySelectorAll('[data-count]')].map((e: Element) => e.textContent);
    const bars = () => [...f.nativeElement.querySelectorAll('.bar')].map((e: Element) => (e as HTMLElement).style.getPropertyValue('--p'));
    // Après le premier rendu seulement : Angular planifie aussi ses rendus avec requestAnimationFrame.
    const ready = async () => {
      await f.whenStable();
      vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => frames.push(fn));
    };
    return { f, ready, counts, bars, frames, intersect: (v: boolean) => cb?.([{ isIntersecting: v }] as IntersectionObserverEntry[], {} as IntersectionObserver), observed: () => !!cb };
  }

  it("ouvert plus tard : repart de 0 puis finit sur les vraies valeurs", async () => {
    const s = setup(false);
    await s.ready();
    s.intersect(false); // replié au chargement
    s.intersect(true);
    expect(s.counts()).toEqual(['0', '0']);
    expect(s.bars()).toEqual(['0', '0']);
    s.frames.shift()!(0);
    s.frames.shift()!(STEP_MS);
    expect(s.counts()).toEqual(['347', '0']);
    s.frames.shift()!(STEP_MS * 2);
    expect(s.counts()).toEqual(['347', '2191']);
    expect(s.bars()).toEqual(['1', '1']);
    expect(s.frames.length).toBe(0);
  });

  it('déjà visible au chargement : état final, pas d’animation', async () => {
    const s = setup(false);
    await s.ready();
    s.intersect(true);
    expect(s.counts()).toEqual(['347', '2191']);
    expect(s.frames.length).toBe(0);
  });

  it('animations réduites : rien n’est observé, valeurs finales', async () => {
    const s = setup(true);
    await s.ready();
    expect(s.observed()).toBe(false);
    expect(s.counts()).toEqual(['347', '2191']);
  });
});
