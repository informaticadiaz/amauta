# Auditoría Prisma y Base de Datos - 2026-03-17

## Alcance

Auditoría técnica del estado actual de Prisma en Amauta y comparación entre:

- Schema versionado en Git
- Schema desplegado en producción
- Estructura real de la base de datos PostgreSQL en producción
- Metadata de migraciones Prisma

Esta auditoría excluye deliberadamente cambios locales no pusheados.

Fecha de auditoría: 2026-03-17
Repositorio auditado: `amauta`
Commit local inspeccionado: `0d54685`

## Resumen Ejecutivo

Prisma sí se utiliza activamente en Amauta como ORM del backend API.

El schema versionado en Git coincide con el schema actualmente desplegado en producción. La anomalía principal no es un drift entre lo pusheado y lo ejecutado, sino la ausencia de una historia versionada de migraciones Prisma.

Conclusión principal:

- Prisma está en uso real en backend y producción.
- El schema versionado y el schema desplegado están alineados.
- La base productiva está alineada con ese mismo schema de 14 modelos.
- `_prisma_migrations` existe pero está vacía.
- No existe una cadena confiable y reproducible de migraciones Prisma versionadas en Git previa a esta regularización.

## Metodología

Se verificó:

1. Uso de Prisma en el código backend.
2. Dependencias y scripts Prisma en el workspace `@amauta/api`.
3. Estado del schema versionado en `HEAD`.
4. Estado del contenedor API desplegado en VPS.
5. Variables de entorno productivas relacionadas con Prisma.
6. Estructura real de PostgreSQL dentro del contenedor de base de datos productivo.
7. Tabla `_prisma_migrations`.
8. Tablas, columnas, enums, índices y claves foráneas en producción.

## Evidencia de uso real de Prisma

Prisma está integrado y en uso en el backend:

- `apps/api/package.json` incluye `prisma` y `@prisma/client`
- `apps/api/src/prisma/prisma.service.ts` extiende `PrismaClient`
- `apps/api/src/prisma/prisma.module.ts` expone `PrismaService` globalmente
- Los servicios de backend consumen `this.prisma...` en auth, cursos, lecciones, inscripciones, progreso y categorías

Esto descarta la hipótesis de que Prisma esté abandonado.

## Estado del entorno local

La configuración local de desarrollo apunta a:

- `DATABASE_URL=postgresql://amauta:desarrollo123@localhost:5432/amauta_dev`

Durante la auditoría, la base local no estuvo accesible:

- `psql` no logró conectar a `localhost:5432`
- `npx prisma migrate status` devolvió `P1001: Can't reach database server at localhost:5432`

Por lo tanto, la verificación exacta de estructura se realizó contra producción en VPS.

## Estado de producción

### Contenedores detectados

Se verificaron contenedores Amauta en ejecución:

- API: `amauta-amautaapi-ryf48a.1.v1r12a02g9wj27hp0qmmj33z8`
- Web: `amauta-amauta-mbni79.1.eictqg1ikez9d3nivgr8lr8me`
- DB: `amauta-amautadb-kt4oqj.1.8vxn6l57ms6ovsbojcs7m9zez`
- Redis: `amauta-amautaredis-wseezo.1.wwu3m76u5n3wegwpjwwt04cxq`

### Variables relevantes en API productiva

Se verificó en el contenedor API:

- `NODE_ENV=production`
- `API_URL=https://amauta-api.diazignacio.ar`
- `DATABASE_URL=postgresql://amauta_user:***@amauta-amautadb-kt4oqj:5432/amauta_prod?schema=public`

## Alineación entre Git y producción

Se verificó que el schema commiteado en `HEAD` coincide con el schema desplegado en producción.

### Modelos versionados y desplegados

- `Usuario`
- `Perfil`
- `Categoria`
- `Curso`
- `Leccion`
- `Recurso`
- `Inscripcion`
- `Progreso`
- `Institucion`
- `Grupo`
- `GrupoEstudiante`
- `Asistencia`
- `Calificacion`
- `Comunicado`

Total: 14 modelos

### Enums versionados y desplegados

- `Rol`
- `Nivel`
- `EstadoCurso`
- `TipoLeccion`
- `EstadoInscripcion`
- `TipoInstitucion`
- `EstadoAsistencia`
- `TipoComunicado`
- `Prioridad`

Total: 9 enums

