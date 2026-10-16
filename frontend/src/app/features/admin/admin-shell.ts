import { Component, ViewEncapsulation, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeToggle } from '../../core/theme/theme-toggle';
import { AdminApi } from './admin.api';

/** Cadre de l'admin (DESIGN §11.1). La navigation n'apparaît qu'une fois la session confirmée par la garde. */
@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ThemeToggle],
  encapsulation: ViewEncapsulation.None,
  styleUrl: './admin.css',
  template: `
    <div class="adm-root">
      <a class="skip" href="#contenu" (click)="skip($event)">Aller au contenu</a>
      <header class="adm-head">
        <div class="wrap">
          <a class="wm" routerLink="/admin">Zofolio admin</a>
          @if (api.authed()) {
            <nav aria-label="Admin">
              @for (l of links; track l.path) {
                <a [routerLink]="'/admin/' + l.path" routerLinkActive #rla="routerLinkActive" [attr.aria-current]="rla.isActive ? 'page' : null">{{ l.label }}</a>
              }
            </nav>
          } @else {
            <span></span>
          }
          <div class="tools">
            <app-theme-toggle />
            @if (api.authed()) {
              <button type="button" class="link" (click)="logout()">Déconnexion</button>
            }
          </div>
        </div>
      </header>
      <main id="contenu" tabindex="-1" class="adm"><router-outlet /></main>
    </div>
  `,
})
export class AdminShell {
  protected readonly api = inject(AdminApi);
  private readonly router = inject(Router);
  protected readonly links = [
    { path: 'projets', label: 'Projets' },
    { path: 'courses', label: 'Courses' },
    { path: 'stats', label: 'Stats' },
    { path: 'medias', label: 'Médias' },
  ];

  protected skip(e: Event) {
    e.preventDefault();
    document.getElementById('contenu')?.focus();
  }

  protected logout() {
    this.api.logout().subscribe({
      // même en cas d'échec, on quitte l'écran : la session expirera d'elle-même
      complete: () => this.leave(),
      error: () => this.leave(),
    });
  }

  private leave() {
    this.api.authed.set(false);
    this.api.drafts.clear();
    void this.router.navigate(['/admin/connexion']);
  }
}
