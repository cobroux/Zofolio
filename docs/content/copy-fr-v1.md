# Textes FR du V1 (T3)

Statut : BROUILLON, en attente de validation d'Enzo

Date : 2026-10-15. Rien n'est validé. Worldline : validation d'Enzo obligatoire avant tout usage (SPEC §9).
Sources : `facts-v1.md`, faits ajoutés par Enzo (CV oct. 2026, course), SPEC §1, DESIGN §1 et §5, plan §4.1 et §4.3.
Règles appliquées : « je » sobre, jamais de tutoiement, une touche de fun par section au plus, pas d'eyebrow, pas de mot accentué dans un titre, titres sur 2 lignes maximum, chiffres au format FR (`13 h 35 min 53 s`, `79,4 km`, `3 160 m`).
Worldline : ni client, ni architecture, ni nom de produit.
Les trous s'écrivent `[À FOURNIR : ...]`. La maquette n'a pas été retrouvée dans le dépôt : le ton vient des deux exemples donnés par Enzo.

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
| `footer.line` | Phidippides a couru 42 km pour porter un message. Ici, un formulaire suffit. |
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
| `p1.master.body` | Université d'Artois, en alternance à partir du 18 septembre 2023. Soutenance d'alternance : « Master 2 ILI ». Date du diplôme : [À FOURNIR : date du diplôme]. |
| `p1.licence` | Licence informatique, Université d'Artois, [À FOURNIR : années de licence]. |
| `p1.tag` | Écrit à la main |
| `p1.note` | Voie romaine sur le GR3 : c'est à peu près ici que le trail devient sérieux. |
| `p1.card1` | [À FOURNIR : projet universitaire n°1 (parmi BomberStudent, Cin-folie, calculateur DPE, quarkus-color, LISP-Interpretor, ObjVLisp2023, LambdaCalcul) : titre, pitch d'une phrase, stack, lien dépôt] |
| `p1.card2` | [À FOURNIR : projet universitaire n°2, mêmes champs] |
| `p1.card3` | [À FOURNIR : projet universitaire n°3, mêmes champs] |

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
| `p2.lead` | De mars 2023 à septembre 2025, chez Worldline, à Seclin : d'abord développeur back-end, puis développeur fullstack dans une équipe Scrum. Une application de trading de titres, où une erreur ne se voit pas dans un log : elle se voit dans un ordre. |
| `p2.stack` | Java · Spring Boot · JEE · Hibernate · REST · messaging asynchrone · Docker · Tomcat · GitLab CI |
| `p2.m1.title` | Développeur back-end |
| `p2.m1.dates` | Mars à août 2023 |
| `p2.m1.body` | Un projet pris en charge de bout en bout : étude, développement, recette. Les tests techniques d'entrée portaient sur Java, SQL et Git. |
| `p2.m1.split` | Java · SQL · Git · messaging asynchrone |
| `p2.m2.title` | Développeur fullstack |
| `p2.m2.dates` | Septembre 2023 à septembre 2025 |
| `p2.m2.body` | Analyse d'impact, développement back-end en Java, évolutions du front, modifications de base de données, tests unitaires, revue de code, documentation. Le tout en sprints Scrum d'environ quatre semaines, avec Definition of Done. |
| `p2.m2.split` | Spring Boot · Hibernate · REST · GitLab CI · Docker · Tomcat · Scrum |
| `p2.m3.title` | Sauvegarder et partager des recherches |
| `p2.m3.body` | Ma fonctionnalité de dernière année, sur les écrans d'administration : analyse de l'existant, maquette Figma, validation par le Product Owner et le Scrum Master, puis développement front, back et base de données. [À FOURNIR : accord d'Enzo pour nommer cette fonctionnalité, qui touche au produit] |
| `p2.m3.split` | Figma · Spring · JPQL · SQL |
| `p2.lesson` | Une date codée en dur a masqué un bug jusqu'en production. Depuis, je teste en conditions réelles. |
| `p2.impact` | [À FOURNIR : un chiffre d'impact générique (ordre de grandeur), validé par Enzo] |
| `p2.fun` | P2 : la plus longue étape. |
| `p2.now` | Depuis juin 2026, ingénieur d'études chez Aubay. [À FOURNIR : accord d'Enzo pour afficher cette ligne ; aucun détail de mission] |

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
| `p3.oltre.todo` | [À FOURNIR : confirmation de Spring Boot dans Oltre-backend ; date de début du projet (mars 2026 ou novembre 2025)] |
| `p3.zotracker.title` | Zotracker |
| `p3.zotracker.pitch` | Le suivi GPS en direct d'une course à pied : carte, chrono, allure, heure d'arrivée estimée, profil d'altitude et messages des proches. |
| `p3.zotracker.split` | Node.js 22 · Docker Compose · 34 commits |
| `p3.zotracker.body` | Des alertes privées (SOS, immobile, hors parcours) préviennent les proches, et la zone de départ est masquée sur la trace publique. Un mode simulation permet de tout tester sans courir. |
| `p3.zotracker.tag` | Conçu avec IA |
| `p3.zotracker.fun` | Un mode simulation, parce que courir pour tester, c'est long. |
| `p3.garmin.title` | garmin-mcp |
| `p3.garmin.pitch` | Un service REST qui relaie mes données Garmin Connect vers Oltre. |
| `p3.garmin.split` | Python · Railway · 29 commits |
| `p3.garmin.todo` | [À FOURNIR : description détaillée et stack de garmin-mcp, README non lu] |
| `p3.histoquiz` | [À FOURNIR : description, stack et objectif de histoquiz (fiche courte) ; le dépôt compte 2 commits] |
| `p3.link` | Voir le projet |
| `p3.video.alt` | [À FOURNIR : description du clip vidéo d'Oltre (V2)] |

## 6. Journal (carnet d'entraînement)

Le graphe de contributions GitHub est hors V1. Pas de classement.

| Clé | Texte |
|---|---|
| `journal.title` | Journal de course |
| `journal.lead` | 32 courses terminées. UTMB Index : 459. |
| `journal.col.date` | Date |
| `journal.col.race` | Course |
| `journal.col.dist` | Distance |
| `journal.col.time` | Temps |
| `journal.col.note` | Note |
| `journal.pr` | Record personnel |
| `journal.fun` | Un chiffre, pas un classement. |

| Course | Date | Distance | Temps | Note |
|---|---|---|---|---|
| Grand Trail d'Auvergne (GTA) | 2025, [À FOURNIR : jour et mois] | 79,4 km, 3 160 m D+ | 13 h 35 min 53 s | Départ à 6 h 30, arrivée à 20 h 05. Une journée entière sans réunion. |
| Côte d'Opale | 2026, [À FOURNIR : jour et mois] | 62 km | 7 h 32 min 39 s (record personnel) | 5 min 12 s de mieux que l'année précédente. |
| Côte d'Opale | 2025, [À FOURNIR : jour et mois] | 62 km | 7 h 37 min 51 s | La référence à battre. |
| Marathon de Paris | [À FOURNIR : date] | [À FOURNIR : distance, 42,195 km à confirmer] | [À FOURNIR : temps] | [À FOURNIR : note] |
| Marathon du Louvre-Lens | [À FOURNIR : date] | [À FOURNIR] | [À FOURNIR : temps] | [À FOURNIR : note] |
| Triathlon M de Fourmies | [À FOURNIR : date] | [À FOURNIR] | [À FOURNIR : temps] | [À FOURNIR : note] |
| Ch'ti Trail S | [À FOURNIR : date] | [À FOURNIR] | [À FOURNIR : temps] | [À FOURNIR : note] |
| Club des Baudets d'Hinges | [À FOURNIR : depuis quand] | sans objet | sans objet | [À FOURNIR : note] |

## 7. Arrivée (km 79,4)

Aplat orange.

| Clé | Texte |
|---|---|
| `arrivee.title` | Prochain objectif : 100 km… et un nouveau poste |
| `arrivee.lead` | Je cherche un poste d'ingénieur fullstack Java / Spring Boot et Angular. Recherche basée à Paris. |
| `arrivee.email` | [À FOURNIR : adresse e-mail de contact] |
| `arrivee.github` | GitHub |
| `arrivee.linkedin` | LinkedIn |
| `arrivee.cv` | Télécharger le CV |
| `arrivee.langs` | Français, anglais (TOEIC 910) |
| `arrivee.foot` | 13 h 35 min 53 s. Phidippides aurait signé. |
| `arrivee.chronos` | Dossard 1592 · 79,4 km · 3 160 m D+ · 13 h 35 min 53 s |

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
| `photo.IMG_0124.alt` | [À FOURNIR : description de la photo IMG_0124] |
| `photo.IMG_7732.alt` | [À FOURNIR : description de la photo IMG_7732] |
| `photo.IMG_2506.alt` | [À FOURNIR : description de la photo IMG_2506] |
| `photo.IMG_2487.alt` | [À FOURNIR : description de la photo IMG_2487] |

Les photos montrant des tiers restent à recadrer (SPEC §11, plan §5).

## 9. Mentions légales

| Clé | Texte |
|---|---|
| `legal.title` | Mentions légales |
| `legal.editor.title` | Éditeur |
| `legal.editor.body` | Enzo Leveque, [À FOURNIR : statut (particulier ou autre) et adresse postale ou domiciliation]. Directeur de la publication : Enzo Leveque. Contact : [À FOURNIR : adresse e-mail de contact]. |
| `legal.host.title` | Hébergeur |
| `legal.host.body` | Hetzner Online GmbH, [À FOURNIR : adresse et coordonnées de l'hébergeur, à reprendre du site de Hetzner]. Serveur situé dans l'Union européenne. |
| `legal.data.title` | Données du formulaire de contact |
| `legal.data.body` | Le formulaire collecte votre nom, votre adresse e-mail, votre société (facultative) et votre message, pour répondre à votre demande. Une empreinte chiffrée de votre adresse IP est conservée uniquement pour limiter le nombre d'envois (5 par heure). Aucun e-mail automatique ne vous est envoyé. |
| `legal.retention.title` | Conservation |
| `legal.retention.body` | Les messages sont conservés 12 mois, puis supprimés. [À FOURNIR : confirmation d'Enzo de la durée de 12 mois, plan §7 question 5] |
| `legal.rights.title` | Vos droits |
| `legal.rights.body` | Vous pouvez demander l'accès, la rectification ou la suppression de vos données (RGPD) en écrivant à [À FOURNIR : adresse e-mail de contact]. Vous pouvez aussi saisir la CNIL (cnil.fr). |
| `legal.cookies` | [À FOURNIR : confirmation qu'aucun cookie ni traceur n'est déposé en V1] |
| `legal.credits` | Photographies : [À FOURNIR : crédits photo, dont l'accord du photographe pour IMG_2487]. |

---

## Trous restants (récapitulatif)

1. Contact : adresse e-mail publique, statut et adresse de l'éditeur, adresse Hetzner.
2. Worldline : accord pour la fonctionnalité « sauvegarder et partager des recherches », le chiffre d'impact, la ligne Aubay.
3. P1 : trois projets universitaires retenus (titre, pitch, stack, lien), dates de licence et de diplôme.
4. Journal : dates, distances, temps et notes des marathons, triathlon, Ch'ti Trail, Baudets d'Hinges ; jour et mois du GTA et des Côte d'Opale.
5. P3 : Spring Boot dans Oltre, date de début, descriptions de garmin-mcp et histoquiz, alt du clip.
6. Photos (alt des trois courses et IMG_2487), conservation 12 mois, cookies, crédits photo.
