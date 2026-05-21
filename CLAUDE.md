# CLAUDE.md

Amauta es un sistema educativo para la gestión del aprendizaje.
_"No concebimos la educación como un producto, sino como un derecho social."_

- **Visión**: `README.md` — filosofía, principios, offline-first
- **Roadmap**: `docs/project-management/roadmap.md` — fuente de verdad para qué construir
- **Workflow**: `WORKFLOW.md` — fuente de verdad para cómo trabajar

---

## Estado Actual

**Fase 4c — Módulo Escolar (administración avanzada)** · Sprint 21-23 · 0/9 pendiente

| Issue   | Descripción                                                     | Estado       |
| ------- | --------------------------------------------------------------- | ------------ |
| F4c-001 | Catálogo de materias y migración de calificaciones              | ⏳ Pendiente |
| F4c-002 | Matrícula formal: inscripción del estudiante a la institución   | ⏳ Pendiente |
| F4c-003 | Historial académico del estudiante (trayectoria entre períodos) | ⏳ Pendiente |
| F4c-004 | Horarios semanales por grupo                                    | ⏳ Pendiente |
| F4c-005 | Cierre de ciclo lectivo y promoción masiva                      | ⏳ Pendiente |
| F4c-006 | Alertas automáticas: asistencia baja y notas en riesgo          | ⏳ Pendiente |
| F4c-007 | Rol tutor/padre: acceso al seguimiento de su hijo               | ⏳ Pendiente |
| F4c-008 | Justificación formal de ausencias                               | ⏳ Pendiente |
| F4c-009 | Calendario institucional                                        | ⏳ Pendiente |

