# Faits sourcés V1 (T2)

Date : 2026-10-15. Brouillon interne, non publié. Chaque puce porte sa source (`Source : document, section`).
Règle Worldline appliquée (SPEC §9) : aucun nom d'entreprise partenaire, d'établissement, de produit ni de détail d'architecture. Les marques `À FOURNIR` signalent les trous. Rien n'est inventé.
Documents lus : rapport d'alternance M1 et M2 (Drive), soutenance M2 (Drive), rapport de stage L3 (Drive), SPEC.md §1, README Oltre-backend, oltre-frontend et Zotracker, API GitHub (liste des dépôts, dates, nombre de commits).
Non lu : CV (voir section 6).

## 1. Profil et formation

- Licence informatique, Université d'Artois, trois années d'études avant le stage de fin de licence. Dates : `À FOURNIR`. Source : rapport d'alternance M1, Introduction ; CV non lisible (voir section 6).
- Stage de fin de licence chez Worldline (L3), environ quatre mois. Dates exactes : `À FOURNIR`. Source : rapport d'alternance M1, « Obtention de mon alternance » ; rapport de stage L3, « Introduction » et « Le sujet proposé ».
- Test technique passé pour obtenir le stage : Java, SQL, environnement Git. Source : rapport de stage L3, « L'obtention de mon Stage ».
- Master Ingénierie Logicielle pour l'Internet (ILI), Université d'Artois, en alternance. Début de l'alternance le 18 septembre 2023. Source : rapport d'alternance M1, Introduction ; rapport d'alternance M2, Introduction ; SPEC.md §1 (« Master ILI (Univ. Artois) »).
- Diplôme de Master et date de soutenance : `À FOURNIR`. Source : soutenance M2 (slides sans date).
- Soutenance d'alternance M2, intitulée « Master 2 ILI ». Source : soutenance M2, titre.
- Langues : anglais, réunions d'équipe en anglais suivies sans difficulté. Score TOEIC : `À FOURNIR` (cité dans la version CV, non vérifié). Source : rapport de stage L3, « Autre compétence » ; SPEC.md n'en parle pas.

## 2. Worldline (anonymisé, validation d'Enzo requise pour tout texte)

