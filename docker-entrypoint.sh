#!/bin/sh
set -e

DB_FILE="/app/data/dev.db"
mkdir -p /app/data

echo "Verificando base de datos SQLite en $DB_FILE..."
if [ ! -f "$DB_FILE" ]; then
    echo "Base de datos nueva detectada. Ejecutando migraciones y seed..."
    npx prisma migrate deploy
    npx prisma db seed
else
    echo "Base de datos existente encontrada. Aplicando migraciones si existen..."
    npx prisma migrate deploy || true
fi

echo "Iniciando servidor Next.js..."
exec node server.js
