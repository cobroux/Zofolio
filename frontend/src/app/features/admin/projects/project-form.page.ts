import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { ProjectSummary } from '../../../core/api/api.models';
import { Icon } from '../admin-icon';
import { AdminApi, Decision, GithubRepoAdmin, MediaAdmin, Problem, ProjectAdmin, Tr } from '../admin.api';
import { META, TIER_LABELS, bannerMessage, errorMap, fieldMessage } from '../admin.errors';
import { ErrorSummary } from '../error-summary';
import { MediaUpload } from '../media/media-upload';
import { ProjectPreview } from './project-preview';

const LANGS = ['fr', 'en'] as const;
const TR_KEYS = ['title', 'pitch', 'duration', 'note', 'role', 'problem', 'wall', 'takeaway', 'aiNote', 'metaTitle', 'metaDescription'] as const;
type TrKey = (typeof TR_KEYS)[number];
const REQUIRED: TrKey[] = ['title', 'pitch'];
const SLUG = /^[a-z0-9-]{1,64}$/;
const REPO = /^[A-Za-z0-9._-]{1,100}$/;

/** Validation alignée sur le back (`ProjectAdminService.fill`) : même notation pointée, mêmes codes. Le back reste l'autorité. */
export function validateProject(p: ProjectAdmin, creating: boolean): Record<string, string> {
  const e: Record<string, string> = {};
  if (creating && !SLUG.test(p.slug ?? '')) e['slug'] = 'Pattern';
  if (p.sortOrder !== null && !(Number.isInteger(p.sortOrder) && p.sortOrder >= 0 && p.sortOrder <= 100000)) e['sortOrder'] = 'Range';
  for (const k of TR_KEYS) {
    const v: Tr | null = p[k];
    for (const l of LANGS) if ((v?.[l]?.length ?? 0) > (META[k].max ?? 0)) e[`${k}.${l}`] = 'Size';
    if ((REQUIRED.includes(k) || v?.['en']) && !v?.['fr']) e[`${k}.fr`] = 'NotBlank';
  }
  if (p.stack.length > 12) e['stack'] = 'Size';
  p.stack.forEach((s, i) => s.length > 40 && (e[`stack[${i}]`] = 'Size'));
  if (p.githubRepos.length > 5) e['githubRepos'] = 'Size';
  p.githubRepos.forEach((s, i) => !REPO.test(s) && (e[`githubRepos[${i}]`] = 'Pattern'));
  if (p.demoUrl && !(/^https:\/\/\S+$/.test(p.demoUrl) && p.demoUrl.length <= 255)) e['demoUrl'] = 'Pattern';
  for (const l of LANGS) {
    const d = p.decisions?.[l] ?? [];
    if (d.length > 3) e[`decisions.${l}`] = 'Size';
    d.forEach((x, i) => {
      if (!x.title || x.title.length > 120) e[`decisions.${l}[${i}].title`] = 'Size';
      if (!x.tradeoff || x.tradeoff.length > 1000) e[`decisions.${l}[${i}].tradeoff`] = 'Size';
    });
  }
  const v = p.video;
  if (v) {
    if (!SLUG.test(v.name)) e['video.name'] = 'Pattern';
    for (const k of ['width', 'height'] as const) if (!(Number.isInteger(v[k]) && v[k]! >= 1 && v[k]! <= 4096)) e[`video.${k}`] = 'Range';
    for (const l of LANGS) if ((v.caption[l]?.length ?? 0) > 200) e[`video.caption.${l}`] = 'Size';
  }
  return e;
}

const text = () => new FormGroup({ fr: new FormControl('', { nonNullable: true }), en: new FormControl('', { nonNullable: true }) });
const decision = (d?: Decision) => new FormGroup({ title: new FormControl(d?.title ?? '', { nonNullable: true }), tradeoff: new FormControl(d?.tradeoff ?? '', { nonNullable: true }) });
type DecisionGroup = ReturnType<typeof decision>;
const int = (s: string): number | null => (s.trim() === '' ? null : Number(s));
/** Textes vides écartés ; `null` si rien n'est saisi. */
const pack = (v: { fr: string; en: string }): Tr | null => {
  const o = Object.fromEntries(Object.entries(v).filter(([, s]) => s.trim() !== ''));
  return Object.keys(o).length ? o : null;
};

