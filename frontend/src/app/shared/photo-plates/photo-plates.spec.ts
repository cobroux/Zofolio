import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PhotoPlates, Plate } from './photo-plates';

const plate: Plate = { src: '/img/portrait-800.jpg', alt: 'Enzo au départ', caption: 'Départ', width: 800, height: 1000 };

@Component({ imports: [PhotoPlates], template: `<app-photo-plates [main]="main" [inset]="inset" />` })
class Host {
  main = plate;
  inset: Plate | null = null;
}
@Component({
  imports: [PhotoPlates],
  template: `<app-photo-plates [main]="main" [inset]="null"><svg plate-ui></svg></app-photo-plates>`,
})
class UiHost {
  main: Plate = { ...plate, ui: true };
}

describe('PhotoPlates', () => {
  it('plaque sans JS : image visible, alt et taille posés', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const img: HTMLImageElement = f.nativeElement.querySelector('img');
    expect(img.getAttribute('alt')).toBe(plate.alt);
    expect(img.getAttribute('width')).toBe(String(plate.width));
    expect(img.closest('figure')!.classList).not.toContain('hidden');
    expect(f.nativeElement.querySelector('figcaption').textContent).toContain('Départ');
  });
  it("encart : second figure seulement s'il est fourni", async () => {
    const f = TestBed.createComponent(Host);
    f.componentInstance.inset = { ...plate, alt: 'encart' };
    await f.whenStable();
    expect(f.nativeElement.querySelectorAll('figure').length).toBe(2);
  });
  it('ui : projette le schéma et pose data-ui', async () => {
    const f = TestBed.createComponent(UiHost);
    await f.whenStable();
    expect(f.nativeElement.querySelector('[data-ui] svg')).toBeTruthy();
    expect(f.nativeElement.querySelector('img')).toBeNull();
  });
  it('révélation : .in posé une seule fois au passage dans le viewport', async () => {
    let cb!: IntersectionObserverCallback;
    vi.stubGlobal('IntersectionObserver', class {
      constructor(c: IntersectionObserverCallback) { cb = c; }
      observe = vi.fn();
      disconnect = vi.fn();
    });
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    const fig: HTMLElement = f.nativeElement.querySelector('figure');
    expect(fig.classList.contains('in')).toBe(false);
    cb([{ isIntersecting: true }] as IntersectionObserverEntry[], {} as IntersectionObserver);
    await f.whenStable();
    expect(fig.classList.contains('in')).toBe(true);
    vi.unstubAllGlobals();
  });
});
