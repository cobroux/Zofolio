import { Component } from '@angular/core';

@Component({
  selector: 'app-legal',
  template: `
    <main>
      <h1 i18n>Mentions légales</h1>
      <h2 i18n>Éditeur</h2>
      <p i18n>Enzo Leveque, [À FOURNIR : statut (particulier ou autre) et adresse postale ou domiciliation]. Directeur de la publication : Enzo Leveque. Contact : [À FOURNIR : adresse e-mail de contact].</p>
      <h2 i18n>Hébergeur</h2>
      <p i18n>Hetzner Online GmbH, [À FOURNIR : adresse et coordonnées de l'hébergeur, à reprendre du site de Hetzner]. Serveur situé dans l'Union européenne.</p>
      <h2 i18n>Données du formulaire de contact</h2>
      <p i18n>Le formulaire collecte votre nom, votre adresse e-mail, votre société (facultative) et votre message, pour répondre à votre demande. Une empreinte chiffrée de votre adresse IP est conservée uniquement pour limiter le nombre d'envois (5 par heure). Aucun e-mail automatique ne vous est envoyé.</p>
      <h2 i18n>Conservation</h2>
      <p i18n>Les messages sont conservés 12 mois, puis supprimés. [À FOURNIR : confirmation d'Enzo de la durée de 12 mois, plan §7 question 5]</p>
      <h2 i18n>Vos droits</h2>
      <p i18n>Vous pouvez demander l'accès, la rectification ou la suppression de vos données (RGPD) en écrivant à [À FOURNIR : adresse e-mail de contact]. Vous pouvez aussi saisir la CNIL (cnil.fr).</p>
      <h2 i18n>Cookies</h2>
      <p i18n>[À FOURNIR : confirmation qu'aucun cookie ni traceur n'est déposé en V1]</p>
      <h2 i18n>Crédits</h2>
      <p i18n>Photographies : [À FOURNIR : crédits photo, dont l'accord du photographe pour IMG_2487].</p>
    </main>
  `,
  styles: `
    main { max-width: var(--measure); padding: var(--s-9) var(--margin); }
    h1 { font-family: var(--font-display); font-size: var(--t-display); margin: 0 0 var(--s-6); }
    h2 { font-family: var(--font-display); font-size: var(--t-lead); margin: var(--s-6) 0 var(--s-2); }
    p { margin: 0; }
  `,
})
export class LegalPage {}
