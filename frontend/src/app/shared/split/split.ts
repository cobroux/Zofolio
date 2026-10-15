import { Component, LOCALE_ID, computed, inject, input } from '@angular/core';

/** Parties d'un split : durée · stack · commits · note, nombres au format de la locale. */
export function splitParts(
  locale: string,
  s: { duration?: string | null; stack?: string[] | null; commits?: number | null },
): string[] {
  const n = new Intl.NumberFormat(locale).format;
  return [
    s.duration,
    s.stack?.join(', '),
    s.commits != null ? $localize`${n(s.commits)} commits` : null,
  ].filter((p): p is string => !!p);
}

/** Ligne de données tabulaire (DESIGN §6) ; la note ironique passe en dessous, en petit. */
@Component({
  selector: 'app-split',
  template: `
    <p class="tnum">{{ parts().join(' · ') }}</p>
    @if (note()) {
      <p class="note">{{ note() }}</p>
    }
  `,
  styles: `
    :host {
      display: block;
      color: var(--split-ink, var(--ink-2));
      font-size: var(--t-small);
      font-variant-numeric: tabular-nums lining-nums;
    }
    p {
      max-width: none;
    }
    .note {
      margin-block-start: var(--s-1);
    }
  `,
})
export class Split {
  readonly duration = input<string | null>();
  readonly stack = input<string[] | null>();
  readonly commits = input<number | null>();
  readonly note = input<string | null>();
  private readonly locale = inject(LOCALE_ID);
  protected readonly parts = computed(() => splitParts(this.locale, { duration: this.duration(), stack: this.stack(), commits: this.commits() }));
}
