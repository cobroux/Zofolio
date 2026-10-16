# Clips de démonstration (plan-v2 §5, ADR 0003)

Données 100 % factices, outil local (hors CI). Ne jamais modifier les dépôts Oltre et Zotracker, ni monter leurs volumes.
Prérequis : Docker, ffmpeg, cwebp, et `frontend/node_modules` (le lien `tools/clips/node_modules` -> `../../frontend/node_modules`, ignoré par git, fournit Playwright).

## Oltre (`-p oltre-demo`, front 127.0.0.1:4210, API 127.0.0.1:8090)
1. Copier `Oltre-backend` et `oltre-frontend` dans un dossier temporaire sans `.env`, `.git`, `target` ni fichiers « * 2.* » (un doublon `ApiExceptionHandler 2.java` fait échouer `mvn package`) ; garder `certs/` (le Dockerfile le copie).
2. `export JWT_SECRET=$(openssl rand -hex 32) GARMIN_SERVICE_URL= GARMIN_SERVICE_TOKEN= GEMINI_API_KEY= ALLOWED_ORIGINS=http://localhost:4210 API_URL=http://localhost:8090`
3. `docker compose -p oltre-demo --env-file /dev/null -f <copie>/Oltre-backend/docker-compose.yaml -f tools/clips/oltre.override.yml up -d --build` (`--env-file /dev/null` : le `.env` réel n'est jamais lu).
4. `node tools/clips/oltre-seed.mjs $TMP/auth.json`
5. `cd frontend && OLTRE_AUTH=$TMP/auth.json CLIPS_OUT=$TMP/out npx playwright test -c ../tools/clips/playwright.clips.config.ts oltre`
6. `TRIM=1 tools/clips/encode.sh <video.webm> oltre-1 3`, puis `docker compose -p oltre-demo ... down -v`.

## Zotracker (`-p zotracker-demo`, 127.0.0.1:3010)
1. `export ADMIN_PASSWORD=$(openssl rand -hex 16)` puis `docker compose -p zotracker-demo --env-file /dev/null -f <Zotracker>/docker-compose.yml -f tools/clips/zotracker.override.yml up -d --build`
2. `cd frontend && ADMIN_PASSWORD=$ADMIN_PASSWORD CLIPS_OUT=$TMP/out npx playwright test -c ../tools/clips/playwright.clips.config.ts zotracker` (le GPX officiel du GTA est lu dans `~/Downloads`, jamais copié ; `GPX=` pour un autre chemin). Une pile neuve à chaque essai (`down -v` avant).
3. `TRIM=1.5 tools/clips/encode.sh $TMP/out/zotracker.webm zotracker-1 4`, puis `down -v`.

Vérifier : `ffprobe` (durée 15-30 s, sans audio), `du -k` <= 2560, aucune donnée réelle sur 3 images extraites.

## GFaim (Android, portrait 540x1170, `-p gfaim-demo`)
Dépôts publics `GFaim-app` et `GFaim-api` clonés dans un dossier temporaire. Aucune clé Spoonacular : l'API démarre avec une clé et un truststore factices, les recettes viennent de `gfaim-seed.sh`.
1. API : `mvn -B package -DskipTests` (JDK 21), clés JWT générées par `openssl` dans `src/main/resources/META-INF/keys` (README de l'API), truststore JKS bidon (`keytool -genkeypair`), Postgres seul via `docker compose -p gfaim-demo` (hôte 127.0.0.1:55432). L'API tourne sur l'hôte (`QUARKUS_HTTP_PORT`) ; `SPOONACULAR_API_BASE_URL=http://127.0.0.1:9`.
2. APK : Gradle 8.9 + JDK 21 (le dépôt n'a pas `gradle-wrapper.jar` : utiliser une distribution 8.9), `assembleDebug`. Si le port 8080 de l'hôte est pris, remplacer le port de `BASE_URL` (`ApiClient.java`) dans la copie temporaire seulement.
3. Base vierge : ne PAS seeder avant. `gfaim.sh` fait l'inscription (demo@example.test, mot de passe `Demo123!pass`, avec majuscule, chiffre et caractère spécial exigés par l'appli) et la famille dans l'appli, puis appelle `gfaim-seed.sh <API> data` (4 recettes, repas, courses). Sans `data`, le seed crée aussi l'utilisateur et la famille.
4. AVD `zofolio-demo` (android-35 google_apis_playstore arm64, pixel_6), `wm size 1080x2340`, `cmd package compile -m speed -f com.gfaim`, désactiver Play Store et apps Google superflues (sinon ANR), installer l'APK, puis `tools/clips/gfaim.sh $TMP/out` (vitesse 1x : inscription, famille avec Alex et Sam, accueil, calendrier, recette ; enregistre via `screenrecord`, coupe les temps morts avec `freezedetect` (1,8 s max par segment figé), encode en 540x1170, 30 i/s, produit `gfaim-1.*` et `gfaim-shot-1..3.png`). Les taps attendent l'écran voulu (uiautomator) et se répètent si besoin. Un émulateur lent (juste après démarrage, ANR System UI) allonge le clip : le relancer à chaud.
5. Nettoyage : `adb emu kill`, `avdmanager delete avd -n zofolio-demo`, `docker compose -p gfaim-demo down -v`.
