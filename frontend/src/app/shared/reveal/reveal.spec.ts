import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Reveal } from './reveal';

@Component({ imports: [Reveal], template: `<p [appReveal]="2">x</p>` })
class Host {}

describe('Reveal', () => {
  it("pose .in une seule fois au premier passage et se désabonne", async () => {
    let cb!: IntersectionObserverCallback;
    const disconnect = vi.fn();
    vi.stubGlobal('IntersectionObserver', class {
      constructor(c: IntersectionObserverCallback) { cb = c; }
      observe = vi.fn();
      disconnect = disconnect;
    });
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const p: HTMLElement = f.nativeElement.querySelector('p');
    expect(p.classList.contains('reveal')).toBe(true);
    expect(p.style.getPropertyValue('--i')).toBe('2');
    cb([{ isIntersecting: false }] as IntersectionObserverEntry[], {} as IntersectionObserver); // 1er appel : hors écran
    expect(p.classList.contains('in')).toBe(false);
    cb([{ isIntersecting: true }] as IntersectionObserverEntry[], {} as IntersectionObserver);
    expect(p.classList.contains('in')).toBe(true);
    expect(p.classList.contains('now')).toBe(false); // transition jouée
    expect(disconnect).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
