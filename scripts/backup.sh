#!/usr/bin/env bash
# Script backup bază de date Campus Manager
# Rulează: crontab -e  →  0 3 * * * /path/to/scripts/backup.sh

set -e

DATE=$(date +%Y-%m-%d_%H-%M)
BACKUP_DIR="/home/eduard/Desktop/mari/PPRSC/backups"
DB_NAME="campus_manager"
DB_USER="campus_admin"
DB_HOST="localhost"
DB_PORT="5433"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

echo "🔄 Backup $DB_NAME la $DATE..."

PGPASSWORD="campus_secret" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -F c \
  -f "$BACKUP_DIR/${DB_NAME}_${DATE}.dump"

echo "✅ Backup salvat: $BACKUP_DIR/${DB_NAME}_${DATE}.dump"

# Șterge backup-uri mai vechi de $RETENTION_DAYS zile
find "$BACKUP_DIR" -name "${DB_NAME}_*.dump" -mtime +$RETENTION_DAYS -delete

echo "🗑️  Backup-uri mai vechi de $RETENTION_DAYS zile au fost șterse."
echo "✅ Backup complet!"

# Restaurare (când e nevoie):
# pg_restore -h localhost -p 5433 -U campus_admin -d campus_manager \
#   -c "${BACKUP_DIR}/campus_manager_2026-05-15_22-00.dump"
