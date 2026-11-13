# 📊 Análisis de Deployment: VPS y Amauta

> **⚠️ VERSIÓN PÚBLICA**: Este documento NO contiene información sensible.
> Datos reales de conexión se almacenan en ubicación privada (ver sección Seguridad).

---

## 🎯 Resumen Ejecutivo

**Estado actual**: Amauta está en Fase 0 (76% completado, 13/17 tareas). El proyecto está preparado para deployment con variables de entorno ya sanitizadas y documentadas.

**Recomendación principal**: Aprovechar infraestructura VPS existente para desplegar Amauta usando Dokploy, similar a proyectos anteriores.

---

## 📍 Estado de VPS (Información General)

### Infraestructura Existente

**Stack activo**:

- ✅ **Dokploy**: Orquestador de deployments
- ✅ **Docker + Docker Compose**: Containerización
- ✅ **Traefik**: Reverse proxy automático (via Dokploy)
- ✅ **PostgreSQL**: Ya en uso
- ✅ **Cloudflare**: DNS + CDN + SSL

### Sistema de Protección Operativo

Tu VPS tiene un **sistema robusto de protección y monitoreo** implementado:

**Monitoreo automático**:

- ✅ Cron jobs activos (backup DB, limpieza Docker, monitor disco)
- ✅ Backup diario PostgreSQL
- ✅ Limpieza Docker semanal
- ✅ Monitor de disco cada 6 horas
- ✅ Reportes semanales y mensuales automáticos

**Umbrales de alerta**:

```
< 70%    → Normal
70-80%   → Atención (monitor activo)
> 80%    → Warning (limpieza automática)
> 90%    → Crítico (limpieza agresiva)
```

**Documentación completa** disponible en repositorio de documentación VPS.

---

## 🏗️ Arquitectura Propuesta para Amauta

### Subdominios Sugeridos

```
amauta.[TU-DOMINIO]         → Frontend (Next.js PWA)
amauta-api.[TU-DOMINIO]     → Backend API (NestJS + Fastify)
```

**Alternativa** (si quieres separación total):

```
amauta.[OTRO-DOMINIO]       → Frontend
amauta-api.[OTRO-DOMINIO]   → Backend
```

### Stack Técnico de Amauta

**Frontend (apps/web)**:

- Framework: Next.js 14+ (App Router)
- Estado actual: Scripts placeholder, pendiente implementación

**Backend (apps/api)**:

- Framework: NestJS + Fastify (pendiente implementación)
- ORM: Prisma (✅ configurado)
- Schema: 16 modelos definidos (usuarios, cursos, instituciones, etc.)
- Migraciones: Listas para aplicar

**Base de Datos**:

- PostgreSQL 15+ requerido
- Prisma ORM con schema completo
- Extensiones necesarias: uuid-ossp, pg_trgm, unaccent
- Redis 7+ para caché (configurado en docker-compose.yml)

---

## 🔐 Estrategia de Variables de Entorno

### Sistema Implementado

Amauta tiene una **estrategia de seguridad robusta** ya implementada:

**Archivos públicos (en repo)**:

```
apps/api/.env.example               ✅ Template desarrollo
apps/api/.env.production.example    ✅ Template producción
apps/web/.env.example               ✅ Template desarrollo
apps/web/.env.production.example    ✅ Template producción
```

**Archivos privados (gitignored)**:

```
apps/api/.env.local                 🔒 Desarrollo local
apps/api/.env.production.local      🔒 Producción (solo local)
apps/web/.env.local                 🔒 Desarrollo local
apps/web/.env.production.local      🔒 Producción (solo local)
```

**Validación con Zod**: Variables validadas automáticamente al iniciar la aplicación.

**Documentación completa**: `docs/technical/environment-variables.md`

### Variables Críticas para Producción (Template)

**Backend API** (`apps/api/.env.production.local`):

```env
NODE_ENV=production
API_URL=https://amauta-api.[TU-DOMINIO]
DATABASE_URL=postgresql://[USUARIO]:[PASSWORD]@[HOST]:5432/amauta_prod
JWT_SECRET=<generar con: openssl rand -base64 32>
SESSION_SECRET=<generar diferente>
NEXTAUTH_SECRET=<mismo que frontend>
CORS_ORIGIN=https://amauta.[TU-DOMINIO]
```