interface TextField { key: TrKey; area?: boolean }
const IDENTITY: TextField[] = [{ key: 'title' }, { key: 'pitch', area: true }, { key: 'duration' }, { key: 'note' }];
const TEXTS: TextField[] = [{ key: 'role' }, { key: 'problem', area: true }, { key: 'wall', area: true }, { key: 'takeaway', area: true }, { key: 'aiNote', area: true }];
const SEO: TextField[] = [{ key: 'metaTitle' }, { key: 'metaDescription', area: true }];

/** Formulaire d'un projet (DESIGN §11.1). Enregistrer = publier (D41) ; un nouveau projet naît `Masqué`. */
@Component({
  selector: 'app-project-form',
  imports: [ReactiveFormsModule, NgTemplateOutlet, RouterLink, Icon, ErrorSummary, MediaUpload, ProjectPreview],
  template: `
    <div class="bar">
      <h1>{{ creating ? 'Nouveau projet' : (form.controls.title.controls.fr.value || 'Projet') }}</h1>
      <a class="btn plain" routerLink="/admin/projets">← Projets</a>
    </div>
    @if (missing()) {
      <p class="banner" role="alert"><app-icon name="error" />Introuvable. <a routerLink="/admin/projets">Retour à la liste.</a></p>
    } @else {
      <app-error-summary [errors]="errors()" [banner]="banner()" />
      @if (status(); as s) {
        <p role="status">{{ s }}</p>
      }
      <form [formGroup]="form" (ngSubmit)="save()" novalidate>
        <fieldset>
          <legend>Identité</legend>
          <div class="pair">
            <div class="field" [class.invalid]="errors()['slug']">
              <label for="f-slug">Slug</label>
              <input id="f-slug" formControlName="slug" [readonly]="!creating" autocapitalize="none" spellcheck="false" [attr.aria-invalid]="errors()['slug'] ? 'true' : null" aria-describedby="m-slug" />
              <span class="help" id="m-slug"><span class="msg">{{ msg('slug') }}</span>{{ creating ? 'Définitif après création' : 'Immuable' }}</span>
            </div>
            <ng-container *ngTemplateOutlet="select; context: { key: 'tier', label: 'Niveau', opts: tiers }" />
            <ng-container *ngTemplateOutlet="select; context: { key: 'stage', label: 'Étape', opts: stages }" />
            <ng-container *ngTemplateOutlet="select; context: { key: 'aiTag', label: 'Part de l’IA', opts: aiTags }" />
            <div class="field" [class.invalid]="errors()['sortOrder']">
              <label for="f-sortOrder">Ordre</label>
              <input id="f-sortOrder" inputmode="numeric" formControlName="sortOrder" [attr.aria-invalid]="errors()['sortOrder'] ? 'true' : null" aria-describedby="m-sortOrder" />
              <span class="help" id="m-sortOrder"><span class="msg">{{ msg('sortOrder') }}</span>vide : en dernier</span>
            </div>
          </div>
          <div class="field" [class.invalid]="errors()['stack'] || stackItemError()">
            <label for="f-stack">Stack</label>
            <input id="f-stack" formControlName="stack" [attr.aria-invalid]="errors()['stack'] || stackItemError() ? 'true' : null" aria-describedby="m-stack" />
            <span class="help" id="m-stack"><span class="msg">{{ msg('stack') }}</span>séparée par des virgules, 12 maximum</span>
          </div>
          <div class="field" [class.invalid]="errors()['demoUrl']">
            <label for="f-demoUrl">Adresse de la démo</label>
            <input id="f-demoUrl" type="url" formControlName="demoUrl" [attr.aria-invalid]="errors()['demoUrl'] ? 'true' : null" aria-describedby="m-demoUrl" />
            <span class="help" id="m-demoUrl"><span class="msg">{{ msg('demoUrl') }}</span>https:// uniquement, vide : pas de lien</span>
          </div>
          <ng-container *ngTemplateOutlet="pairs; context: { fields: identity }" />
        </fieldset>

        <fieldset>
          <legend>Textes de l’étude de cas</legend>
          <ng-container *ngTemplateOutlet="pairs; context: { fields: texts }" />
        </fieldset>

        <fieldset>
          <legend>Décisions</legend>
          <p class="small">0 à 3 par langue. Chaque décision : un titre et son compromis.</p>
          <div class="cols">
            @for (l of langs; track l) {
              <div class="col" [attr.lang]="l">
                <h2>{{ l === 'fr' ? 'Français' : 'English' }}</h2>
                @for (d of decisions()[l]; track d; let i = $index) {
                  <div class="field" [class.invalid]="errors()['decisions.' + l + '[' + i + '].title']" [formGroup]="d">
                    <label [for]="'f-decisions-' + l + '-' + i + '-title'">Décision {{ i + 1 }}, titre</label>
                    <input [id]="'f-decisions-' + l + '-' + i + '-title'" formControlName="title" [attr.aria-invalid]="errors()['decisions.' + l + '[' + i + '].title'] ? 'true' : null" [attr.aria-describedby]="'m-decisions-' + l + '-' + i + '-title'" />
                    <span class="help" [id]="'m-decisions-' + l + '-' + i + '-title'"><span class="msg">{{ msg('decisions.' + l + '[' + i + '].title') }}</span></span>
                  </div>
                  <div class="field" [class.invalid]="errors()['decisions.' + l + '[' + i + '].tradeoff']" [formGroup]="d">
                    <label [for]="'f-decisions-' + l + '-' + i + '-tradeoff'">Décision {{ i + 1 }}, compromis</label>
                    <textarea [id]="'f-decisions-' + l + '-' + i + '-tradeoff'" formControlName="tradeoff" [attr.aria-invalid]="errors()['decisions.' + l + '[' + i + '].tradeoff'] ? 'true' : null" [attr.aria-describedby]="'m-decisions-' + l + '-' + i + '-tradeoff'"></textarea>
                    <span class="help" [id]="'m-decisions-' + l + '-' + i + '-tradeoff'"><span class="msg">{{ msg('decisions.' + l + '[' + i + '].tradeoff') }}</span></span>
                  </div>
                  <button type="button" class="btn plain" (click)="removeDecision(l, i)">Retirer la décision {{ i + 1 }}</button>
                }
                <span [id]="'f-decisions-' + l"></span>
                @if (errors()['decisions.' + l]) {
                  <p class="msg" role="alert"><app-icon name="error" />3 décisions maximum.</p>
                }
                <button type="button" class="btn" [attr.aria-disabled]="decisions()[l].length >= 3" (click)="addDecision(l)">Ajouter une décision</button>
              </div>
            }
          </div>
        </fieldset>

        <fieldset id="f-githubRepos" [class.invalid]="errors()['githubRepos']">
          <legend>Dépôts GitHub</legend>
          <p class="small">5 maximum. Un dépôt n’est visible sur le site que si un projet non masqué le liste.</p>
          @for (r of repoChoices(); track r.name) {
            <div class="check">
              <input type="checkbox" #c [id]="'f-repo-' + r.name" [checked]="chosen().includes(r.name)" (change)="toggleRepo(r.name, c.checked)" />
              <label [for]="'f-repo-' + r.name">{{ r.name }} <span class="small">{{ r.projects.length ? '· aussi dans : ' + r.projects.join(', ') : '' }}</span></label>
            </div>
          } @empty {
            <p class="small">Aucun dépôt dans le cache GitHub.</p>
          }
          @if (errors()['githubRepos']) {
            <p class="msg" role="alert"><app-icon name="error" />5 dépôts maximum.</p>
          }
        </fieldset>

        <fieldset formGroupName="video">
          <legend>Clip</legend>
          <div class="check">
            <input id="f-video-on" type="checkbox" formControlName="on" />
            <label for="f-video-on">Ce projet a un clip</label>
          </div>
          @if (val().video.on) {
            <div class="pair">
              <div class="field" [class.invalid]="errors()['video.name']">
                <label for="f-video-name">Nom</label>
                <input id="f-video-name" formControlName="name" [attr.aria-invalid]="errors()['video.name'] ? 'true' : null" aria-describedby="m-video-name" />
                <span class="help" id="m-video-name"><span class="msg">{{ msg('video.name') }}</span>minuscules, chiffres, tirets</span>
              </div>
              <div class="field" [class.invalid]="errors()['video.width']">
                <label for="f-video-width">Largeur (px)</label>
                <input id="f-video-width" inputmode="numeric" formControlName="width" [attr.aria-invalid]="errors()['video.width'] ? 'true' : null" aria-describedby="m-video-width" />
                <span class="help" id="m-video-width"><span class="msg">{{ msg('video.width') }}</span></span>
              </div>
              <div class="field" [class.invalid]="errors()['video.height']">
                <label for="f-video-height">Hauteur (px)</label>
                <input id="f-video-height" inputmode="numeric" formControlName="height" [attr.aria-invalid]="errors()['video.height'] ? 'true' : null" aria-describedby="m-video-height" />
                <span class="help" id="m-video-height"><span class="msg">{{ msg('video.height') }}</span></span>
              </div>
            </div>
            <div class="cols">
              <div class="field" [class.invalid]="errors()['video.mp4']">
                <label for="f-video-mp4">Vidéo MP4</label>
                <select id="f-video-mp4" formControlName="mp4" [attr.aria-invalid]="errors()['video.mp4'] ? 'true' : null" aria-describedby="m-video-mp4">
                  <option value="">Aucune</option>
                  @for (m of videos(); track m.id) {
                    <option [value]="m.url">{{ m.url.slice(9) }} · {{ m.width }} × {{ m.height }}</option>
                  }
                </select>
                <span class="help" id="m-video-mp4"><span class="msg">{{ msg('video.mp4') }}</span></span>
              </div>
              <div class="field" [class.invalid]="errors()['video.poster']">
                <label for="f-video-poster">Affiche</label>
                <select id="f-video-poster" formControlName="poster" [attr.aria-invalid]="errors()['video.poster'] ? 'true' : null" aria-describedby="m-video-poster">
                  <option value="">Aucune</option>
                  @for (m of posters(); track m.id) {
                    <option [value]="m.url">{{ m.url.slice(9) }} · {{ m.width }} × {{ m.height }}</option>
                  }
                </select>
                <span class="help" id="m-video-poster"><span class="msg">{{ msg('video.poster') }}</span></span>
              </div>
            </div>
            <app-media-upload (uploaded)="uploaded($event)" />
            <div class="cols" style="margin-block-start:var(--s-5)">
              @for (l of langs; track l) {
                <div class="col" [attr.lang]="l">
                  <h2>Légende ({{ l === 'fr' ? 'Français' : 'English' }})</h2>
                  <div class="field" [class.invalid]="errors()['video.caption.' + l]" formGroupName="caption">
                    <label [for]="'f-video-caption-' + l">Légende</label>
                    <input [id]="'f-video-caption-' + l" [formControlName]="l" [attr.aria-invalid]="errors()['video.caption.' + l] ? 'true' : null" [attr.aria-describedby]="'m-video-caption-' + l" />
                    <span class="help" [id]="'m-video-caption-' + l"><span class="msg">{{ msg('video.caption.' + l) }}</span></span>
                  </div>
                </div>
              }
            </div>
          }
        </fieldset>

        <fieldset>
          <legend>Référencement</legend>
          <ng-container *ngTemplateOutlet="pairs; context: { fields: seo }" />
        </fieldset>

        <div class="actions">
          <div class="wrap">
            <span class="small">{{ val().tier === 'HIDDEN' ? 'Non publié' : 'Publié sur le site' }}</span>
            <button type="button" class="btn" (click)="preview('fr')">Aperçu FR</button>
            <button type="button" class="btn" (click)="preview('en')">Aperçu EN</button>
            <button type="submit" class="btn primary" [attr.aria-disabled]="busy()">{{ val().tier === 'HIDDEN' ? 'Enregistrer' : 'Enregistrer et publier' }}</button>
          </div>
        </div>
      </form>
    }
    <app-project-preview [project]="previewed()" [lang]="previewLang()" (closed)="previewed.set(null)" />

    <ng-template #select let-key="key" let-label="label" let-opts="opts">
      <div class="field" [class.invalid]="errors()[key]" [formGroup]="form">
        <label [for]="'f-' + key">{{ label }}</label>
        <select [id]="'f-' + key" [formControlName]="key" [attr.aria-invalid]="errors()[key] ? 'true' : null" [attr.aria-describedby]="'m-' + key">
          @for (o of opts; track o[0]) {
            <option [value]="o[0]">{{ o[1] }}</option>
          }
        </select>
        <span class="help" [id]="'m-' + key"><span class="msg">{{ msg(key) }}</span></span>
      </div>
    </ng-template>

    <ng-template #pairs let-fields="fields">
      <div class="cols">
        @for (l of langs; track l) {
          <div class="col" [attr.lang]="l">
            <h2>{{ l === 'fr' ? 'Français' : 'English' }}</h2>
            @for (f of fields; track f.key) {
              <div class="field" [class.invalid]="errors()[f.key + '.' + l]">
                <label [for]="'f-' + f.key + '-' + l">{{ meta[f.key].label }}</label>
                @if (f.area) {
                  <textarea [id]="'f-' + f.key + '-' + l" [formControl]="tr(f.key, l)" [attr.aria-invalid]="errors()[f.key + '.' + l] ? 'true' : null" [attr.aria-describedby]="'m-' + f.key + '-' + l"></textarea>
                } @else {
                  <input [id]="'f-' + f.key + '-' + l" [formControl]="tr(f.key, l)" [attr.aria-invalid]="errors()[f.key + '.' + l] ? 'true' : null" [attr.aria-describedby]="'m-' + f.key + '-' + l" />
                }
                <span class="help" [id]="'m-' + f.key + '-' + l">
                  <span class="msg">{{ msg(f.key + '.' + l) }}</span>
                  @if (near(f.key, l); as n) {
                    <span class="tnum" [class.over]="n.over">{{ n.len }} / {{ n.max }}</span>
                  }
                </span>
              </div>
            }
          </div>
        }
      </div>
    </ng-template>
  `,
})
export class ProjectFormPage {
  private readonly api = inject(AdminApi);
  private readonly router = inject(Router);
  private readonly slug = inject(ActivatedRoute).snapshot.paramMap.get('slug');
  private readonly summary = viewChild.required(ErrorSummary);
  protected readonly creating = this.slug === null;
  protected readonly langs = LANGS;
  protected readonly meta = META;
  protected readonly identity = IDENTITY;
  protected readonly texts = TEXTS;
  protected readonly seo = SEO;
  protected readonly tiers = Object.entries(TIER_LABELS);
  protected readonly stages = [['', 'Aucune'], ['P1', 'P1 · les fondations'], ['P3', 'P3 · projets nés de la course']];
  protected readonly aiTags = [['HAND', 'Écrit à la main'], ['HAND_THEN_AI', 'Commencé à la main, puis IA'], ['AI', 'IA comme outil, conçu et revu par moi']];

