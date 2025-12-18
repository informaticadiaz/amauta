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

#### Opción A: PostgreSQL Local

```bash
# Crear base de datos
createdb amauta_dev

# Ejecutar migraciones
npm run prisma migrate dev

# Opcional: Cargar datos de prueba
npm run prisma db seed
```

#### Opción B: Docker

```bash
# Iniciar PostgreSQL y Redis con Docker Compose
docker-compose up -d postgres redis

# Ejecutar migraciones
npm run prisma migrate dev
```

### 5. Generar Cliente Prisma

```bash
npm run prisma generate
```

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

## Problemas Comunes

### Error: "Port 3000 already in use"

```bash
# Encontrar y matar proceso
lsof -ti:3000 | xargs kill -9
```

### Error de conexión a PostgreSQL

```bash
# Verificar que PostgreSQL está corriendo
pg_isready

# O si usas Docker:
docker-compose ps
```

### Error de Prisma

```bash
# Regenerar cliente
npm run prisma generate

# Reset base de datos (⚠️ borra datos)
npm run prisma migrate reset
```

### Limpiar y reinstalar

```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules .next
npm run install
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