**Frontend Web** (`apps/web/.env.production.local`):

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://amauta-api.[TU-DOMINIO]
NEXTAUTH_URL=https://amauta.[TU-DOMINIO]
NEXTAUTH_SECRET=<mismo que backend>
```

---

## 🎯 Opciones de Deployment

### Opción 1: PostgreSQL Compartido (Recomendada)

**Ventajas**:

- ✅ Aprovecha PostgreSQL ya existente y monitoreado
- ✅ Una sola instancia a mantener y actualizar
- ✅ Backups automáticos ya configurados
- ✅ Menos overhead de recursos
- ✅ Particionamiento lógico por base de datos

**Implementación**:

```sql
-- En PostgreSQL existente
CREATE DATABASE amauta_prod;
CREATE USER amauta_user WITH PASSWORD '[TU-PASSWORD-SEGURO]';
GRANT ALL PRIVILEGES ON DATABASE amauta_prod TO amauta_user;
ALTER DATABASE amauta_prod OWNER TO amauta_user;

-- Extensiones requeridas
\c amauta_prod
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
```

**DATABASE_URL** (formato):

```
postgresql://amauta_user:[PASSWORD]@localhost:5432/amauta_prod
```

### Opción 2: PostgreSQL Dedicado en Docker

**Ventajas**:

- ✅ Aislamiento completo
- ✅ Versión específica de PostgreSQL
- ✅ Configuración independiente

**Desventajas**:

- ❌ Más recursos consumidos
- ❌ Backups separados a configurar
- ❌ Más complejidad operativa

**Uso**: Solo si necesitas versión específica o aislamiento estricto.

---

## 📋 Plan de Deployment Detallado

### Fase 1: Preparación Local (Pre-deployment)

**1. Crear Dockerfiles de producción**

`apps/api/Dockerfile` (ejemplo):

```dockerfile
# Multi-stage build
FROM node:22.22.1-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
RUN npm ci --workspace=@amauta/api --omit=dev

FROM node:22.22.1-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build --workspace=@amauta/api
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

FROM node:22.22.1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/prisma ./prisma

EXPOSE 3001
CMD ["node", "dist/main.js"]
```

**2. Configurar variables localmente**

```bash
# En tu máquina LOCAL (NO en el VPS)
cd ~/amauta

# Backend
cd apps/api
cp .env.production.example .env.production.local
# Editar con valores REALES de tu VPS

# Frontend
cd ../web
cp .env.production.example .env.production.local
# Editar con dominios reales
```

**3. Generar secrets seguros**

```bash
# JWT_SECRET
openssl rand -base64 32

# SESSION_SECRET
openssl rand -base64 32

# NEXTAUTH_SECRET (usar el mismo en ambas apps)
openssl rand -base64 32
```

### Fase 2: Configuración DNS (Cloudflare)

```bash
# Registros A o CNAME en Cloudflare
amauta              A/CNAME    [TU-VPS-IP]    ☁️ Proxy ON
amauta-api          A/CNAME    [TU-VPS-IP]    ☁️ Proxy ON

# SSL/TLS
Modo: Full (strict)
```

### Fase 3: PostgreSQL en VPS

**Opción A: Usar PostgreSQL existente** (recomendado):

```bash
# SSH al VPS
ssh root@[TU-VPS-IP]

# Conectar a PostgreSQL
docker exec -it [postgres-container] psql -U postgres

# Crear base de datos y usuario
CREATE DATABASE amauta_prod;
CREATE USER amauta_user WITH PASSWORD '[tu-password-seguro]';
GRANT ALL PRIVILEGES ON DATABASE amauta_prod TO amauta_user;
ALTER DATABASE amauta_prod OWNER TO amauta_user;

\c amauta_prod
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
\q

