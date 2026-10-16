import { Component, ElementRef, Injector, afterNextRender, computed, inject, input, viewChild } from '@angular/core';
import { Icon } from './admin-icon';
import { fieldError, fieldId } from './admin.errors';

/** Récapitulatif en tête de formulaire (DESIGN §11.1) : `role="alert"`, un lien par champ en erreur, focus placé dessus après un échec. */
@Component({
  selector: 'app-error-summary',
  imports: [Icon],
  template: `
    @if (items().length || banner()) {
      <div #box class="err-sum" role="alert" tabindex="-1">
        <p><app-icon name="error" />{{ banner() ?? 'Le formulaire contient des erreurs :' }}</p>
        @if (items().length) {
          <ul>
            @for (i of items(); track i.id) {
              <li><a [href]="'#' + i.id" (click)="go($event, i.id)">{{ i.text }}</a></li>
            }
          </ul>
        }
      </div>
    }
  `,
})
export class ErrorSummary {
  /** Champ pointé -> code d'erreur. */
  readonly errors = input<Record<string, string>>({});
  readonly banner = input<string | null>(null);
  private readonly box = viewChild<ElementRef<HTMLElement>>('box');
  private readonly injector = inject(Injector);
  protected readonly items = computed(() => Object.entries(this.errors()).map(([f, c]) => ({ id: fieldId(f), text: fieldError(f, c) })));

  focus() {
    afterNextRender(() => this.box()?.nativeElement.focus(), { injector: this.injector });
  }

  protected go(e: Event, id: string) {
    e.preventDefault();
    const el = document.getElementById(id);
    (el?.matches('input,select,textarea,button') ? el : el?.querySelector<HTMLElement>('input,select,textarea'))?.focus();
  }
}