- Employeur : groupe international français de services de paiement et de transactions électroniques, fondé en 1974, plus de 50 pays. Nom à valider pour publication (SPEC §9). Source : rapport d'alternance M2, « Qu'est ce que Wordline ? ».
- Site de Seclin, dans une division de services financiers, au sein d'un pôle d'information financière et de trading d'environ une centaine de personnes. Source : rapport d'alternance M2, « La structure d'accueil ».
- Domaine : solution logicielle de gestion d'ordres boursiers, utilisée par des établissements financiers pour passer des ordres, consulter des portefeuilles et administrer des comptes de traders. Solution en service depuis plus de vingt ans. Source : rapport d'alternance M2, « Remise en contexte » ; rapport de stage L3, « Présentation du produit ».
- Criticité : environnement de production exigeant, où la fiabilité compte. Source : rapport d'alternance M2, « Travail effectué semestre 1 » ; rapport d'alternance M2, « Bilan » (« environnements de production exigeants »).
- Interface web d'administration de la solution, qui permet d'administrer les comptes et les ordres (technologies front à confirmer). Source : rapport d'alternance M2, « Présentation de l'admin portal ».
- Rôle d'Enzo : stagiaire puis alternant, développeur full stack dans une équipe Scrum. Tâches : analyse d'impact, développement back-end Java, évolutions front, modifications de base de données, tests unitaires, revue, documentation, merge requests. Source : rapport d'alternance M2, « Remise en contexte » ; rapport d'alternance M1, « Travail effectué pendant le S1 ».
- Stage L3 : prise en charge d'un projet de bout en bout (étude, recherche, développement, recette). Sujet : étude de technologies de messagerie asynchrone, comparatif, choix, prototype et intégration. Source : rapport de stage L3, « Le sujet proposé » et « Analyse du sujet et recherche de solution ».
- Alternance S1 : analyse, modélisation, développement sur une composante critique de la solution, puis reprise par un collègue à la réorganisation. Source : rapport d'alternance M1, « Sujet proposé » et « Travail effectué pendant le S1 ».
- Alternance S2 (squad mobile puis squad 2) : tickets variés sur interface d'administration et back-end ; évolution de l'affichage de l'état d'un marché (colonne calculée pour la date du jour). Source : rapport d'alternance M2, « Travail effectué semestre 1 », sections « Front » et « Bug » ; rapport d'alternance M1, « Travail effectué pendant le S2 ».
- Leçon tirée : une valeur de date codée en dur a masqué un bug jusqu'en production ; les tests doivent se faire en conditions réelles. Source : rapport d'alternance M2, « Front » (paragraphe « Une leçon importante »).
- Correction d'un bug de changement de langue dans l'interface (clé de libellé au lieu de valeur traduite). Source : rapport d'alternance M2, « Bug ».
- Projet phare de la dernière année : sauvegarde et partage de recherches sur les écrans d'administration. Analyse du flux existant, maquette Figma, validation par le Product Owner et le Scrum Master, changements front, back et base de données (JPQL, Spring). Source : rapport d'alternance M2, « Travail effectué semestre 2 ».
- Méthodes : Scrum, sprints (environ 4 semaines selon la soutenance), planning poker, daily, review et rétrospective, Definition of Done (documentation, tests unitaires, revue, mise à jour du ticket). Source : soutenance M2, « Déroulement d'un sprint » et « Travail effectués » ; rapport d'alternance M2, « Quelques notions » et « Remise en contexte ».
- Outils : Java, Spring, Hibernate, JPQL, Maven, JUnit, SQL, JIRA, Confluence, Figma, Git, SonarQube, JavaScript, HTML, CSS. Source : rapport d'alternance M2, « Bilan » et « Explications d'outils découverts ».
- Compétences acquises (bilan) : autonomie, gestion d'un projet de A à Z, travail en équipe, vocabulaire professionnel, rigueur sur la Definition of Done, proposition de solutions (pas seulement exécution). Source : rapport d'alternance M2, « Bilan » ; soutenance M2, « Bilan de mon alternance ».
- Difficultés (bilan) : complexité de la solution, prise de recul, manque d'approfondissement par moments, respect de la Definition of Done. Source : soutenance M2, « Bilan » ; rapport d'alternance M1, « Difficultés rencontrées ».
- Fin de l'alternance : pas de renouvellement chez Worldline, dans un contexte économique et d'équipe difficile. Ne pas publier sans accord d'Enzo. Source : soutenance M2, « Et maintenant ? » ; rapport d'alternance M2, « L'après ? ».

## 3. Projets nés de la course (P3)

### Oltre

- Application personnelle de pilotage du quotidien, backend et frontend séparés. Source : SPEC.md §1 (Oltre, tag « Commencé à la main, puis IA ») ; Oltre-backend/README.md, « Lancer avec Docker ».
- Lancement avec Docker Compose : backend, frontend et MySQL. Source : Oltre-backend/README.md, « Lancer avec Docker ».
- Intégration Garmin Connect via un service REST dédié (garmin-mcp), déployé sur Railway en production. Source : Oltre-backend/README.md, « Intégration Garmin ».
- Frontend Angular (Angular CLI 22.0.1) testé avec Vitest. Source : oltre-frontend/README.md, « Running unit tests » et en-tête.
- Backend Java. Spring Boot non mentionné dans le README : `À FOURNIR` pour confirmation. Source : GitHub API (langage du dépôt : Java).
- Dépôts GitHub : Oltre-backend, créé le 22 juin 2026, poussé le 14 octobre 2026, 145 commits. Source : API GitHub (liste des dépôts ; commits via en-tête Link, le 15 octobre 2026).
- Dépôt oltre-frontend, créé le 22 juin 2026, poussé le 14 octobre 2026, 210 commits. Source : API GitHub (idem).
- Date de début du projet : contradictoire (mars 2026 ou novembre 2025 selon les versions du CV). Voir section 7.

### Zotracker

