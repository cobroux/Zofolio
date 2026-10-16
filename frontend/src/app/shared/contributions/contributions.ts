import { Component, ElementRef, LOCALE_ID, afterNextRender, computed, inject, input, viewChild } from '@angular/core';
import { Contributions } from '../../core/api/api.models';

export interface Bar {
  x: number;
  y: number;
  h: number;
  /** 0 = repos, 1 à 4 = charge croissante. */
  tone: number;
  total: number;
}

const BASE = 120;
const MAX_H = 90;
const MIN_H = 6;
const REST_H = 3;
const STEP = 14;

/** Totaux hebdomadaires (7 jours par semaine, la dernière peut être partielle). */
export function weeklyTotals(counts: number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < counts.length; i += 7) out.push(counts.slice(i, i + 7).reduce((a, b) => a + b, 0));
  return out;
}

/** Hauteur linéaire (plancher 6 px), ton par quartiles des semaines actives ; semaine à zéro = trait de repos. */
export function weeklyBars(totals: number[]): Bar[] {
  const active = totals.filter((t) => t > 0).sort((a, b) => a - b);
  const max = active.at(-1) ?? 0;
  const q = (p: number) => active[Math.ceil(p * active.length) - 1];
  const [q1, q2, q3] = [q(0.25), q(0.5), q(0.75)];
  return totals.map((total, i) => {
    const h = total === 0 ? REST_H : Math.max(MIN_H, (total / max) * MAX_H);
    const tone = total === 0 ? 0 : total <= q1 ? 1 : total <= q2 ? 2 : total <= q3 ? 3 : 4;
    return { x: i * STEP, y: BASE - h, h, tone, total };
  });
}

/** Carnet d'entraînement (DESIGN §10.4) : une barre par semaine, la hauteur porte la valeur, le ton la répète. Rendu SSR, sans animation. */
@Component({
  selector: 'app-contributions',
  template: `
    @if (view(); as v) {
      <div class="carnet">
        <p class="sum tnum" [id]="id">{{ v.summary }}</p>
        <div class="scroll" #scroll tabindex="0" role="region" [attr.aria-labelledby]="id">
          <svg viewBox="0 0 742 170" role="img" [attr.aria-labelledby]="id + '-t'">
            <title [id]="id + '-t'" i18n>Contributions GitHub par semaine sur 12 mois</title>
            @for (b of v.bars; track $index) {
              <rect [attr.class]="'g' + b.tone" [attr.x]="b.x" [attr.y]="b.y" width="10" [attr.height]="b.h" />
            }
            <line class="base" x1="0" x2="742" y1="121" y2="121" />
            <text class="peak" [attr.x]="v.peak.x + 5" [attr.y]="v.peak.y - 6" text-anchor="middle">{{ v.peak.total }}</text>
            @for (m of v.months; track m.x) {
              <text [attr.x]="m.x" y="142">{{ m.label }}</text>
            }
          </svg>
        </div>
        <p class="legend" aria-hidden="true">
          <span i18n>Repos</span>
          @for (t of tones; track t) {
            <svg viewBox="0 0 16 16"><rect width="16" height="16" [attr.class]="'g' + t" /></svg>
          }
          <span i18n>Charge</span>
          <span i18n>La hauteur donne la valeur ; le ton la répète.</span>
        </p>
      </div>
    }
  `,
  styles: `
    :host { display: block; }
    .sum { margin: 0; font-size: var(--t-small); color: var(--ink); }
    .scroll { overflow-x: auto; padding-block: var(--s-2); }
    .scroll svg { display: block; min-width: 740px; width: 100%; height: auto; }
    .g0 { fill: var(--line-muted); }
    .g1 { fill: color-mix(in srgb, var(--accent) 35%, var(--surface)); }
    .g2 { fill: color-mix(in srgb, var(--accent) 55%, var(--surface)); }
    .g3 { fill: color-mix(in srgb, var(--accent) 78%, var(--surface)); }
    .g4 { fill: var(--accent); }
    .base { stroke: var(--ink); stroke-width: 2; }
    text { fill: var(--ink-2); font: 400 15px var(--font-text); font-variant-numeric: tabular-nums; }
    .peak { fill: var(--ink); font-weight: 600; }
    .legend { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s-2) var(--s-3); margin: var(--s-3) 0 0; font-size: var(--t-small); color: var(--ink-2); max-width: none; }
    .legend svg { width: 16px; height: 16px; flex: none; }
  `,
})
export class ContributionsGraph {
  /** `null` ou vide : rien n'est rendu. */
  readonly data = input<Contributions | null>(null);
  protected readonly id = 'carnet-sum';
  protected readonly tones = [1, 2, 3, 4];
  private readonly locale = inject(LOCALE_ID);
  private readonly scroll = viewChild<ElementRef<HTMLElement>>('scroll');

  protected readonly view = computed(() => {
    const d = this.data();
    if (!d?.counts.length) return null;
    const totals = weeklyTotals(d.counts);
    const bars = weeklyBars(totals);
    const best = Math.max(...totals);
    const active = totals.filter((t) => t > 0).length;
    const n = new Intl.NumberFormat(this.locale).format;
    const month = new Intl.DateTimeFormat(this.locale, { month: 'short', timeZone: 'UTC' });
    const start = Date.parse(d.start);
    // Un mois est nommé au-dessus de sa première semaine.
    const months = bars
      .map((b, i) => ({ x: b.x, date: new Date(start + i * 7 * 864e5) }))
      .filter((w) => w.date.getUTCDate() <= 7)
      .map((w) => ({ x: w.x, label: month.format(w.date) }));
    return {
      bars,
      months,
      peak: bars[totals.indexOf(best)],
      summary: $localize`${n(d.total)} contributions sur 12 mois · ${active} semaines actives sur ${totals.length} · meilleure semaine : ${n(best)}`,
    };
  });

  constructor() {
    // Petit écran : le défilement horizontal démarre sur les semaines récentes.
    afterNextRender(() => {
      const el = this.scroll()?.nativeElement;
      if (el) el.scrollLeft = el.scrollWidth;
    });
  }
}
