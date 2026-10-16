import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../admin-icon';
import { AdminApi, Problem, ProjectAdmin } from '../admin.api';
import { TIER_LABELS, bannerMessage } from '../admin.errors';

/** Liste des projets (DESIGN §11.1) : vrai `<table>`, pile de cartes sous 768 px. Un projet masqué porte l'icône œil barré ET le mot. */
@Component({
  selector: 'app-project-list',
  imports: [RouterLink, Icon],
  template: `
    <div class="bar">
      <h1>Projets</h1>
      <a class="btn primary" routerLink="/admin/projets/nouveau">Nouveau projet</a>
    </div>
    @if (error(); as e) {
      <p class="banner" role="alert"><app-icon name="error" />{{ e }}</p>
    }
    @if (list(); as items) {
      <table class="tbl">
        <caption>Projets, dans l’ordre d’affichage du site</caption>
        <thead>
          <tr><th scope="col">Titre</th><th scope="col">Slug</th><th scope="col">Niveau</th><th scope="col">Étape</th><th scope="col" class="n">Ordre</th></tr>
        </thead>
        <tbody>
          @for (p of items; track p.slug) {
            <tr>
              <th scope="row"><a [routerLink]="['/admin/projets', p.slug]">{{ p.title['fr'] }}</a></th>
              <td>{{ p.slug }}</td>
              <td><span class="lvl"><app-icon [name]="p.tier === 'HIDDEN' ? 'hidden' : 'published'" />{{ tiers[p.tier ?? ''] }}</span></td>
              <td>{{ p.stage ?? '—' }}</td>
              <td class="n">{{ p.sortOrder }}</td>
            </tr>
          }
        </tbody>
      </table>
      <ul class="cards" aria-label="Projets">
        @for (p of items; track p.slug) {
          <li>
            <a [routerLink]="['/admin/projets', p.slug]">{{ p.title['fr'] }}</a>
            <dl>
              <dt>Slug</dt><dd>{{ p.slug }}</dd>
              <dt>Niveau</dt><dd><span class="lvl"><app-icon [name]="p.tier === 'HIDDEN' ? 'hidden' : 'published'" />{{ tiers[p.tier ?? ''] }}</span></dd>
              <dt>Étape</dt><dd>{{ p.stage ?? '—' }}</dd>
            </dl>
          </li>
        }
      </ul>
    } @else if (!error()) {
      <p role="status">Chargement…</p>
    }
  `,
})
export class ProjectListPage {
  protected readonly tiers = TIER_LABELS;
  protected readonly list = signal<ProjectAdmin[] | null>(null);
  protected readonly error = signal<string | null>(null);

  constructor() {
    inject(AdminApi).projects().subscribe({ next: (l) => this.list.set(l), error: (p: Problem) => this.error.set(bannerMessage(p)) });
  }
}