- Suivi GPS en direct pour courses à pied : page publique avec carte, chrono, allure, heure d'arrivée estimée, profil d'altitude et messages. Espace admin protégé par mot de passe. Source : Zotracker/README.md, premier paragraphe.
- Alertes automatiques (départ, ravitaillements, arrivée, plus de position) et notifications push. Source : Zotracker/README.md, « Alertes ».
- Alertes de sécurité privées pour les proches (SOS, immobile, hors parcours) via ntfy. Source : Zotracker/README.md, « Sécurité : alertes privées ».
- Mode simulation pour tester sans courir. Source : Zotracker/README.md, « Tester sans courir : la simulation ».
- Confidentialité : masquage de la zone de départ (domicile) sur la trace publique. Source : Zotracker/README.md, tableau des variables (`PUBLIC_TRACK_MASK_M`).
- Stack : Node.js 22+ et Docker Compose. Source : Zotracker/README.md, « Démarrage rapide ».
- Dépôt créé le 12 octobre 2026, poussé le 14 octobre 2026, 34 commits. Source : API GitHub.
- Tag IA : « Conçu avec IA », méthode à expliquer dans le colophon. Source : SPEC.md §1, « Tags IA ».

### garmin-mcp

- Service REST qui relaie les données Garmin Connect pour Oltre. Source : Oltre-backend/README.md, « Intégration Garmin ».
- Dépôt Python, créé le 22 septembre 2026, poussé le 13 octobre 2026, 29 commits. Source : API GitHub.
- Description détaillée du dépôt : `À FOURNIR` (README de garmin-mcp non lu).

### histoquiz

- Dépôt Java, créé le 6 octobre 2026, 2 commits. Source : API GitHub.
- Description, stack détaillée et objectif : `À FOURNIR` (aucun README lu).

## 4. Projets universitaires (P1)

- Tag « Écrit à la main » : projets universitaires, statut inachevé assumé (« livré dans le temps imparti »). Source : SPEC.md §1, « Tags IA ».
- Études de cas P1 : Master ILI et projets universitaires. Liste exacte des projets retenus : `À FOURNIR`. Source : SPEC.md §1, « Hiérarchie des projets ».
- Fiches courtes indiquées dans SPEC : BomberStudent, Cin-folie, calculateur DPE, quarkus-color, LISP-Interpreter, ObjVLisp2023, LambdaCalcul. Source : SPEC.md §1, « Hiérarchie des projets ».
- Dépôts GitHub créés en avril 2025 (lot universitaire probable, à confirmer) : BomberStudent (5 commits), Cin-folie-website, GFaim-api, GFaim-app, LambdalCalcul-project, LISP-Interpretor, ObjVLisp2023, Projet-JAI-Devops-DPE-calculator. Source : API GitHub (dates de création). Lien avec P1 : `À FOURNIR`.
- quarkus-color (mars 2025), Root-ME (juin 2025) et File-name-changer (juin 2025) : dépôts hors liste SPEC, rôle à confirmer. Source : API GitHub.
- GFaim (app et API) : non déployé, pas de lien vers un store. Source : SPEC.md §1 (« Études de cas », « Hiérarchie des projets ») et SPEC.md §13 (décision 5).

## 5. Ravitaillements (soft skills)

- Brancardier aux urgences à l'hôpital (durée et lieu exacts : `À FOURNIR`). Source : SPEC.md §1 (ravitaillements) ; dates non confirmées (section 7).
- Tuteur pédagogique de L1 à l'Université d'Artois (dates : `À FOURNIR`). Source : SPEC.md §1 (ravitaillements) ; dates non confirmées (section 7).

## 6. Courses (SPEC §1)

- Grand Trail d'Auvergne 2025 : dossard 1592, 79,4 km, environ 3 160 m de dénivelé positif, temps 13 h 35 min 53 s. Source : SPEC.md §1, « Objectif ».
- Horaires : départ à 6 h 30 (km 0), arrivée à 20 h 05 (km 79,4). Source : SPEC.md §1, tableau « Structure narrative ».
- Journal : UTMB index 459. Source : SPEC.md §1, « Objectif ».
- Journal : marathons de Paris et du Louvre-Lens (dates et temps : `À FOURNIR`). Source : SPEC.md §1, « Objectif ».
- Journal : 2 × Côte d'Opale 62 km, progression de 7 h 37 à 7 h 32 (dates : `À FOURNIR`). Source : SPEC.md §1, « Objectif ».
- Journal : GTA 80 km (distance à confirmer, voir section 7), triathlon M de Fourmies, Ch'ti Trail S, club des Baudets d'Hinges (dates : `À FOURNIR`). Source : SPEC.md §1, « Objectif ».