  protected readonly form = new FormGroup({
    slug: new FormControl('', { nonNullable: true }),
    tier: new FormControl('HIDDEN', { nonNullable: true }),
    stage: new FormControl('', { nonNullable: true }),
    sortOrder: new FormControl('', { nonNullable: true }),
    aiTag: new FormControl('HAND', { nonNullable: true }),
    stack: new FormControl('', { nonNullable: true }),
    demoUrl: new FormControl('', { nonNullable: true }),
    githubRepos: new FormControl<string[]>([], { nonNullable: true }),
    title: text(), pitch: text(), duration: text(), note: text(), role: text(), problem: text(), wall: text(), takeaway: text(), aiNote: text(), metaTitle: text(), metaDescription: text(),
    video: new FormGroup({
      on: new FormControl(false, { nonNullable: true }),
      name: new FormControl('', { nonNullable: true }),
      width: new FormControl('', { nonNullable: true }),
      height: new FormControl('', { nonNullable: true }),
      mp4: new FormControl('', { nonNullable: true }),
      poster: new FormControl('', { nonNullable: true }),
      caption: text(),
    }),
  });
  /** Sans zone : le template lit cette photo des valeurs (signal), jamais les contrôles directement. */
  protected readonly val = toSignal(this.form.valueChanges.pipe(map(() => this.form.getRawValue())), { initialValue: this.form.getRawValue() });
  protected readonly decisions = signal<{ fr: DecisionGroup[]; en: DecisionGroup[] }>({ fr: [], en: [] });
  protected readonly repos = signal<GithubRepoAdmin[]>([]);
  protected readonly media = signal<MediaAdmin[]>([]);
  protected readonly errors = signal<Record<string, string>>({});
  protected readonly banner = signal<string | null>(null);
  protected readonly status = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly missing = signal(false);
  protected readonly previewed = signal<ProjectSummary | null>(null);
  protected readonly previewLang = signal<'fr' | 'en'>('fr');

