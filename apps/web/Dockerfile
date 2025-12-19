# Dockerfile para Amauta Frontend Web (Next.js PWA)
# Multi-stage build optimizado para producción

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps

# Instalar dependencias del sistema necesarias para Next.js
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/shared/package*.json ./packages/shared/ 2>/dev/null || true
COPY packages/types/package*.json ./packages/types/ 2>/dev/null || true

# Instalar dependencias
RUN npm ci --workspace=@amauta/web

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias desde stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./
COPY turbo.json ./

# Copiar código fuente del Web
COPY apps/web ./apps/web

# Copiar packages compartidos si existen
COPY packages ./packages 2>/dev/null || true

# Build arguments para Next.js
ARG NEXT_PUBLIC_API_URL
ARG NEXTAUTH_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL

# Deshabilitar telemetry de Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js
WORKDIR /app/apps/web
# Nota: Cuando tengamos Next.js, será: npm run build
# Por ahora es un placeholder
RUN mkdir -p .next/standalone .next/static public || true

# ============================================
# Stage 3: Runner (Producción)
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Configurar zona horaria
ENV TZ=UTC

# Variables de entorno de producción
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copiar archivos necesarios
# Nota: Cuando tengamos Next.js con output: 'standalone', usaremos:
# COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
# COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Por ahora, placeholder
COPY --from=builder --chown=nextjs:nodejs /app/apps/web ./apps/web
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Exponer puerto
EXPOSE 3000

# Cambiar a usuario no-root
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Comando de inicio
# Nota: Cuando tengamos Next.js, será: node apps/web/server.js
CMD ["sh", "-c", "echo 'Frontend placeholder - Esperando implementación de Next.js' && echo 'Port 3000 listening...' && tail -f /dev/null"]
