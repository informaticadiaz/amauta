# Dockerfile para Amauta Backend API
# Multi-stage build para optimizar tamaño de imagen

# ============================================
# Stage 1: Production Dependencies
# ============================================
FROM node:22.22.1-alpine AS deps-prod

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/types/package*.json ./packages/types/
COPY packages/shared/package*.json ./packages/shared/

# Instalar solo dependencias de producción de todos los workspaces
ENV NODE_ENV=production
RUN npm ci --omit=dev

# ============================================
# Stage 2: All Dependencies (para build)
# ============================================
FROM node:22.22.1-alpine AS deps-build

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/types/package*.json ./packages/types/
COPY packages/shared/package*.json ./packages/shared/

# Instalar TODAS las dependencias (incluyendo dev para TypeScript)
# Actualizado: 2025-12-22 - Agregar @types/node al package.json del API
ARG CACHEBUST=3
RUN echo "Cache bust: $CACHEBUST"
ENV NODE_ENV=development
RUN npm ci

# ============================================
# Stage 3: Builder
# ============================================
FROM node:22.22.1-alpine AS builder

WORKDIR /app

# Copiar dependencias de build (con devDependencies)
COPY --from=deps-build /app/node_modules ./node_modules
COPY --from=deps-build /app/apps/api/node_modules ./apps/api/node_modules

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./
COPY turbo.json ./

# Copiar código fuente de los workspaces compartidos y del API
COPY packages/types ./packages/types
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Compilar los paquetes compartidos antes de la API
RUN npm run build --workspace=@amauta/types
RUN npm run build --workspace=@amauta/shared

# Generar Prisma Client
WORKDIR /app/apps/api
# Prisma generate requiere DATABASE_URL definida (no la usa, solo valida)
ENV DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder?schema=public"
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# ============================================
# Stage 4: Runner (Producción)
# ============================================
FROM node:22.22.1-alpine AS runner

WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copiar solo lo necesario para producción
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/packages/types ./packages/types
COPY --from=builder --chown=nestjs:nodejs /app/packages/shared ./packages/shared
# Copiar dependencias de producción (sin devDependencies)
COPY --from=deps-prod --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=deps-prod --chown=nestjs:nodejs /app/apps/api/node_modules ./apps/api/node_modules
# Copiar Prisma Client generado (sobrescribe el de deps-prod)
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package*.json ./

# Crear directorio de uploads con permisos para el usuario nestjs
RUN mkdir -p /app/uploads/cursos && chown -R nestjs:nodejs /app/uploads

# Variables de entorno por defecto (serán sobrescritas por Dokploy)
ENV NODE_ENV=production
ENV API_PORT=4000
ENV API_HOST=0.0.0.0
ENV UPLOAD_DIR=/app/uploads

# Exponer puerto
EXPOSE 4000

# Cambiar a usuario no-root
USER nestjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio: migrar base de datos y arrancar NestJS
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
