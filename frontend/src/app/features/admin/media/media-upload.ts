import { Component, inject, output, signal } from '@angular/core';
import { Icon } from '../admin-icon';
import { AdminApi, MediaAdmin, Problem } from '../admin.api';
import { bannerMessage, fileSize } from '../admin.errors';

/** Zone d'upload (DESIGN §11.1) : bouton clavier d'abord, dépôt en plus, contraintes écrites avant l'envoi, refus du back en clair. */
@Component({
  selector: 'app-media-upload',
  imports: [Icon],
  template: `
    <div class="upload" [class.drag]="drag()" [class.invalid]="error()" (dragover)="over($event, true)" (dragleave)="over($event, false)" (drop)="drop($event)">
      <p id="up-rules" class="small">JPEG, PNG · 5 Mo max · MP4 · 2,5 Mo max · métadonnées retirées</p>
      <input #file id="up-file" type="file" accept=".jpg,.jpeg,.png,.mp4,image/jpeg,image/png,video/mp4" aria-describedby="up-rules up-err" (change)="send(file.files?.[0]); file.value = ''" />
      <div>
        <label class="btn" for="up-file" [attr.aria-disabled]="busy()">Choisir un fichier</label>
        <span class="small"> ou déposez-le ici</span>
      </div>
      @if (busy()) {
        <div class="prog" role="progressbar" aria-label="Envoi du fichier" aria-valuetext="Envoi en cours"><i></i></div>
      }
      <p id="up-err" class="msg" role="alert">
        @if (error(); as e) {
          <app-icon name="error" />{{ e }}
        }
      </p>
      @if (done(); as m) {
        <p role="status">{{ m.url.slice(9) }} · {{ m.width ? m.width + ' × ' + m.height + ' px · ' : '' }}{{ size(m.bytes) }} · Utilisé par : {{ m.usedBy.length ? m.usedBy.join(', ') : '—' }}</p>
      }
    </div>
  `,
})
export class MediaUpload {
  private readonly api = inject(AdminApi);
  readonly uploaded = output<MediaAdmin>();
  protected readonly busy = signal(false);
  protected readonly drag = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly done = signal<MediaAdmin | null>(null);
  protected readonly size = fileSize;

  protected over(e: DragEvent, on: boolean) {
    e.preventDefault();
    this.drag.set(on);
  }

  protected drop(e: DragEvent) {
    e.preventDefault();
    this.drag.set(false);
    this.send(e.dataTransfer?.files[0]);
  }

  protected send(file: File | undefined) {
    if (!file || this.busy()) return;
    this.busy.set(true);
    this.error.set(null);
    this.done.set(null);
    this.api.upload(file).subscribe({
      next: (m) => {
        this.busy.set(false);
        this.done.set({ ...m, usedBy: m.usedBy ?? [] });
        this.uploaded.emit(m);
      },
      error: (p: Problem) => {
        this.busy.set(false);
        this.error.set(bannerMessage(p));
      },
    });
  }
}