  protected readonly chosen = () => this.val().githubRepos;
  protected readonly repoChoices = () => [...this.repos(), ...this.chosen().filter((n) => !this.repos().some((r) => r.name === n)).map((name) => ({ name, projects: [] as string[] }))];
  protected readonly videos = () => this.media().filter((m) => m.kind === 'VIDEO');
  protected readonly posters = () => this.media().filter((m) => m.kind === 'IMAGE' && /\.(jpg|png)$/.test(m.url));
  protected readonly stackItemError = () => Object.keys(this.errors()).some((k) => k.startsWith('stack['));

  constructor() {
    forkJoin({ repos: this.api.githubRepos(), media: this.api.media(), project: this.slug ? this.api.project(this.slug) : [null] }).subscribe({
      next: ({ repos, media, project }) => {
        this.repos.set(repos);
        this.media.set(media);
        const draft = this.api.drafts.get(this.slug ?? '') as ProjectAdmin | undefined;
        this.api.drafts.delete(this.slug ?? '');
        if (draft) this.banner.set('Votre brouillon a été conservé. Enregistrez-le maintenant.');
        if (draft ?? project) this.fill((draft ?? project)!);
      },
      error: (p: Problem) => (p.code === 'NOT_FOUND' ? this.missing.set(true) : this.banner.set(bannerMessage(p))),
    });
  }

