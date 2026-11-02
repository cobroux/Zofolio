import { Component, ElementRef, afterNextRender, inject, input, signal } from '@angular/core';

export interface Plate {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  ui?: boolean;
}

/** Plaque principale + encart optionnel (spec §5 bis). Avec `ui: true`, le bloc projeté `[plate-ui]` (capture, schéma) remplace l'image. */
@Component({
  selector: 'app-photo-plates',
  template: `
    <figure class="plate" [class.in]="shown()">
      @if (main().ui) {
        <div data-ui><ng-content select="[plate-ui]" /></div>
      } @else {
        <img
          [src]="main().src"
          [alt]="main().alt"
          [attr.width]="main().width"
          [attr.height]="main().height"
          loading="lazy"
          decoding="async"
        />
      }
      <figcaption>{{ main().caption }}</figcaption>
    </figure>
    @if (inset(); as i) {
      <figure class="plate inset" [class.in]="shown()">
        <img
          [src]="i.src"
          [alt]="i.alt"
          [attr.width]="i.width"
          [attr.height]="i.height"
          loading="lazy"
          decoding="async"
        />
        <figcaption>{{ i.caption }}</figcaption>
      </figure>
    }
  `,
  styleUrl: './photo-plates.css',
})
export class PhotoPlates {
  readonly main = input.required<Plate>();
  readonly inset = input<Plate | null>(null);
  protected readonly shown = signal(false);

  constructor() {
    const el: HTMLElement = inject(ElementRef).nativeElement;
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return this.shown.set(true);
      const io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          this.shown.set(true); // une seule fois
          io.disconnect();
        },
        { rootMargin: '0px 0px -80px 0px' },
      );
      io.observe(el);
    });
  }
}
