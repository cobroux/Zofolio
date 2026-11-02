import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminApi, Problem } from '../admin.api';
import { bannerMessage } from '../admin.errors';
import { Icon } from '../admin-icon';

/** CV servi par « Télécharger le CV » : un PDF par langue ; sans envoi, le PDF embarqué dans le back. */
@Component({
  selector: 'app-cv-page',
  imports: [Icon, DatePipe],
  template: `
    <div class="bar"><h1>CV</h1></div>
    <p class="small">
      PDF uniquement · 5 Mo max. Le fichier remplace aussitôt celui que télécharge le site.
    </p>
    @for (l of langs; track l[0]) {
      <section class="upload">
        <h2>{{ l[1] }}</h2>
        <p>
          Actuel :
          @if (dates()?.[l[0]]; as d) {
            envoyé le {{ d | date: 'd/MM/yyyy à HH:mm' }}
          } @else {
            PDF embarqué dans le site
          }
          · <a [href]="'/api/' + l[0] + '/cv'" target="_blank" rel="noopener">Télécharger</a>
        </p>
        <input
          #file
          [id]="'cv-' + l[0]"
          type="file"
          accept=".pdf,application/pdf"
          (change)="send(l[0], file.files?.[0]); file.value = ''"
        />
        <label class="btn" [for]="'cv-' + l[0]" [attr.aria-disabled]="busy() === l[0]"
          >Choisir un PDF</label
        >
        <p class="msg" role="alert">
          @if (error()?.[0] === l[0]) {
            <app-icon name="error" />{{ error()![1] }}
          }
        </p>
      </section>
    }
    @if (status(); as s) {
      <p role="status">{{ s }}</p>
    }
  `,
})
export class CvPage {
  private readonly api = inject(AdminApi);
  protected readonly langs = [
    ['fr', 'Français'],
    ['en', 'English'],
  ] as const;
  protected readonly dates = signal<Record<string, string | null> | null>(null);
  protected readonly busy = signal<string | null>(null);
  protected readonly error = signal<[string, string] | null>(null);
  protected readonly status = signal<string | null>(null);

  constructor() {
    this.load();
  }

  private load() {
    this.api
      .cv()
      .subscribe({
        next: (d) => this.dates.set(d),
        error: (p: Problem) => this.error.set(['fr', bannerMessage(p) ?? '']),
      });
  }

  protected send(lang: string, file: File | undefined) {
    if (!file || this.busy()) return;
    this.busy.set(lang);
    this.error.set(null);
    this.status.set(null);
    this.api.uploadCv(lang, file).subscribe({
      next: () => {
        this.busy.set(null);
        this.status.set(`CV ${lang.toUpperCase()} remplacé : le site sert le nouveau PDF.`);
        this.load();
      },
      error: (p: Problem) => {
        this.busy.set(null);
        const why =
          p.code === 'MEDIA_REJECTED'
            ? p.reason === 'SIZE'
              ? 'Fichier trop lourd : 5 Mo maximum.'
              : 'Ce fichier n’est pas un PDF.'
            : bannerMessage(p);
        this.error.set([lang, why ?? '']);
      },
    });
  }
}
