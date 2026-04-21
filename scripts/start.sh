#!/bin/sh
set -e

echo "🔄 Aplicando schema en la base de datos..."
node node_modules/prisma/build/index.js db push --skip-generate

echo "✅ Base de datos sincronizada."
echo "🚀 Iniciando la aplicación..."
exec node server.js
