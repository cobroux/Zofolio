Statut : BROUILLON, en attente de validation d'Enzo

# Textes FR du V2 « Mi-course » (T4)

Date : 2026-10-15. Rien n'est validé. Worldline : validation d'Enzo mot à mot obligatoire avant tout usage (SPEC §9).
Sources : `facts-v2-case-studies.md` (dont « Réponses d'Enzo »), `copy-fr-v1.md` (ton), plan-v2 §4.2 et §9, DESIGN §1.
Règles appliquées : « je » sobre, jamais de tutoiement, une touche de fun au plus par page, pas d'eyebrow, pas de mot accentué dans un titre, titres sur 2 lignes maximum, chiffres au format FR.
Worldline : aucune architecture, aucun nom de fonctionnalité ni de partenaire ; le nom de l'employeur est autorisé (plan §9, décision 6).
Les trous s'écrivent `[À FOURNIR : ...]`. Les chiffres de commits viennent de github-sync (`commits`), pas de ce fichier.

---

## 1. Oltre (slug `oltre`)

| Clé | Texte |
|---|---|
| `oltre.title` | Oltre |
| `oltre.pitch` | Une application personnelle pour organiser vie pro et vie perso dans un agenda complet : sport, dépenses, tâches, rendez-vous. |
| `oltre.role` | Conception et développement, seul et de zéro : backend, frontend, et la mise en place de Spring Boot et d'Angular |
| `oltre.duration` | En cours |
| `oltre.stack` | Angular 22 · Java 21 · Spring Boot 4.1 · MySQL · Docker Compose |
| `oltre.archi` | Un frontend Angular et un backend Spring Boot séparés, une base MySQL, et un petit service à part qui va chercher mes données Garmin. |
| `oltre.problem` | Mon quotidien était éparpillé : les sorties dans Garmin, les dépenses d'un côté, les tâches et les rendez-vous de l'autre. Je voulais tout voir au même endroit, avec mes activités sportives dedans. |
| `oltre.decision1.title` | Garmin dans un service séparé |
| `oltre.decision1.tradeoff` | Garmin n'offre pas d'accès officiel : j'utilise une bibliothèque non officielle, que j'ai isolée du backend. Un service de plus à lancer et à protéger, mais une dépendance fragile qui ne contamine pas le reste. Et quand Garmin refuse la connexion, l'erreur réelle remonte jusqu'à l'écran au lieu d'un message vague. |
| `oltre.decision2.title` | Gemini plutôt qu'Anthropic pour le coach IA |
| `oltre.decision2.tradeoff` | Gemini propose un tier gratuit, pas l'API Anthropic : pour un projet personnel, le choix était vite fait. Contrepartie : le coach reste muet sans clé, et le nom du modèle a déjà demandé une correction. |
| `oltre.decision3.title` | Verrouillage de connexion par e-mail et par IP |
| `oltre.decision3.tradeoff` | Un inconnu ne peut pas bloquer mon compte depuis sa propre machine. Contrepartie : le compteur vit en mémoire, il repart à zéro au redémarrage et ne se partage pas entre plusieurs instances. |
| `oltre.wall` | Le plus dur n'était pas le code : c'était de synthétiser mon idée et de lui donner forme. Passer d'un besoin flou, organiser ma vie pro et perso, à un produit concret. |
| `oltre.takeaway` | Dépendre d'une API non officielle, c'est prévoir dès le départ où elle casse, et le dire clairement à l'utilisateur. |
| `oltre.aiNote` | Commencé à la main, puis poursuivi avec l'aide de l'IA. |
| `oltre.clip.caption` | Parcours dans Oltre : dépenses, tâches, repas. Données factices. |
| `oltre.clip.alt` | Enregistrement d'écran d'Oltre : l'agenda, puis les dépenses, les tâches et les repas, avec des données factices. |
| `oltre.schema.title` | Architecture d'Oltre |
| `oltre.schema.desc` | Schéma : le frontend Angular appelle le backend Spring Boot, qui lit une base MySQL, interroge le service Garmin et, en option, l'API Gemini pour le coach IA. |
| `oltre.status` | En cours. |

## 2. Zotracker (slug `zotracker`)

| Clé | Texte |
|---|---|
| `zotracker.title` | Zotracker |
| `zotracker.pitch` | Le suivi GPS en direct d'une course à pied : mes proches me suivent sur une carte, sans rien installer. |
| `zotracker.role` | Conception et développement |
| `zotracker.duration` | Depuis octobre 2026 |
| `zotracker.stack` | Node.js 22 · JavaScript natif · Leaflet · Docker Compose · Caddy |
| `zotracker.archi` | Mon téléphone envoie sa position au serveur, qui la cale sur le tracé officiel et la diffuse en direct à la page publique. |
| `zotracker.problem` | Zotracker est né pour le marathon de Lille : mes parents, ma famille et mes amis voulaient me suivre en direct. Il fonctionne dans le navigateur, sans appli à installer, et je compte le réutiliser sur d'autres courses. |
| `zotracker.decision1.title` | Des fichiers JSON plutôt qu'une base de données |
| `zotracker.decision1.tradeoff` | Aucun service à lancer ni à sauvegarder. Contrepartie : les écritures sur disque sont à ma charge. J'ai déjà ajouté un nouvel essai en cas d'échec et un refus de démarrer si le fichier est corrompu. |
| `zotracker.decision2.title` | Un front en JavaScript natif, sans bundler |
| `zotracker.decision2.tradeoff` | Aucune étape de build. Contrepartie : du code dupliqué entre serveur et navigateur. Les statistiques sont calculées deux fois, et les deux résultats divergent déjà sur l'heure d'arrivée estimée avant le départ. |
| `zotracker.decision3.title` | Distance calculée sur le tracé GPX |
| `zotracker.decision3.tradeoff` | La distance suit le parcours officiel, sans le zigzag du GPS. Les points à plus de 100 m sont ignorés, et un écart de plus de 150 m affiche « hors parcours ». Sans fichier GPX, le serveur retombe sur les points bruts, moins précis. |
| `zotracker.wall` | Le jour de la course, tout peut lâcher : le réseau se coupe, le GPS du navigateur s'éteint quand l'écran se verrouille (sur iPhone), les alertes de sécurité doivent partir quand même. Les points sont mis en attente quand le réseau tombe ; le reste de cette fiabilité est encore à construire. |
| `zotracker.takeaway` | Une appli utilisée le jour J ne se juge pas à sa démo : elle se juge au pire moment de la course. D'où le mode simulation, pour tester sans courir. |
| `zotracker.aiNote` | Conçu avec IA. |
| `zotracker.clip.caption` | Une course simulée sur le tracé officiel du Grand Trail d'Auvergne. |
| `zotracker.clip.alt` | Enregistrement d'écran de Zotracker : un coureur virtuel avance sur la carte, avec le chrono, l'allure et le profil d'altitude. |
| `zotracker.schema.title` | Architecture de Zotracker |
| `zotracker.schema.desc` | Schéma : la position GPS arrive au serveur Node.js, qui la projette sur le tracé, calcule allure et heures de passage, puis diffuse en direct à la page publique et à l'admin, et déclenche les alertes. |
| `zotracker.status` | En cours. |

## 3. GFaim (slug `gfaim`, non déployé)

| Clé | Texte |
|---|---|
| `gfaim.title` | GFaim |
| `gfaim.pitch` | Un planificateur de repas pour une famille, mon projet de fin d'études. |
| `gfaim.role` | Équipe de quatre. Je me suis occupé du front et du back. |
| `gfaim.duration` | Janvier à mars 2025 |
| `gfaim.stack` | Java 21 · Quarkus · PostgreSQL · Docker Compose · OpenAPI |
| `gfaim.archi` | Une application Android native appelle une API Quarkus protégée par jeton, qui lit une base PostgreSQL et interroge l'API externe Spoonacular. |
| `gfaim.problem` | Un professeur voulait un planificateur de repas pour sa famille. Le cahier des charges de départ était imposé : il fallait le respecter. Ensuite, la liberté d'innover au-delà. |
| `gfaim.decision1.title` | Des jetons signés en RSA |
| `gfaim.decision1.tradeoff` | La signature se vérifie avec une clé publique, la clé privée reste à l'abri. Contrepartie : générer et distribuer les clés se fait à la main. |
| `gfaim.decision2.title` | Un certificat dédié pour l'API Spoonacular |
| `gfaim.decision2.tradeoff` | La connexion HTTPS passe par un certificat importé à la main. Contrepartie : une étape manuelle à refaire sur chaque machine. [À FOURNIR : la raison (réseau, proxy ou choix).] |
| `gfaim.wall` | Faire converger les idées de quatre personnes, et tenir les délais de livraison. |
| `gfaim.innovations` | Des fonctionnalités proposées par l'équipe au-delà du cahier des charges. |
| `gfaim.takeaway` | Un bon résultat, et une bonne expérience d'équipe. |
| `gfaim.aiNote` | `null` (non renseigné) |
| `gfaim.status` | Terminé : projet de fin d'études livré. Non déployé. |
| `gfaim.clip.caption` | [À FOURNIR : légende du clip, à écrire quand Enzo fournit le matériel] |
| `gfaim.clip.alt` | [À FOURNIR : description du clip GFaim] |
| `gfaim.schema.title` | Architecture de GFaim |
| `gfaim.schema.desc` | Schéma : l'application Android appelle l'API GFaim, qui vérifie un jeton signé, lit une base PostgreSQL et interroge l'API Spoonacular. |

## 4. Worldline (slug `trading-app`)

Tout le bloc est soumis à validation d'Enzo, mot à mot. Pas de clip, pas de schéma d'architecture, pas de dépôt.

| Clé | Texte |
|---|---|
| `trading.title` | Application de trading chez Worldline |
| `trading.pitch` | Pendant 2,5 ans, j'ai fait évoluer une application qui permet à des professionnels de la finance d'acheter et de vendre des titres en bourse. |
| `trading.role` | Développeur back-end, puis fullstack |
| `trading.duration` | 2,5 ans d'expérience professionnelle (mars 2023 à septembre 2025) |
| `trading.stack` | Java · Spring Boot · SQL · Git |
| `trading.problem` | Une application de trading n'a pas droit à l'approximation. Quand on achète ou qu'on vend des titres, une erreur ne reste pas dans un fichier de log : elle se voit dans un ordre. Mon travail : livrer des évolutions complètes, de l'analyse du besoin à la mise en production, en équipe Scrum. |
| `trading.decision1.title` | Tester en conditions réelles |
| `trading.decision1.tradeoff` | Une date codée en dur a masqué un bug jusqu'en production. Depuis, je teste dans des conditions proches du réel, ce qui demande plus de temps de préparation avant la livraison. |
| `trading.decision2.title` | Valider la maquette avant de coder |
| `trading.decision2.tradeoff` | Sur une fonctionnalité portée seul, en dernière année, j'ai fait valider la maquette par le Product Owner avant le développement. Un échange de plus au départ, mais moins de retours en cours de route. |
| `trading.wall` | La complexité de la solution, et le respect de la Definition of Done : une évolution n'est terminée que lorsque tout est vérifié, testé et relu. |
| `trading.takeaway` | Une date codée en dur a masqué un bug jusqu'en production. Depuis, je teste en conditions réelles, et je garde la tête froide quand tout va vite. |
| `trading.aiNote` | `null` |
| `trading.repos` | `[]` |
| `trading.privacy` | Expérience professionnelle : par confidentialité, je ne détaille ni l'architecture ni les fonctionnalités de l'application. |

Remarque : les compromis de `decision1` et `decision2` sont des propositions de rédaction à partir de faits V1 (`p2.lesson`, `p2.m3.body`) : Enzo corrige ou supprime. Dates : stage mars à août 2023, alternance septembre 2023 à septembre 2025, à confirmer.

## 5. Fiches compactes (P1)

Une ligne chacune : nom, stack, lien. GFaim a sa page d'étude de cas et vit aussi en P1.

| Clé | Texte |
|---|---|
| `p1.cinefolie` | Cin-folie : un site de recherche et de notation de films, avec comptes et avis, sur les données de TMDB. Projet de L3 en binôme. PHP · CSS · SQLite. github.com/cobroux/Cin-folie-website |
| `p1.quarkus` | quarkus-color : un service Quarkus minimal, une ressource REST `/colors` testée, avec Dockerfiles et workflow de build d'image. Java. github.com/cobroux/quarkus-color |
| `p1.objvlisp` | ObjVLisp2023 : projet ObjVLisp de L3 informatique (rendu de janvier 2023), un modèle objet réimplémenté en Java, en TDD : des tests fournis à faire passer. Java. github.com/cobroux/ObjVLisp2023 |
| `p1.lambda` | LambdaCalcul : projet en binôme sur la logique propositionnelle (génération de mondes, satisfiabilité), puis une seconde partie avec `epiSat` et `update`. Haskell. github.com/cobroux/LambdalCalcul-project |
| `p1.gfaim` | GFaim : mon projet de fin d'études, un planificateur de repas. Java · Quarkus · PostgreSQL. Lire l'étude de cas. |

## 6. Textes d'interface V2

| Clé | Texte |
|---|---|
| `project.back` | Retour au parcours |
| `project.section.problem` | Le problème |
| `project.section.schema` | L'architecture |
| `project.section.decisions` | Les décisions |
| `project.section.decisions.lead` | Chaque choix a un prix. Le voici. |
| `project.section.wall` | Le mur du 60e km |
| `project.section.wall.lead` | Là où ça a vraiment résisté. |
| `project.section.takeaway` | Ce que j'en retire |
| `project.section.links` | Liens |
| `project.split.duration` | Durée |
| `project.split.role` | Rôle |
| `project.split.stack` | Stack |
| `project.split.commits` | Commits |
| `project.split.languages` | Langages |
| `project.link.repo` | Voir le dépôt |
| `project.link.repos` | Voir les dépôts |
| `project.link.demo` | Voir la démo |
| `project.link.casestudy` | Lire l'étude de cas |
| `project.video.play` | Lecture |
| `project.video.pause` | Pause |
| `project.video.label` | Démonstration vidéo muette, en boucle |
| `project.video.reduced` | Lecture automatique désactivée. Lancez la vidéo avec le bouton. |
| `project.fun` | Un mur au 60e km : c'est là que ça se joue, sur un 79,4 km. |
| `lang.switch.fr` | FR |
| `lang.switch.en` | EN |
| `lang.switch.label` | Langue du site |
| `lang.switch.toEn` | Passer le site en anglais |
| `lang.switch.toFr` | Passer le site en français |
| `contrib.title` | Mon activité sur GitHub |
| `contrib.caption` | Contributions des 12 derniers mois, mises à jour toutes les 6 heures. |
| `contrib.total` | {total} contributions en un an |
| `contrib.cell` | {count} contributions le {date} |
| `contrib.less` | Moins |
| `contrib.more` | Plus |
| `contrib.unavailable` | Le graphe n'est pas disponible pour le moment. |
| `contrib.alt` | Graphe des contributions GitHub sur un an : un carré par jour, plus foncé quand l'activité est plus forte. |
| `project404.title` | Étude de cas introuvable |
| `project404.body` | Cette page n'existe pas, ou pas encore. Le parcours continue sur l'accueil. |
| `project404.cta` | Retour au parcours |

## 7. Meta des 4 pages

| Clé | Texte |
|---|---|
| `meta.oltre.title` | Oltre, application de pilotage du quotidien, Enzo Leveque |
| `meta.oltre.description` | Étude de cas d'Oltre : un agenda personnel (sport, dépenses, tâches, rendez-vous) en Angular et Spring Boot, avec ses décisions et leurs compromis. |
| `meta.zotracker.title` | Zotracker, suivi GPS de course en direct, Enzo Leveque |
| `meta.zotracker.description` | Étude de cas de Zotracker : un suivi GPS en direct pour que les proches suivent une course, sans appli à installer, avec ses décisions et leurs compromis. |
| `meta.gfaim.title` | GFaim, planificateur de repas, Enzo Leveque |
| `meta.gfaim.description` | Étude de cas de GFaim : mon projet de fin d'études, un planificateur de repas en Java et Quarkus, avec un cahier des charges imposé puis de la liberté d'innover. |
| `meta.trading.title` | Application de trading chez Worldline, Enzo Leveque |
| `meta.trading.description` | 2,5 ans d'expérience professionnelle sur une application de trading chez Worldline : le contexte, le mur du projet et ce que j'en retire. |

---

## Trous restants

1. Oltre : aucun trou (pas de date de début affichée : « En cours »).
2. GFaim : raison du certificat Spoonacular, légende et description du clip.
3. Worldline : validation mot à mot, dates exactes, accord sur les deux leçons proposées.
4. Fiches compactes : aucun trou (le « en TDD » d'ObjVLisp vient d'Enzo ; quarkus-color est un gabarit Quarkus étoffé).
