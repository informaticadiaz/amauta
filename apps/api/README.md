# @amauta/api

Backend de Amauta - API REST

## Estado Actual

🚧 **Pendiente configuración**

Este workspace está preparado pero requiere configuración completa que se hará en próximos issues:

- [ ] Issue #5 (T-009): Configurar TypeScript
- [ ] Futuro: Configurar Express o Fastify
- [ ] Issue #8 (T-012): Configurar PostgreSQL
- [ ] Issue #9 (T-013): Configurar Prisma ORM
- [ ] Futuro: Configurar autenticación JWT
- [ ] Futuro: Configurar validación con Zod

## Tecnologías Planeadas

- **Node.js** runtime
- **Express** o **Fastify** como framework
- **TypeScript** en modo strict
- **PostgreSQL** como base de datos
- **Prisma** como ORM
- **Zod** para validación de schemas
- **JWT** para autenticación

## Desarrollo

```bash
# Desde la raíz del monorepo
npm run dev

# Solo este workspace (cuando esté configurado)
npm run dev --workspace=@amauta/api
```

## Estructura (Futura)

```
apps/api/
├── src/
│   ├── routes/       # Rutas de la API
│   ├── controllers/  # Lógica de negocio
│   ├── middleware/   # Middleware custom
│   ├── services/     # Servicios
│   ├── lib/          # Utilidades
│   └── server.ts     # Punto de entrada
├── prisma/           # Schemas de Prisma
└── package.json
```

## Endpoints Planeados

Ver `docs/technical/api-reference.md` para la especificación completa de la API (cuando esté disponible).
