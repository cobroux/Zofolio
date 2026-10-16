#!/usr/bin/env bash
# Restaure un dump dans une base jetable (par défaut) : restore.sh <fichier.dump> [--prod pour écraser la base de prod]
set -euo pipefail
cd /opt/zofolio
set -a; . ./.env; set +a
dump=${1:?usage: restore.sh <fichier.dump> [--prod]}
dc="docker compose -f docker-compose.prod.yml exec -T postgres"
db=zofolio_restore_test
if [ "${2:-}" = "--prod" ]; then db=$POSTGRES_DB; $dc dropdb -U "$DB_USER" --if-exists "$db"; fi
[ "$db" = "$POSTGRES_DB" ] || $dc dropdb -U "$DB_USER" --if-exists "$db"
$dc createdb -U "$DB_USER" "$db"
$dc pg_restore -U "$DB_USER" -d "$db" --no-owner < "$dump"
echo "Restauré dans $db : $($dc psql -U "$DB_USER" -d "$db" -Atc 'select count(*) from project') projets"
[ "$db" = "$POSTGRES_DB" ] || $dc dropdb -U "$DB_USER" "$db"
