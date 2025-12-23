# ADR-005: Deployment con Dokploy en VPS

## Estado

Aceptado

## Fecha

2024-12-20

## Contexto

Necesitamos elegir una estrategia de deployment para Amauta. Los requisitos son:

- Costo accesible (proyecto educativo/open source)
- Control sobre la infraestructura
- Soporte para PostgreSQL, Redis, Node.js
- SSL/HTTPS automático
- Fácil de mantener

### Contexto adicional

Amauta tiene una misión social de democratizar la educación. El costo de infraestructura debe ser sostenible a largo plazo, especialmente si instituciones educativas pequeñas quieren hostear su propia instancia.

## Opciones Consideradas

### Opción 1: Vercel + Railway/Supabase

- **Pros**:
  - Zero config para Next.js
  - Free tier generoso
  - Escalado automático
- **Contras**:
  - Costos escalan rápidamente
  - Dependencia de múltiples servicios
  - Backend en serverless (cold starts)
  - Menos control

### Opción 2: AWS/GCP/Azure

- **Pros**:
  - Máxima flexibilidad
  - Escalabilidad ilimitada
  - Servicios gestionados
- **Contras**:
  - Complejidad alta
  - Costos difíciles de predecir
  - Requiere expertise DevOps
  - Overkill para proyecto inicial

### Opción 3: DigitalOcean App Platform

- **Pros**:
  - Simple de usar
  - Precios predecibles
  - Managed databases
- **Contras**:
  - Más caro que VPS puro
  - Menos control que VPS
  - Vendor lock-in

### Opción 4: VPS con Dokploy (elegida)

- **Pros**:
  - Costo fijo predecible (~$6-20/mes)
  - Control total
  - Self-hosted (sin vendor lock-in)
  - Docker-based (portable)
  - UI para gestión
  - SSL automático con Let's Encrypt
- **Contras**:
  - Requiere setup inicial
  - Responsabilidad de mantenimiento
  - Sin escalado automático

### Opción 5: VPS con Docker Compose manual

- **Pros**:
  - Máximo control
  - Sin dependencias de herramientas
- **Contras**:
  - Setup manual completo
  - Sin UI de gestión
  - SSL manual
  - Más propenso a errores

## Decisión

**Usar Dokploy en un VPS** para deployment.

### Razones principales

1. **Costo fijo y bajo**: VPS de $6-20/mes cubre todo
2. **Self-hosted**: Cualquier institución puede replicar el setup
3. **Docker-based**: Portabilidad, mismo ambiente en dev y prod
4. **Dokploy UI**: Facilita gestión sin ser experto DevOps
5. **SSL automático**: Let's Encrypt integrado
6. **Sin vendor lock-in**: Podemos migrar a cualquier VPS

### Proveedor elegido

Hostinger VPS - Buen balance costo/performance para Latinoamérica.

## Consecuencias

### Positivas

- Costos predecibles y bajos
- Control total sobre la infraestructura
- Mismo stack que desarrollo (Docker)
- Documentación replicable para otras instituciones
- Sin límites artificiales (requests, bandwidth)

### Negativas

- Responsabilidad de backups
- Responsabilidad de seguridad del servidor
- Sin escalado automático (hay que escalar manualmente)
- Single point of failure (sin HA automático)

### Neutras

- Requiere conocimiento básico de Linux/Docker
- Updates de OS/Docker son manuales
- Monitoreo debe configurarse aparte

## Arquitectura de Deployment

```
VPS (Hostinger)
├── Dokploy (gestión)
│   ├── Traefik (reverse proxy + SSL)
│   └── Dashboard (UI)
├── Servicios
│   ├── amauta-api (NestJS + Fastify)
│   ├── amauta-web (Next.js)
│   ├── postgres (PostgreSQL 15)
│   └── redis (Redis 7)
└── Volúmenes
    ├── postgres_data
    └── redis_data
```

## URLs de Producción

- **Frontend**: https://amauta.diazignacio.ar
- **Backend API**: https://amauta-api.diazignacio.ar

## Dockerfiles

Usamos multi-stage builds para optimizar tamaño de imagen:

```dockerfile
# Ejemplo simplificado
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/main.js"]
```

## Plan de Backup

- PostgreSQL: pg_dump diario a almacenamiento externo
- Volúmenes Docker: Snapshot semanal del VPS
- Código: GitHub (siempre actualizado)

## Referencias

- [Dokploy Documentation](https://docs.dokploy.com/)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Let's Encrypt](https://letsencrypt.org/)