  protected tr(key: string, lang: string) {
    return this.form.get([key, lang]) as FormControl<string>;
  }
  protected msg = (f: string) => (this.errors()[f] ? fieldMessage(f, this.errors()[f]) : '');

  /** Compteur « 112 / 120 » à partir de 80 % de la limite. */
  protected near(key: string, lang: string) {
    const max = META[key].max ?? 0;
    const len = (this.val() as unknown as Record<string, Record<string, string>>)[key][lang].length;
    return len >= max * 0.8 ? { len, max, over: len > max } : null;
  }

  protected addDecision(l: 'fr' | 'en') {
    if (this.decisions()[l].length < 3) this.decisions.update((d) => ({ ...d, [l]: [...d[l], decision()] }));
  }
  protected removeDecision(l: 'fr' | 'en', i: number) {
    this.decisions.update((d) => ({ ...d, [l]: d[l].filter((_, j) => j !== i) }));
  }
  protected toggleRepo(name: string, on: boolean) {
    const c = this.form.controls.githubRepos;
    c.setValue(on ? [...c.value, name] : c.value.filter((n) => n !== name));
  }
  protected uploaded(m: MediaAdmin) {
    this.media.update((l) => [m, ...l.filter((x) => x.id !== m.id)]);
    this.form.controls.video.get(m.kind === 'VIDEO' ? 'mp4' : 'poster')?.setValue(m.url);
  }

