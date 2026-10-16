import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { AdminApi, MediaAdmin, Problem } from '../admin.api';
import { bannerMessage, fileSize } from '../admin.errors';
import { Icon } from '../admin-icon';
import { MediaUpload } from './media-upload';

/** Médias (DESIGN §11.1) : upload, liste avec `usedBy`, suppression confirmée (409 expliqué). */
@Component({
  selector: 'app-media-page',
  imports: [MediaUpload, Icon],
  template: `
    <div class="bar"><h1>Médias</h1></div>
    @if (error(); as e) {
      <p class="banner" role="alert"><app-icon name="error" />{{ e }}</p>
    }
    <app-media-upload (uploaded)="load()" />
    <h2>Fichiers</h2>
    @if (list(); as items) {
      @if (items.length) {
        <table>
          <caption>Médias téléversés, récents d’abord</caption>
          <thead>
            <tr><th scope="col">Aperçu</th><th scope="col">Nom</th><th scope="col">Dimensions</th><th scope="col" class="n">Poids</th><th scope="col">Utilisé par</th><th scope="col"><span class="sr-only">Actions</span></th></tr>
          </thead>
          <tbody>
            @for (m of items; track m.id) {
              <tr>
                <td>
                  @if (m.kind === 'IMAGE') {
                    <img class="thumb" [src]="m.url" alt="" width="48" height="48" loading="lazy" />
                  } @else {
                    <span class="small">MP4</span>
                  }
                </td>
                <th scope="row"><a [href]="m.url" target="_blank" rel="noopener">{{ m.url.slice(9) }}</a></th>
                <td>{{ m.width ? m.width + ' × ' + m.height : '—' }}</td>
                <td class="n">{{ size(m.bytes) }}</td>
                <td>{{ m.usedBy.length ? m.usedBy.join(', ') : '—' }}</td>
                <td class="row-actions"><button type="button" class="btn" (click)="ask(m)">Supprimer<span class="sr-only"> {{ m.url.slice(9) }}</span></button></td>
              </tr>
            }
          </tbody>
        </table>
      } @else {
        <p>Aucun média.</p>
      }
    } @else {
      <p role="status">Chargement…</p>
    }
    <dialog #dlg class="confirm" aria-labelledby="del-title" (close)="target.set(null)">
      @if (target(); as m) {
        <h2 id="del-title">Supprimer ce média ?</h2>
        <p>{{ m.url.slice(9) }}</p>
        @if (m.usedBy.length) {
          <p class="msg" role="alert"><app-icon name="error" />Utilisé par : {{ m.usedBy.join(', ') }}. Retirez-le d’abord.</p>
        }
        @if (delError(); as e) {
          <p class="msg" role="alert"><app-icon name="error" />{{ e }}</p>
        }
        <div class="row-actions">
          <button type="button" class="btn" autofocus (click)="dlg.close()">Annuler</button>
          <button type="button" class="btn" [attr.aria-disabled]="m.usedBy.length > 0" (click)="remove(m)">Supprimer</button>
        </div>
      }
    </dialog>
  `,
})
export class MediaPage {
  private readonly api = inject(AdminApi);
  private readonly dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');
  protected readonly list = signal<MediaAdmin[] | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly delError = signal<string | null>(null);
  protected readonly target = signal<MediaAdmin | null>(null);
  protected readonly size = fileSize;

  constructor() {
    this.load();
  }

  protected load() {
    this.api.media().subscribe({ next: (m) => this.list.set(m), error: (p: Problem) => this.error.set(bannerMessage(p)) });
  }

  protected ask(m: MediaAdmin) {
    this.delError.set(null);
    this.target.set(m);
    this.dlg().nativeElement.showModal();
  }

  protected remove(m: MediaAdmin) {
    if (m.usedBy.length) return;
    this.api.deleteMedia(m.id).subscribe({
      next: () => {
        this.dlg().nativeElement.close();
        this.load();
      },
      error: (p: Problem) => this.delError.set(p.code === 'CONFLICT' ? 'Ce média est encore utilisé par un projet. Retirez-le d’abord.' : bannerMessage(p)),
    });
  }
}
