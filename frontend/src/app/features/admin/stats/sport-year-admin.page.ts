import { Component, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SportYear } from '../../../core/api/api.models';
import { AdminApi, Problem } from '../admin.api';
import { bannerMessage, errorMap, fieldMessage } from '../admin.errors';
import { ErrorSummary } from '../error-summary';

const FIELDS = [
  { key: 'year', label: 'Année', help: '2000 à l’année en cours' },
  { key: 'distanceKm', label: 'Kilomètres', help: 'vide : non renseigné' },
  { key: 'elevationGainM', label: 'D+ (m)', help: 'vide : non renseigné' },
  { key: 'hours', label: 'Heures', help: 'vide : non renseigné' },
  { key: 'activities', label: 'Activités', help: 'vide : non renseigné' },
] as const;
type Key = (typeof FIELDS)[number]['key'];
const num = (s: string): number | null => (s.trim() === '' ? null : Number(s.replace(',', '.')));

/** Totaux annuels (D48) : une ligne par année, saisie à la main. Ni tracé, ni fréquence cardiaque, ni donnée de santé. */
@Component({
  selector: 'app-sport-year-admin',
  imports: [ReactiveFormsModule, ErrorSummary],
  template: `
    <div class="bar"><h1>Stats</h1></div>
    <p class="small">Totaux annuels seulement : ils alimentent le bloc « Les années en chiffres » du Journal. Enregistrer une année existante la remplace.</p>
    <app-error-summary [errors]="errors()" [banner]="banner()" />
    @if (status(); as s) {
      <p role="status">{{ s }}</p>
    }
    <form [formGroup]="form" (ngSubmit)="save()" novalidate>
      <fieldset>
        <legend>Saisir une année</legend>
        <div class="pair" style="grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr))">
          @for (f of fields; track f.key) {
            <div class="field" [class.invalid]="errors()[f.key]">
              <label [for]="'f-' + f.key">{{ f.label }}</label>
              <input [id]="'f-' + f.key" inputmode="decimal" [formControlName]="f.key" [attr.aria-invalid]="errors()[f.key] ? 'true' : null" [attr.aria-describedby]="'m-' + f.key" />
              <span class="help" [id]="'m-' + f.key"><span class="msg">{{ msg(f.key) }}</span>{{ f.help }}</span>
            </div>
          }
        </div>
        <button type="submit" class="btn primary" [attr.aria-disabled]="busy()">Enregistrer</button>
      </fieldset>
    </form>
    @if (list(); as items) {
      <table class="tbl">
        <caption>Années saisies, la plus récente d’abord</caption>
        <thead>
          <tr><th scope="col">Année</th><th scope="col" class="n">km</th><th scope="col" class="n">m D+</th><th scope="col" class="n">h</th><th scope="col" class="n">Activités</th><th scope="col"><span class="sr-only">Actions</span></th></tr>
        </thead>
        <tbody>
          @for (y of items; track y.year) {
            <tr>
              <th scope="row">{{ y.year }}</th>
              <td class="n">{{ y.distanceKm ?? '—' }}</td>
              <td class="n">{{ y.elevationGainM ?? '—' }}</td>
              <td class="n">{{ y.hours ?? '—' }}</td>
              <td class="n">{{ y.activities ?? '—' }}</td>
              <td class="row-actions">
                <button type="button" class="btn" (click)="edit(y)">Modifier<span class="sr-only"> {{ y.year }}</span></button>
                @if (confirming() === y.year) {
                  <button type="button" class="btn" (click)="remove(y)">Confirmer<span class="sr-only"> la suppression de {{ y.year }}</span></button>
                  <button type="button" class="btn plain" (click)="confirming.set(null)">Annuler</button>
                } @else {
                  <button type="button" class="btn" (click)="confirming.set(y.year)">Supprimer<span class="sr-only"> {{ y.year }}</span></button>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    } @else {
      <p role="status">Chargement…</p>
    }
  `,
})
export class SportYearAdminPage {
  private readonly api = inject(AdminApi);
  private readonly summary = viewChild.required(ErrorSummary);
  protected readonly fields = FIELDS;
  protected readonly form = new FormGroup(Object.fromEntries(FIELDS.map((f) => [f.key, new FormControl('', { nonNullable: true })])) as Record<Key, FormControl<string>>);
  protected readonly list = signal<SportYear[] | null>(null);
  protected readonly confirming = signal<number | null>(null);
  protected readonly errors = signal<Record<string, string>>({});
  protected readonly banner = signal<string | null>(null);
  protected readonly status = signal<string | null>(null);
  protected readonly busy = signal(false);

  constructor() {
    this.load();
  }

  protected msg = (f: string) => (this.errors()[f] ? fieldMessage(f, this.errors()[f]) : '');

  private load() {
    this.api.sportYears().subscribe({ next: (l) => this.list.set(l), error: (p: Problem) => this.banner.set(bannerMessage(p)) });
  }

  protected edit(y: SportYear) {
    this.form.setValue({ year: String(y.year), distanceKm: String(y.distanceKm ?? ''), elevationGainM: String(y.elevationGainM ?? ''), hours: String(y.hours ?? ''), activities: String(y.activities ?? '') });
    document.getElementById('f-year')?.focus();
  }

  protected save() {
    const v = this.form.getRawValue();
    const body: SportYear = { year: Number(v.year), distanceKm: num(v.distanceKm), elevationGainM: num(v.elevationGainM), hours: num(v.hours), activities: num(v.activities) };
    const local: Record<string, string> = {};
    if (!Number.isInteger(body.year) || body.year < 2000 || body.year > new Date().getFullYear()) local['year'] = 'Range';
    for (const k of ['distanceKm', 'elevationGainM', 'hours', 'activities'] as const) {
      const n = body[k];
      if (n !== null && (Number.isNaN(n) || n < 0)) local[k] = 'Range';
    }
    if (Object.keys(local).length) return this.fail(local, null);
    this.busy.set(true);
    this.api.saveSportYear(body).subscribe({
      next: () => {
        this.busy.set(false);
        this.errors.set({});
        this.banner.set(null);
        this.status.set(`${body.year} enregistrée : le Journal est à jour.`);
        this.form.reset();
        this.load();
      },
      error: (p: Problem) => {
        this.busy.set(false);
        this.fail(errorMap(p.errors), bannerMessage(p));
      },
    });
  }

  protected remove(y: SportYear) {
    this.confirming.set(null);
    this.api.deleteSportYear(y.year).subscribe({
      next: () => {
        this.status.set(`${y.year} supprimée.`);
        this.load();
      },
      error: (p: Problem) => this.fail({}, bannerMessage(p)),
    });
  }

  private fail(errors: Record<string, string>, banner: string | null) {
    this.errors.set(errors);
    this.banner.set(banner);
    this.summary().focus();
  }
}
