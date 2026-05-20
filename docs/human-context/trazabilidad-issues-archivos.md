# Trazabilidad issues → archivos modificados

**Generado**: 2026-05-20
**Método**: `git log` con `Resuelve: #N` en el cuerpo del commit + `git diff-tree`
**Cobertura**: issues #90–#104 (Fases 5–7 y 4b)

> **Nota de cobertura**: El historial git de este repo comienza en Fase 5 (issue #90).
> Los issues #1–#89 (Fases 0–4) no tienen commits rastreables en este repositorio.
> Para esos issues la referencia funcional está en `docs/human-context/` por issue individual.

---

## Cómo leer este documento

Cada entrada tiene:
- **Issue**: número y commit que lo cierra
- **Archivos por categoría**: `apps/api` (backend), `apps/web` (frontend), `docs` (documentación), otros

La convención de commit usada en el proyecto es:

```
feat: descripción del cambio

Resuelve: #<N>
```

---

## Fase 5 — Comunidad y Colaboración

### #90 — F5-007: API de interacción en foros

**Commit**: `4c75d7dc` · feat: completar interacción de foros en backend

| Categoría | Archivos |
|---|---|
| Backend API | `apps/api/src/foros/foros.controller.ts` |
| | `apps/api/src/foros/foros.service.ts` |
| Tests | `apps/api/src/foros/foros.controller.spec.ts` |
| | `apps/api/src/foros/foros.service.spec.ts` |
| Docs | `docs/ai-context/modules/foros.md` |
| Config | `CLAUDE.md` · `AGENTS.md` |

---

### #91 — F5-008: UI de interacción en foros

**Commit**: `7ee3e089` · feat: completar interacciones UI de foros

| Categoría | Archivos |
|---|---|
| Frontend routes | `apps/web/src/app/api/foros/respuestas/[respuestaId]/solucion/route.ts` |
| | `apps/web/src/app/api/foros/respuestas/[respuestaId]/util/route.ts` |
| Componentes | `apps/web/src/components/foros/ForoDetalle.tsx` |
| | `apps/web/src/components/foros/ForoListado.tsx` |
| | `apps/web/src/components/foros/ForoPostCard.tsx` |
| | `apps/web/src/components/foros/types.ts` |
| Tests | `apps/web/src/app/api/foros/respuestas/[respuestaId]/solucion/route.test.ts` |
| | `apps/web/src/app/api/foros/respuestas/[respuestaId]/util/route.test.ts` |
| | `apps/web/src/components/foros/ForoInteracciones.test.tsx` |
| | `apps/web/src/components/foros/ForoListado.test.tsx` |
| Docs PM | `docs/project-management/backlog.md` · `roadmap.md` · `sprints.md` |
| Config | `CLAUDE.md` · `AGENTS.md` |

---

### #92 — F5-009: API de notificaciones básicas para foros

**Commit**: `c917156e` · feat: agregar notificaciones básicas de foros

| Categoría | Archivos |
|---|---|
| Backend API | `apps/api/src/notificaciones/notificaciones.controller.ts` |
| | `apps/api/src/notificaciones/notificaciones.service.ts` |
| | `apps/api/src/notificaciones/notificaciones.module.ts` |
| | `apps/api/src/notificaciones/dto/query-notificaciones.dto.ts` |
| | `apps/api/src/foros/foros.service.ts` _(notificaciones integradas)_ |
| | `apps/api/src/foros/foros.module.ts` |
| | `apps/api/src/app.module.ts` |
| Tests | `apps/api/src/notificaciones/notificaciones.service.spec.ts` |
| | `apps/api/src/foros/foros.service.spec.ts` |
| Docs | `docs/ai-context/modules/notificaciones.md` |
| | `docs/ai-context/modules/foros.md` |
| | `docs/project-management/roadmap.md` |
| Config | `CLAUDE.md` · `AGENTS.md` |

---

## Fase 6 — Búsqueda y Descubrimiento

### #93 — F6-001: Diseño funcional de búsqueda y descubrimiento

**Commit**: `d3c87422` · docs: definir búsqueda y descubrimiento de cursos

| Categoría | Archivos |
|---|---|
| Docs PM | `docs/project-management/fase-6-diseno-funcional-busqueda.md` _(nuevo)_ |
| | `docs/project-management/roadmap.md` |
| | `docs/sistema/README.md` |
| Config | `CLAUDE.md` · `AGENTS.md` |

> Issue de documentación pura — sin cambios de código.

---

### #94 — F6-002: API de búsqueda de cursos con full-text y filtros

**Commit**: `2478ed08` · feat: API de búsqueda de cursos con relevancia y filtros (F6-002)

| Categoría | Archivos |
|---|---|
| Backend API | `apps/api/src/cursos/cursos.controller.ts` |
| | `apps/api/src/cursos/cursos.service.ts` |
| | `apps/api/src/cursos/dto/busqueda-cursos.dto.ts` _(nuevo)_ |
| Tests | `apps/api/src/cursos/cursos.service.spec.ts` |
| Docs | `docs/ai-context/modules/cursos.md` |
| | `docs/human-context/issue-94-api-busqueda-basica-cursos.md` _(nuevo)_ |

---

### #95 — F6-003: UI de búsqueda y filtros del catálogo

**Commit**: `b66e29b7` · test(catalogo): agregar tests para UI de búsqueda y filtros (F6-003)

| Categoría | Archivos |
|---|---|
| Tests Frontend | `apps/web/src/components/catalogo/__tests__/CatalogoCursos.test.tsx` _(nuevo)_ |
| Docs | `docs/ai-context/frontend/components.md` |
| | `docs/ai-context/frontend/pages.md` |
| | `docs/human-context/issue-95-ui-busqueda-filtros-catalogo.md` _(nuevo)_ |
| | `docs/project-management/roadmap.md` |
| Config | `CLAUDE.md` |

---

## Fase 7 — Multimedia y Contenido Rico

### #97 — F7-001: Diseño funcional de multimedia y contenido rico

**Commit**: `34a8e39a` · docs: diseño funcional Fase 7 — multimedia y contenido rico

| Categoría | Archivos |
|---|---|
| Docs PM | `docs/project-management/fase-7-diseno-funcional-multimedia.md` _(nuevo)_ |
| | `docs/project-management/roadmap.md` |
| | `docs/human-context/issue-97-diseno-funcional-multimedia-contenido-rico.md` _(nuevo)_ |
| Config | `CLAUDE.md` |

> Issue de documentación pura — sin cambios de código.

---

### #98 — F7-002: Editor de texto rico para lecciones TEXTO

**Commit**: `49502271` · feat: editor TipTap para lecciones TEXTO con sanitización XSS

| Categoría | Archivos |
|---|---|
| Componentes | `apps/web/src/components/lecciones/RichTextEditor.tsx` _(nuevo)_ |
| | `apps/web/src/components/lecciones/RichTextEditor.module.css` _(nuevo)_ |
| | `apps/web/src/components/lecciones/RichTextContent.tsx` _(nuevo)_ |
| | `apps/web/src/components/lecciones/LeccionForm.tsx` _(modificado)_ |
| | `apps/web/src/components/lecciones/LeccionContent.tsx` _(modificado)_ |
| Tests | `apps/web/src/components/lecciones/RichTextEditor.test.tsx` _(nuevo)_ |
| Docs | `docs/ai-context/frontend/components.md` |
| | `docs/human-context/issue-98-editor-de-texto-rico.md` _(nuevo)_ |
| | `docs/audits/issue-094-api-busqueda-cursos-filtros.md` |
| | `docs/audits/README.md` |
| Config | `apps/web/package.json` · `package-lock.json` _(TipTap + DOMPurify)_ |

---

## Fase 4b — Módulo Escolar Gaps

### #101 — F4b-001: Vista del estudiante — mis calificaciones y mi asistencia

**Commit**: `8721ae16` · feat: vista del estudiante — mis calificaciones y mi asistencia (F4b-001)

| Categoría | Archivos |
|---|---|
| Backend API | `apps/api/src/asistencias/asistencias.controller.ts` |
| | `apps/api/src/asistencias/asistencias.service.ts` |
| | `apps/api/src/calificaciones/calificaciones.controller.ts` |
| | `apps/api/src/calificaciones/calificaciones.service.ts` |
| Tests | `apps/api/src/asistencias/asistencias.service.spec.ts` |
| | `apps/api/src/calificaciones/calificaciones.service.spec.ts` |
| Frontend routes | `apps/web/src/app/api/me/asistencias/route.ts` _(nuevo)_ |
| | `apps/web/src/app/api/me/calificaciones/route.ts` _(nuevo)_ |
| Páginas | `apps/web/src/app/dashboard/mi-asistencia/page.tsx` _(nuevo)_ |
| | `apps/web/src/app/dashboard/mis-notas/page.tsx` _(nuevo)_ |
| Componentes | `apps/web/src/components/layout/Sidebar.tsx` |
| Docs | `docs/ai-context/modules/asistencias.md` |
| | `docs/ai-context/modules/calificaciones.md` |
| | `docs/ai-context/frontend/pages.md` |
| | `docs/human-context/issue-101-vista-estudiante-mis-calificaciones-mi-asistencia.md` _(nuevo)_ |
| Config | `CLAUDE.md` |

---

### #102 — F4b-002: Boletín académico descargable por periodo

**Commit**: `d8edc9ff` · feat: boletín académico descargable por periodo (F4b-002)

| Categoría | Archivos |
|---|---|
| Backend API | `apps/api/src/boletin/boletin.controller.ts` _(nuevo)_ |
| | `apps/api/src/boletin/boletin.service.ts` _(nuevo)_ |
| | `apps/api/src/boletin/boletin.module.ts` _(nuevo)_ |
| | `apps/api/src/boletin/dto/query-boletin.dto.ts` _(nuevo)_ |
| | `apps/api/src/app.module.ts` |
| Tests | `apps/api/src/boletin/boletin.service.spec.ts` _(nuevo)_ |
| Frontend routes | `apps/web/src/app/api/me/boletin/route.ts` _(nuevo)_ |
| | `apps/web/src/app/api/me/grupos/route.ts` _(nuevo)_ |
| Páginas | `apps/web/src/app/dashboard/mi-boletin/page.tsx` _(nuevo)_ |
| Componentes | `apps/web/src/components/layout/Sidebar.tsx` |
| Docs | `docs/ai-context/modules/boletin.md` _(nuevo)_ |
| | `docs/ai-context/frontend/pages.md` |
| | `docs/human-context/issue-102-boletin-academico-descargable-por-periodo.md` _(nuevo)_ |

---

### #103 — F4b-003: Comunicados institucionales — API y UI completa

**Commit**: `5d3f8adf` · feat: comunicados institucionales — API y UI completa (F4b-003)

| Categoría | Archivos |
|---|---|
| Prisma | `apps/api/prisma/schema.prisma` |
| | `apps/api/prisma/migrations/20260508000100_add_archivado_to_comunicados/migration.sql` _(nuevo)_ |
| Backend API | `apps/api/src/comunicados/comunicados.controller.ts` _(nuevo)_ |
| | `apps/api/src/comunicados/comunicados.service.ts` _(nuevo)_ |
| | `apps/api/src/comunicados/comunicados.module.ts` _(nuevo)_ |
| | `apps/api/src/comunicados/dto/create-comunicado.dto.ts` _(nuevo)_ |
| | `apps/api/src/comunicados/dto/query-comunicados.dto.ts` _(nuevo)_ |
| | `apps/api/src/comunicados/dto/update-comunicado.dto.ts` _(nuevo)_ |
| | `apps/api/src/app.module.ts` |
| Tests | `apps/api/src/comunicados/comunicados.service.spec.ts` _(nuevo)_ |
| Frontend routes | `apps/web/src/app/api/instituciones/[id]/comunicados/route.ts` _(nuevo)_ |
| | `apps/web/src/app/api/instituciones/[id]/comunicados/[comId]/route.ts` _(nuevo)_ |
| | `apps/web/src/app/api/me/comunicados/route.ts` _(nuevo)_ |
| Páginas | `apps/web/src/app/dashboard/comunicados/page.tsx` _(nuevo)_ |
| | `apps/web/src/app/dashboard/comunicados/nuevo/page.tsx` _(nuevo)_ |
| Componentes | `apps/web/src/components/layout/Sidebar.tsx` |
| Docs | `docs/ai-context/modules/comunicados.md` _(nuevo)_ |
| | `docs/ai-context/frontend/pages.md` |
| | `docs/human-context/issue-103-comunicados-institucionales.md` _(nuevo)_ |

---

### #104 — F4b-004: Reportes de asistencia y rendimiento académico (admin)

**Commit**: `4c8a49d2` · feat: reportes de asistencia y rendimiento académico (admin)

| Categoría | Archivos |
|---|---|
| Backend API | `apps/api/src/grupos/grupos.controller.ts` |
| | `apps/api/src/grupos/grupos.service.ts` |
| | `apps/api/src/grupos/dto/query-reporte-asistencia.dto.ts` _(nuevo)_ |
| | `apps/api/src/grupos/dto/query-reporte-rendimiento.dto.ts` _(nuevo)_ |
| Tests | `apps/api/src/grupos/grupos.service.spec.ts` |
| Frontend routes | `apps/web/src/app/api/grupos/[id]/reportes/asistencia/route.ts` _(nuevo)_ |
| | `apps/web/src/app/api/grupos/[id]/reportes/asistencia/csv/route.ts` _(nuevo)_ |
| | `apps/web/src/app/api/grupos/[id]/reportes/rendimiento/route.ts` _(nuevo)_ |
| Páginas | `apps/web/src/app/dashboard/reportes/page.tsx` _(nuevo)_ |
| Componentes | `apps/web/src/components/layout/Sidebar.tsx` |
| | `apps/web/src/components/layout/MobileMenu.tsx` |
| Docs | `docs/ai-context/modules/grupos.md` |
| | `docs/ai-context/frontend/pages.md` |
| | `docs/human-context/issue-104-reportes-asistencia-rendimiento-admin.md` _(nuevo)_ |
| Config | `CLAUDE.md` |

---

## Issues sin trazabilidad git

Los siguientes issues fueron cerrados antes del inicio del historial git de este repositorio.
Su documentación funcional está disponible en `docs/human-context/` por issue individual.

| Rango | Fase | Issues | Documentación disponible |
|---|---|---|---|
| #2–#27 | Fase 0 (Fundamentos) | 26 issues | `docs/audits/issue-0XX-*.md` |
| #28–#43 | Fase 1 (MVP Cursos) | 16 issues | `docs/human-context/issue-39` a `issue-43` |
| #44–#51 | Fase 2 (PWA Offline) | 8 issues | `docs/human-context/issue-44` a `issue-51` |
| #52–#63 | Fase 3 (Evaluaciones) | 12 issues | `docs/human-context/issue-52` a `issue-63` |
| #64–#82 | Fase 4 (Módulo Escolar) | 19 issues | `docs/human-context/issue-64` a `issue-81` |
| #83–#92 | Fase 5 (inicio) | issues #83-#89 | `docs/human-context/issue-83` a `issue-88` |

---

## Archivos más modificados entre issues

Ranking de archivos tocados con mayor frecuencia en los 12 issues rastreados:

| Archivo | Issues que lo modificaron |
|---|---|
| `apps/web/src/components/layout/Sidebar.tsx` | #101 · #102 · #103 · #104 |
| `docs/ai-context/frontend/pages.md` | #95 · #101 · #102 · #103 · #104 |
| `apps/api/src/app.module.ts` | #92 · #102 · #103 |
| `CLAUDE.md` | #90 · #91 · #92 · #93 · #95 · #97 · #101 · #104 |
| `docs/project-management/roadmap.md` | #91 · #92 · #93 · #95 · #97 |

---

## Cómo regenerar este documento

```bash
# Listar commits con "Resuelve: #N" y sus archivos modificados
git log --format="%H|||%B" | python3 -c "
import sys, re, subprocess

text = sys.stdin.read()
entries = re.split(r'\n(?=[a-f0-9]{40}\|\|\|)', text)
results = {}
for entry in entries:
    if '|||' not in entry:
        continue
    parts = entry.split('|||', 1)
    h = parts[0].strip()
    body = parts[1] if len(parts) > 1 else ''
    issues = re.findall(r'Resuelve:\s*#(\d+)', body)
    if issues:
        results[h] = {'issues': sorted(issues, key=int), 'subject': body.split('\n')[0]}

for h, data in sorted(results.items(), key=lambda x: min(int(i) for i in x[1]['issues'])):
    r = subprocess.run(['git', 'diff-tree', '--no-commit-id', '-r', '--name-only', h],
                       capture_output=True, text=True)
    files = [f for f in r.stdout.strip().split('\n') if f]
    print(f'Issue(s): #{\", #\".join(data[\"issues\"])}')
    print(f'Commit: {h[:8]} — {data[\"subject\"]}')
    for f in files:
        print(f'  {f}')
    print()
"
```
