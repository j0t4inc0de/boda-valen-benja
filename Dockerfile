# Etapa 1: Dependencias
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Etapa 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Compilar Next.js en modo standalone
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
RUN npm run build

# Etapa 3: Runner para producción
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

RUN apk add --no-cache libc6-compat

# Copiar archivos públicos y standalone de Next.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copiar Prisma y scripts necesarios para migraciones y seeds en tiempo de ejecución
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
