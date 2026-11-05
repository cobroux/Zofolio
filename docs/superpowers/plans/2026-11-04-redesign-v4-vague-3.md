# Refonte v4, vague 3 : retours d'Enzo du 2026-11-04

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** corriger les défauts relevés par Enzo sur la v4 (bandeau, graphe GitHub, liens de contact, index P3) puis préparer la coupe du texte, qu'il valide avant toute application.

**Spec:** `docs/superpowers/specs/2026-11-02-redesign-v4-design.md`. Les décisions d'Enzo de ce jour priment sur la spec quand elles la contredisent (notamment §6 « dos du dossard » et §4 « textes conservés »).

## Global Constraints

Celles de `.superpowers/sdd/2026-11-02-redesign-v4-vague-1/global-constraints.md`, mot pour mot. En plus : aucun chiffre inventé ; une donnée absente est retirée ; pas de dépendance (icônes en SVG inline).

## Review Focus

1. Bandeau : le km affiché quand le titre d'une étape atteint la ligne de lecture vaut le km officiel de ce pointage (P1 20, P2 44, P3 58,2, Arrivée 79,41), à 1440 et 390 px.
2. Graphe GitHub absent (synchro vide) : rien de cassé, la zone disparaît.
3. Liens de contact : chaque destination (email, GitHub, LinkedIn, CV) n'apparaît qu'une fois dans l'Arrivée et le dos du dossard.
4. Ligne P3 sans média et sans données GitHub : pas de cadre vide ni de chiffre à zéro inventé.

---

## Task 1: Bandeau de suivi aligné sur les pointages
- [ ] Diagnostiquer (superpowers:systematic-debugging) : mesurer, à 1440 × 900 et 390 × 844, le km affiché par le bandeau quand le haut de `#p1`, `#p2`, `#p3`, `#arrivee` atteint la position de lecture utilisée par `kmAtScroll`. Comparer aux `CHECKPOINTS` de `profile.data.ts`.
- [ ] Test E2E qui échoue avec ces mesures (tolérance ± 0,5 km), puis corriger la cause dans la fonction pure ou dans le choix des repères (pas de rustine par page). Test unitaire de la fonction pure corrigée.
- [ ] Vérifier dernier temps de passage et région `aria-live` cohérents avec le km corrigé. Commit `fix(redesign): bandeau aligné sur les pointages`.

## Task 2: Graphe de contributions GitHub visible
- [ ] Le graphe sort du `<details>` « Voir le détail » du Journal et s'affiche directement sous « L'endurance, deux fois » ou en tête du Journal ; les autres courses restent repliées. S'il n'y a pas de données, la zone est retirée.
- [ ] Vérification locale : test unitaire avec la fixture `home.fixture.json` ; le rapport explique comment fournir un `GITHUB_TOKEN` de test (jamais de vrai secret dans un fichier suivi).
- [ ] Tests unitaires (avec et sans données) + E2E. Commit `feat(redesign): graphe de contributions visible`.

## Task 3: Liens de contact : boutons à logo, sans doublon
- [ ] Arrivée : LinkedIn et GitHub deviennent des boutons avec logo SVG inline (`aria-hidden` sur l'icône, nom accessible = texte visible), même hauteur que le bouton CV, cible ≥ 44 px.
- [ ] Dos du dossard : retirer GitHub, LinkedIn et l'email s'ils sont déjà dans l'Arrivée ; il garde commit, déploiement, CI, Lighthouse, stack et « Le code ». Chaque destination n'apparaît qu'une fois.
- [ ] Tests : compter les liens par `href` dans `#arrivee` + dos du dossard (1 chacun) ; axe. Commit `feat(redesign): contact à logos, sans doublon`.

## Task 4: Ligne P3 sans média plus riche
- [ ] Pour un projet sans vidéo ni capture (HistoQuiz, garmin-mcp) : la ligne et le cadre d'aperçu montrent ses preuves réelles issues de la synchro GitHub (commits en chiffre monumental, langages, dernier push), dans le style des chiffres de preuve existants. Sans données, retour au comportement actuel (pas de cadre).
- [ ] Respecter spec §7 « Index P3 : aperçu » (fondu 240 ms, mouvement réduit direct) et les contrastes.
- [ ] Tests unitaires (avec/sans données) + E2E survol HistoQuiz. Captures 1440/390 relues. Commit `feat(redesign): preuves GitHub dans l'index P3`.

## Task 5: Proposition de coupe du texte (sans application)
- [ ] `docs/content/coupes-v3.md` : pour chaque bloc de texte de l'accueil et des études (FR), le texte actuel, la version coupée proposée (objectif −40 à −50 % de mots), et ce qui disparaît. Aucun fait ajouté. Compte de mots avant/après par section.
- [ ] STOP : Enzo valide ou corrige avant toute application.
