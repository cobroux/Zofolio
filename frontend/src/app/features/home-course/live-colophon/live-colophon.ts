import { Component, LOCALE_ID, computed, inject, input } from '@angular/core';
import { BuildInfo } from '../../../core/api/api.models';

const REPO = 'https://github.com/cobroux/Zofolio';

/**
 * Le dos du dossard (spec §6) : commit, déploiement, CI, stack. Le contact vit dans l'Arrivée (une destination, un lien). Une ligne n'existe que si sa donnée existe ;
 * sur papier fixe (thème indifférent), donc couleurs propres à l'objet.
 */
@Component({
  selector: 'app-live-colophon',
  template: `
    <dl>
      @if (info()?.commit; as sha) {
        <div data-row="commit">
          <dt i18n>Commit</dt>
          <dd><a [href]="repo + '/commit/' + sha" rel="noopener">{{ sha }}</a></dd>
        </div>
      }
      @if (deployed(); as d) {
        <div data-row="deployed">
          <dt i18n>Déployé le</dt>
          <dd><time [attr.datetime]="d.iso">{{ d.text }}</time></dd>
        </div>
      }
      @if (info()?.ci?.conclusion; as c) {
        <div data-row="ci">
          <dt i18n>Dernière CI sur main</dt>
          <dd>
            @let label = c === 'success' ? ciGreen : ciRed;
            @if (info()?.ci?.url; as url) { <a [href]="url" rel="noopener">{{ label }}</a> } @else { {{ label }} }
          </dd>
        </div>
      }
      <div data-row="stack">
        <dt i18n>Stack</dt>
        <dd>Angular 22 SSR · Spring Boot 4 · PostgreSQL · Caddy · <a [href]="repo" rel="noopener" i18n>Le code</a></dd>
      </div>
    </dl>
  `,
  styles: `
    :host { display: block; text-align: left; font-size: max(0.8125rem, 2.9cqi); line-height: 1.35; user-select: text; }
    dl { margin: 0; }
    dl { display: grid; gap: 1.2cqi; }
    dl div { display: flex; flex-wrap: wrap; gap: 0 2cqi; }
    dt { font-weight: 700; }
    dt::after { content: ':'; }
    :host-context(html[lang='fr']) dt::after { content: '\\00a0:'; }
    dd { margin: 0; font-variant-numeric: tabular-nums lining-nums; }
    a { color: inherit; display: inline-flex; align-items: center; min-height: var(--target); }
    a:focus-visible { outline: 3px solid #14161a; outline-offset: 2px; }
  `,
})
export class LiveColophon {
  readonly info = input<BuildInfo | null>(null);
  protected readonly repo = REPO;
  protected readonly ciGreen = $localize`CI verte`;
  protected readonly ciRed = $localize`CI rouge`;
  private readonly locale = inject(LOCALE_ID);

  /** Date selon la langue, fuseau fixe (identique au rendu serveur et navigateur). */
  protected readonly deployed = computed(() => {
    const iso = this.info()?.deployedAt;
    const d = iso ? new Date(iso) : null;
    return iso && d && !isNaN(d.getTime())
      ? { iso, text: new Intl.DateTimeFormat(this.locale, { dateStyle: 'long', timeZone: 'Europe/Paris' }).format(d) }
      : null;
  });
}
