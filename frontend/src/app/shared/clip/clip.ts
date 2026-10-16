import { Component, ElementRef, PLATFORM_ID, afterNextRender, effect, inject, input, signal, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Video } from '../../core/api/api.models';

let uid = 0;
const ignore = () => undefined;

/** Pas de lecture automatique si l'utilisateur a demandé moins de mouvement ou économise les données (DESIGN §10.3). */
function calm(): boolean {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return (
    matchMedia('(prefers-reduced-motion: reduce)').matches || c?.saveData === true || /(^|slow-)2g$/.test(c?.effectiveType ?? '')
  );
}

/** Clip muet en boucle : affiche d'abord, vidéo au passage dans le viewport (ou au clic), bouton Lecture/Pause toujours visible. */
@Component({
  selector: 'app-clip',
  styleUrl: './clip.css',
  template: `
    @if (video(); as v) {
      @if (missing()) {
        <p class="soon" [style.aspect-ratio]="v.width + ' / ' + v.height" i18n>Démo vidéo à venir</p>
      } @else {
        <figure [class.portrait]="v.height > v.width" [attr.aria-labelledby]="capId">
          <div class="frame" [style.aspect-ratio]="v.width + ' / ' + v.height">
            @defer (on viewport; on interaction(btn)) {
              <video #vid muted [muted]="true" loop playsinline preload="none" [poster]="v.poster" [attr.aria-labelledby]="capId" [attr.width]="v.width" [attr.height]="v.height"
                (play)="playing.set(true)" (pause)="playing.set(false)">
                <source [src]="v.webm" type="video/webm" />
                <source [src]="v.mp4" type="video/mp4" (error)="missing.set(true)" />
              </video>
            } @placeholder {
              <img [src]="v.poster" alt="" loading="lazy" [attr.width]="v.width" [attr.height]="v.height" (error)="missing.set(true)" />
            }
          </div>
          <figcaption>
            <button #btn type="button" class="ctl" (click)="toggle()">
              @if (playing()) {
                <ng-container i18n>Pause</ng-container>
              } @else {
                <ng-container i18n>Lecture</ng-container>
              }
            </button>
            <span [id]="capId">{{ v.caption }}</span>
          </figcaption>
        </figure>
      }
    }
  `,
})
export class Clip {
  readonly video = input<Video | null>();
  protected readonly capId = `clip-cap-${uid++}`;
  protected readonly playing = signal(false);
  protected readonly missing = signal(false);
  private readonly vid = viewChild<ElementRef<HTMLVideoElement>>('vid');
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private wantPlay = false;
  /** Une pause demandée par le visiteur n'est pas annulée par le retour dans le viewport. */
  private userPaused = false;

  constructor() {
    const browser = isPlatformBrowser(inject(PLATFORM_ID));
    // Une affiche déjà en erreur avant l'hydratation a perdu son événement `error`.
    afterNextRender(() => {
      const img = this.host.querySelector('img');
      if (img?.complete && img.naturalWidth === 0) this.missing.set(true);
    });
    effect((onCleanup) => {
      const v = this.vid()?.nativeElement;
      if (!v || !browser) return;
      const play = () => v.play()?.catch(ignore);
      if (this.wantPlay) {
        play();
        return;
      }
      if (calm() || typeof IntersectionObserver === 'undefined') return;
      const io = new IntersectionObserver(([e]) => (e.isIntersecting && !this.userPaused ? play() : v.pause()), { threshold: 0.5 });
      io.observe(v);
      onCleanup(() => io.disconnect());
    });
  }

  protected toggle() {
    const v = this.vid()?.nativeElement;
    // Clic avant le chargement : le @defer se déclenche (interaction) et la lecture démarre à l'apparition de la vidéo.
    if (!v) return void (this.wantPlay = true);
    this.userPaused = !v.paused;
    if (v.paused) v.play()?.catch(ignore);
    else v.pause();
  }
}