# Probar conexión
psql -h localhost -U amauta_user -d amauta_prod -W
```

### Fase 4: Dokploy - Backend API

**1. Crear aplicación en Dokploy UI**:

```
Nombre: amauta-api
Tipo: Dockerfile
Repository: https://github.com/informaticadiaz/amauta
Branch: main
Build Context: ./
Dockerfile: apps/api/Dockerfile
```

**2. Configurar variables de entorno en Dokploy**:

```
NODE_ENV=production
API_PORT=3001
API_HOST=0.0.0.0
API_URL=https://amauta-api.[TU-DOMINIO]
DATABASE_URL=postgresql://amauta_user:[PASSWORD]@host.docker.internal:5432/amauta_prod
JWT_SECRET=[tu-secret-generado]
SESSION_SECRET=[tu-secret-generado]
NEXTAUTH_SECRET=[tu-secret-compartido]
CORS_ORIGIN=https://amauta.[TU-DOMINIO]
LOG_LEVEL=info
LOG_FORMAT=json
```

**Nota**: `host.docker.internal` permite que el contenedor acceda al PostgreSQL del host.

**3. Configurar dominio**:

```
Domain: amauta-api.[TU-DOMINIO]
HTTPS: Enabled (Auto TLS via Traefik)
Redirect HTTP → HTTPS: Yes
```

**4. Deploy inicial**:

- Trigger build en Dokploy
- Verificar logs (sin errores)
- Health check: `curl https://amauta-api.[TU-DOMINIO]/health`

### Fase 5: Migraciones Prisma

```bash
# SSH al VPS
ssh root@[TU-VPS-IP]

# Dentro del contenedor API
docker exec -it amauta-api sh

# Ejecutar migraciones
npx prisma migrate deploy

# Verificar
npx prisma db seed  # Si tienes seed (T-014)

# Salir
exit
```

### Fase 6: Dokploy - Frontend Web

**1. Crear aplicación**:

```
Nombre: amauta-web
Tipo: Dockerfile
Repository: https://github.com/informaticadiaz/amauta
Branch: main
Build Context: ./
Dockerfile: apps/web/Dockerfile
```

**2. Configurar variables**:

```
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://amauta-api.[TU-DOMINIO]
NEXTAUTH_URL=https://amauta.[TU-DOMINIO]
NEXTAUTH_SECRET=[mismo que backend]
NEXT_PUBLIC_APP_NAME=Amauta
NEXT_PUBLIC_PWA_ENABLED=true
```

**3. Configurar dominio**:

```
Domain: amauta.[TU-DOMINIO]
HTTPS: Enabled
Redirect: Yes
```

**4. Deploy y verificar**:

- Build
- Verificar acceso en https://amauta.[TU-DOMINIO]

### Fase 7: CI/CD Automático

**1. Webhooks en Dokploy**:

```
Trigger: Push to main branch
Actions:
  - Pull latest code
  - Build Docker image
  - Deploy new version
```

**2. GitHub Actions (opcional para pre-checks)**:

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS
on:
  push:
    branches: [main]
jobs:
  pre-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
  # Dokploy webhook se activa automáticamente después
```

---

## ⚙️ Monitoreo y Mantenimiento

### Adaptar Scripts Existentes

**Tu VPS ya tiene scripts de monitoreo**. Puedes adaptarlos:

**1. Backup de Amauta DB**:

```bash
# Agregar a /root/scripts/backup-amauta-db.sh
docker exec [postgres-container] pg_dump -U amauta_user amauta_prod > \
  /root/backups/amauta_prod_$(date +%Y%m%d_%H%M%S).sql
```

**2. Agregar a health checks**:

```bash
# En /root/scripts/health-check.sh
# Verificar Amauta API
curl -f https://amauta-api.[TU-DOMINIO]/health || echo "Amauta API DOWN"
```

**3. Cron job para backup Amauta** (además del existente):

```cron
0 3 * * * /root/scripts/backup-amauta-db.sh
```

### Logs

**Ver logs en Dokploy UI**:

```
Aplicación → Logs (real-time)
```

**SSH al VPS**:

```bash
# API logs
docker logs amauta-api --tail 100 -f

# Web logs
docker logs amauta-web --tail 100 -f

