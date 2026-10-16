import { Component, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RaceAdmin, AdminApi, Problem } from '../admin.api';
import { bannerMessage, errorMap, fieldMessage } from '../admin.errors';
import { ErrorSummary } from '../error-summary';

const KINDS: Record<string, string> = { RACE: 'Course', INDEX: 'Indice (UTMB)', CLUB: 'Club' };
const num = (s: string): number | null => (s.trim() === '' ? null : Number(s.replace(',', '.')));

/** Courses (plan-v3 §3.4) : liste et formulaire. Aucun champ de classement ni de tracé (SPEC §3). */
@Component({
  selector: 'app-race-admin',
  imports: [ReactiveFormsModule, ErrorSummary],
  template: `
    <div class="bar">
      <h1>Courses</h1>
      <button type="button" class="btn primary" (click)="edit(null)">Nouvelle course</button>
    </div>
    <app-error-summary [errors]="errors()" [banner]="banner()" />
    @if (status(); as s) {
      <p role="status">{{ s }}</p>
    }
    @if (editing()) {
      <form [formGroup]="form" (ngSubmit)="save()" novalidate>
        <fieldset>
          <legend>{{ form.controls.id.value ? 'Modifier la course' : 'Nouvelle course' }}</legend>
          @for (f of fields; track f.key) {
            <div class="field" [class.invalid]="errors()[f.key]">
              <label [for]="'f-' + f.key">{{ f.label }}</label>
              @if (f.key === 'kind') {
                <select id="f-kind" formControlName="kind" [attr.aria-invalid]="errors()['kind'] ? 'true' : null" aria-describedby="m-kind">
                  @for (k of kinds; track k[0]) {
                    <option [value]="k[0]">{{ k[1] }}</option>
                  }
                </select>
              } @else {
                <input [id]="'f-' + f.key" [type]="f.type ?? 'text'" [formControlName]="f.key" [attr.aria-invalid]="errors()[f.key] ? 'true' : null" [attr.aria-describedby]="'m-' + f.key" />
              }
              <span class="help" [id]="'m-' + f.key"><span class="msg">{{ msg(f.key) }}</span>{{ f.help }}</span>
            </div>
          }
          <div class="cols">
            @for (l of langs; track l) {
              <div class="col" [attr.lang]="l[0]">
                <h3>{{ l[1] }}</h3>
                @for (k of ['name', 'note']; track k) {
                  <div class="field" [class.invalid]="errors()[k + '.' + l[0]]">
                    <label [for]="'f-' + k + '-' + l[0]">{{ k === 'name' ? 'Nom' : 'Note' }}</label>
                    <input [id]="'f-' + k + '-' + l[0]" [formControl]="tr(k, l[0])" [attr.aria-invalid]="errors()[k + '.' + l[0]] ? 'true' : null" [attr.aria-describedby]="'m-' + k + '-' + l[0]" />
                    <span class="help" [id]="'m-' + k + '-' + l[0]"><span class="msg">{{ msg(k + '.' + l[0]) }}</span></span>
                  </div>
                }
              </div>
            }
          </div>
          <div class="check">
            <input id="f-personalRecord" type="checkbox" formControlName="personalRecord" />
            <label for="f-personalRecord">Record personnel</label>
          </div>
          <div class="row-actions" style="justify-content:flex-start;margin-block-start:var(--s-4)">
            <button type="submit" class="btn primary" [attr.aria-disabled]="busy()">Enregistrer</button>
            <button type="button" class="btn" (click)="editing.set(false)">Annuler</button>
          </div>
        </fieldset>
      </form>
    }
    @if (list(); as items) {
      <table class="tbl">
        <caption>Courses et lignes du Journal, dans l’ordre d’affichage</caption>
        <thead>
          <tr><th scope="col">Nom</th><th scope="col">Type</th><th scope="col">Date</th><th scope="col" class="n">Distance (km)</th><th scope="col" class="n">D+ (m)</th><th scope="col" class="n">Ordre</th><th scope="col"><span class="sr-only">Actions</span></th></tr>
        </thead>
        <tbody>
          @for (r of items; track r.id) {
            <tr>
              <th scope="row">{{ r.name['fr'] }}</th>
              <td>{{ kinds_[r.kind] }}</td>
              <td>{{ r.date ?? '—' }}</td>
              <td class="n">{{ r.distanceKm ?? '—' }}</td>
              <td class="n">{{ r.elevationGainM ?? '—' }}</td>
              <td class="n">{{ r.sortOrder }}</td>
              <td class="row-actions">
                <button type="button" class="btn" (click)="edit(r)">Modifier<span class="sr-only"> {{ r.name['fr'] }}</span></button>
                @if (confirming() === r.id) {
                  <button type="button" class="btn" (click)="remove(r)">Confirmer<span class="sr-only"> la suppression de {{ r.name['fr'] }}</span></button>
                  <button type="button" class="btn plain" (click)="confirming.set(null)">Annuler</button>
                } @else {
                  <button type="button" class="btn" (click)="confirming.set(r.id)">Supprimer<span class="sr-only"> {{ r.name['fr'] }}</span></button>
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
export class RaceAdminPage {
  private readonly api = inject(AdminApi);
  private readonly summary = viewChild.required(ErrorSummary);
  protected readonly kinds = Object.entries(KINDS);
  protected readonly kinds_ = KINDS;
  protected readonly langs = [['fr', 'Français'], ['en', 'English']] as const;
  protected readonly fields: { key: string; label: string; type?: string; help: string }[] = [
    { key: 'kind', label: 'Type', help: '' },
    { key: 'date', label: 'Date', type: 'date', help: '' },
    { key: 'distanceKm', label: 'Distance (km)', help: '0 à 1000' },
    { key: 'elevationGainM', label: 'D+ (m)', help: '0 à 20 000' },
    { key: 'durationS', label: 'Durée (secondes)', help: 'ex. 13 h 35 min 53 s = 48953' },
    { key: 'sortOrder', label: 'Ordre', help: 'vide : en dernier' },
  ];
  protected readonly form = new FormGroup({
    id: new FormControl<number | null>(null),
    kind: new FormControl('RACE', { nonNullable: true }),
    date: new FormControl('', { nonNullable: true }),
    distanceKm: new FormControl('', { nonNullable: true }),
    elevationGainM: new FormControl('', { nonNullable: true }),
    durationS: new FormControl('', { nonNullable: true }),
    sortOrder: new FormControl('', { nonNullable: true }),
    personalRecord: new FormControl(false, { nonNullable: true }),
    name: new FormGroup({ fr: new FormControl('', { nonNullable: true }), en: new FormControl('', { nonNullable: true }) }),
    note: new FormGroup({ fr: new FormControl('', { nonNullable: true }), en: new FormControl('', { nonNullable: true }) }),
  });
  protected readonly list = signal<RaceAdmin[] | null>(null);
  protected readonly editing = signal(false);
  protected readonly confirming = signal<number | null>(null);
  protected readonly errors = signal<Record<string, string>>({});
  protected readonly banner = signal<string | null>(null);
  protected readonly status = signal<string | null>(null);
  protected readonly busy = signal(false);

  constructor() {
    this.load();
  }

  protected tr(group: string, lang: string) {
    return this.form.get([group, lang]) as FormControl<string>;
  }
  protected msg = (f: string) => (this.errors()[f] ? fieldMessage(f, this.errors()[f]) : '');

  private load() {
    this.api.races().subscribe({ next: (l) => this.list.set(l), error: (p: Problem) => this.banner.set(bannerMessage(p)) });
  }

  protected edit(r: RaceAdmin | null) {
    this.errors.set({});
    this.banner.set(null);
    this.status.set(null);
    this.form.reset({
      id: r?.id ?? null, kind: r?.kind ?? 'RACE', date: r?.date ?? '', distanceKm: String(r?.distanceKm ?? ''),
      elevationGainM: String(r?.elevationGainM ?? ''), durationS: String(r?.durationS ?? ''), sortOrder: r ? String(r.sortOrder ?? '') : '',
      personalRecord: r?.personalRecord ?? false, name: { fr: r?.name['fr'] ?? '', en: r?.name['en'] ?? '' }, note: { fr: r?.note?.['fr'] ?? '', en: r?.note?.['en'] ?? '' },
    });
    this.editing.set(true);
  }

  protected save() {
    const v = this.form.getRawValue();
    const text = (t: { fr: string; en: string }) => Object.fromEntries(Object.entries(t).filter(([, s]) => s.trim() !== ''));
    const body: RaceAdmin = {
      id: v.id, kind: v.kind, date: v.date || null, name: text(v.name), note: Object.keys(text(v.note)).length ? text(v.note) : null,
      distanceKm: num(v.distanceKm), elevationGainM: num(v.elevationGainM), durationS: num(v.durationS), personalRecord: v.personalRecord, sortOrder: num(v.sortOrder),
    };
    const local: Record<string, string> = {};
    if (!body.name['fr']) local['name.fr'] = 'NotBlank';
    for (const [k, max] of [['distanceKm', 1000], ['elevationGainM', 20000], ['durationS', 604800]] as const) {
      const n = body[k];
      if (n !== null && (Number.isNaN(n) || n < 0 || n > max)) local[k] = 'Range';
    }
    if (Object.keys(local).length) return this.fail(local, null);
    this.busy.set(true);
    this.api.saveRace(body).subscribe({
      next: () => {
        this.busy.set(false);
        this.editing.set(false);
        this.errors.set({});
        this.banner.set(null);
        this.status.set('Course enregistrée : le Journal est à jour.');
        this.load();
      },
      error: (p: Problem) => {
        this.busy.set(false);
        this.fail(errorMap(p.errors), bannerMessage(p));
      },
    });
  }

  protected remove(r: RaceAdmin) {
    this.confirming.set(null);
    this.api.deleteRace(r.id!).subscribe({
      next: () => {
        this.status.set(`« ${r.name['fr']} » supprimée.`);
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
