import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TERRAINS, contrast } from '../../../shared/terrain/terrain';
import { CourseProgress, TOTAL_KM, formatKm, gainAt } from '../course-progress';
import { TrackingBand } from './tracking-band';

describe('TrackingBand', () => {
  let f: ComponentFixture<TrackingBand>;
  let progress: CourseProgress;

  beforeEach(() => {
    sessionStorage.clear();
    progress = TestBed.inject(CourseProgress);
    render();
  });
  afterEach(() => document.body.replaceChildren());

  function render(): HTMLElement {
    f = TestBed.createComponent(TrackingBand);
    f.detectChanges();
    return f.nativeElement;
  }
  const flush = () => f.detectChanges();
  const el = (): HTMLElement => f.nativeElement;
  const values = () => (flush(), el().querySelector('.values[aria-hidden="true"]')!.textContent!);
  const band = () => (flush(), el().querySelector<HTMLElement>('.band')!);
  const announcements = () => (
    flush(),
    [...el().querySelectorAll('[aria-live="polite"] p')].map((p) => p.textContent!.trim())
  );

  it('SSR : nav « Parcours » avec un lien par pointage', () => {
    const nav = render().querySelector('nav[aria-label="Parcours"]')!;
    expect([...nav.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href'))).toEqual([
      '#depart',
      '#p1',
      '#p2',
      '#p3',
      '#arrivee',
    ]);
  });

  it('à km 44 : km, D+ et dernier passage 13:32:16', () => {
    progress.scrollKm.set(44);
    expect(values()).toContain('44');
    expect(values()).toContain('13:32:16');
    // D+ en milliers à la française (espace fine insécable), DESIGN §2.
    expect(values()).toContain(Math.round(gainAt(44)).toLocaleString('fr-FR'));
  });

  it('entre P1 et P2 : passage P1, jamais un temps interpolé', () => {
    progress.scrollKm.set(30);
    expect(values()).toContain('09:23:44');
    expect(values()).not.toContain('13:32:16');
  });

  it('ligne de pointage : une fois par session, pas au retour', () => {
    progress.scrollKm.set(44);
    flush();
    expect(band().classList).toContain('split');
    expect(el().querySelector('.line')!.textContent).toContain(
      'P2 · km 44 · 13:32:16 · 4 h 08 de la plus longue étape',
    );
    progress.scrollKm.set(20);
    flush();
    progress.scrollKm.set(44);
    flush();
    expect(sessionStorage.getItem('zofolio:split:p2')).toBe('1');
    expect(announcements()).toEqual(['P2 atteint, km 44']);
  });

  it('pointage déjà vu dans la session : ni ligne ni annonce', () => {
    sessionStorage.setItem('zofolio:split:p1', '1');
    progress.scrollKm.set(25);
    expect(band().classList).not.toContain('split');
    expect(announcements()).toEqual([]);
  });

  it('valeurs aria-hidden, bouton « Parcours » qui ouvre le road book', () => {
    expect(el().querySelector('.values')!.getAttribute('aria-hidden')).toBe('true');
    const dialog = el().querySelector('dialog')!;
    dialog.showModal = function () {
      this.setAttribute('open', '');
    };
    const btn = el().querySelector<HTMLButtonElement>('nav button')!;
    expect(btn.textContent!.trim()).toBe('Parcours');
    btn.click();
    expect(dialog.hasAttribute('open')).toBe(true);
    expect(el().querySelector('a.how')!.getAttribute('href')).toBe(
      'https://github.com/cobroux/Zofolio/blob/main/frontend/src/app/features/home-course/course-progress.ts',
    );
  });

  it('afficheur km : un rouleau par chiffre, rang en --n, texte conservé', () => {
    progress.scrollKm.set(44);
    flush();
    const d = [...el().querySelectorAll<HTMLElement>('.km .d')];
    expect(d.map((x) => x.style.getPropertyValue('--n'))).toEqual(['4', '4', '0']);
    expect(el().querySelector('.km .v')!.textContent).toBe(formatKm(44, 1));
  });

  it('marque le pointage actif (km du scroll)', () => {
    progress.scrollKm.set(44);
    flush();
    const current = [...el().querySelectorAll('nav [aria-current="location"]')];
    expect(current.map((a) => a.getAttribute('href'))).toEqual(['#p2']);
  });

  it('texte du bandeau lisible sur la nuit (≥ 4,5:1)', () => {
    for (const { bg, ink, ink2 } of [TERRAINS.night.light, TERRAINS.night.dark])
      // #ff8a2b : accent du bandeau (tracking-band.css), fixé pour la nuit dans les deux thèmes.
      for (const c of [ink, ink2, '#ff8a2b']) expect(contrast(c, bg)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('TrackingBand : boucle de scroll', () => {
  it('km du scroll au dixième, trace et libellé lisent la même valeur', () => {
    // Positions document : départ sur la ligne de référence du scroll 0 (km 0), p1 1000 px plus bas ; rect.top = doc - scrollY.
    const line = innerHeight / 3;
    const doc: Record<string, number> = {
      depart: line,
      p1: line + 1000,
      p2: 5000,
      p3: 6000,
      arrivee: 7000,
    };
    const tops = Object.fromEntries(Object.entries(doc).map(([id, y]) => [id, y - 333]));
    Object.entries(tops).forEach(([id, top]) => {
      const s = document.createElement('section');
      s.id = id;
      s.getBoundingClientRect = () => ({ top }) as DOMRect;
      document.body.append(s);
    });
    vi.stubGlobal('scrollY', 333);
    const f = TestBed.createComponent(TrackingBand);
    f.detectChanges();
    const km = TestBed.inject(CourseProgress).scrollKm();
    expect(km).toBeCloseTo(6.7, 5);
    f.detectChanges();
    expect(f.nativeElement.querySelector('.values .km').textContent).toContain(formatKm(km, 1));
    expect(f.nativeElement.querySelector('.mask').style.transform).toBe(`scaleX(${km / TOTAL_KM})`);
    document.body.replaceChildren();
    vi.unstubAllGlobals();
  });
  it('repères remesurés au chargement complet de la fenêtre', async () => {
    const line = innerHeight / 3;
    let shift = 0;
    const doc: Record<string, number> = {
      depart: line,
      p1: line + 1000,
      p2: 5000,
      p3: 6000,
      arrivee: 7000,
    };
    Object.entries(doc).forEach(([id, y]) => {
      const s = document.createElement('section');
      s.id = id;
      s.getBoundingClientRect = () => ({ top: y + (id === 'depart' ? 0 : shift) }) as DOMRect;
      document.body.append(s);
    });
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
    vi.stubGlobal('scrollY', 0);
    const f = TestBed.createComponent(TrackingBand);
    f.detectChanges();
    const progress = TestBed.inject(CourseProgress);
    vi.stubGlobal('scrollY', line + 500);
    shift = 1000; // les polices ont décalé p1 : à scroll identique, le km baisse
    dispatchEvent(new Event('scroll'));
    await new Promise((r) => requestAnimationFrame(r));
    const before = progress.scrollKm();
    dispatchEvent(new Event('load'));
    await new Promise((r) => requestAnimationFrame(r));
    expect(progress.scrollKm()).toBeLessThan(before);
    document.body.replaceChildren();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
});