# PostgreSQL logs (si dedicado)
docker logs amauta-postgres --tail 50
```

---

## 🚨 Consideraciones de Recursos

### Capacidad del VPS

**Proyectos actuales**:

- Proyectos existentes en producción
- Sistema de monitoreo

**Amauta agregará**:

- Frontend Next.js (~100-200MB RAM)
- Backend NestJS + Fastify (~200-400MB RAM)
- PostgreSQL compartido (sin overhead adicional) o dedicado (+100-200MB)

**Total estimado**: +300-600MB RAM adicional

**Recomendación**: Monitorear recursos con `docker stats` después del deployment.

### Disco

**Tu sistema de protección ya monitorea esto**. Amauta agregará:

- Imágenes Docker: ~500MB-1GB
- Datos PostgreSQL: Crecimiento según uso
- Uploads: Depende de actividad

**Acción**: El sistema de limpieza automática debería manejarlo, pero revisar umbrales.

---

## 🎯 Decisiones Técnicas Críticas

### 1. ¿Implementar Backend Ahora o Esperar?

**Situación**: `apps/api` tiene solo Prisma configurado, no hay NestJS implementado.

**Opciones**:

**A) Deployment completo diferido hasta Fase 1** (Recomendado):

- ✅ Esperar a tener backend funcional (NestJS + Fastify)
- ✅ Deployment más limpio y completo
- ✅ Menos iteraciones de configuración
- ⏱️ Tiempo: Completar T-014 (seed), luego implementar backend en Fase 1

**B) Deployment de infraestructura ahora**:

- ✅ Infraestructura lista desde el inicio
- ✅ Probar deployment temprano
- ❌ Deploy de "placeholder" sin funcionalidad real
- ❌ Posibles ajustes cuando el backend esté listo

**Recomendación**: **Opción A** - Completar Fase 0, luego hacer deployment cuando tengas MVP funcional.

### 2. ¿PostgreSQL Compartido o Dedicado?

**Recomendación**: **Compartido** (Opción 1)

**Razones**:

- Simplicidad operativa
- Aprovecha backups existentes
- Menos recursos
- Fácil crear database adicional

**Única razón para dedicado**: Si necesitas PostgreSQL 16+ y tu VPS usa 15.

### 3. ¿Redis Necesario desde el Inicio?

**Situación**: `docker-compose.yml` tiene Redis configurado, pero la arquitectura dice "en uso desde Fase 1".

**Recomendación**:

- Mantener Redis en docker-compose local
- **NO** deployarlo en VPS hasta que el backend lo necesite activamente
- Agregar cuando implementes caché de sesiones/queries

---

## 🚀 Roadmap Sugerido

### Fase 0 (Actual - 78% completado)

**Completado recientemente**:

- ✅ T-018: Servidor HTTP con NestJS + Fastify (issue #19)

**Tareas restantes**:

1. 🎯 T-019: Configurar Next.js en Frontend (issue #20) - **Próxima recomendada**
2. ⏳ T-014: Crear seed data (issue #15)
3. ⏳ T-014bis: Expandir CI (issue #10)
4. ⏳ T-015: Crear diagramas (issue #16)
5. ⏳ T-016: Documentar API (issue #17)

**NO hacer deployment todavía** - Fase 0 es fundamentos.

### Fase 0.5 (Preparación Deployment)

**Después de completar Fase 0**:

1. T-017: Configurar deployment VPS (issue #18) - **Este análisis te ayudará**
2. Crear Dockerfiles de producción
3. Configurar DNS en Cloudflare
4. Setup PostgreSQL en VPS
5. Configurar Dokploy (2 aplicaciones)
6. Documentar proceso completo

### Fase 1 (MVP)

**Con infraestructura lista**:

1. ✅ Backend NestJS + Fastify implementado
2. Implementar frontend Next.js (en progreso - issue #20)
3. Auth y usuarios básicos
4. Deploy automático desde día 1
5. Testing en producción durante desarrollo

**Ventaja**: Deployment continuo habilitado.

---

## ⚠️ Riesgos y Mitigaciones

### Riesgo 1: Overhead de Recursos

**Probabilidad**: Media
**Impacto**: Medio

**Mitigación**:

- Monitorear con `docker stats` post-deployment
- Sistema de alertas ya configurado detectará problemas
- PostgreSQL compartido reduce overhead
- Considerar upgrade VPS si uso > 85%

### Riesgo 2: Complejidad Operativa

**Probabilidad**: Media
**Impacto**: Bajo

**Mitigación**:

- Documentar deployment exhaustivamente
- Usar mismo Dokploy (experiencia ya adquirida)
- Scripts de monitoreo reutilizables
- Health checks automáticos

### Riesgo 3: Conflictos de Versiones

**Probabilidad**: Baja
**Impacto**: Medio

**Mitigación**:

- PostgreSQL compartido usa misma versión (no hay conflicto)
- Aislamiento por database
- Docker containers independientes por app
- Node.js 22 LTS en todos lados

### Riesgo 4: Secrets Leakeados

**Probabilidad**: Baja (gracias a estrategia implementada)
**Impacto**: Alto

**Mitigación**:

- ✅ Sistema `.env.local` ya implementado
- ✅ Validación Zod previene errores
- ✅ Documentación clara en `environment-variables.md`
- ✅ `.gitignore` protege archivos sensibles
- Rotación de secrets cada 3-6 meses (documentar)

---

## 📝 Recomendaciones Finales

### Inmediatas (Hoy/Esta Semana)

1. ✅ **Completar Fase 0** antes de pensar en deployment:
   - ✅ T-018: Backend NestJS + Fastify (issue #19) - Completado
   - 🎯 T-019: Configurar Next.js en Frontend (issue #20) - **Siguiente**
   - ⏳ T-014: Crear seed data (issue #15)
   - ⏳ T-014bis: Expandir CI (issue #10)
   - ⏳ T-015 y T-016 (docs) - issues #16, #17

2. 📚 **Estudiar este análisis** para familiarizarte con el plan

3. 🎯 **Decidir estrategia PostgreSQL**:
   - Recomendado: Compartido con proyectos existentes
   - Crear database `amauta_prod` en tu próxima sesión SSH

### Corto Plazo (Próximas 2 Semanas)

4. 🐳 **Crear Dockerfiles de producción**:
   - `apps/api/Dockerfile` (multi-stage)
   - `apps/web/Dockerfile` (cuando Next.js esté implementado)
   - `.dockerignore` en cada app

5. 🌐 **Configurar DNS en Cloudflare**:
   - Registros A/CNAME para `amauta.[TU-DOMINIO]`
   - Registros A/CNAME para `amauta-api.[TU-DOMINIO]`
   - Proxy activado, SSL/TLS Full (strict)

6. 🔐 **Generar y guardar secrets**:
   - Crear `.env.production.local` LOCALMENTE
   - Generar JWT_SECRET, SESSION_SECRET, NEXTAUTH_SECRET
   - **NO commitear** estos archivos
   - Guardar en gestor de passwords (1Password/Bitwarden)

### Medio Plazo (Próximo Mes)

7. 🚀 **Ejecutar T-017** (issue #18):
   - Seguir checklist del issue paso a paso
   - Documentar proceso real (ajustar si necesario)
   - Hacer deployment de prueba

8. ✅ **Backend NestJS + Fastify** (completado - issue #19):
   - Servidor HTTP básico implementado
   - Pendiente: módulos de auth, usuarios, cursos
   - Pendiente: endpoints REST completos
   - Pendiente: integración con Prisma

9. 🎨 **Frontend Next.js** (en progreso - issue #20):
   - App Router, Server Components
   - PWA configuration
   - Integración con backend API
   - NextAuth setup

### Largo Plazo (Próximos 3 Meses)

10. 📊 **Extender sistema de monitoreo**:
    - Adaptar scripts existentes para Amauta
    - Health checks específicos
    - Alertas personalizadas
    - Reportes de uso

11. 🔄 **Establecer flujo de deployment continuo**:
    - Push a `main` → deploy automático
    - Tests en CI antes de deploy
    - Rollback procedures documentados

12. 📈 **Optimizar recursos**:
    - Análisis de uso real
    - Ajuste de límites Docker
    - Considerar upgrade VPS si necesario

---

## 🔒 Seguridad de la Información

### Datos NO Incluidos en Este Documento

Por seguridad, este documento **NO contiene**:

- ❌ Direcciones IP reales del VPS
- ❌ Nombres de dominio reales
- ❌ Nombres de contenedores Docker específicos
- ❌ Credenciales de base de datos
- ❌ Secrets o API keys
- ❌ Información específica de proyectos en producción

### Dónde Se Almacenan los Datos Reales

**Opción 1: Repositorio Privado** (Recomendada)

- Crear repositorio privado: `amauta-deployment-private`
- Guardar versión completa del análisis con datos reales
- Acceso solo para ti

**Opción 2: Branch Privado**

- No es posible tener ramas privadas en repo público
- Toda rama en un repo público es pública

**Opción 3: Gestor de Passwords**

- 1Password / Bitwarden
- Guardar análisis completo como "Secure Note"
- Incluir todos los datos sensibles

**Opción 4: Archivo Local Encriptado**

- Guardar en `~/.amauta-secrets/vps-analysis-full.md`
- Encriptar con GPG si es necesario
- **NO** sincronizar con git

### Recomendación de Estructura

```
# Repositorio PÚBLICO (informaticadiaz/amauta)
docs/technical/
  └── vps-deployment-analysis.md          ✅ Versión sanitizada