## 7. Contradictions à trancher (Enzo)

- Dates de l'alternance : rapports M1 et M2 disent 18 septembre 2023. Versions du CV : septembre 2023 à septembre 2025. À confirmer.
- Dates du stage L3 : rapport M1 dit environ quatre mois ; une version du CV dit mars à août 2023. À confirmer.
- Université : « Université d'Artois » dans les rapports et le CV ; le rapport M1 cite aussi « Université Jean Perrin » et le M2 « faculté Jean Perron ». À confirmer.
- Oltre : SPEC dit « commencé à la main puis IA » ; les versions du CV donnent novembre 2025 ou mars 2026 pour le début ; GitHub donne le 22 juin 2026 pour la création du dépôt. À confirmer.
- GTA : SPEC §1 donne 79,4 km dans la structure narrative et 80 km dans le journal. À confirmer.
- Projet phare de l'alternance : la soutenance parle d'un « projet full stack » ; le rapport M2 parle de la sauvegarde de recherches. Les deux sont cohérents, à confirmer si l'un doit apparaître seul.
- Nom de l'employeur à afficher : validation Enzo requise (SPEC §9).

## 8. À FOURNIR

- Fichier CV : le `fileId` fourni (`1hHweZoOUTyZ62gKimPXRetjI2k68L-EwkdxPi57DL-s`) renvoie « Requested entity was not found ». Plusieurs versions de CV existent dans le Drive (CV_Enzo_Leveque, Version optimisée v1, v2, v3, Dossier de compétences Akkodis), avec des dates et intitulés divergents. Enzo doit indiquer la bonne version ou partager le fichier. Tout fait tiré du CV reste à compléter.
- Dates de licence, de stage L3, de soutenance du Master, de diplôme.
- Score TOEIC et langues (version CV).
- Poste actuel et employeur actuel, si à faire figurer.
- Liste et descriptions des projets universitaires (P1), et lien avec les dépôts GitHub d'avril 2025.
- Description, stack et objectif de garmin-mcp et histoquiz.
- Spring Boot dans Oltre-backend (confirmation).
- Dates, lieux et temps des courses du journal (marathons, Côte d'Opale, GTA 80 km, triathlon, Ch'ti Trail).
- Lieu et dates des ravitaillements (brancardier, tuteur L1).
- Validation Enzo : nom de l'employeur, contenu Worldline, fin de l'alternance.

## Temps de courses (recherche web)

- Marathon de Paris (année inconnue) : introuvable. Aucun résultat au nom d'Enzo Leveque dans les sources consultées. Source : https://utmb.world/runner/7761468.enzo.leveque
- Marathon du Louvre-Lens (année inconnue) : introuvable. Aucun résultat au nom d'Enzo Leveque dans les sources consultées. Source : https://www.marathons.com/fr/10-km/la-route-du-louvre-2026-le-lievre-anthony-kimtai-renverse-le-marathon_k20l
- Triathlon de Fourmies, format M : introuvable. Aucun résultat au nom d'Enzo Leveque ; seul un compte rendu 2022 (format M : 1,4 km natation, 39 km vélo, 10 km course) a été trouvé. Source : https://www.lavenir.net/regions/charleroi/sports/2022/06/15/debut-de-saison-canon-pour-geoffrey-marrion-QANY5JLHLJFQ7LPNG43VAVKFME/
- Ch'ti Trail (triathlon S) : introuvable. La fiche de la course ne liste pas d'épreuve de triathlon. Source : https://fr.milesrepublic.com/event/chti-trail-17225

## Temps de courses (fournis par Enzo, 2026-10-15)
- Marathon du Louvre-Lens (La Route du Louvre), 11 mai 2025 : 42,195 km, temps net 3:56:05, dossard 1717. Source : diplôme finisher, https://my.raceresult.com/339883/details0/certificate/1608/Diplome%20Finisher
- Triathlon des Moines (format M, Fourmies) : 2h28. Source : Enzo (année À FOURNIR)
- Chtriman (format S) : 1h16. Source : Enzo (année À FOURNIR)
- Marathon de Paris 2026 : 42,195 km, 3h36. Source : Enzo (résultats https://results.timeto.com/detail/b08da3-14155-f2d2b69d3cae3de0)