## Estado de migraciones Prisma

Se verificó la tabla de metadata:

- `_prisma_migrations` existe en producción
- `_prisma_migrations` contiene `0 rows`

Además:

- el repositorio no versionaba previamente `apps/api/prisma/migrations/`
- el contenedor productivo no incluye `prisma/migrations/`

Interpretación técnica más probable:

- el schema fue sincronizado por `db push`, inicialización directa o flujo equivalente sin preservar historial reproducible
- no hay una cadena de migraciones versionadas en Git para reconstruir la evolución histórica anterior

## Estructura real validada en producción

### Tablas existentes en `public`

- `_prisma_migrations`
- `asistencias`
- `calificaciones`
- `categorias`
- `comunicados`
- `cursos`
- `grupos`
- `grupos_estudiantes`
- `inscripciones`
- `instituciones`
- `lecciones`
- `perfiles`
- `progresos`
- `recursos`
- `usuarios`

### Enums existentes en `public`

- `EstadoAsistencia`
- `EstadoCurso`
- `EstadoInscripcion`
- `Nivel`
- `Prioridad`
- `Rol`
- `TipoComunicado`
- `TipoInstitucion`
- `TipoLeccion`

### Conteo de columnas por tabla

- `_prisma_migrations`: 8
- `asistencias`: 8
- `calificaciones`: 10
- `categorias`: 7
- `comunicados`: 10
- `cursos`: 14
- `grupos`: 9
- `grupos_estudiantes`: 3
- `inscripciones`: 7
- `instituciones`: 9
- `lecciones`: 11
- `perfiles`: 13
- `progresos`: 11
- `recursos`: 9
- `usuarios`: 11

### Integridad referencial validada

Se verificaron claves foráneas activas para las relaciones principales:

- cursos -> usuarios
- cursos -> categorias
- lecciones -> cursos
- recursos -> lecciones
- inscripciones -> usuarios
- inscripciones -> cursos
- progresos -> usuarios
- progresos -> lecciones
- perfiles -> usuarios
- grupos -> instituciones
- grupos -> usuarios
- grupos_estudiantes -> grupos
- grupos_estudiantes -> usuarios
- asistencias -> grupos
- asistencias -> usuarios
- calificaciones -> grupos
- calificaciones -> usuarios
- comunicados -> instituciones
- comunicados -> usuarios

No se detectaron inconsistencias estructurales en el schema desplegado.

## Estado de datos en producción

La base está poblada y consistente con el seed histórico:

- `usuarios`: 10
- `categorias`: 6
- `cursos`: 8
- `lecciones`: 15
- `recursos`: 8
- `inscripciones`: 12
- `progresos`: 28
- `instituciones`: 2
- `grupos`: 4
- `grupos_estudiantes`: 4
- `asistencias`: 40
- `calificaciones`: 16
- `comunicados`: 4

## Riesgos identificados

### Riesgo 1: ausencia de historial reproducible de migraciones

Impacto:

- impide reconstruir con confianza la evolución histórica de la DB
- dificulta nuevos deployments seguros
- complica rollback y auditoría formal de cambios

### Riesgo 2: falsa sensación de cobertura por existencia de `_prisma_migrations`

Impacto:

- la tabla existe, pero al estar vacía no funciona como trazabilidad efectiva
- puede inducir a pensar que hubo `prisma migrate` correctamente versionado cuando no hay evidencia de ello

### Riesgo 3: continuidad operativa sin baseline registrado

Impacto:

- futuras migraciones Prisma no parten de una metadata consistente
- el proyecto queda expuesto a drift o despliegues ambiguos al próximo cambio de schema

## Conclusión final

Prisma sigue siendo parte central de Amauta y está operando en producción.

El estado real, ignorando cambios locales no publicados, es este:

- Prisma sí se usa
- Git y producción están alineados en schema
- la base productiva está consistente con ese schema
- no existe historial confiable de migraciones versionadas previo a la regularización
- `_prisma_migrations` existe pero está vacía, por lo que no aporta trazabilidad histórica real

## Recomendaciones inmediatas

1. Versionar una migración baseline que represente el schema actual de producción.
2. Desplegar esa baseline junto al código.
3. Marcar la baseline como aplicada con `prisma migrate resolve`.
4. Tomar esa baseline como punto de partida para cualquier cambio futuro de DB.