# Repositorio PRIVADO (amauta-deployment-private)
deployment/
  ├── vps-analysis-FULL.md                🔒 Con datos reales
  ├── production-configs/
  │   ├── .env.production.local.template  🔒 Template con valores
  │   ├── dokploy-configs.md              🔒 Configuraciones UI
  │   └── ssh-commands.md                 🔒 Comandos específicos VPS
  └── credentials/
      ├── database.md                     🔒 Credenciales DB
      └── secrets.md                      🔒 JWT, API keys, etc.

# Local (NO en git)
~/.amauta-secrets/
  ├── .env.production.local               🔒 Archivos reales
  └── vps-credentials.md                  🔒 IP, SSH, etc.
```

---

## 📚 Recursos y Referencias

### Documentación Amauta (Pública)

- `docs/technical/architecture.md` - Arquitectura completa
- `docs/technical/environment-variables.md` - Estrategia de seguridad
- `docs/technical/setup.md` - Setup local
- `docs/technical/database.md` - Schema Prisma
- `WORKFLOW.md` - Metodología de trabajo con issues

### Documentación VPS

- Documentación VPS disponible en ubicación privada
- No incluida en repositorio público

### Issues Relevantes

- Issue #20: T-019 Configurar Next.js en Frontend - 🎯 **Siguiente**
- Issue #19: T-018 Servidor HTTP NestJS + Fastify - ✅ Completado
- Issue #18: T-017 Configurar deployment VPS (8 puntos)
- Issue #15: T-014 Crear seed data
- Issue #10: T-014bis Expandir CI
- Issues #16, #17: Documentación

### Comandos Útiles (Genéricos)

```bash
# SSH al VPS
ssh root@[TU-VPS-IP]

