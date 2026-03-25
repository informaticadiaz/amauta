# Guía de Configuración - Amauta

## Requisitos Previos

### Software Necesario

- **Node.js**: v20.x o superior ([Descargar](https://nodejs.org/))
- **npm**: v10.x o superior (viene incluido con Node.js)
- **PostgreSQL**: v15.x o superior ([Descargar](https://www.postgresql.org/download/)) - Pendiente de configuración
- **Redis**: v7.x o superior ([Descargar](https://redis.io/download)) - Opcional, para futuro
- **Git**: Para control de versiones
- **Docker** (opcional): Para ejecutar servicios en contenedores

### Editor Recomendado

- **VS Code** con extensiones:
  - ESLint
  - Prettier
  - Prisma
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features

## Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-org/amauta.git
cd amauta
```

### 2. Instalar Dependencias

```bash
# Instalar dependencias del proyecto
npm install
```

### 3. Configurar Variables de Entorno

El proyecto utiliza variables de entorno para configuración, con validación automática mediante Zod.

#### 3.1. Backend API (apps/api)

Crear archivo `.env.local` en `apps/api/`:

```bash
cd apps/api
cp .env.example .env.local
```

Editar `apps/api/.env.local` con tus configuraciones:

```env
# Variables mínimas requeridas para desarrollo
NODE_ENV=development
API_PORT=3001
DATABASE_URL=postgresql://usuario:password@localhost:5432/amauta_dev
JWT_SECRET=genera-un-secreto-aleatorio-de-al-menos-32-caracteres-aqui
NEXTAUTH_SECRET=genera-otro-secreto-aleatorio-de-al-menos-32-caracteres
```

**Generar secrets seguros:**

```bash
# Para JWT_SECRET y NEXTAUTH_SECRET
openssl rand -base64 32
```

**Validación automática:**

El archivo `apps/api/src/config/env.ts` valida automáticamente todas las variables al iniciar la aplicación. Si falta alguna variable requerida o tiene un valor inválido, la aplicación mostrará un error claro y no se iniciará.

**Variables disponibles:**

Ver el archivo `apps/api/.env.example` para la lista completa de variables disponibles, incluyendo:

- General: `NODE_ENV`, `API_PORT`, `API_HOST`, `API_URL`
- Base de datos: `DATABASE_URL`, `DATABASE_POOL_MIN`, `DATABASE_POOL_MAX`
- Seguridad: `JWT_SECRET`, `JWT_EXPIRES_IN`, `SESSION_SECRET`
- CORS: `CORS_ORIGIN`
- Redis (opcional): `REDIS_URL`, `REDIS_CACHE_TTL`
- Uploads: `UPLOAD_DIR`, `MAX_FILE_SIZE`, `ALLOWED_FILE_TYPES`
- Email SMTP (opcional): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- Logs: `LOG_LEVEL`, `LOG_FORMAT`
- Rate limiting: `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`

#### 3.2. Frontend Web (apps/web)

Crear archivo `.env.local` en `apps/web/`:

```bash
cd apps/web
cp .env.example .env.local
```

Editar `apps/web/.env.local` con tus configuraciones:

```env
# Variables mínimas requeridas para desarrollo
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=usa-el-mismo-secreto-que-en-api
```

**Importante para Next.js:**

- Variables con prefijo `NEXT_PUBLIC_` son accesibles en el navegador (cliente)
- Variables sin prefijo solo están disponibles en el servidor
- La validación se ejecuta tanto en build time como en runtime

**Variables disponibles:**

Ver el archivo `apps/web/.env.example` para la lista completa de variables disponibles, incluyendo:

- Next.js: `PORT`
- API: `API_URL` (servidor), `NEXT_PUBLIC_API_URL` (cliente)
- NextAuth: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- App: `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_VERSION`
- Analytics (opcional): `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_SENTRY_DSN`
- PWA: `NEXT_PUBLIC_PWA_ENABLED`
- Servicios externos (opcional): Cloudinary, AWS S3

#### 3.3. Uso en el Código

**Backend (apps/api):**

```typescript
// Importar variables validadas
import { env } from './config/env';

// Usar con autocompletado y type-safety
const port = env.API_PORT; // number
const dbUrl = env.DATABASE_URL; // string
const corsOrigins = env.CORS_ORIGIN; // string[]
```

**Frontend (apps/web):**

```typescript
// En Server Components o API routes
import { env } from '@/config/env';
const apiUrl = env.API_URL; // Funciona en servidor

// En Client Components
import { clientEnv } from '@/config/env';
const apiUrl = clientEnv.NEXT_PUBLIC_API_URL; // Funciona en cliente
```

#### 3.4. Validación y Errores

Si faltan variables requeridas o tienen valores inválidos, verás un error claro al iniciar:

```
❌ Error en la configuración de variables de entorno:

  - JWT_SECRET: String must contain at least 32 character(s)
  - DATABASE_URL: Required

📄 Revisa el archivo .env.example para ver las variables requeridas.
```

### 4. Configurar Base de Datos

El proyecto usa PostgreSQL 15+ como base de datos principal. Tienes dos opciones para configurarla:

#### Opción A: Docker (Recomendado) 🐳

Esta es la forma más rápida y sencilla. Todo está pre-configurado en `docker-compose.yml`.

**Requisitos:**

- Docker Desktop instalado ([Descargar](https://www.docker.com/products/docker-desktop))
- Docker Compose (incluido en Docker Desktop)

**Pasos:**

```bash
# 1. Iniciar servicios (PostgreSQL + Redis)
docker-compose up -d

# 2. Verificar que los servicios estén corriendo
docker-compose ps

# 3. Ver logs (opcional)
docker-compose logs -f postgres

# 4. Los servicios ya están listos para usar
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

**Servicios incluidos:**

- **PostgreSQL 15**: Base de datos principal
  - Usuario: `amauta`
  - Password: `desarrollo123`
  - Database: `amauta_dev`
  - Puerto: `5432`
- **Redis 7**: Caché y sesiones (opcional)
  - Password: `desarrollo123`
  - Puerto: `6379`

**Comandos útiles:**

```bash
# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ borra datos)
docker-compose down -v

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Conectar a PostgreSQL
docker-compose exec postgres psql -U amauta -d amauta_dev

# Backup de base de datos
docker-compose exec postgres pg_dump -U amauta amauta_dev > backup.sql

# Restore de backup
docker-compose exec -T postgres psql -U amauta -d amauta_dev < backup.sql
```

**Scripts de inicialización:**

El directorio `docker/postgres/init/` contiene scripts SQL que se ejecutan automáticamente la primera vez que se crea el contenedor:

- `01-init.sql`: Configura extensiones (uuid-ossp, pg_trgm, unaccent), funciones útiles y parámetros de búsqueda en español

**Persistencia de datos:**

Los datos se guardan en volúmenes Docker y persisten entre reinicios:

- `amauta_postgres_data`: Datos de PostgreSQL
- `amauta_redis_data`: Datos de Redis

#### Opción B: Instalación Local

Si prefieres no usar Docker o quieres mayor control sobre PostgreSQL, puedes instalarlo localmente.

**📖 Guía completa:** Ver [`docker/postgres/LOCAL_INSTALL.md`](../../docker/postgres/LOCAL_INSTALL.md)

**Guías por sistema operativo:**

- **Linux (Ubuntu/Debian)**: `sudo apt install postgresql-15`
- **Linux (Fedora/RHEL)**: `sudo dnf install postgresql-server`
- **macOS**: `brew install postgresql@15` o [Postgres.app](https://postgresapp.com/)
- **Windows**: [Instalador oficial](https://www.postgresql.org/download/windows/)

**Después de instalar:**

```bash
# 1. Crear usuario y base de datos
sudo -u postgres psql
```

```sql
CREATE USER amauta WITH PASSWORD 'desarrollo123';
CREATE DATABASE amauta_dev;
GRANT ALL PRIVILEGES ON DATABASE amauta_dev TO amauta;
ALTER DATABASE amauta_dev OWNER TO amauta;

-- Habilitar extensiones
\c amauta_dev
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
\q
```

```bash
# 2. Configurar .env.local
# Ver apps/api/.env.local y apps/web/.env.local
# DATABASE_URL=postgresql://amauta:desarrollo123@localhost:5432/amauta_dev

# 3. Verificar conexión
psql -U amauta -d amauta_dev -h localhost
```

#### Verificar Conexión

Después de configurar la base de datos (Docker o local):

```bash
# Opción 1: Conectar con psql
psql -U amauta -d amauta_dev -h localhost
# Password: desarrollo123

# Dentro de psql:
SELECT version();  -- Ver versión de PostgreSQL
\l                 -- Listar bases de datos
\du                -- Listar usuarios
\q                 -- Salir

# Opción 2: Verificar con variable de entorno
echo $DATABASE_URL

# Opción 3: Una vez que Prisma esté configurado (T-013)
# npm run prisma db execute --stdin <<< "SELECT version();"
```

### 5. Configurar Redis (Opcional)

Redis se usa para caché y sesiones. Es opcional en desarrollo pero **recomendado**.

#### Con Docker (Recomendado)

Si usaste `docker-compose up -d`, Redis ya está corriendo en `localhost:6379`.

**Verificar que Redis esté funcionando:**

```bash
# Opción 1: Redis CLI (si tienes redis-cli instalado)
redis-cli -h localhost -p 6379 ping
# Debería responder: PONG

# Opción 2: Conectar con password
redis-cli -h localhost -p 6379 -a desarrollo123 ping

# Opción 3: Desde Docker
docker-compose exec redis redis-cli ping
```

**Comandos útiles:**

```bash
# Ver info de Redis
docker-compose exec redis redis-cli info

# Ver memoria usada
docker-compose exec redis redis-cli info memory

# Ver keys almacenadas
docker-compose exec redis redis-cli keys '*'

# Flush toda la cache (⚠️ borra todo)
docker-compose exec redis redis-cli FLUSHALL

# Ver logs de Redis
docker-compose logs -f redis
```

#### Instalación Local (Alternativa)

**Linux (Ubuntu/Debian):**

```bash
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**macOS:**

```bash
brew install redis
brew services start redis
```

**Windows:**

```bash
# Descargar desde: https://github.com/microsoftarchive/redis/releases
# O usar WSL2 y seguir instrucciones de Linux
```

**Configurar password (opcional):**

```bash
# Editar /etc/redis/redis.conf
requirepass desarrollo123

# Reiniciar
sudo systemctl restart redis-server
```

#### Configurar en .env.local

Si Redis está disponible, agregar a `apps/api/.env.local`:

```env
REDIS_URL=redis://:desarrollo123@localhost:6379
REDIS_CACHE_TTL=3600
```

Si **NO** usas Redis, puedes omitir estas variables. La aplicación funcionará sin caché.

### 6. Configurar Prisma ORM

Una vez que PostgreSQL esté corriendo, configura Prisma:

```bash
# 1. Ejecutar primera migración (crea todas las tablas)
cd apps/api
npm run prisma:migrate

# Esto te pedirá un nombre para la migración, por ejemplo: "init"
# Creará las tablas y generará Prisma Client automáticamente
```

**¿Qué hace esto?**

- Crea todas las tablas en PostgreSQL según `apps/api/prisma/schema.prisma`
- Genera la carpeta `prisma/migrations/` con el historial de migraciones
- Genera Prisma Client automáticamente en `node_modules/@prisma/client`

**Comandos Prisma disponibles:**

```bash
# Generar/actualizar Prisma Client (si modificas el schema)
npm run prisma:generate --workspace=@amauta/api

# Crear nueva migración después de modificar schema.prisma
npm run prisma:migrate --workspace=@amauta/api

# Abrir Prisma Studio (interface gráfica para ver datos)
npm run prisma:studio --workspace=@amauta/api
# Abre en http://localhost:5555

# Ver estado de migraciones
npx prisma migrate status --schema=apps/api/prisma/schema.prisma

# Push schema sin crear migración (desarrollo rápido)
npm run db:push --workspace=@amauta/api
```

**Ver documentación completa:**

- Schema y modelos: `docs/technical/database.md`
- Comandos Prisma: `apps/api/prisma/README.md`

## Ejecutar el Proyecto

### Desarrollo

```bash
# Terminal 1: Backend API
npm run dev:api

# Terminal 2: Frontend Next.js
npm run dev:web

# O ambos simultáneamente:
npm run dev
```

La aplicación estará disponible en:

- Frontend: http://localhost:3000
- API Backend: http://localhost:3001
- Prisma Studio: `npm run prisma studio` → http://localhost:5555

### Producción

```bash
# Build
npm run build

# Iniciar
npm run start
```

#### Migraciones Prisma en Producción (IMPORTANTE)

En producción, el contenedor de la API ejecuta automáticamente las migraciones
al iniciar (configurado en el `Dockerfile` del API):

```
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
```

**Implicaciones:**

- Cada deploy de la API aplica migraciones pendientes con `prisma migrate deploy`.
- No es necesario ejecutar manualmente `migrate deploy` si el deploy ya corrió.
- El workflow de GitHub Actions valida el deploy con un healthcheck a `/health`.

## Estructura del Proyecto

```
amauta/
├── apps/
│   ├── web/                    # Aplicación Next.js (Frontend)
│   │   ├── app/                # App Router
│   │   ├── components/         # Componentes React
│   │   ├── lib/                # Utilidades
│   │   └── public/             # Assets estáticos
│   └── api/                    # Backend API
│       ├── src/
│       │   ├── controllers/    # Controladores
│       │   ├── services/       # Lógica de negocio
│       │   ├── routes/         # Rutas
│       │   └── middleware/     # Middleware
│       └── prisma/             # Esquema y migraciones
│           ├── schema.prisma
│           ├── migrations/
│           └── seed.ts
├── packages/
│   ├── ui/                     # Componentes UI compartidos
│   ├── config/                 # Configuraciones compartidas
│   └── types/                  # Tipos TypeScript compartidos
├── docs/                       # Documentación
│   ├── technical/              # Docs técnicas
│   └── project-management/     # Docs de gestión
├── docker-compose.yml
├── package.json
├── turbo.json                  # Configuración Turborepo
└── .env.example
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar todo en modo desarrollo
npm run dev:web          # Solo frontend
npm run dev:api          # Solo backend

# Build
npm run build            # Construir todo
npm run build:web        # Solo frontend
npm run build:api        # Solo backend

# Testing
npm run test             # Ejecutar tests
npm run test:watch       # Tests en modo watch
npm run test:coverage    # Tests con cobertura

# Linting y Formatting
npm run lint             # Ejecutar ESLint
npm run format           # Formatear con Prettier
npm run type-check       # Verificar tipos TypeScript

# Base de Datos
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:migrate   # Crear migración
npm run prisma:studio    # Abrir Prisma Studio
npm run prisma:seed      # Cargar datos de prueba

# Docker
npm run docker:up        # Iniciar servicios
npm run docker:down      # Detener servicios
npm run docker:clean     # Limpiar volúmenes
```

## Configuración de Docker (Opcional)

### docker-compose.yml básico

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: amauta_dev
      POSTGRES_USER: amauta
      POSTGRES_PASSWORD: desarrollo123
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

Ejecutar:

```bash
docker-compose up -d
```

## Problemas Comunes y Soluciones

### 1. Error: "Port already in use"

**Síntoma:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solución:**

```bash
# Encontrar proceso usando el puerto
lsof -ti:3000

# Matar proceso
lsof -ti:3000 | xargs kill -9

# O cambiar puerto en .env.local
PORT=3002
API_PORT=3003
```

### 2. Error de conexión a PostgreSQL

**Síntoma:** `Error: P1001: Can't reach database server`

**Verificar:**

```bash
# ¿PostgreSQL está corriendo?
pg_isready

# Con Docker:
docker-compose ps postgres

# ¿Puedes conectarte manualmente?
psql -U amauta -d amauta_dev -h localhost
```

**Soluciones comunes:**

```bash
# Reiniciar PostgreSQL (Docker)
docker-compose restart postgres

# Ver logs para más info
docker-compose logs postgres

# Verificar DATABASE_URL en .env.local
echo $DATABASE_URL
# Debe ser: postgresql://amauta:desarrollo123@localhost:5432/amauta_dev
```

### 3. Error de Prisma Client

**Síntoma:** `@prisma/client did not initialize yet`

**Solución:**

```bash
# Regenerar cliente Prisma
npm run prisma:generate --workspace=@amauta/api

# Si persiste, limpiar y regenerar
rm -rf node_modules/@prisma/client
npm install
npm run prisma:generate --workspace=@amauta/api
```

### 4. Migraciones de Prisma fallan

**Síntoma:** `Migration failed to apply`

**Solución:**

```bash
# Ver estado de migraciones
npx prisma migrate status --schema=apps/api/prisma/schema.prisma

# Resolver manualmente (⚠️ solo desarrollo)
npm run prisma:migrate:reset --workspace=@amauta/api

# Esto:
# 1. Elimina todas las tablas
# 2. Re-aplica todas las migraciones
# 3. Ejecuta seed (si existe)
```

### 5. Error de Redis

**Síntoma:** `Error: Redis connection to localhost:6379 failed`

**Solución:**

```bash
# Verificar que Redis está corriendo
redis-cli ping
# O con Docker:
docker-compose ps redis

# Si no es crítico, comentar REDIS_URL en .env.local
# La app funcionará sin caché

# Iniciar Redis (Docker)
docker-compose up -d redis
```

### 6. Variables de entorno no reconocidas

**Síntoma:** `❌ Error en la configuración de variables de entorno`

**Solución:**

```bash
# 1. Verificar que .env.local existe
ls -la apps/api/.env.local
ls -la apps/web/.env.local

# 2. Verificar formato (sin comillas extra, sin espacios)
# CORRECTO:
NODE_ENV=development

# INCORRECTO:
NODE_ENV = development
NODE_ENV="development"

# 3. Regenerar secrets si faltan
openssl rand -base64 32

# 4. Reiniciar servidor después de cambiar .env
```

### 7. Error de permisos en PostgreSQL

**Síntoma:** `permission denied for schema public`

**Solución:**

```sql
-- Conectar como superusuario
sudo -u postgres psql amauta_dev

-- Otorgar permisos
GRANT ALL ON SCHEMA public TO amauta;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO amauta;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO amauta;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO amauta;
```

### 8. ESLint o Prettier errores

**Síntoma:** Archivos con errores de formato

**Solución:**

```bash
# Formatear todos los archivos
npm run format

# Fix errores de ESLint automáticamente
npm run lint:fix --workspace=@amauta/api
npm run lint:fix --workspace=@amauta/web
```

### 9. Limpiar y reinstalar todo

**Cuando nada funciona:**

```bash
# 1. Detener servicios
docker-compose down

# 2. Limpiar todo
rm -rf node_modules
rm -rf apps/api/node_modules
rm -rf apps/web/node_modules
rm -rf .next
rm -rf apps/web/.next
rm -rf apps/api/dist

# 3. Limpiar package-lock
rm package-lock.json

# 4. Reinstalar
npm install

# 5. Regenerar Prisma
npm run prisma:generate --workspace=@amauta/api

# 6. Iniciar servicios
docker-compose up -d

# 7. Ejecutar migraciones
npm run prisma:migrate --workspace=@amauta/api
```

### 10. Docker se queda sin espacio

**Síntoma:** `no space left on device`

**Solución:**

```bash
# Ver uso de disco de Docker
docker system df

# Limpiar imágenes sin usar
docker image prune -a

# Limpiar volúmenes sin usar
docker volume prune

# Limpiar todo (⚠️ elimina contenedores detenidos)
docker system prune -a --volumes
```

### 11. Husky pre-commit hooks fallan

**Síntoma:** `husky - pre-commit hook failed`

**Solución:**

```bash
# Ver qué falló
git commit -m "test" --no-verify

# Formatear manualmente antes de commit
npm run format
npm run lint:fix --workspace=@amauta/api

# O skip hooks (solo para emergencias)
git commit -m "mensaje" --no-verify
```

## Siguiente Paso

Una vez configurado el entorno, revisa:

- [Estándares de Código](./coding-standards.md)
- [Guía de Contribución](../../CONTRIBUTING.md)
- [Arquitectura](./architecture.md)

## Soporte

¿Problemas con la configuración?

- Revisa los [issues](https://github.com/tu-org/amauta/issues)
- Crea un nuevo issue con la etiqueta `setup`
