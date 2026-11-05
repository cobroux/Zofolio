import { Component, ElementRef, input, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Reveal } from '../../../shared/reveal/reveal';

export interface Shot {
  name: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Étude de cas liée, seulement si elle existe. */
  slug?: string;
}

/** Bande de captures intégrée à un chapitre ; hauteur via --shot-h ; clic = agrandissement dans un <dialog> natif (Échap ferme). */
@Component({
  selector: 'app-shots',
  imports: [Reveal, RouterLink],
  template: `
    <ul i18n-aria-label aria-label="Captures">
      @for (s of shots(); track s.src) {
        <li appReveal>
          <button type="button" (click)="open(s)">
            <img [src]="s.src" [alt]="s.alt" [attr.width]="s.width" [attr.height]="s.height" loading="lazy" decoding="async" />
          </button>
          @if (s.slug) {
            <a [routerLink]="['/projets', s.slug]">{{ s.name }}</a>
          } @else {
            <span>{{ s.name }}</span>
          }
        </li>
      }
    </ul>
    <dialog #dlg tabindex="-1" (click)="dlg.close()" (keydown.escape)="dlg.close()" [attr.aria-label]="current()?.name">
      @if (current(); as c) {
        <img [src]="c.src" [alt]="c.alt" [attr.width]="c.width" [attr.height]="c.height" />
      }
      <button type="button" class="close" i18n>Fermer</button>
    </dialog>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    ul {
      display: flex;
      gap: var(--s-5);
      margin: 0;
      padding: 0 0 var(--s-3);
      list-style: none;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
    }
    li {
      display: flex;
      flex: none;
      flex-direction: column;
      gap: var(--s-2);
      scroll-snap-align: start;
    }
    li > button {
      padding: 0;
      border: 1px solid var(--line-muted);
      background: none;
      cursor: zoom-in;
    }
    li img {
      display: block;
      width: auto;
      height: var(--shot-h, 16rem);
      transition: transform 200ms ease;
    }
    li > button:hover img {
      transform: scale(1.02);
    }
    dialog {
      max-width: min(92vw, 1280px);
      max-height: 92vh;
      padding: 0;
      border: 0;
      background: none;
    }
    dialog::backdrop {
      background: rgb(0 0 0 / 0.8);
    }
    dialog img {
      display: block;
      max-width: 100%;
      max-height: 86vh;
      width: auto;
      height: auto;
      margin-inline: auto;
    }
    .close {
      display: block;
      min-height: var(--target);
      margin: var(--s-3) auto 0;
      color: #fff;
      background: none;
      border: 0;
      text-decoration: underline;
    }
    @media (prefers-reduced-motion: reduce) {
      li img {
        transition: none;
      }
    }
  `,
})
export class Shots {
  private readonly dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');
  protected readonly current = signal<Shot | null>(null);
  readonly shots = input.required<Shot[]>();

  protected open(s: Shot): void {
    this.current.set(s);
    this.dlg().nativeElement.showModal();
  }
}
