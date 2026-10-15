import { computed, inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type ThemeMode = 'system' | 'light' | 'dark';

const KEY = 'theme';
const NEXT: Record<ThemeMode, ThemeMode> = { system: 'light', light: 'dark', dark: 'system' };

type ViewTransitionDoc = Document & { startViewTransition?: (update: () => void) => unknown };

/** L'attribut `data-theme` initial est posé par le script inline d'index.html (avant le rendu). */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT) as ViewTransitionDoc;
  private readonly win = this.doc.defaultView;
  private readonly systemDark = signal(false);

  readonly mode = signal<ThemeMode>('system');
  readonly dark = computed(() => this.mode() === 'dark' || (this.mode() === 'system' && this.systemDark()));

  constructor() {
    const stored = this.read();
    if (stored) this.mode.set(stored);
    const query = this.win?.matchMedia?.('(prefers-color-scheme: dark)');
    if (query) {
      this.systemDark.set(query.matches);
      query.addEventListener('change', (e) => this.systemDark.set(e.matches));
    }
  }

  cycle() {
    const next = NEXT[this.mode()];
    const apply = () => {
      this.mode.set(next);
      const root = this.doc.documentElement;
      if (next === 'system') root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', next);
    };
    const reduce = this.win?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (this.doc.startViewTransition && !reduce) this.doc.startViewTransition(apply);
    else apply();
    this.write(next);
  }

  private read(): ThemeMode | null {
    try {
      const v = this.win?.localStorage.getItem(KEY);
      return v === 'light' || v === 'dark' ? v : null;
    } catch {
      return null;
    }
  }

  private write(mode: ThemeMode) {
    try {
      if (mode === 'system') this.win?.localStorage.removeItem(KEY);
      else this.win?.localStorage.setItem(KEY, mode);
    } catch {
      /* stockage indisponible : le thème vaut pour la session */
    }
  }
}
