# ========================
# STAGE 1: Build
# ========================
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

# Placeholders para que el build no falle (no se conecta a la BD real)
ENV DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder"
ENV NEXTAUTH_SECRET="build-secret-placeholder"
ENV NEXTAUTH_URL="http://localhost:3000"
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NEXT_TELEMETRY_DISABLED=1

RUN npx prisma generate
RUN npm run build

# ========================
# STAGE 2: Runner
# ========================
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# openssl es requerido por Prisma en Linux slim
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Artefactos de Next.js standalone
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Prisma: schema + cliente generado
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
# bcryptjs: pure JS, sin binarios nativos - siempre incluirlo explícitamente
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Las migraciones se corren manualmente desde la consola de EasyPanel:
# node node_modules/.prisma/../prisma/build/index.js db push
# o bien: npx prisma db push (si hay conexión a internet en el contenedor)
CMD ["node", "server.js"]
