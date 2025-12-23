# @amauta/api

Backend de Amauta - API REST con NestJS + Fastify

## Estado Actual

**Fase 0 - Fundamentos completados**

- [x] TypeScript en modo strict
- [x] NestJS + Fastify configurado
- [x] PostgreSQL 15 con Prisma ORM
- [x] Variables de entorno con validación Zod
- [x] Endpoints básicos (`/health`, `/api/v1/info`)
- [x] CORS configurado
- [x] Dockerfile optimizado para producción
- [ ] Autenticación JWT (Fase 1)
- [ ] Endpoints de negocio (Fase 1)

## Stack Tecnológico

| Tecnología | Versión | Propósito                                    |
| ---------- | ------- | -------------------------------------------- |
| Node.js    | 20 LTS  | Runtime                                      |
| NestJS     | 11.x    | Framework backend                            |
| Fastify    | -       | HTTP adapter (mejor performance que Express) |
| TypeScript | 5.x     | Tipado estático                              |
| PostgreSQL | 15      | Base de datos                                |
| Prisma     | 6.x     | ORM                                          |
| Zod        | 4.x     | Validación de schemas                        |
| Redis      | 7       | Cache (disponible)                           |

## Desarrollo

### Requisitos

- Node.js 20+
- Docker y Docker Compose (para PostgreSQL y Redis)

### Comandos

```bash
# Iniciar servicios (PostgreSQL, Redis)
docker compose up -d

# Instalar dependencias
npm install

# Generar cliente Prisma
npm run prisma:generate --workspace=@amauta/api

# Ejecutar migraciones
npm run prisma:migrate --workspace=@amauta/api

# Build
npm run build --workspace=@amauta/api

# Iniciar en desarrollo
npm run start:dev --workspace=@amauta/api

# Solo iniciar (requiere build previo)
npm run start --workspace=@amauta/api
```

### Variables de Entorno

Copiar `.env.example` a `.env.local` y configurar:

```bash
cp apps/api/.env.example apps/api/.env.local
```

Variables requeridas:

- `DATABASE_URL` - Conexión a PostgreSQL
- `JWT_SECRET` - Secret para tokens (mín. 32 caracteres)

Ver `docs/technical/environment-variables.md` para documentación completa.

## Estructura

```
apps/api/
├── src/
│   ├── main.ts           # Entry point (NestJS + Fastify)
│   ├── app.module.ts     # Módulo raíz
│   ├── app.controller.ts # Controller principal
│   ├── app.service.ts    # Service principal
│   └── config/
│       └── env.ts        # Validación de variables de entorno
├── prisma/
│   ├── schema.prisma     # Schema de base de datos
│   └── migrations/       # Migraciones
├── dist/                 # Build de producción
├── Dockerfile            # Multi-stage build
├── .dockerignore
├── package.json
└── tsconfig.json
```

## Endpoints Disponibles

| Método | Ruta           | Descripción                     |
| ------ | -------------- | ------------------------------- |
| GET    | `/health`      | Health check (usado por Docker) |
| GET    | `/`            | Información básica de la API    |
| GET    | `/api/v1/info` | Información detallada de la API |

### Ejemplo de Respuesta

```bash
curl http://localhost:3001/health
```

```json
{
  "status": "ok",
  "timestamp": "2025-12-23T12:00:00.000Z",
  "version": "0.1.0",
  "uptime": 3600
}
```

## Testing

```bash
# Type check
npm run type-check --workspace=@amauta/api

# Lint
npm run lint --workspace=@amauta/api

# Lint con fix
npm run lint:fix --workspace=@amauta/api
```

## Deployment

El API está configurado para deployment en Docker:

```bash
# Build de imagen
docker build -f apps/api/Dockerfile -t amauta-api .

# Ejecutar
docker run -p 4000:4000 --env-file .env.production amauta-api
```

Ver `docs/technical/dokploy-ui-deployment-guide.md` para deployment en producción.

## Documentación Relacionada

- [Arquitectura del Sistema](../../docs/technical/architecture.md)
- [Estándares de Código](../../docs/technical/coding-standards.md)
- [Base de Datos](../../docs/technical/database.md)
- [Variables de Entorno](../../docs/technical/environment-variables.md)
- [Guía de Deployment](../../docs/technical/dokploy-ui-deployment-guide.md)
