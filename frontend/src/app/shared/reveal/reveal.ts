import { Directive, ElementRef, afterNextRender, inject, input, numberAttribute } from '@angular/core';

/** Entrée d'un bloc (DESIGN §7) : une fois, au premier passage dans le viewport. `appReveal` = rang 0 à 3 (décalage de 60 ms). */
@Directive({
  selector: '[appReveal]',
  host: { class: 'reveal', '[style.--i]': 'appReveal()' },
})
export class Reveal {
  readonly appReveal = input(0, { transform: (v: unknown) => numberAttribute(v, 0) });

  constructor() {
    const el: HTMLElement = inject(ElementRef).nativeElement;
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return el.classList.add('in', 'now');
      let first = true;
      const io = new IntersectionObserver(
        ([e]) => {
          const initial = first;
          first = false;
          if (!e.isIntersecting) return;
          // Déjà visible au chargement : état final tout de suite.
          el.classList.add('in');
          if (initial) el.classList.add('now');
          io.disconnect();
        },
        { rootMargin: '0px 0px -80px 0px', threshold: 0 },
      );
      io.observe(el);
    });
  }
}
