#!/usr/bin/env bash
# Sauvegarde quotidienne : pg_dump compressé, rétention 7 jours. Lancé par cron (voir infra/README.md).
set -euo pipefail
umask 077
cd /opt/zofolio
set -a; . ./.env; set +a
out=/opt/zofolio/backups/zofolio-$(date +%F-%H%M).dump
docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U "$DB_USER" -Fc "$POSTGRES_DB" > "$out.tmp"
mv "$out.tmp" "$out"
find /opt/zofolio/backups -name 'zofolio-*.dump' -mtime +7 -delete
