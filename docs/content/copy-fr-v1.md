# Textes FR du V1 (T3)

Statut : VALIDÉ par Enzo le 2026-10-15 (hors [À FOURNIR] restants). Mis à jour le 2026-10-16 (retours d'Enzo : P1, P3, Journal, Arrivée).

Date : 2026-10-15. Rien n'est validé. Worldline : validation d'Enzo obligatoire avant tout usage (SPEC §9).
Sources : `facts-v1.md`, faits ajoutés par Enzo (CV oct. 2026, course), SPEC §1, DESIGN §1 et §5, plan §4.1 et §4.3.
Règles appliquées : « je » sobre, jamais de tutoiement, une touche de fun par section au plus, pas d'eyebrow, pas de mot accentué dans un titre, titres sur 2 lignes maximum, chiffres au format FR (`13 h 35 min 53 s`, `79,4 km`, `3 160 m`).
Worldline : ni client, ni architecture, ni nom de produit.
Les trous s'écrivent `[À FOURNIR : ...]`. 
---

## 0. Meta et transversal

| Clé | Texte |
|---|---|
| `meta.title` | Enzo Leveque, ingénieur fullstack Java / Spring Boot et Angular |
| `meta.description` | Portfolio d'Enzo Leveque : 2,5 ans sur une application de trading chez Worldline, des projets perso nés de la course, et un Grand Trail d'Auvergne en 13 h 35 min 53 s. |
| `meta.legal.title` | Mentions légales, Enzo Leveque |
| `meta.legal.description` | Éditeur, hébergeur et traitement des données du formulaire de contact. |
| `nav.depart` | Départ |
| `nav.p1` | Fondations |
| `nav.p2` | Worldline |
| `nav.p3` | Projets |
| `nav.journal` | Journal |
| `nav.arrivee` | Arrivée |
| `footer.line` | Enzo Leveque · GitHub · LinkedIn (la phrase Phidippides passe sous le formulaire, voir `arrivee.foot`) |
| `footer.legal` | Mentions légales |
| `footer.skip` | Aller au contenu |
| `profile.label` | Profil d'altitude du Grand Trail d'Auvergne 2025 |
| `404.title` | Page introuvable |
| `404.body` | Vous êtes hors parcours. Le balisage reprend à l'accueil. |
| `404.cta` | Retour au départ |

## 1. Départ (hero)

| Clé | Texte |
|---|---|
| `hero.h1` | Enzo Leveque |
| `hero.title` | Ingénieur fullstack Java / Spring Boot + Angular |
| `hero.lead` | 2,5 ans sur une application de trading critique chez Worldline. |
| `hero.stack` | Java · Spring Boot · Angular · Docker · SQL |
| `hero.cta.cv` | Télécharger le CV |
| `hero.cta.contact` | Me contacter |
| `hero.split` | Départ 6 h 30 · km 0 |
| `hero.bib` | 1592 |
| `hero.keyfact` | 2,5 ans · Worldline · trading |
| `hero.photo.alt` | Enzo Leveque en tenue de trail, devant un ciel bleu. |

## 2. P1 : Les fondations (km 20)

| Clé | Texte |
|---|---|
| `p1.title` | Les fondations |
| `p1.lead` | Une licence et un Master en informatique à l'Université d'Artois, dont deux ans en alternance. Les projets ci-dessous sont écrits à la main et livrés dans le temps imparti. |
| `p1.master.title` | Master Ingénierie Logicielle pour l'Internet (ILI) |
| `p1.master.body` | Licence informatique (2020-2023) puis Master ILI (2023-2025) à l'Université d'Artois, dont deux ans en alternance chez Worldline. |
| `p1.licence` | Licence informatique, Université d'Artois, 2020-2023 (mini-frise : Licence 2020-2023, puis Master 2023-2025). |
| `p1.tag` | Écrit à la main |
| `p1.note` | Voie romaine sur le GR3 : c'est à peu près ici que le trail devient sérieux. |
| `p1.card1` | LISP-Interpretor : un interpréteur Lisp écrit en Java, avec son lecteur, son évaluateur et son environnement. Java. github.com/cobroux/LISP-Interpretor |
| `p1.card2` | BomberStudent : un Bomberman en réseau, client et serveur communiquant par sockets. C. github.com/cobroux/BomberStudent |
| `p1.card3` | Calculateur DPE : une application qui calcule le DPE médian d'une rue, d'une ville ou d'un département, livrée avec sa chaîne CI/CD (projet DevOps). Java EE · JSF · Docker Compose · Elasticsearch · Nginx. github.com/cobroux/Projet-JAI-Devops-DPE-calculator |

Remarque : le logo de la promo ILI est exclu du V1 sans l'accord écrit de l'enseignant représenté (plan §5).

### R1 : Ravitaillement, brancardier

| Clé | Texte |
|---|---|
| `r1.title` | Brancardier aux urgences |
| `r1.body` | De 2020 à 2023, au centre hospitalier de Beuvry. Garder la tête froide et parler clairement quand tout va vite : un entraînement qui sert encore devant un incident de production. |
| `r1.ration` | 2020 à 2023 · urgences · CH de Beuvry |
| `r1.fun` | Ravito : badge d'accès. |

## 3. P2 : Worldline (km 44)

Aplat inversé, la plus longue étape. Tout le bloc est soumis à validation d'Enzo.

| Clé | Texte |
|---|---|
| `p2.title` | 2,5 ans sur une appli de trading |
| `p2.lead` | Chez Worldline, de 2023 à 2025 : 2,5 ans d'expérience professionnelle. L'application permet à des professionnels de la finance d'acheter et de vendre des titres en bourse. Ici, une erreur ne se voit pas dans un log : elle se voit dans un ordre. |
| `p2.stack` | Java · Spring Boot · JEE · Hibernate · REST · messaging asynchrone · Docker · Tomcat · GitLab CI |
| `p2.m1.title` | Développeur back-end |
| `p2.m1.dates` | Mars à août 2023 |
| `p2.m1.body` | Mes premiers mois : un projet back-end mené de bout en bout, de l'étude à la recette. |
| `p2.m1.split` | Java · SQL · Git · messaging asynchrone |
| `p2.m2.title` | Développeur fullstack |
| `p2.m2.dates` | Septembre 2023 à septembre 2025 |
| `p2.m2.body` | Des évolutions complètes, du besoin à la mise en production : analyse, code back et front, tests, revue. En équipe Scrum. |
| `p2.m2.split` | Spring Boot · Hibernate · REST · GitLab CI · Docker · Tomcat · Scrum |
| `p2.m3.title` | Une fonctionnalité, de la maquette à la prod |
| `p2.m3.body` | En dernière année, une fonctionnalité portée seul : maquette, validation avec le Product Owner, puis développement complet. |
| `p2.m3.split` | Figma · Spring · SQL |
| `p2.lesson` | Une date codée en dur a masqué un bug jusqu'en production. Depuis, je teste en conditions réelles. |
| `p2.fun` | P2 : la plus longue étape. |
| `p2.now` | Depuis juin 2026 : ingénieur d'études chez Aubay. |

## 4. R2 : Ravitaillement, tuteur L1

| Clé | Texte |
|---|---|
| `r2.title` | Tuteur en L1 |
| `r2.body` | En 2022-2023, à l'Université d'Artois, j'ai accompagné des étudiants de première année sur leurs premiers programmes. Expliquer clairement oblige à comprendre sérieusement. |
| `r2.ration` | 2022-2023 · Université d'Artois · L1 |

## 5. P3 : Nés de la course (km 58,2)

Mosaïque 7/5, 5/7, 12. Les stats (commits) datent du 15 octobre 2026 : à figer ou à retirer.

| Clé | Texte |
|---|---|
| `p3.title` | Nés de la course |
| `p3.lead` | Trois outils construits autour de mes sorties : suivre une course en direct, piloter le quotidien, relayer mes données Garmin. |
| `p3.oltre.title` | Oltre |
| `p3.oltre.pitch` | Une application personnelle de pilotage du quotidien, avec un backend Java et un frontend Angular séparés. |
| `p3.oltre.split` | Angular 22 · Java · MySQL · Docker Compose · 355 commits (backend et frontend) |
| `p3.oltre.tag` | Commencé à la main, puis IA |
| `p3.oltre.todo` | Backend Spring Boot 4.1. Projet commencé en juin 2026. |
| `p3.zotracker.title` | Zotracker |
| `p3.zotracker.pitch` | Le suivi GPS en direct d'une course à pied : carte, chrono, allure, heure d'arrivée estimée, profil d'altitude et messages des proches. |
| `p3.zotracker.split` | Node.js 22 · Docker Compose · 34 commits |
| `p3.zotracker.body` | Des alertes privées (SOS, immobile, hors parcours) préviennent les proches, et la zone de départ est masquée sur la trace publique. Un mode simulation permet de tout tester sans courir. |
| `p3.zotracker.tag` | Conçu avec IA |
| `p3.zotracker.fun` | Un mode simulation, parce que courir pour tester, c'est long. |
| `p3.garmin.title` | garmin-mcp |
| `p3.garmin.pitch` | Un service REST qui relaie mes données Garmin Connect vers Oltre. |
| `p3.garmin.split` | Python · Railway · 29 commits |
| `p3.garmin.todo` | Un serveur MCP et une API REST qui exposent mes données Garmin Connect (activités, sommeil, Body Battery) à Claude et à Oltre. Python · Docker · Railway. |
| `p3.histoquiz` | HistoQuiz : un quiz d'histoire multijoueur en temps réel, de 1914 à 1991. Java 21 · Spring Boot 4.1 · WebSocket STOMP · Angular 22 · Docker. |
| `p3.link` | Voir le dépôt (github.com/cobroux/Oltre-backend, Zotracker, garmin-mcp, histoquiz) |
| `p3.video.poster` | Démo vidéo à venir |
| `p3.video.alt` | Emplacement de la démo vidéo d'Oltre, à venir. [À FOURNIR : description du clip (V2)] |

## 6. Journal (carnet d'entraînement)

Le graphe de contributions GitHub est hors V1. Pas de classement.

| Clé | Texte |
|---|---|
| `journal.title` | Journal de course |
| `journal.lead` | 32 courses terminées, toujours un peu plus loin. Même méthode qu'au travail : mesurer, ajuster, recommencer. |
| `journal.index` | 459 |
| `journal.index.caption` | UTMB Index. Un chiffre, pas un classement. |
| `journal.col.date` | Date |
| `journal.col.race` | Course |
| `journal.col.dist` | Distance |
| `journal.col.time` | Temps |
| `journal.col.note` | Note |
| `journal.pr` | Record personnel |
| `journal.fun` | (fusionné dans `journal.index.caption`) |

| Course | Date | Distance | Temps | Note |
|---|---|---|---|---|
| Grand Trail d'Auvergne (GTA) | 11 octobre 2025 | 79,4 km, 3 160 m D+ | 13 h 35 min 53 s | Départ à 6 h 30, arrivée à 20 h 05. Une journée entière sans réunion. |
| Côte d'Opale | 13 septembre 2026 | 62 km | 7 h 32 min 39 s (record personnel) | 5 min 12 s de mieux que l'année précédente. |
| Côte d'Opale | 14 septembre 2025 | 62 km | 7 h 37 min 51 s | La référence à battre. |
| Marathon de Paris | 2026, [À FOURNIR : jour et mois] | 42,195 km | 3 h 36 min | Sous les 3 h 40, dans les rues de Paris. |
| Marathon du Louvre-Lens (La Route du Louvre) | 11 mai 2025 | 42,195 km | 3 h 56 min 05 s | Quatre minutes de moins que les 4 heures. |
| Triathlon des Moines (format M, Fourmies) | [À FOURNIR : année] | [À FOURNIR] | 2 h 28 min | Trois sports, un seul chrono. |
| Chtriman (format S) | [À FOURNIR : année] | [À FOURNIR] | 1 h 16 min | Format court, rythme soutenu. |
| Club des Baudets d'Hinges | [À FOURNIR : depuis quand] | sans objet | sans objet | Courir à plusieurs, ça change le rythme. |

## 7. Arrivée (km 79,4)

Aplat orange.

| Clé | Texte |
|---|---|
| `arrivee.split` | Arrivée 20 h 05 · km 79,4 |
| `arrivee.title` | Prochain objectif : 100 km. (2 lignes : « Prochain objectif : » / « 100 km. ») |
| `arrivee.subtitle` | Et un nouveau poste. Parlons-en. |
| `arrivee.lead` | Recherche basée à Paris. Français, anglais (TOEIC 910). |
| `arrivee.email` | enzo.lvq12@gmail.com |
| `arrivee.github` | GitHub |
| `arrivee.linkedin` | LinkedIn |
| `arrivee.cv` | Télécharger le CV |
| `arrivee.foot` | Phidippides a couru de Marathon à Athènes pour porter un message. Ici, un formulaire suffit. |

### Formulaire de contact

| Clé | Texte |
|---|---|
| `form.title` | Écrire un message |
| `form.name` | Nom |
| `form.email` | E-mail |
| `form.company` | Société (facultatif) |
| `form.message` | Message |
| `form.submit` | Envoyer le message |
| `form.sending` | Envoi en cours… |
| `form.honeypot` | Site web (ne pas remplir) |
| `form.noscript` | Sans JavaScript, écrivez directement par e-mail ou téléchargez le CV : les liens ci-dessus fonctionnent. |
| `form.success` | Message envoyé. Merci, je réponds dès que possible. |

Erreurs par champ (`VALIDATION_FAILED`, `errors[].code` = contrainte, plan §4.1 et §4.3) :

| Champ | `code` | Message |
|---|---|---|
| name | NotBlank | Indiquez votre nom. |
| name | Size | Le nom est limité à 100 caractères. |
| name | Pattern | Le nom ne peut pas contenir de saut de ligne ni de caractère de contrôle. |
| email | NotBlank | Indiquez votre adresse e-mail. |
| email | Email | Cette adresse e-mail n'a pas l'air valide. |
| email | Size | L'adresse e-mail est limitée à 254 caractères. |
| company | Size | La société est limitée à 100 caractères. |
| message | NotBlank | Écrivez un message : une page blanche ne porte pas bien loin. |
| message | Size | Le message est limité à 5 000 caractères. |

Erreurs globales (par `code` du plan §4.1, `aria-live`) :

| HTTP | `code` | Message |
|---|---|---|
| 400 | `VALIDATION_FAILED` | Quelques champs sont à corriger avant l'envoi. |
| 400 | `MALFORMED_REQUEST` | Le message n'a pas pu être lu. Rechargez la page et réessayez. |
| 429 | `RATE_LIMITED` | Trop de messages envoyés depuis cette connexion. Réessayez dans {minutes} min, ou écrivez directement à [À FOURNIR : adresse e-mail de contact]. |
| 503 | `MAIL_DELIVERY_FAILED` | Votre message est enregistré, mais la notification n'est pas partie. Pour être certain qu'il soit lu, écrivez à [À FOURNIR : adresse e-mail de contact]. |
| 500 | `INTERNAL_ERROR` | Une erreur inattendue s'est produite. Réessayez dans un instant. |
| 404 | `NOT_FOUND` | Cette ressource n'existe pas. |
| aucune réponse | réseau | Le serveur ne répond pas. Vérifiez votre connexion et réessayez. |

## 8. Alt des photos

| Clé | Alt |
|---|---|
| `photo.portrait.alt` | Enzo Leveque en tenue de trail, devant un ciel bleu. |
| `photo.IMG_0124.alt` | Enzo, médaille au cou, devant l'arche d'arrivée du Trail de la Côte d'Opale 62 km |
| `photo.IMG_7732.alt` | Enzo en pleine course, dossard sur le ventre |
| `photo.IMG_2506.alt` | non utilisée en V1 |
| `photo.IMG_2487.alt` | non utilisée en V1 |

Les photos montrant des tiers restent à recadrer (SPEC §11, plan §5).

## 9. Mentions légales

| Clé | Texte |
|---|---|
| `legal.title` | Mentions légales |
| `legal.editor.title` | Éditeur |
| `legal.editor.body` | Enzo Leveque, particulier. Contact : enzo.lvq12@gmail.com. Conformément à l'article 6-III-2 de la LCEN, l'adresse de l'éditeur non professionnel est communiquée à l'hébergeur. |
| `legal.host.title` | Hébergeur |
| `legal.host.body` | Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Allemagne, www.hetzner.com. Serveur situé dans l'Union européenne. |
| `legal.data.title` | Données du formulaire de contact |
| `legal.data.body` | Le formulaire collecte votre nom, votre adresse e-mail, votre société (facultative) et votre message, pour répondre à votre demande. Une empreinte chiffrée de votre adresse IP est conservée uniquement pour limiter le nombre d'envois (5 par heure). Aucun e-mail automatique ne vous est envoyé. |
| `legal.retention.title` | Conservation |
| `legal.retention.body` | Les messages sont conservés 12 mois, puis supprimés. |
| `legal.rights.title` | Vos droits |
| `legal.rights.body` | Vous pouvez demander l'accès, la rectification ou la suppression de vos données (RGPD) en écrivant à [À FOURNIR : adresse e-mail de contact]. Vous pouvez aussi saisir la CNIL (cnil.fr). |
| `legal.cookies` | Ce site ne dépose aucun cookie ni traceur. Seule une préférence de thème est stockée dans votre navigateur (localStorage) : elle est strictement nécessaire et exemptée de consentement. |
| `legal.credits` | Photographies : Enzo Leveque. Pour IMG_2487, si elle est utilisée plus tard : Margot et Fabien photographes, accord obtenu. |

---

## Trous restants (récapitulatif)

1. Contact : adresse e-mail publique, statut et adresse de l'éditeur.
2. Worldline : accord pour la fonctionnalité « sauvegarder et partager des recherches », le chiffre d'impact, la ligne Aubay.
3. P1 : dates de licence et de diplôme.
4. Journal : année du triathlon et du Chtriman, distances de ces deux courses, jour et mois du marathon de Paris, date du club.
5. P3 : alt du clip.
