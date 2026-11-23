#!/bin/sh
set -e

echo "=== [1/2] Sincronizando tablas en MySQL con Prisma ==="
npx prisma db push --skip-generate --accept-data-loss

echo "=== [2/2] Creando / verificando usuario administrador en la Base de Datos ==="
npx tsx prisma/init-db.ts

echo "=== [3/3] Iniciando la aplicación Next.js en producción ==="
exec next start -H 0.0.0.0 -p 3000