  private fill(p: ProjectAdmin) {
    const f = this.form;
    f.patchValue({
      slug: p.slug ?? '', tier: p.tier ?? 'HIDDEN', stage: p.stage ?? '', sortOrder: String(p.sortOrder ?? ''), aiTag: p.aiTag ?? 'HAND',
      stack: p.stack.join(', '), demoUrl: p.demoUrl ?? '', githubRepos: p.githubRepos,
    });
    for (const k of TR_KEYS) f.controls[k].patchValue({ fr: p[k]?.['fr'] ?? '', en: p[k]?.['en'] ?? '' });
    f.controls.video.patchValue({
      on: !!p.video, name: p.video?.name ?? '', width: String(p.video?.width ?? ''), height: String(p.video?.height ?? ''),
      mp4: p.video?.mp4 ?? '', poster: p.video?.poster ?? '', caption: { fr: p.video?.caption['fr'] ?? '', en: p.video?.caption['en'] ?? '' },
    });
    this.decisions.set({ fr: (p.decisions?.['fr'] ?? []).map(decision), en: (p.decisions?.['en'] ?? []).map(decision) });
  }

  protected payload(): ProjectAdmin {
    const v = this.form.getRawValue();
    const d = (l: 'fr' | 'en') => this.decisions()[l].map((g) => g.getRawValue()).filter((x) => x.title.trim() || x.tradeoff.trim());
    const dec = { fr: d('fr'), en: d('en') };
    const clip = v.video;
    return {
      slug: this.slug ?? (v.slug || null), tier: v.tier, stage: v.stage || null, sortOrder: int(v.sortOrder), aiTag: v.aiTag,
      stack: v.stack.split(',').map((s) => s.trim()).filter(Boolean), githubRepos: v.githubRepos, demoUrl: v.demoUrl.trim() || null,
      title: pack(v.title) ?? {}, pitch: pack(v.pitch) ?? {}, duration: pack(v.duration), note: pack(v.note), role: pack(v.role),
      problem: pack(v.problem), wall: pack(v.wall), takeaway: pack(v.takeaway), aiNote: pack(v.aiNote), metaTitle: pack(v.metaTitle), metaDescription: pack(v.metaDescription),
      decisions: dec.fr.length || dec.en.length ? dec : null,
      video: clip.on ? { name: clip.name, mp4: clip.mp4 || null, poster: clip.poster || null, width: int(clip.width), height: int(clip.height), caption: pack(clip.caption) ?? {} } : null,
    };
  }

