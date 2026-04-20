# ========================
# STAGE 1: Build
# ========================
FROM node:20 AS builder
WORKDIR /app

# Copiar dependencias y schema de Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Variables de entorno necesarias para el build
# DATABASE_URL no importa en build, solo en runtime
ENV DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder"
ENV NEXTAUTH_SECRET="build-secret-placeholder"
ENV NEXTAUTH_URL="http://localhost:3000"
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NEXT_TELEMETRY_DISABLED=1

# Generar cliente Prisma y compilar Next.js
RUN npx prisma generate
RUN npm run build

# ========================
# STAGE 2: Runner
# ========================
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Instalar openssl (requerido por Prisma en Linux slim)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copiar artefactos del build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copiar Prisma (schema + cliente generado)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Copiar script de inicio
COPY --from=builder /app/scripts/start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# El script aplica las migraciones y luego inicia el servidor
CMD ["./start.sh"]
