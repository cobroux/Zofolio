import { Component } from '@angular/core';

/** Architecture de GFaim (facts-v2, « Architecture »). Le nœud orange est l'étape manuelle : le certificat de l'API externe. */
@Component({
  selector: 'app-gfaim-diagram',
  styleUrl: './diagram.css',
  template: `
    <figure>
      <svg class="h" viewBox="0 0 900 330" role="img" aria-labelledby="gfaim-h-t gfaim-h-d">
        <title id="gfaim-h-t" i18n>Architecture de GFaim</title>
        <desc id="gfaim-h-d" i18n>L'application Android native appelle l'API Quarkus avec un jeton JWT signé en RSA. L'API lit une base PostgreSQL et interroge l'API externe Spoonacular en HTTPS, avec un certificat importé à la main.</desc>
        <defs>
          <marker id="gfaim-ah-h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 10 5 0 10z" class="d-ah" /></marker>
          <marker id="gfaim-hh-h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 10 5 0 10z" class="d-hah" /></marker>
        </defs>
        <rect class="d-box" x="0" y="125" width="190" height="80" />
        <text class="d-t" x="16" y="158" i18n>Application Android</text>
        <text class="d-s" x="16" y="182" i18n>native, Java</text>

        <rect class="d-box" x="320" y="85" width="240" height="160" />
        <text class="d-t" x="336" y="118" i18n>API GFaim (Quarkus)</text>
        <text class="d-s" x="336" y="144" i18n>Java 21, gestion des repas</text>
        <text class="d-s" x="336" y="164" i18n>jeton JWT signé en RSA</text>
        <text class="d-s" x="336" y="196" i18n>doc OpenAPI (Swagger)</text>

        <rect class="d-box" x="650" y="20" width="230" height="80" />
        <text class="d-t" x="666" y="52">PostgreSQL</text>
        <text class="d-s" x="666" y="76" i18n>lancé par Docker Compose</text>

        <rect class="d-wall" x="640" y="215" width="260" height="100" />
        <text class="d-w" x="656" y="247">Spoonacular</text>
        <text class="d-ws" x="656" y="271" i18n>API externe, HTTPS</text>
        <text class="d-ws" x="656" y="293" i18n>certificat importé à la main</text>

        <path class="d-a" d="M190 165H318" marker-end="url(#gfaim-ah-h)" />
        <text class="d-s" x="204" y="152" i18n>JWT (RSA)</text>
        <path class="d-a" d="M560 105H605V60H648" marker-end="url(#gfaim-ah-h)" />
        <path class="d-a d-hot" d="M560 225H600V265H638" marker-end="url(#gfaim-hh-h)" />
      </svg>
      <svg class="v" viewBox="0 0 360 500" role="img" aria-labelledby="gfaim-v-t gfaim-v-d">
        <title id="gfaim-v-t" i18n>Architecture de GFaim</title>
        <desc id="gfaim-v-d" i18n>L'application Android native appelle l'API Quarkus avec un jeton JWT. L'API lit une base PostgreSQL et interroge l'API externe Spoonacular, avec un certificat importé à la main.</desc>
        <defs>
          <marker id="gfaim-ah-v" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 10 5 0 10z" class="d-ah" /></marker>
          <marker id="gfaim-hh-v" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 10 5 0 10z" class="d-hah" /></marker>
        </defs>
        <rect class="d-box" x="40" y="0" width="280" height="64" />
        <text class="d-t" x="56" y="30" i18n>Application Android</text>
        <text class="d-s" x="56" y="50" i18n>native, Java</text>
        <path class="d-a" d="M180 64V112" marker-end="url(#gfaim-ah-v)" />
        <text class="d-s" x="192" y="94" i18n>JWT (RSA)</text>
        <rect class="d-box" x="40" y="114" width="280" height="104" />
        <text class="d-t" x="56" y="144" i18n>API GFaim (Quarkus)</text>
        <text class="d-s" x="56" y="168" i18n>Java 21, gestion des repas</text>
        <text class="d-s" x="56" y="188" i18n>doc OpenAPI (Swagger)</text>
        <path class="d-a" d="M180 218V266" marker-end="url(#gfaim-ah-v)" />
        <rect class="d-box" x="40" y="268" width="280" height="64" />
        <text class="d-t" x="56" y="298">PostgreSQL</text>
        <text class="d-s" x="56" y="320" i18n>lancé par Docker Compose</text>
        <path class="d-a d-hot" d="M320 166H344V420H322" marker-end="url(#gfaim-hh-v)" />
        <rect class="d-wall" x="40" y="372" width="280" height="96" />
        <text class="d-w" x="56" y="402">Spoonacular</text>
        <text class="d-ws" x="56" y="426" i18n>API externe, HTTPS</text>
        <text class="d-ws" x="56" y="448" i18n>certificat importé à la main</text>
      </svg>
      <figcaption i18n>Un trait plein : appel systématique. Orange : l'étape manuelle, un certificat à importer sur chaque machine.</figcaption>
    </figure>
  `,
})
export class GfaimDiagram {}
