import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { CHECKPOINTS, SPLITS } from '../profile.data';
import {
  CHECKPOINT_IDS,
  CheckpointId,
  CourseProgress,
  TOTAL_KM,
  altitudeAt,
  altitudeRatioAt,
  formatKm,
  gainAt,
  kmAtScroll,
  lastCheckpoint,
  profilePath,
} from '../course-progress';
import { RoadBook } from '../road-book/road-book';

const LABELS = {
  depart: { short: $localize`0`, full: $localize`Départ`, name: $localize`Départ` },
  p1: { short: $localize`P1`, full: $localize`Fondations`, name: $localize`P1 · Fondations` },
  p2: { short: $localize`P2`, full: $localize`Worldline`, name: $localize`P2 · Worldline` },
  p3: { short: $localize`P3`, full: $localize`Projets perso`, name: $localize`P3 · Projets perso` },
  arrivee: { short: $localize`Arr.`, full: $localize`Arrivée`, name: $localize`Arrivée` },
};
/** Heure du départ officiel (GTA 2025, spec §3) : seul « passage » avant P1. */
const START_CLOCK = '06:30:00';
const LONGEST = Math.max(...Object.values(SPLITS).map((s) => s.legS));
const SPLIT_MS = 2400;

const clockAt = (id: CheckpointId) => (id === 'depart' ? START_CLOCK : SPLITS[id].clock);
/** Nom court affiché devant un temps de passage : « P2 », « Départ », « Arrivée ». */
const passName = (id: CheckpointId) => (id === 'depart' || id === 'arrivee' ? LABELS[id].full : LABELS[id].short);
/** Durée de tronçon « 4 h 08 ». */
const legText = (s: number) => `${Math.floor(s / 3600)} h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}`;
const group = (n: number) => Math.round(n).toLocaleString($localize`:@@numberLocale:fr-FR`);

/** Vrai la première fois de la session (et le note). Stockage bloqué : on montre quand même. */
function firstInSession(id: CheckpointId): boolean {
  const key = `zofolio:split:${id}`;
  try {
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, '1');
  } catch {
    /* navigation privée stricte : pas de mémoire, la ligne revient au rechargement */
  }
  return true;
}

/**
 * Bandeau de suivi (signature, spec §3) : km, altitude, D+ et dernier temps de passage à la position de lecture,
 * calculés depuis le vrai profil. Sans JS, c'est une nav de liens d'ancre.
 */
@Component({
  selector: 'app-tracking-band',
  imports: [RoadBook],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tracking-band.html',
  styleUrl: './tracking-band.css',
})
export class TrackingBand {
  protected readonly progress = inject(CourseProgress);
  protected readonly d = profilePath(false);
  protected readonly formatKm = formatKm;
  protected readonly items = CHECKPOINT_IDS.map((id) => ({
    id,
    km: CHECKPOINTS[id],
    x: (CHECKPOINTS[id] / TOTAL_KM) * 100,
    a: altitudeRatioAt(CHECKPOINTS[id]),
    clock: clockAt(id),
    ...LABELS[id],
  }));

  private readonly at = computed(() => lastCheckpoint(this.progress.scrollKm()));
  protected readonly km = computed(() => formatKm(this.progress.scrollKm(), 1));
  protected readonly alt = computed(() => group(altitudeAt(this.progress.scrollKm())));
  protected readonly gain = computed(() => group(gainAt(this.progress.scrollKm())));
  protected readonly passLabel = computed(() => passName(this.at()));
  protected readonly passClock = computed(() => clockAt(this.at()));

  /** Ligne de pointage : texte du dernier pointage célébré, gardé pendant le repli. */
  protected readonly line = signal('');
  protected readonly extended = signal(false);
  /** Annonces de la région live : une entrée par pointage atteint (ajout = annonce). */
  protected readonly said = signal<string[]>([]);
  /** Infobulles : après la première (300 ms), les voisines s'ouvrent sans délai. */
  protected readonly warm = signal(false);

  private readonly mask = viewChild.required<ElementRef<SVGRectElement>>('mask');
  private readonly dot = viewChild.required<ElementRef<HTMLElement>>('dot');
  private readonly trace = viewChild.required<ElementRef<HTMLElement>>('trace');
  private warmTimer = 0;

