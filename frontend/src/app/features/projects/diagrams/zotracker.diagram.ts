import { Component } from '@angular/core';

/** Architecture de Zotracker (facts-v2, « Architecture »). Le nœud orange est le maillon fragile le jour de la course. */
@Component({
  selector: 'app-zotracker-diagram',
  styleUrl: './diagram.css',
  template: `
    <figure>
      <svg class="h" viewBox="0 0 900 330" role="img" aria-labelledby="zotracker-h-t zotracker-h-d">
        <title id="zotracker-h-t" i18n>Architecture de Zotracker</title>
        <desc id="zotracker-h-d" i18n>Le GPS du téléphone du coureur, qui peut se couper quand l'écran se verrouille, envoie la position au serveur Node.js avec une clé traceur. Le serveur la projette sur le tracé GPX, calcule l'allure et les heures de passage, puis diffuse en temps réel la page publique et l'administration, déclenche les alertes par Web Push et ntfy, et enregistre l'état dans des fichiers JSON. Une simulation optionnelle réinjecte un coureur virtuel dans le même flux.</desc>
        <defs>
          <marker id="zotracker-ah-h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 10 5 0 10z" class="d-ah" /></marker>
          <marker id="zotracker-hh-h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 10 5 0 10z" class="d-hah" /></marker>
        </defs>
        <rect class="d-wall" x="0" y="50" width="200" height="120" />
        <text class="d-w" x="16" y="80" i18n>GPS du téléphone</text>
        <text class="d-ws" x="16" y="104" i18n>navigateur ou appli</text>
        <text class="d-ws" x="16" y="128" i18n>coupé si l'écran</text>
        <text class="d-ws" x="16" y="148" i18n>se verrouille</text>

        <rect class="d-box" x="0" y="230" width="200" height="90" />
        <text class="d-t" x="16" y="262" i18n>Simulation</text>
        <text class="d-s" x="16" y="286" i18n>coureur virtuel</text>
        <text class="d-s" x="16" y="306" i18n>optionnelle</text>

        <rect class="d-box" x="300" y="40" width="220" height="250" />
        <text class="d-t" x="316" y="72" i18n>Serveur Node.js</text>
        <text class="d-s" x="316" y="98" i18n>projette la position</text>
        <text class="d-s" x="316" y="118" i18n>sur le tracé GPX,</text>
        <text class="d-s" x="316" y="138" i18n>calcule allure et</text>
        <text class="d-s" x="316" y="158" i18n>heures de passage</text>

        <rect class="d-box" x="650" y="10" width="250" height="80" />
        <text class="d-t" x="666" y="42" i18n>Page publique et admin</text>
        <text class="d-s" x="666" y="66" i18n>suivi en direct</text>

        <rect class="d-box" x="650" y="125" width="250" height="80" />
        <text class="d-t" x="666" y="157" i18n>Alertes</text>
        <text class="d-s" x="666" y="181" i18n>Web Push, ntfy (SOS privés)</text>

        <rect class="d-box" x="650" y="240" width="250" height="80" />
        <text class="d-t" x="666" y="272">state.json, secrets.json</text>
        <text class="d-s" x="666" y="296" i18n>stockage en fichiers JSON</text>

        <path class="d-a d-hot" d="M200 110H298" marker-end="url(#zotracker-hh-h)" />
        <text class="d-s" x="206" y="98" i18n>clé traceur</text>
        <path class="d-a d-opt" d="M200 275H298" marker-end="url(#zotracker-ah-h)" />
        <path class="d-a" d="M520 52H648" marker-end="url(#zotracker-ah-h)" />
        <text class="d-s" x="526" y="40" i18n>temps réel (SSE)</text>
        <path class="d-a" d="M520 165H648" marker-end="url(#zotracker-ah-h)" />
        <path class="d-a" d="M520 280H648" marker-end="url(#zotracker-ah-h)" />
      </svg>
      <svg class="v" viewBox="0 0 360 640" role="img" aria-labelledby="zotracker-v-t zotracker-v-d">
        <title id="zotracker-v-t" i18n>Architecture de Zotracker</title>
        <desc id="zotracker-v-d" i18n>Le GPS du téléphone, qui peut se couper quand l'écran se verrouille, envoie la position au serveur Node.js, qui la projette sur le tracé GPX puis alimente la page publique et l'administration en temps réel, les alertes Web Push et ntfy, et des fichiers JSON. Une simulation optionnelle réinjecte un coureur virtuel dans le serveur.</desc>
        <defs>
          <marker id="zotracker-ah-v" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 10 5 0 10z" class="d-ah" /></marker>
          <marker id="zotracker-hh-v" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 10 5 0 10z" class="d-hah" /></marker>
        </defs>
        <rect class="d-wall" x="40" y="0" width="280" height="80" />
        <text class="d-w" x="56" y="28" i18n>GPS du téléphone</text>
        <text class="d-ws" x="56" y="50" i18n>navigateur ou appli</text>
        <text class="d-ws" x="56" y="70" i18n>coupé si l'écran se verrouille</text>
        <path class="d-a d-hot" d="M180 80V128" marker-end="url(#zotracker-hh-v)" />
        <text class="d-s" x="192" y="110" i18n>clé traceur</text>
        <rect class="d-box" x="40" y="130" width="280" height="96" />
        <text class="d-t" x="56" y="160" i18n>Serveur Node.js</text>
        <text class="d-s" x="56" y="184" i18n>projette sur le tracé GPX,</text>
        <text class="d-s" x="56" y="204" i18n>allure et heures de passage</text>
        <path class="d-a" d="M40 178H16V502" />
        <path class="d-a" d="M16 302H38" marker-end="url(#zotracker-ah-v)" />
        <path class="d-a" d="M16 402H38" marker-end="url(#zotracker-ah-v)" />
        <path class="d-a" d="M16 502H38" marker-end="url(#zotracker-ah-v)" />
        <rect class="d-box" x="40" y="270" width="280" height="64" />
        <text class="d-t" x="56" y="300" i18n>Page publique et admin</text>
        <text class="d-s" x="56" y="322" i18n>temps réel (SSE)</text>
        <rect class="d-box" x="40" y="370" width="280" height="64" />
        <text class="d-t" x="56" y="400" i18n>Alertes</text>
        <text class="d-s" x="56" y="422" i18n>Web Push, ntfy (SOS privés)</text>
        <rect class="d-box" x="40" y="470" width="280" height="64" />
        <text class="d-t" x="56" y="500">state.json, secrets.json</text>
        <text class="d-s" x="56" y="522" i18n>stockage en fichiers JSON</text>
        <path class="d-a d-opt" d="M320 602H344V178H322" marker-end="url(#zotracker-ah-v)" />
        <rect class="d-box" x="40" y="570" width="280" height="64" />
        <text class="d-t" x="56" y="600" i18n>Simulation</text>
        <text class="d-s" x="56" y="622" i18n>coureur virtuel, optionnelle</text>
      </svg>
      <figcaption i18n>Un trait plein : appel systématique. Pointillé : optionnel. Orange : le maillon fragile le jour de la course, le GPS du téléphone.</figcaption>
    </figure>
  `,
})
export class ZotrackerDiagram {}
