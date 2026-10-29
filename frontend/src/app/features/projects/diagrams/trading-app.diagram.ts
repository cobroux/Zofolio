import { Component } from '@angular/core';
import { Reveal } from '../../../shared/reveal/reveal';

/** Parcours d'un ordre (SPEC : vue d'ensemble, aucune architecture ni nom de client). Les étapes entrent une à une (DESIGN §7). */
@Component({
  selector: 'app-trading-app-diagram',
  imports: [Reveal],
  styleUrl: './diagram.css',
  template: `
    <figure>
      <svg class="h" viewBox="0 0 900 330" role="img" aria-labelledby="trading-h-t trading-h-d">
        <title id="trading-h-t" i18n>Le parcours d'un ordre de bourse</title>
        <desc id="trading-h-d" i18n>Un professionnel de la finance saisit un ordre d'achat ou de vente dans l'application. L'ordre passe des contrôles stricts (le point où aucune approximation n'est permise), puis part de façon asynchrone vers la bourse, qui l'exécute. La confirmation revient jusqu'au professionnel.</desc>
        <defs>
          <marker id="trading-ah-h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 10 5 0 10z" class="d-ah" /></marker>
          <marker id="trading-hh-h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 10 5 0 10z" class="d-hah" /></marker>
        </defs>
        <g appReveal="0">
          <rect class="d-box" x="0" y="105" width="170" height="100" />
          <text class="d-t" x="16" y="138" i18n>Professionnel</text>
          <text class="d-s" x="16" y="162" i18n>de la finance,</text>
          <text class="d-s" x="16" y="184" i18n>saisit un ordre</text>
        </g>
        <g appReveal="1">
          <path class="d-a" d="M170 155H241" marker-end="url(#trading-ah-h)" />
          <text class="d-s" x="180" y="142" i18n>ordre</text>
          <rect class="d-box" x="243" y="105" width="170" height="100" />
          <text class="d-t" x="259" y="138" i18n>Application</text>
          <text class="d-s" x="259" y="162" i18n>achat et vente</text>
          <text class="d-s" x="259" y="184" i18n>de titres</text>
        </g>
        <g appReveal="2">
          <path class="d-a d-hot" d="M413 155H484" marker-end="url(#trading-hh-h)" />
          <rect class="d-wall" x="486" y="105" width="170" height="100" />
          <text class="d-w" x="502" y="138" i18n>Contrôles</text>
          <text class="d-ws" x="502" y="162" i18n>aucune</text>
          <text class="d-ws" x="502" y="184" i18n>approximation</text>
        </g>
        <g appReveal="3">
          <path class="d-a d-hot" d="M656 155H728" marker-end="url(#trading-hh-h)" />
          <text class="d-s" x="662" y="96" i18n>envoi</text>
          <text class="d-s" x="662" y="118" i18n>asynchrone</text>
          <rect class="d-box" x="730" y="105" width="170" height="100" />
          <text class="d-t" x="746" y="138" i18n>Bourse</text>
          <text class="d-s" x="746" y="162" i18n>exécute l'ordre</text>
        </g>
        <g appReveal="4">
          <path class="d-a d-opt" d="M815 205V285H85V207" marker-end="url(#trading-ah-h)" />
          <text class="d-s" x="380" y="312" i18n>confirmation d'exécution</text>
        </g>
      </svg>
      <svg class="v" viewBox="0 0 360 470" role="img" aria-labelledby="trading-v-t trading-v-d">
        <title id="trading-v-t" i18n>Le parcours d'un ordre de bourse</title>
        <desc id="trading-v-d" i18n>Le professionnel saisit un ordre dans l'application, l'ordre passe des contrôles stricts (aucune approximation permise), part de façon asynchrone vers la bourse qui l'exécute, et la confirmation revient au professionnel.</desc>
        <defs>
          <marker id="trading-ah-v" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 10 5 0 10z" class="d-ah" /></marker>
          <marker id="trading-hh-v" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 10 5 0 10z" class="d-hah" /></marker>
        </defs>
        <g appReveal="0">
          <rect class="d-box" x="40" y="0" width="280" height="64" />
          <text class="d-t" x="56" y="28" i18n>Professionnel</text>
          <text class="d-s" x="56" y="50" i18n>saisit un ordre</text>
        </g>
        <g appReveal="1">
          <path class="d-a" d="M180 64V114" marker-end="url(#trading-ah-v)" />
          <rect class="d-box" x="40" y="116" width="280" height="64" />
          <text class="d-t" x="56" y="144" i18n>Application</text>
          <text class="d-s" x="56" y="166" i18n>achat et vente de titres</text>
        </g>
        <g appReveal="2">
          <path class="d-a d-hot" d="M180 180V230" marker-end="url(#trading-hh-v)" />
          <rect class="d-wall" x="40" y="232" width="280" height="64" />
          <text class="d-w" x="56" y="260" i18n>Contrôles</text>
          <text class="d-ws" x="56" y="282" i18n>aucune approximation</text>
        </g>
        <g appReveal="3">
          <path class="d-a d-hot" d="M180 296V346" marker-end="url(#trading-hh-v)" />
          <text class="d-s" x="200" y="327" i18n>envoi asynchrone</text>
          <rect class="d-box" x="40" y="348" width="280" height="64" />
          <text class="d-t" x="56" y="376" i18n>Bourse</text>
          <text class="d-s" x="56" y="398" i18n>exécute l'ordre</text>
        </g>
        <g appReveal="4">
          <path class="d-a d-opt" d="M40 380H16V32H38" marker-end="url(#trading-ah-v)" />
          <text class="d-s" x="40" y="450" i18n>Retour : confirmation d'exécution</text>
        </g>
      </svg>
    </figure>
  `,
})
export class TradingAppDiagram {}
