import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Reveal } from '../../../shared/reveal/reveal';

interface Shot {
  name: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Étude de cas liée, seulement si elle existe. */
  slug?: string;
}

/** Captures des projets lancés pour de vrai ; clic = agrandissement dans un <dialog> natif (Échap ferme). */
@Component({
  selector: 'app-shots-section',
  imports: [Reveal, RouterLink],
  template: `
    <section id="captures" aria-labelledby="shots-title">
      <h2 id="shots-title" appReveal i18n>En images</h2>
      <ul>
        @for (s of shots; track s.src) {
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
      <dialog #dlg (click)="dlg.close()" [attr.aria-label]="current()?.name">
        @if (current(); as c) {
          <img [src]="c.src" [alt]="c.alt" [attr.width]="c.width" [attr.height]="c.height" />
        }
        <button type="button" class="close" i18n>Fermer</button>
      </dialog>
    </section>
  `,
  styles: `
    section {
      display: flex;
      flex-direction: column;
      gap: var(--s-6);
      padding: var(--s-9) var(--margin);
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
      height: 16rem;
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
export class ShotsSection {
  private readonly dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');
  protected readonly current = signal<Shot | null>(null);
  protected readonly shots: Shot[] = [
    { name: 'Histoquiz', src: 'media/histoquiz-shot.webp', width: 780, height: 1688, alt: $localize`Histoquiz : une question chronométrée sur la Première Guerre mondiale` },
    { name: 'Oltre', src: 'media/oltre-1.webp', width: 1280, height: 800, alt: $localize`Oltre : l'agenda qui organise vie pro et vie perso`, slug: 'oltre' },
    { name: 'Zotracker', src: 'media/zotracker-1.webp', width: 1280, height: 800, alt: $localize`Zotracker : le suivi de course en direct sur la carte`, slug: 'zotracker' },
    { name: 'GFaim', src: 'media/gfaim-1.webp', width: 540, height: 1170, alt: $localize`GFaim : le planificateur de repas familial`, slug: 'gfaim' },
    { name: 'Cin-folie', src: 'media/cinfolie-shot.webp', width: 1280, height: 800, alt: $localize`Cin-folie : le catalogue de films, avec recherche et filtres` },
    { name: 'Calculateur DPE', src: 'media/dpe-shot.webp', width: 1280, height: 800, alt: $localize`Calculateur DPE : le formulaire département, ville et rue` },
  ];

  protected open(s: Shot): void {
    this.current.set(s);
    this.dlg().nativeElement.showModal();
  }
}