# Ver estado Docker
ssh root@[TU-VPS-IP] "docker ps -a"

# Monitoreo disco
ssh root@[TU-VPS-IP] "df -h / && docker system df"

# Logs de aplicación
docker logs [container-name] --tail 100 -f

# Backup manual PostgreSQL
docker exec [postgres-container] pg_dump -U usuario dbname > backup.sql
```

---

## ✨ Conclusión

**Tu VPS está listo** para recibir Amauta. Tienes:

- ✅ Infraestructura robusta y monitoreada
- ✅ Experiencia comprobada con Dokploy
- ✅ Sistema de protección automática
- ✅ Documentación exhaustiva

**Amauta está preparado** para deployment. Tiene:

- ✅ Arquitectura bien definida
- ✅ Variables de entorno con estrategia de seguridad
- ✅ Prisma ORM configurado con schema completo
- ✅ Docker Compose para desarrollo local

**Próximo paso**: Completar Fase 0 (4 tareas restantes), luego ejecutar T-017 siguiendo el plan detallado de este análisis.

**Tiempo estimado total para deployment**: 2-3 días de trabajo (cuando estés listo).

---

**Nota**: Para acceder a la versión completa con datos reales de configuración, consultar repositorio privado o gestor de passwords.

_Última actualización: 2025-12-19_
