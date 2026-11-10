import { Component } from '@angular/core';

// Identifiants i18n fixes (@@legal.*) : une retouche du texte ne casse pas la traduction EN.
@Component({
  selector: 'app-legal',
  template: `
    <div>
      <h1 i18n>Mentions légales</h1>
      <h2 i18n>Éditeur</h2>
      <p i18n="@@legal.editor">Enzo Leveque, particulier, directeur de la publication. Contact : enzo.lvq12@gmail.com. Conformément à l'article 6-III-2 de la LCEN, l'adresse de l'éditeur non professionnel est communiquée à l'hébergeur.</p>
      <h2 i18n>Hébergeur</h2>
      <p i18n="@@legal.host">Oracle France SAS (Oracle Cloud Infrastructure), 15 boulevard Charles de Gaulle, 92715 Colombes Cedex, France, +33 1 57 60 20 20. Serveurs situés en région Paris (Union européenne).</p>
      <h2 i18n>Données du formulaire de contact</h2>
      <p i18n="@@legal.form">Le formulaire collecte votre nom, votre adresse e-mail, votre société (facultative) et votre message, uniquement pour répondre à votre demande. Responsable du traitement : Enzo Leveque. Base légale : l'intérêt légitime à répondre aux demandes reçues (article 6-1-f du RGPD). Une empreinte (hachage) de votre adresse IP sert uniquement à limiter le nombre d'envois (5 par heure). Aucun e-mail automatique ne vous est envoyé.</p>
      <h2 i18n="@@legal.recipients.title">Destinataires</h2>
      <p i18n="@@legal.recipients">Seul l'éditeur lit les messages. Ils sont stockés chez Oracle (région Paris, Union européenne) et transmis par e-mail via Google (Gmail), ce qui peut impliquer un transfert vers les États-Unis encadré par le Data Privacy Framework.</p>
      <h2 i18n>Conservation</h2>
      <p i18n="@@legal.retention">Les messages sont supprimés automatiquement de la base au bout de 12 mois ; la copie reçue par e-mail est supprimée dans le même délai.</p>
      <h2 i18n>Vos droits</h2>
      <p i18n="@@legal.rights">Vous pouvez demander l'accès à vos données, leur rectification, leur effacement, la limitation du traitement, vous y opposer ou en obtenir la portabilité, en écrivant à enzo.lvq12@gmail.com. Réponse sous un mois. Vous pouvez aussi saisir la CNIL (cnil.fr).</p>
      <h2 i18n>Cookies</h2>
      <p i18n="@@legal.cookies">Aucun cookie ni traceur de mesure d'audience n'est déposé chez les visiteurs. Le stockage du navigateur sert uniquement à mémoriser le thème choisi (localStorage) et certaines animations déjà vues (sessionStorage, effacé à la fermeture de l'onglet). L'espace d'administration, réservé à l'éditeur, utilise un cookie de session technique. Ces usages sont strictement nécessaires et exemptés de consentement.</p>
      <h2 i18n>Crédits</h2>
      <p i18n="@@legal.credits">Photographies : droits réservés à leurs auteurs. Pour toute demande de retrait d'une image : enzo.lvq12@gmail.com. Les logos de technologies sont des marques de leurs détenteurs respectifs, cités sans affiliation.</p>
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