  protected save() {
    const p = this.payload();
    const local = validateProject(p, this.creating);
    if (Object.keys(local).length) return this.fail(local, null);
    this.busy.set(true);
    this.status.set(null);
    (this.slug ? this.api.saveProject(this.slug, p) : this.api.createProject(p)).subscribe({
      next: (saved) => {
        this.busy.set(false);
        this.errors.set({});
        this.banner.set(null);
        this.status.set(saved.tier === 'HIDDEN' ? 'Enregistré. Le projet reste non publié.' : 'Enregistré et publié : visible sur le site.');
        if (this.creating) void this.router.navigate(['/admin/projets', saved.slug]);
        else this.fill(saved);
      },
      error: (e: Problem) => {
        this.busy.set(false);
        if (e.code === 'UNAUTHENTICATED') this.api.drafts.set(this.slug ?? '', p);
        else if (e.code === 'CONFLICT') this.fail({ slug: 'Conflict' }, null);
        else this.fail(errorMap(e.errors), bannerMessage(e));
      },
    });
  }

  protected preview(lang: 'fr' | 'en') {
    const p = this.payload();
    const local = validateProject(p, this.creating);
    if (Object.keys(local).length) return this.fail(local, null);
    this.api.preview(lang, p).subscribe({
      next: (s) => {
        this.errors.set({});
        this.banner.set(null);
        this.previewLang.set(lang);
        this.previewed.set(s);
      },
      error: (e: Problem) => {
        if (e.code === 'UNAUTHENTICATED') this.api.drafts.set(this.slug ?? '', p);
        else this.fail(errorMap(e.errors), bannerMessage(e));
      },
    });
  }

  private fail(errors: Record<string, string>, banner: string | null) {
    this.errors.set(errors);
    this.banner.set(banner);
    this.summary().focus();
  }
}
