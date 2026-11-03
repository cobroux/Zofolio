import { Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

/** Durée de remplissage d'un élément ; le suivant démarre quand il finit. */
export const STEP_MS = 700;
const easeOut = (x: number) => 1 - (1 - x) ** 3;

/** Progression (0 à 1) de chacun des `n` éléments au temps `t` ms : l'un après l'autre, freinés en fin de course. */
export const steps = (t: number, n: number) =>
  Array.from({ length: n }, (_, i) => easeOut(Math.min(1, Math.max(0, t / STEP_MS - i))));

/**
 * Remplit à tour de rôle les `[data-count]` du bloc (chiffre de 0 à sa valeur) et la `.bar` de la même cellule (`--p` de 0 à 1),
 * une fois, quand le bloc entre dans le viewport. Déjà visible au chargement, animations réduites ou sans JS : valeurs finales du SSR.
 */
@Directive({ selector: '[appCountUp]' })
export class CountUp {
  readonly format = input.required<(n: number) => string>({ alias: 'appCountUp' });
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;

  constructor() {
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      let first = true;
      const io = new IntersectionObserver(
        ([e]) => {
          const initial = first;
          first = false;
          if (!e.isIntersecting) return;
          io.disconnect();
          if (!initial) this.play();
        },
        { threshold: 0.3 },
      );
      io.observe(this.el);
    });
  }

  private play() {
    const items = [...this.el.querySelectorAll<HTMLElement>('[data-count]')].map((el) => ({
      el,
      value: Number(el.dataset['count']),
      bar: el.closest('td, li, div')?.querySelector<HTMLElement>('.bar') ?? null,
      row: el.closest('tr, li') ?? el,
    }));
    // Les éléments d'une même ligne (tr, li) se remplissent ensemble ; les lignes se suivent.
    const rows = [...new Set(items.map((it) => it.row))];
    const draw = (p: number[]) =>
      items.forEach((it) => {
        const q = p[rows.indexOf(it.row)];
        it.el.textContent = this.format()(Math.round(it.value * q));
        it.bar?.style.setProperty('--p', String(q));
      });
    draw(items.map(() => 0));
    let start: number | undefined;
    const frame = (now: number) => {
      start ??= now;
      const p = steps(now - start, rows.length);
      draw(p);
      if (p.at(-1)! < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
}
