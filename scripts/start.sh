#!/bin/sh
set -e

echo "🔄 Ejecutando migraciones de base de datos..."
npx prisma db push --skip-generate

echo "✅ Base de datos lista."
echo "🚀 Iniciando la aplicación..."
exec node server.js
