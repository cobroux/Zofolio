import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { CourseProgress } from '../../features/home-course/course-progress';
import { ThemeToggle } from '../theme/theme-toggle';

@Component({
  selector: 'app-header',
  imports: [RouterLink, ThemeToggle],
  template: `
    <a class="skip" href="#contenu" (click)="skip($event)" i18n>Aller au contenu</a>
    <header>
      <a class="wordmark" routerLink="/" i18n-aria-label aria-label="E. Leveque, accueil">E. Leveque</a>
      <div class="tools">
        <a class="lang" [href]="switchHref()" [attr.lang]="other" [attr.hreflang]="other" [attr.aria-label]="label">{{ other.toUpperCase() }}</a><app-theme-toggle /></div>
    </header>
  `,
  styles: `
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 64px;
      padding-inline: var(--margin);
    }
    @media (min-width: 1100px) {
      header {
        padding-inline-end: calc(var(--margin) + 72px);
      }
    }
    .wordmark {
      display: inline-flex;
      align-items: center;
      min-height: var(--target);
      font: 800 1.5rem / 1 var(--font-display);
      font-stretch: 72%;
      letter-spacing: -0.02em;
      text-decoration: none;
    }
    .lang {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: var(--target);
      min-height: var(--target);
      font-weight: 600;
    }
    .tools {
      display: flex;
      gap: var(--s-2);
    }
    .skip {
      position: absolute;
      inset-block-start: var(--s-2);
      inset-inline-start: var(--s-2);
      z-index: 10;
      padding: var(--s-3) var(--s-4);
      background: var(--ink);
      color: var(--bg);
      transform: translateY(-200%);
    }
    .skip:focus {
      transform: none;
    }
  `,
})
export class Header {
  // D21 : bascule = rechargement vers l'autre préfixe de locale ; chemin et section active conservés (l'ancre n'existe que sur l'accueil).
  protected readonly other = $localize`:@@otherLocale:en`;
  protected readonly label = $localize`:@@switchLabel:EN, version anglaise`;
  private readonly router = inject(Router);
  private readonly progress = inject(CourseProgress);
  private readonly path = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url.split(/[?#]/)[0]),
    ),
    { initialValue: this.router.url.split(/[?#]/)[0] },
  );
  protected readonly switchHref = computed(
    () => `/${this.other}${this.path()}${this.path() === '/' ? `#${this.progress.active()}` : ''}`,
  );

  // Le href="#contenu" seul pointerait vers la racine du <base href="/fr/">.
  skip(event: Event) {
    event.preventDefault();
    document.getElementById('contenu')?.focus();
  }
}
