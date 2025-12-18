# Guía de Configuración - Amauta

## Requisitos Previos

### Software Necesario
- **Node.js**: v20.x o superior ([Descargar](https://nodejs.org/))
- **pnpm**: v8.x o superior (recomendado sobre npm/yarn)
  ```bash
  npm install -g pnpm
  ```
- **PostgreSQL**: v15.x o superior ([Descargar](https://www.postgresql.org/download/))
- **Redis**: v7.x o superior ([Descargar](https://redis.io/download))
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
pnpm install
```

### 3. Configurar Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.example .env.local
```

Editar `.env.local` con tus configuraciones:

```env
# Database
DATABASE_URL="postgresql://usuario:password@localhost:5432/amauta_dev"

# Redis
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-secreto-aleatorio-aqui"

# API
API_URL="http://localhost:3001"
API_PORT=3001

# Entorno
NODE_ENV="development"

# Opcional: Para uploads de archivos
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760  # 10MB

# Opcional: Email (para notificaciones)
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASSWORD=""
```

### 4. Configurar Base de Datos

#### Opción A: PostgreSQL Local

```bash
# Crear base de datos
createdb amauta_dev

# Ejecutar migraciones
pnpm prisma migrate dev

# Opcional: Cargar datos de prueba
pnpm prisma db seed
```

#### Opción B: Docker

```bash
# Iniciar PostgreSQL y Redis con Docker Compose
docker-compose up -d postgres redis

# Ejecutar migraciones
pnpm prisma migrate dev
```

### 5. Generar Cliente Prisma

```bash
pnpm prisma generate
```

## Ejecutar el Proyecto

### Desarrollo

```bash
# Terminal 1: Backend API
pnpm dev:api

# Terminal 2: Frontend Next.js
pnpm dev:web

# O ambos simultáneamente:
pnpm dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- API Backend: http://localhost:3001
- Prisma Studio: `pnpm prisma studio` → http://localhost:5555

### Producción

```bash
# Build
pnpm build

# Iniciar
pnpm start
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
pnpm dev              # Iniciar todo en modo desarrollo
pnpm dev:web          # Solo frontend
pnpm dev:api          # Solo backend

# Build
pnpm build            # Construir todo
pnpm build:web        # Solo frontend
pnpm build:api        # Solo backend

# Testing
pnpm test             # Ejecutar tests
pnpm test:watch       # Tests en modo watch
pnpm test:coverage    # Tests con cobertura

# Linting y Formatting
pnpm lint             # Ejecutar ESLint
pnpm format           # Formatear con Prettier
pnpm type-check       # Verificar tipos TypeScript

# Base de Datos
pnpm prisma:generate  # Generar cliente Prisma
pnpm prisma:migrate   # Crear migración
pnpm prisma:studio    # Abrir Prisma Studio
pnpm prisma:seed      # Cargar datos de prueba

# Docker
pnpm docker:up        # Iniciar servicios
pnpm docker:down      # Detener servicios
pnpm docker:clean     # Limpiar volúmenes
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
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
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
pnpm prisma generate

# Reset base de datos (⚠️ borra datos)
pnpm prisma migrate reset
```

### Limpiar y reinstalar
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules .next
pnpm install
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
