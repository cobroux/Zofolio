import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { AiTag } from '../../shared/ai-tag/ai-tag';

/** Mesures Lighthouse mobile (médiane de 3) : à remplir avec la prod (T8) ; null = pas encore mesuré. */
export const LH_DATE: string | null = null;
export const LH_PAGES = ['/fr/', '/en/', '/fr/projets/oltre'];
export const LH_ROWS: { label: string; threshold: number; scores: (number | null)[] }[] = [
  { label: $localize`Performance`, threshold: 90, scores: [null, null, null] },
  { label: $localize`Accessibilité`, threshold: 95, scores: [null, null, null] },
  { label: $localize`Bonnes pratiques`, threshold: 95, scores: [null, null, null] },
  { label: $localize`SEO`, threshold: 95, scores: [null, null, null] },
];
export const EDITION_UPDATED = '2026-10-16';

/** Un score à moins de 2 points du seuil reçoit la note « limite » (DESIGN §11.2). */
export const isAtLimit = (score: number | null, threshold: number) => score !== null && score <= threshold + 2;

@Component({
  selector: 'app-colophon',
  imports: [AiTag, DatePipe],
  template: `
    <section class="start" aria-labelledby="c-h1">
      <div>
        <h1 id="c-h1" i18n>Colophon</h1>
        <p class="lead" i18n>Ce site est aussi une preuve. Voici comment il est fait, qui a écrit quoi, et ce que j'ai décidé moi-même.</p>
      </div>
      <aside class="bib" i18n-aria-label aria-label="Édition">
        <b i18n>Édition 2026</b>
        <p class="tnum"><ng-container i18n>FR + EN · mise à jour le</ng-container> {{ updated | date: 'longDate' }}</p>
      </aside>
    </section>

    <section aria-labelledby="c-stack">
      <h2 id="c-stack" i18n>La stack</h2>
      <div class="three">
        <div><h3>Back</h3><p i18n>Java 21, Spring Boot 4.1, Maven, Liquibase pour le schéma, PostgreSQL 17.</p></div>
        <div><h3>Front</h3><p i18n>Angular 22 (composants standalone, signals), rendu côté serveur avec <code>&#64;angular/ssr</code>, TypeScript, CSS natif sans framework.</p></div>
        <div><h3>Infra</h3><p i18n>Docker Compose, Caddy en frontal, GitHub Actions.</p></div>
      </div>
      <p i18n>Le site se lit sans JavaScript. Le serveur envoie déjà le HTML complet.</p>
      <p i18n>Même famille de technos que mes projets perso (Oltre, Zotracker) et que mon travail chez Worldline : je ne change pas d'outils pour faire joli.</p>
    </section>

    <section class="inv" aria-labelledby="c-meth">
      <h2 id="c-meth" i18n>Une équipe d'agents, un chef d'équipe</h2>
      <p i18n>Le code de ce site a été écrit en grande partie par des agents IA. Je les pilote, je tranche, je relis. Comme une petite équipe, avec un budget à surveiller.</p>
      <table>
        <caption i18n>Agents, rôle et modèle</caption>
        <thead><tr><th scope="col" i18n>Agent</th><th scope="col" i18n>Rôle</th><th scope="col" i18n>Modèle</th></tr></thead>
        <tbody>
          <tr><th scope="row">tech-lead</th><td i18n>Specs, ADR, arbitrages</td><td>Opus</td></tr>
          <tr><th scope="row">designer</th><td i18n>Direction artistique, DESIGN.md</td><td>Sonnet</td></tr>
          <tr><th scope="row">backend-dev</th><td i18n>Spring Boot, Liquibase, API</td><td>Sonnet</td></tr>
          <tr><th scope="row">frontend-dev</th><td i18n>Angular, SSR, accessibilité</td><td>Sonnet</td></tr>
          <tr><th scope="row">code-reviewer</th><td i18n>Revue avant fusion</td><td>Sonnet</td></tr>
          <tr><th scope="row">qa-engineer</th><td i18n>E2E, axe, Lighthouse</td><td>Sonnet</td></tr>
          <tr><th scope="row">copywriter</th><td i18n>Premiers jets de textes</td><td>Sonnet</td></tr>
          <tr><th scope="row">devops</th><td i18n>Docker, CI, déploiement</td><td>Haiku</td></tr>
          <tr><th scope="row">content-researcher</th><td i18n>Faits tirés de mes documents</td><td>Haiku</td></tr>
        </tbody>
      </table>
      <p i18n>Chaque rôle prend le modèle le moins coûteux qui tient la tâche : Opus pour le tech lead (specs, arbitrages), Sonnet pour la plupart des autres, Haiku pour le DevOps et la recherche de contenu.</p>
      <p i18n>Des skills guident les agents. Pour le design, Taste (contre le look « fait par une IA ») et Emil (les détails de finition et de mouvement).</p>
      <p i18n>Le cycle d'une feature : spec, design si besoin, back et front en parallèle, revue de code, QA, déploiement.</p>
      <p i18n>À chaque point de contrôle, une revue de code et une passe QA (E2E, accessibilité, performance). Leurs rapports sont dans <code>docs/reviews/</code>, défauts compris.</p>
      <p i18n>Règle commune : la plus petite modification qui résout vraiment le problème. Pas d'abstraction « au cas où ».</p>
      <p i18n>Oui, il y a un agent rédacteur. Non, il n'a pas écrit cette phrase sans que je la relise.</p>
    </section>

    <section aria-labelledby="c-ai">
      <h2 id="c-ai" i18n>Qui a écrit quoi</h2>
      <p class="tags"><app-ai-tag tag="HAND" /> <app-ai-tag tag="HAND_THEN_AI" /> <app-ai-tag tag="AI" /></p>
      <p i18n>Chaque projet porte un tag. « Écrit à la main » : les projets universitaires. « Commencé à la main, puis IA » : Oltre. « Conçu avec IA » : Zotracker et ce site.</p>
      <p i18n>Ce que j'ai décidé moi-même : le concept (le site suit mon Grand Trail d'Auvergne), tous les contenus et leur validation, les arbitrages d'architecture et de budget. Aucun texte ne part en ligne sans mon accord.</p>
      <p i18n>Ce que les agents ont fait : écrire le code, les tests et les premiers jets de textes, sur mes specs. Je relis, je corrige, je refuse parfois.</p>
      <h3 i18n>Les clips des projets</h3>
      <p i18n>Les courtes vidéos de démonstration sont générées par script : Docker lance le projet, Playwright le pilote avec un faux curseur, ffmpeg encode le MP4. Données factices uniquement : aucune donnée Garmin ni aucun compte réels ne passent devant la caméra. Chaque clip pèse moins de 2,5 Mo, sans métadonnées, et ne se charge que lorsqu'il entre à l'écran.</p>
    </section>

    <section class="alt" aria-labelledby="c-ci">
      <h2 id="c-ci" i18n>Ce que la CI vérifie</h2>
      <p i18n>À chaque push, GitHub Actions lance quatre jobs : le back (build et tests, <code>./mvnw verify</code>), le front (lint, tests, build), les tests E2E Playwright sur la pile complète, et Lighthouse.</p>
      <p i18n>Les E2E incluent axe-core : zéro violation d'accessibilité, en clair et en sombre, en FR et en EN.</p>
      <p i18n>Les seuils Lighthouse mobile font échouer le build : 90 en performance, 95 en accessibilité, bonnes pratiques et SEO. Une PR rouge ne se fusionne pas.</p>
      <p i18n>Environ 120 tests au total (back, front, E2E). [À recompter avant publication]</p>
      <p i18n>(conditionnel) Une CI verte sur <code>main</code> déclenche le déploiement : images Docker poussées sur GHCR, mises en ligne sur une VM Oracle Cloud (gratuite), derrière Cloudflare, avec retour automatique à la version précédente si le démarrage échoue.</p>
      <p class="aid" i18n>(conditionnel) La base est sauvegardée chaque nuit, chiffrée, sur Cloudflare R2.</p>
    </section>

    <section aria-labelledby="c-lh">
      <h2 id="c-lh" i18n>Scores Lighthouse</h2>
      <p i18n>Mesurés sur le site en ligne, mobile, médiane de trois mesures. Pas de score arrondi à la hausse.</p>
      <p class="tnum">
        @if (lhDate) { <ng-container i18n>Mesure du</ng-container> {{ lhDate | date: 'longDate' }} }
        @else { <ng-container i18n>Mesure du [À MESURER : date, T8]</ng-container> }
      </p>
      <table class="lh">
        <caption i18n>Scores par page, seuil entre parenthèses</caption>
        <thead>
          <tr><th scope="col" i18n>Catégorie</th>@for (p of pages; track p) { <th scope="col" class="n">{{ p }}</th> }</tr>
        </thead>
        <tbody>
          @for (r of rows; track r.label) {
            <tr>
              <th scope="row">{{ r.label }} <span class="tnum">({{ r.threshold }})</span></th>
              @for (s of r.scores; track $index) {
                <td class="n">
                  @if (s === null) { <span class="todo" i18n>[À MESURER : prod]</span> }
                  @else {
                    <span class="split tnum">{{ s }}</span>
                    @if (limit(s, r.threshold)) { <span class="note" i18n>Limite : pile au seuil. Je l'écris.</span> }
                  }
                </td>
              }
            </tr>
          }
        </tbody>
      </table>
      <p i18n>Pour mémoire, la dernière mesure locale (<code>docs/reviews/V2-T34-T35-qa.md</code>) donnait 90, 100, 100, 100 sur <code>/fr/</code> : la performance était juste au seuil. Je préfère l'écrire que de le cacher.</p>
    </section>

    <section class="arr" aria-labelledby="c-repo">
      <h2 id="c-repo" i18n>Tout est dans le dépôt</h2>
      <p class="links">
        <a href="https://github.com/cobroux/Zofolio" rel="noopener" i18n>Le code source</a>
        <a href="https://github.com/cobroux/Zofolio/tree/main/tasks" rel="noopener" i18n>Les plans et listes de tâches (tasks/)</a>
        <a href="https://github.com/cobroux/Zofolio/tree/main/docs/adr" rel="noopener" i18n>Les décisions d'architecture (docs/adr/)</a>
      </p>
    </section>
  `,
  styles: `
    :host { display: block; }
    section { padding: var(--s-9) var(--margin); }
    section > * + * { margin-block-start: var(--s-4); }
    section > :where(h2) { font: 800 clamp(2rem, 4vw, 3.25rem) / 1.05 var(--font-display); }
    h1 { font: 800 var(--t-display) / 1 var(--font-display); }
    .start { display: grid; gap: var(--s-6); }
    .lead { font-size: var(--t-lead); max-width: var(--measure); }
    .bib { background: var(--surface); padding: var(--s-5); align-self: end; }
    @media (min-width: 1100px) { .start { grid-template-columns: 1fr 22rem; } .bib { min-height: 12rem; } }
    .three { display: grid; gap: var(--s-6); }
    @media (min-width: 900px) { .three { grid-template-columns: repeat(3, 1fr); } }
    h3 { font-weight: 600; }
    .inv { background: var(--ink); color: var(--bg); }
    .alt { background: var(--surface); }
    .arr { background: var(--accent); color: var(--on-accent); }
    table { width: 100%; border-collapse: collapse; }
    caption { text-align: start; font-size: var(--t-small); padding-block-end: var(--s-2); }
    th, td { text-align: start; padding: var(--s-2) var(--s-4) var(--s-2) 0; vertical-align: bottom; }
    .lh .n { text-align: end; }
    .split { display: block; font: 800 clamp(2.5rem, 6vw, 4.5rem) / 0.95 var(--font-display); font-stretch: 75%; }
    .note, .todo { display: block; font-size: var(--t-small); color: var(--ink-2); }
    .tags { display: flex; flex-wrap: wrap; gap: var(--s-3); }
    .links a { display: block; font: 800 clamp(1.75rem, 4vw, 3rem) / 1.1 var(--font-display); min-height: var(--target); color: inherit; text-decoration: underline; }
  `,
})
export class ColophonPage {
  protected readonly updated = EDITION_UPDATED;
  protected readonly lhDate = LH_DATE;
  protected readonly pages = LH_PAGES;
  protected readonly rows = LH_ROWS;
  protected readonly limit = isAtLimit;
}
