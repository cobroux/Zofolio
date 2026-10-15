import { TestBed } from '@angular/core/testing';
import { ElevationProfile } from './elevation-profile';
import { CourseProgress, altitudeRatioAt, formatKm, kmAtScroll, kmToCoord, profilePath } from '../course-progress';

describe('ElevationProfile', () => {
  it('convertit les km en coordonnée', () => {
    expect(kmToCoord(0)).toBe(0);
    expect(kmToCoord(79.41)).toBeCloseTo(1000);
    expect(kmToCoord(39.705, 200)).toBeCloseTo(100);
    expect(profilePath(true).startsWith('M')).toBe(true);
    expect(formatKm(79.41)).toBe('79,4');
  });

  it('place le point sur le tracé : altitude interpolée et km lié au scroll', () => {
    expect(altitudeRatioAt(0)).toBeCloseTo((414 - 407) / (1369 - 407));
    expect(altitudeRatioAt(46.43)).toBe(1); // point culminant, 1369 m
    expect(altitudeRatioAt(0.09)).toBeCloseTo((410.5 - 407) / (1369 - 407)); // mi-chemin entre 414 et 407 m
    const anchors = [[-450, 0], [800, 20], [3000, 44]] as const;
    expect(kmAtScroll(-1000, anchors)).toBe(0);
    expect(kmAtScroll(800, anchors)).toBe(20);
    expect(kmAtScroll(1900, anchors)).toBe(32);
    expect(kmAtScroll(9999, anchors)).toBe(44);
  });

  it('rend 5 ancres réelles et marque le checkpoint actif', async () => {
    const f = TestBed.createComponent(ElevationProfile);
    await f.whenStable();
    const el: HTMLElement = f.nativeElement;
    const links = [...el.querySelectorAll('a')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['#depart', '#p1', '#p2', '#p3', '#arrivee']);
    expect(el.querySelector('nav')!.getAttribute('aria-label')).toBe('Profil de la course');
    expect(el.querySelectorAll('[aria-current="location"]').length).toBe(1);
    expect(links[0].getAttribute('aria-current')).toBe('location');

    TestBed.inject(CourseProgress).active.set('p2');
    await f.whenStable();
    expect(links[2].getAttribute('aria-current')).toBe('location');
    expect(el.querySelector('.km')!.textContent).toContain('km 44');
  });
});

describe('CourseProgress.start', () => {
  it("passe au checkpoint de la section qui croise l'observateur", () => {
    let cb!: IntersectionObserverCallback;
    const observed: string[] = [];
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(c: IntersectionObserverCallback) {
          cb = c;
        }
        observe(e: Element) {
          observed.push(e.id);
        }
      },
    );
    ['depart', 'p1', 'p2', 'p3', 'arrivee'].forEach((id) => {
      const s = document.createElement('section');
      s.id = id;
      document.body.append(s);
    });
    const p = TestBed.inject(CourseProgress);
    p.start();
    expect(observed).toEqual(['depart', 'p1', 'p2', 'p3', 'arrivee']);
    cb([{ isIntersecting: true, target: document.getElementById('p3')! } as unknown as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(p.active()).toBe('p3');
    expect(p.km()).toBe(58.2);
    document.body.replaceChildren();
    vi.unstubAllGlobals();
  });

  it('start() deux fois : déconnecte l\'ancien observateur et observe les nouveaux nœuds', () => {
    const disconnect = vi.fn();
    const observed: Element[] = [];
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe(e: Element) {
          observed.push(e);
        }
        disconnect = disconnect;
      },
    );
    const mk = () => {
      const s = document.createElement('section');
      s.id = 'depart';
      document.body.append(s);
      return s;
    };
    const p = TestBed.inject(CourseProgress);
    mk();
    p.start();
    document.body.replaceChildren(); // navigation vers les mentions légales puis retour : sections recréées
    const fresh = mk();
    p.start();
    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(observed.at(-1)).toBe(fresh);
    document.body.replaceChildren();
    vi.unstubAllGlobals();
  });
});
