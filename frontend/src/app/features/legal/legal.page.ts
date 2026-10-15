import { Component } from '@angular/core';

@Component({
  selector: 'app-legal',
  template: `
    <div>
      <h1 i18n>Mentions légales</h1>
      <h2 i18n>Éditeur</h2>
      <p i18n>Enzo Leveque, particulier. Contact : enzo.lvq12@gmail.com. Conformément à l'article 6-III-2 de la LCEN, l'adresse de l'éditeur non professionnel est communiquée à l'hébergeur.</p>
      <h2 i18n>Hébergeur</h2>
      <p i18n>Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Allemagne, www.hetzner.com. Serveur situé dans l'Union européenne.</p>
      <h2 i18n>Données du formulaire de contact</h2>
      <p i18n>Le formulaire collecte votre nom, votre adresse e-mail, votre société (facultative) et votre message, pour répondre à votre demande. Une empreinte chiffrée de votre adresse IP est conservée uniquement pour limiter le nombre d'envois (5 par heure). Aucun e-mail automatique ne vous est envoyé.</p>
      <h2 i18n>Conservation</h2>
      <p i18n>Les messages sont conservés 12 mois, puis supprimés.</p>
      <h2 i18n>Vos droits</h2>
      <p i18n>Vous pouvez demander l'accès, la rectification ou la suppression de vos données (RGPD) en écrivant à enzo.lvq12@gmail.com. Vous pouvez aussi saisir la CNIL (cnil.fr).</p>
      <h2 i18n>Cookies</h2>
      <p i18n>Ce site ne dépose aucun cookie ni traceur. Seule une préférence de thème est stockée dans votre navigateur (localStorage) : elle est strictement nécessaire et exemptée de consentement.</p>
      <h2 i18n>Crédits</h2>
      <p i18n>Photographies : Enzo Leveque. Pour IMG_2487, si elle est utilisée plus tard : Margot et Fabien photographes, accord obtenu.</p>
    </div>
  `,
  styles: `
    div { max-width: var(--measure); padding: var(--s-9) var(--margin); }
    h1 { font-family: var(--font-display); font-size: var(--t-display); margin: 0 0 var(--s-6); }
    h2 { font-family: var(--font-display); font-size: var(--t-lead); margin: var(--s-6) 0 var(--s-2); }
    p { margin: 0; }
  `,
})
export class LegalPage {}
