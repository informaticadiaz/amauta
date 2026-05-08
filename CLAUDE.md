# CLAUDE.md

Amauta es un sistema educativo para la gestión del aprendizaje.
_"No concebimos la educación como un producto, sino como un derecho social."_

- **Visión**: `README.md` — filosofía, principios, offline-first
- **Roadmap**: `docs/project-management/roadmap.md` — fuente de verdad para qué construir
- **Workflow**: `WORKFLOW.md` — fuente de verdad para cómo trabajar

---

## Estado Actual

**Fase 4b — Módulo Escolar (completar gaps)** · Sprint 20 · 3/4 completados

| Issue          | Descripción                                          | Estado |
| -------------- | ---------------------------------------------------- | ------ |
| #101 / F4b-001 | Vista del estudiante — mis calificaciones/asistencia | ✅     |
| #102 / F4b-002 | Boletín académico descargable por periodo            | ✅     |
| #103 / F4b-003 | Comunicados institucionales — API y UI               | ✅     |
| #104 / F4b-004 | Reportes de asistencia y rendimiento (admin)         | 🔄     |

Gaps detectados: estudiante no podía ver sus propias notas/asistencia. Comunicados en schema pero sin módulo. Sin boletín ni reportes admin.
**Fase 7 pausada** hasta completar Fase 4b.

### Historial de Fases

| Fase | Nombre                      | Estado          |
| ---- | --------------------------- | --------------- |
| 0    | Fundamentos                 | ✅              |
| 1    | MVP Cursos                  | ✅              |
| 2    | Offline-First PWA           | ✅              |
| 3    | Evaluaciones                | ✅              |
| 4    | Módulo Escolar              | ✅ (admin/educ) |
| 4b   | Módulo Escolar — gaps       | 🔄 En curso     |
| 5    | Comunidad y Colaboración    | ✅              |
| 6    | Búsqueda y Recomendaciones  | ✅              |
| 7    | Multimedia y Contenido Rico | ⏸ Pausada       |

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
- Para migraciones: `docs/ai-skills/prisma-db-management.md`
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

| Tarea                      | Leer ANTES                                                               |
| -------------------------- | ------------------------------------------------------------------------ |
| Cualquier query Prisma     | `docs/ai-context/database/schema.md` + `apps/api/prisma/schema.prisma`   |
| Crear/modificar endpoint   | `docs/ai-context/_patterns.md` + `docs/ai-context/modules/{modulo}.md`   |
| Crear módulo CRUD          | `docs/ai-skills/crud-generator.md`                                       |
| Agregar endpoint existente | `docs/ai-skills/api-endpoint.md` + `docs/ai-context/modules/{modulo}.md` |

#### Frontend (Web)

| Tarea               | Leer ANTES                                                                |
| ------------------- | ------------------------------------------------------------------------- |
| Crear formulario    | `docs/ai-skills/react-form.md` + `docs/ai-context/frontend/components.md` |
| Crear página        | `docs/ai-context/frontend/pages.md`                                       |
| Hooks de auth/roles | `docs/ai-context/frontend/hooks.md`                                       |

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

| Skill                 | Archivo                                   | Cuándo usar                            |
| --------------------- | ----------------------------------------- | -------------------------------------- |
| Prisma & DB           | `docs/ai-skills/prisma-db-management.md`  | Migraciones, errores de DB             |
| CRUD Generator        | `docs/ai-skills/crud-generator.md`        | Módulo nuevo completo                  |
| API Endpoint          | `docs/ai-skills/api-endpoint.md`          | Endpoint en módulo existente           |
| React Form            | `docs/ai-skills/react-form.md`            | Formulario nuevo                       |
| Complete Issue        | `docs/ai-skills/complete-issue.md`        | Ejecutar issue completo                |
| Performance Review    | `docs/ai-skills/performance-review.md`    | Informe de performance                 |
| Security Audit        | `docs/ai-skills/security-audit.md`        | Auditoría OWASP                        |
| Fix Security Findings | `docs/ai-skills/fix-security-findings.md` | Aplicar fixes de auditoría             |
| Feature Audit         | `docs/ai-skills/feature-audit.md`         | Verificar criterios de aceptación      |
| Functional Docs       | `docs/ai-skills/functional-docs.md`       | Documentación funcional no técnica     |
| AI Context Validator  | `docs/ai-skills/ai-context-validator.md`  | Sincronizar docs/ai-context con código |
| Issue Inspector       | `docs/ai-skills/issue-inspector.md`       | Auditar issue en producción            |
| PWA Mobile Design     | `docs/ai-skills/pwa-mobile-design.md`     | Auditar/diseñar PWA mobile             |
| NotebookLM Cuadernos  | `docs/ai-skills/notebooklm-cuadernos.md`  | Cuadernos de estudio                   |