**F4c-001 debe ir primero** — es una migración de modelo de datos (materias como catálogo) de la que dependen F4c-003, F4c-004 y F4c-005.
**Fase 7 en curso en paralelo** (Multimedia y Contenido Rico — #98, #99, #100 abiertos).

### Historial de Fases

| Fase | Nombre                                   | Estado          |
| ---- | ---------------------------------------- | --------------- |
| 0    | Fundamentos                              | ✅              |
| 1    | MVP Cursos                               | ✅              |
| 2    | Offline-First PWA                        | ✅              |
| 3    | Evaluaciones                             | ✅              |
| 4    | Módulo Escolar                           | ✅ (admin/educ) |
| 4b   | Módulo Escolar — gaps                    | ✅              |
| 4c   | Módulo Escolar — administración avanzada | ⏳ Planificada  |
| 5    | Comunidad y Colaboración                 | ✅              |
| 6    | Búsqueda y Recomendaciones               | ✅              |
| 7    | Multimedia y Contenido Rico              | 🔄 En curso     |

---

## Reglas de Oro

1. **Features nuevas** → leer `roadmap.md` PRIMERO
2. **Issues** → seguir `WORKFLOW.md`
3. **Queries Prisma** → leer schema ANTES de escribir una sola línea
4. **Al terminar** → actualizar `docs/ai-context/` y estado en `CLAUDE.md`
5. **Commits** → en español, referenciar el issue (`Resuelve: #N`)

---

## Entorno de Desarrollo (CRÍTICO) 🚨

**La base de datos está en el VPS, NO local.**

| Servicio    | Ubicación     | URL                               |
| ----------- | ------------- | --------------------------------- |
| PostgreSQL  | VPS (Dokploy) | producción                        |
| Redis       | VPS (Dokploy) | producción                        |
| Backend API | VPS           | https://amauta-api.diazignacio.ar |
| Frontend    | VPS           | https://amauta.diazignacio.ar     |

- Los comandos de Prisma se ejecutan contra la DB de producción
- Cualquier `prisma migrate` afecta producción directamente
- **SIEMPRE verificar** `prisma migrate status` antes de cambios
- Para migraciones: `ia-skills/development/prisma-db-management.md`
- CI/CD: la API ejecuta `npx prisma migrate deploy` al iniciar; el healthcheck a `/health` valida el deploy

---

## Stack Técnico

| Capa          | Tecnología                           |
| ------------- | ------------------------------------ |
| Frontend      | Next.js 14+ App Router + TypeScript  |
| Backend       | NestJS + Fastify + TypeScript strict |
| ORM           | Prisma                               |
| Base de datos | PostgreSQL 15+                       |
| Caché         | Redis 7+                             |
| Deployment    | Dokploy en VPS                       |

Monorepo con Turborepo: `apps/web` (Next.js), `apps/api` (NestJS), `packages/shared`, `packages/types`.

---

## Flujo de Trabajo con Issues

```bash
# Listar issues abiertos
gh issue list --limit 50

# Ver detalles
gh issue view <N> --json title,body,labels | jq -r '"\(.title)\n\n\(.body)"'

# Commit estándar
git commit -m "$(cat <<'EOF'
feat: descripción del cambio

Resuelve: #<N>
EOF
)"

# Cerrar issue
gh issue close <N> --comment "✅ Tarea completada..."
```

Usuarios de prueba (password: `password123`): `superadmin@amauta.test`, `admin1@amauta.test`, `educador1@amauta.test`, `estudiante1@amauta.test`. Ver `apps/api/prisma/README.md` para la tabla completa.

---

## Sistema de Contexto para IA

### Qué leer antes de codear

#### Backend (API)

| Tarea                      | Leer ANTES                                                                      |
| -------------------------- | ------------------------------------------------------------------------------- |
| Cualquier query Prisma     | `docs/ai-context/database/schema.md` + `apps/api/prisma/schema.prisma`          |
| Crear/modificar endpoint   | `docs/ai-context/_patterns.md` + `docs/ai-context/modules/{modulo}.md`          |
| Crear módulo CRUD          | `ia-skills/development/crud-generator.md`                                       |
| Agregar endpoint existente | `ia-skills/development/api-endpoint.md` + `docs/ai-context/modules/{modulo}.md` |

#### Frontend (Web)

| Tarea               | Leer ANTES                                                                       |
| ------------------- | -------------------------------------------------------------------------------- |
| Crear formulario    | `ia-skills/development/react-form.md` + `docs/ai-context/frontend/components.md` |
| Crear página        | `docs/ai-context/frontend/pages.md`                                              |
| Hooks de auth/roles | `docs/ai-context/frontend/hooks.md`                                              |

#### Módulos documentados

`auth`, `cursos` (⭐ template de referencia), `lecciones`, `inscripciones`, `uploads`, `categorias`, `foros`, `notificaciones`

---

## Patrones Críticos

```typescript
// ❌ NUNCA parse directo
const data = schema.parse(dto);

// ✅ SIEMPRE safeParse
const result = schema.safeParse(dto);
if (!result.success)
  throw new BadRequestException(result.error.issues[0]?.message);
const data = result.data;
```

```typescript
// ❌ NUNCA delete físico
await this.prisma.curso.delete({ where: { id } });

// ✅ SIEMPRE soft delete
await this.prisma.curso.update({
  where: { id },
  data: { estado: 'ARCHIVADO' },
});
```

```typescript
// Estructura de respuestas
// Singular:  { curso, message }
// Lista:     { cursos, total, page, limit, totalPages }
```

---

## Enums Disponibles

```typescript
enum Rol {
  ESTUDIANTE,
  EDUCADOR,
  ADMIN_ESCUELA,
  SUPER_ADMIN,
}
enum Nivel {
  PRINCIPIANTE,
  INTERMEDIO,
  AVANZADO,
}
enum EstadoCurso {
  BORRADOR,
  REVISION,
  PUBLICADO,
  ARCHIVADO,
}
enum TipoLeccion {
  VIDEO,
  TEXTO,
  QUIZ,
  INTERACTIVO,
  DESCARGABLE,
}
enum EstadoInscripcion {
  ACTIVO,
  COMPLETADO,
  ABANDONADO,
}
enum TipoInstitucion {
  ESCUELA,
  COLEGIO,
  UNIVERSIDAD,
  CENTRO_FORMACION,
}
enum EstadoAsistencia {
  PRESENTE,
  AUSENTE,
  TARDANZA,
  JUSTIFICADO,
}
enum TipoForoPost {
  PREGUNTA,
  ANUNCIO,
  DEBATE,
}
enum EstadoForoPost {
  PUBLICADO,
  CERRADO,
  ELIMINADO,
}
enum TipoNotificacion {
  NUEVA_RESPUESTA,
  SOLUCION_MARCADA,
}
enum TipoComunicado {
  GENERAL,
  ACADEMICO,
  ADMINISTRATIVO,
  EVENTO,
  URGENTE,
}
enum Prioridad {
  BAJA,
  NORMAL,
  ALTA,
  URGENTE,
}
```

Solo usar estos valores. Verificar en `docs/ai-context/database/schema.md` ante la duda.

---

## Skills Disponibles

| Skill                 | Archivo                                          | Cuándo usar                            |
| --------------------- | ------------------------------------------------ | -------------------------------------- |
| Prisma & DB           | `ia-skills/development/prisma-db-management.md`  | Migraciones, errores de DB             |
| CRUD Generator        | `ia-skills/development/crud-generator.md`        | Módulo nuevo completo                  |
| API Endpoint          | `ia-skills/development/api-endpoint.md`          | Endpoint en módulo existente           |
| React Form            | `ia-skills/development/react-form.md`            | Formulario nuevo                       |
| Complete Issue        | `ia-skills/automation/complete-issue.md`         | Ejecutar issue completo                |
| Performance Review    | `ia-skills/quality/performance-review.md`        | Informe de performance                 |
| Security Audit        | `ia-skills/quality/security-audit.md`            | Auditoría OWASP                        |
| Fix Security Findings | `ia-skills/quality/fix-security-findings.md`     | Aplicar fixes de auditoría             |
| Feature Audit         | `ia-skills/quality/feature-audit.md`             | Verificar criterios de aceptación      |
| Functional Docs       | `ia-skills/documentation/functional-docs.md`     | Documentación funcional no técnica     |
| AI Context Validator  | `ia-skills/quality/ai-context-validator.md`      | Sincronizar docs/ai-context con código |
| Issue Inspector       | `ia-skills/testing/issue-inspector.md`           | Auditar issue en producción            |
| PWA Mobile Design     | `ia-skills/specialized/pwa-mobile-design.md`     | Auditar/diseñar PWA mobile             |
| NotebookLM Cuadernos  | `ia-skills/capacitacion/notebooklm-cuadernos.md` | Cuadernos de estudio                   |
