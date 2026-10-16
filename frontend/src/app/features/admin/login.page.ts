import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Icon } from './admin-icon';
import { AdminApi, Problem } from './admin.api';
import { bannerMessage, lockMinutes } from './admin.errors';

/** Connexion (DESIGN §11.1) : un champ, un bouton. `LOGIN_LOCKED` désactive le bouton (aria-disabled) le temps du blocage. */
@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule, Icon],
  template: `
    <div class="login">
      <h1>Connexion</h1>
      @if (route.snapshot.queryParamMap.get('expiree')) {
        <p class="small" role="status">Session expirée. Reconnectez-vous.</p>
      }
      <form (submit)="submit($event)" novalidate>
        <div class="field" [class.invalid]="error()">
          <label for="f-password">Mot de passe</label>
          <input id="f-password" type="password" autocomplete="current-password" [formControl]="password" [attr.aria-invalid]="error() ? 'true' : null" aria-describedby="login-err" />
          <p id="login-err" class="msg" role="alert">
            @if (error(); as e) {
              <app-icon name="error" />{{ e }}
            }
          </p>
        </div>
        <button class="btn primary" type="submit" [attr.aria-disabled]="locked() || busy()">Se connecter</button>
      </form>
    </div>
  `,
})
export class LoginPage {
  protected readonly route = inject(ActivatedRoute);
  private readonly api = inject(AdminApi);
  private readonly router = inject(Router);
  protected readonly password = new FormControl('', { nonNullable: true });
  protected readonly error = signal<string | null>(null);
  protected readonly locked = signal(false);
  protected readonly busy = signal(false);

  constructor() {
    // pose le cookie XSRF-TOKEN avant le POST de connexion ; déjà connecté : on passe
    this.api.session().subscribe((ok) => ok && this.done());
  }

  protected submit(e: Event) {
    e.preventDefault();
    if (this.locked() || this.busy()) return;
    if (!this.password.value) return this.error.set('Saisissez le mot de passe.');
    this.busy.set(true);
    this.api.login(this.password.value).subscribe({
      // le jeton CSRF change avec la session : on relit /session pour récupérer le nouveau cookie
      next: () => this.api.session().subscribe(() => this.done()),
      error: (p: Problem) => this.fail(p),
    });
  }

  private done() {
    this.api.authed.set(true);
    const back = this.route.snapshot.queryParamMap.get('retour');
    void this.router.navigateByUrl(back?.startsWith('/admin/') && !back.startsWith('/admin/connexion') ? back : '/admin/projets');
  }

  private fail(p: Problem) {
    this.busy.set(false);
    this.password.setValue('');
    if (p.code === 'UNAUTHENTICATED') this.error.set('Mot de passe incorrect.');
    else if (p.code === 'LOGIN_LOCKED') {
      this.locked.set(true);
      setTimeout(() => this.locked.set(false), (p.retryAfter ?? 60) * 1000);
      this.error.set(`Trop d’essais. Réessayez dans ${lockMinutes(p.retryAfter)} min.`);
    } else this.error.set(bannerMessage(p));
  }
}