  constructor() {
    const destroyRef = inject(DestroyRef);
    const host: HTMLElement = inject(ElementRef).nativeElement;
    let furthest = 0;
    let collapse = 0;
    // Seulement en avançant au-delà du plus loin déjà atteint : revenir en arrière ne rejoue rien.
    effect(() => {
      const id = this.at();
      const i = CHECKPOINT_IDS.indexOf(id);
      if (i <= furthest) return;
      furthest = i;
      if (id === 'depart' || !firstInSession(id)) return;
      const km = formatKm(CHECKPOINTS[id]);
      const name = passName(id);
      const leg = legText(SPLITS[id].legS);
      const clock = SPLITS[id].clock;
      this.line.set(
        SPLITS[id].legS === LONGEST
          ? $localize`${name}:name: · km ${km}:km: · ${clock}:clock: · ${leg}:leg: de la plus longue étape`
          : $localize`${name}:name: · km ${km}:km: · ${clock}:clock: · ${leg}:leg: d'étape`,
      );
      this.said.update((s) => [...s, id === 'arrivee' ? $localize`Arrivée atteinte, km ${km}:km:` : $localize`${name}:name: atteint, km ${km}:km:`]);
      this.extended.set(true);
      clearTimeout(collapse);
      collapse = setTimeout(() => this.extended.set(false), SPLIT_MS) as unknown as number;
    });

    afterNextRender(() => {
      this.progress.start();
      // Trace et point écrits en `transform` directement sur leurs éléments (spec §9), depuis la même valeur que le km affiché.
      let frame = 0;
      let anchors: (readonly [number, number])[] = [];
      let box = { w: 0, h: 0 };
      let stale = true;
      const measure = () => {
        // Position document de chaque section ; le départ est ramené à la ligne de référence du scroll 0 pour valoir km 0 en haut.
        const line = innerHeight / 3;
        anchors = CHECKPOINT_IDS.flatMap((id) => {
          const el = document.getElementById(id);
          return el ? [[el.getBoundingClientRect().top + scrollY, CHECKPOINTS[id]] as const] : [];
        });
        if (anchors.length) anchors[0] = [Math.max(anchors[0][0], line), anchors[0][1]];
        const r = this.trace().nativeElement.getBoundingClientRect();
        box = { w: r.width, h: r.height };
        stale = false;
      };
      const update = () => {
        frame = 0;
        if (stale) measure();
        // En bas de page, l'arrivée ne croise jamais la ligne de référence : le bas du scroll vaut l'arrivée.
        const max = document.documentElement.scrollHeight - innerHeight;
        const atEnd = max > 0 && scrollY >= max - 1;
        const km = atEnd ? TOTAL_KM : anchors.length ? kmAtScroll(scrollY + innerHeight / 3, anchors) : 0;
        const shown = Math.round(km * 10) / 10;
        this.progress.scrollKm.set(shown);
        const p = shown / TOTAL_KM;
        this.mask().nativeElement.style.transform = `scaleX(${p})`;
        this.dot().nativeElement.style.transform = `translate(${p * box.w}px, ${(1 - altitudeRatioAt(shown)) * box.h}px)`;
      };
      const schedule = () => (frame ||= requestAnimationFrame(update));
      const remeasure = () => {
        stale = true;
        schedule();
      };
      // La hauteur du document change aussi sans resize de fenêtre (polices, images).
      const ro = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(remeasure);
      ro?.observe(document.body);
      // Chrome ne défile pas vers un élément focalisé déjà dans la fenêtre, même sous le bandeau : on le ramène dans le scroll-padding (WCAG 2.4.11), sans animation.
      const reveal = (e: FocusEvent) => {
        const t = e.target;
        if (t instanceof Element && !host.contains(t) && t.matches(':focus-visible')) t.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      };
      update();
      addEventListener('scroll', schedule, { passive: true });
      addEventListener('resize', remeasure, { passive: true });
      document.addEventListener('focusin', reveal);
      destroyRef.onDestroy(() => {
        document.removeEventListener('focusin', reveal);
        cancelAnimationFrame(frame);
        clearTimeout(collapse);
        clearTimeout(this.warmTimer);
        removeEventListener('scroll', schedule);
        removeEventListener('resize', remeasure);
        ro?.disconnect();
      });
    });
  }

  protected warmSoon(): void {
    if (!this.warm()) this.warmTimer ||= setTimeout(() => this.warm.set(true), 300) as unknown as number;
  }

  protected cool(): void {
    clearTimeout(this.warmTimer);
    this.warmTimer = 0;
    this.warm.set(false);
  }
}
