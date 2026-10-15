import { Component } from '@angular/core';

/** Architecture d'Oltre (facts-v2, « Architecture »). Deux gabarits du même schéma, un seul visible. */
@Component({
  selector: 'app-oltre-diagram',
  styleUrl: './diagram.css',
  template: `
    <figure>
      <svg class="h" viewBox="0 0 900 330" role="img" aria-labelledby="oltre-h-t oltre-h-d">
        <title id="oltre-h-t" i18n>Architecture d'Oltre</title>
        <desc id="oltre-h-d" i18n>Le frontend Angular appelle le backend Spring Boot en REST avec un jeton JWT. Le backend lit MySQL, appelle le service garmin-mcp avec un jeton interne, qui interroge l'API Garmin Connect non officielle (le point fragile). Le backend appelle aussi Gemini pour le coach, de façon optionnelle.</desc>
        <defs>
          <marker id="oltre-ah-h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 10 5 0 10z" class="d-ah" /></marker>
          <marker id="oltre-hh-h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 10 5 0 10z" class="d-hah" /></marker>
        </defs>
        <rect class="d-box" x="0" y="125" width="170" height="80" />
        <text class="d-t" x="16" y="158" i18n>Frontend Angular</text>
        <text class="d-s" x="16" y="182" i18n>nginx, SPA</text>

        <rect class="d-box" x="290" y="85" width="200" height="160" />
        <text class="d-t" x="306" y="118" i18n>Backend Spring Boot</text>
        <text class="d-s" x="306" y="144" i18n>sport, dépenses, tâches,</text>
        <text class="d-s" x="306" y="164" i18n>rendez-vous, repas, coach</text>
        <text class="d-s" x="306" y="196" i18n>Sécurité stateless (JWT)</text>

        <rect class="d-box" x="640" y="10" width="170" height="70" />
        <text class="d-t" x="656" y="42">MySQL 8.4</text>
        <text class="d-s" x="656" y="64" i18n>schéma Flyway</text>

        <rect class="d-box" x="620" y="125" width="130" height="80" />
        <text class="d-t" x="636" y="158">garmin-mcp</text>
        <text class="d-s" x="636" y="182" i18n>REST, Python</text>

        <rect class="d-wall" x="780" y="125" width="120" height="80" />
        <text class="d-w" x="792" y="152">Garmin</text>
        <text class="d-w" x="792" y="170">Connect</text>
        <text class="d-ws" x="792" y="192" i18n>non officielle</text>

        <rect class="d-box" x="640" y="250" width="170" height="70" />
        <text class="d-t" x="656" y="282">Gemini</text>
        <text class="d-s" x="656" y="304" i18n>coach, optionnel</text>

        <path class="d-a" d="M170 165H288" marker-end="url(#oltre-ah-h)" />
        <text class="d-s" x="180" y="152">REST + JWT</text>
        <path class="d-a" d="M490 105H560V45H638" marker-end="url(#oltre-ah-h)" />
        <text class="d-s" x="500" y="97">JPA</text>
        <path class="d-a" d="M490 165H618" marker-end="url(#oltre-ah-h)" />
        <text class="d-s" x="498" y="152" i18n>jeton interne</text>
        <path class="d-a d-hot" d="M750 165H778" marker-end="url(#oltre-hh-h)" />
        <path class="d-a d-opt" d="M490 225H560V285H638" marker-end="url(#oltre-ah-h)" />
        <text class="d-s" x="500" y="248" i18n>clé API</text>
      </svg>
      <svg class="v" viewBox="0 0 360 560" role="img" aria-labelledby="oltre-v-t oltre-v-d">
        <title id="oltre-v-t" i18n>Architecture d'Oltre</title>
        <desc id="oltre-v-d" i18n>Frontend Angular, puis backend Spring Boot, qui lit MySQL, appelle garmin-mcp puis Garmin Connect (API non officielle, point fragile), et appelle Gemini de façon optionnelle.</desc>
        <defs>
          <marker id="oltre-ah-v" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 10 5 0 10z" class="d-ah" /></marker>
          <marker id="oltre-hh-v" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 10 5 0 10z" class="d-hah" /></marker>
        </defs>
        <rect class="d-box" x="40" y="0" width="280" height="64" />
        <text class="d-t" x="56" y="30" i18n>Frontend Angular</text>
        <text class="d-s" x="56" y="50" i18n>nginx, SPA</text>
        <path class="d-a" d="M180 64V112" marker-end="url(#oltre-ah-v)" />
        <text class="d-s" x="192" y="94">REST + JWT</text>
        <rect class="d-box" x="40" y="114" width="280" height="104" />
        <text class="d-t" x="56" y="144" i18n>Backend Spring Boot</text>
        <text class="d-s" x="56" y="168" i18n>sport, dépenses, tâches,</text>
        <text class="d-s" x="56" y="188" i18n>rendez-vous, repas, coach</text>
        <path class="d-a" d="M110 218V266" marker-end="url(#oltre-ah-v)" />
        <text class="d-s" x="120" y="248">JPA</text>
        <rect class="d-box" x="40" y="268" width="140" height="64" />
        <text class="d-t" x="56" y="298">MySQL 8.4</text>
        <text class="d-s" x="56" y="318" i18n>Flyway</text>
        <path class="d-a" d="M260 218V266" marker-end="url(#oltre-ah-v)" />
        <text class="d-s" x="270" y="246" i18n>jeton</text>
        <rect class="d-box" x="200" y="268" width="120" height="64" />
        <text class="d-t" x="212" y="298">garmin-mcp</text>
        <text class="d-s" x="212" y="318">REST</text>
        <path class="d-a d-hot" d="M260 332V380" marker-end="url(#oltre-hh-v)" />
        <rect class="d-wall" x="160" y="382" width="160" height="80" />
        <text class="d-w" x="174" y="410">Garmin Connect</text>
        <text class="d-ws" x="174" y="434" i18n>API non officielle</text>
        <path class="d-a d-opt" d="M40 190H20V510H38" marker-end="url(#oltre-ah-v)" />
        <text class="d-s" x="30" y="420" i18n>clé API</text>
        <rect class="d-box" x="40" y="478" width="190" height="64" />
        <text class="d-t" x="56" y="508">Gemini</text>
        <text class="d-s" x="56" y="528" i18n>coach, optionnel</text>
      </svg>
      <figcaption i18n>Un trait plein : appel systématique. Pointillé : optionnel. Orange : la dépendance sur laquelle je n'ai aucune prise.</figcaption>
    </figure>
  `,
})
export class OltreDiagram {}
