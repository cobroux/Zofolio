# Infra Zofolio

Prod : VM Oracle Always Free (Ubuntu 24.04 arm64), `https://88-96-45-97.sslip.io` (HTTPS par le proxy frontal `/opt/edge`, Let's Encrypt automatique). Pas de domaine ni de Cloudflare pour l'instant.

## Provisionner la VM
`brew install ansible`, puis `cd infra/ansible && ansible-playbook playbook.yml` (idempotent). Il pose : mises à jour de sécurité automatiques, SSH par clé seule, root interdit, fail2ban, ufw 22/80/443 (remplace les règles iptables REJECT d'Oracle), Docker + compose, `/opt/zofolio`, swap 2 Go. La Security List Oracle doit ouvrir 22, 80, 443.

## Déployer
- Automatique : tout push sur `main` lance `.github/workflows/deploy.yml` (SSH, mise à jour sur `origin/main`, `docker compose -f docker-compose.prod.yml up -d --build --wait`). Le build arm64 se fait sur la VM (premier build ~10 min, ensuite le cache).
- Manuel : `ssh ubuntu@88.96.45.97 'cd /opt/zofolio && git fetch origin main && git checkout -f -B main origin/main && docker compose -f docker-compose.prod.yml up -d --build --wait --remove-orphans && docker compose -f docker-compose.prod.yml restart caddy'`.
- Secrets GitHub : `SSH_HOST`, `SSH_USER`, `SSH_KEY` (clé de déploiement dédiée, restreinte par `restrict` dans `authorized_keys`), `SSH_KNOWN_HOSTS` (clé d'hôte épinglée).
- Retour arrière : sur la VM, `git checkout -f <sha>` puis la même commande `up -d --build --wait`.

## Secrets (`/opt/zofolio/.env`, 600, jamais commité)
Modèle : `.env.example`. Le hash admin est entre apostrophes (les `$`). Rotation :
- Mot de passe admin : `docker run --rm caddy:2 caddy hash-password --plaintext '<mdp>'`, remplacer `ADMIN_PASSWORD_HASH='...'`, puis `docker compose -f docker-compose.prod.yml up -d backend`.
- `GITHUB_TOKEN` : régénérer (fine-grained, lecture seule des dépôts publics), remplacer, redémarrer `backend`.
- `DB_PASSWORD` : ne pas le changer dans `.env` seul (la base garde l'ancien) ; `ALTER USER` dans postgres d'abord.
- `IP_HASH_SALT` : libre à changer (remet à zéro les compteurs de limite).
- SMTP : renseigner `SMTP_USERNAME`, `SMTP_PASSWORD` (mot de passe d'application Gmail) et `CONTACT_TO`, puis redémarrer `backend`. Tant que c'est vide, les messages sont enregistrés mais pas envoyés.
- Clé de déploiement : `ssh-keygen -t ed25519`, remplacer la ligne `zofolio-deploy` de `~/.ssh/authorized_keys`, `gh secret set SSH_KEY < clé`, puis supprimer le fichier local.

## Sauvegarde et restauration
Cron `/etc/cron.d/zofolio-backup` : 03:30, `scripts/backup.sh` (`pg_dump -Fc` dans `/opt/zofolio/backups`, dossier 0700, 7 jours de rétention). Le volume `media` n'est pas sauvegardé (shortcut : aucun média téléversé pour l'instant, à ajouter avec R2).
- Test à blanc : `scripts/restore.sh backups/<fichier>.dump` (base jetable `zofolio_restore_test`, affiche le nombre de projets, puis la supprime).
- Restauration réelle : `docker compose -f docker-compose.prod.yml stop backend frontend`, `scripts/restore.sh backups/<fichier>.dump --prod`, puis `up -d`.

## Ajouter un domaine et Cloudflare plus tard
1. DNS : enregistrement A vers l'IP (nuage orange si Cloudflare), SSL « Full (strict) ».
2. `Caddyfile.prod` : remplacer l'adresse `88-96-45-97.sslip.io` par le domaine ; `frontend/angular.json` : ajouter le domaine à `allowedHosts`.
3. Derrière Cloudflare : bloc global `servers { trusted_proxies static <plages CF> ; client_ip_headers CF-Connecting-IP }` pour que `{client_ip}` soit la vraie IP, et refuser les connexions hors plages CF (voir `tasks/plan-v3.md` D28-D30).
4. Sauvegardes hors serveur : rclone vers R2 (chiffré) en fin de `backup.sh` (D33).

## Notes
- Aucun port publié par Zofolio. Les ports 80/443 et le HTTPS sont tenus par le proxy frontal partagé `/opt/edge` (Caddy, indépendant des projets, certificats dans le volume `edge_caddy_data`). Il renvoie `88-96-45-97.sslip.io` vers `zofolio-web:80` (le Caddy interne de Zofolio, réseau `edge`). Chaque appli du serveur a son fichier dans `/opt/edge/sites/` ; ajouter ou modifier un site : éditer ce fichier puis `docker exec edge-caddy caddy reload --config /etc/caddy/Caddyfile`.
- Postgres, back et front restent sur le réseau Compose.
- Ordre de démarrage : postgres sain, puis backend sain, puis frontend sain, puis Caddy.
