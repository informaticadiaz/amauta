# Docker - Amauta

Este directorio contiene configuración y scripts relacionados con Docker para el proyecto Amauta.

## Contenido

```
docker/
├── README.md                    # Este archivo
└── postgres/
    ├── init/
    │   └── 01-init.sql          # Script de inicialización de PostgreSQL
    └── LOCAL_INSTALL.md         # Guía de instalación local sin Docker
```

## docker-compose.yml

El archivo principal `docker-compose.yml` está en la raíz del proyecto y configura:

- **PostgreSQL 15**: Base de datos principal
- **Redis 7**: Caché y sesiones
- **Adminer** (opcional): Interface web para PostgreSQL

## Uso Rápido

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver estado de servicios
docker-compose ps

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

## Scripts de Inicialización

Los scripts en `postgres/init/` se ejecutan automáticamente cuando se crea el contenedor de PostgreSQL por primera vez.

### 01-init.sql

- Habilita extensiones necesarias (uuid-ossp, pg_trgm, unaccent)
- Configura búsqueda full-text en español
- Crea funciones útiles (trigger_set_timestamp, es_search)
- Configura timezone y encoding

## Instalación Local

Si prefieres no usar Docker, consulta:

- **Linux/macOS/Windows**: `postgres/LOCAL_INSTALL.md`

## Documentación

Ver también:

- `docs/technical/setup.md` - Guía completa de configuración
- `docs/technical/database.md` - Esquema y modelos de base de datos
