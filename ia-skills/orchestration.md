---
name: orchestration
description: Menú interactivo para explorar y ejecutar todas las skills del proyecto de modo iterativo
---

# Skill: Orquestador de Skills

> Menú interactivo que funciona como puerta de entrada al ecosistema de skills. Te guía a través de carpetas → selecciona skill → ejecuta.

---

## Uso

```
Usá la skill orchestration para explorar todas las skills disponibles en ia-skills/
```

---

## Propósito

Este skill **NO** ejecuta una tarea específica. En su lugar:

1. Te presenta las 8 categorías de skills disponibles
2. Descubre las skills en la categoría que elegís
3. Te propone ejecutar la skill seleccionada
4. Después de terminar, te ofrece continuar con otra skill

Es el menú principal del repositorio de skills.

---

## Workflow

### ### Paso 1 — Mostrar menú de categorías

Presentá al usuario las 8 categorías disponibles:

```
═════════════════════════════════════════════════════════════════
                    🎯 ORQUESTADOR DE SKILLS
═════════════════════════════════════════════════════════════════

¿En qué área deseas trabajar?

  1. development/      → crear/modificar código
                         (API endpoints, CRUD, formularios, DB, arquitectura)

  2. quality/          → auditorías y revisiones
                         (seguridad, performance, features, validación)

  3. testing/          → testing y verificación
                         (tests de alto valor, auditoría post-deploy)

  4. documentation/    → documentación funcional y visual
                         (docs funcionales, presentaciones visuales)

  5. specialized/      → skills muy específicos
                         (PWA mobile, offline-first)

  6. capacitacion/     → materiales educativos
                         (cuadernos de estudio, NotebookLM)

  7. automation/       → ejecución autónoma
                         (complete-issue, loops, auditoría continua)

  8. orchestration/    → orquestación de cambios
                         (SDD, project-manager, propuestas)

─────────────────────────────────────────────────────────────────
Escribe el número (1-8) o el nombre de la carpeta:
```

**Regla**: esperar entrada válida. Si el usuario escribe un número inválido, mostrar el menú nuevamente.

### ### Paso 2 — Listar skills de la categoría seleccionada

Lee el directorio `ia-skills/<categoria>/` y lista todos los archivos `.md`:

```
═════════════════════════════════════════════════════════════════
                   SKILLS EN: development/
═════════════════════════════════════════════════════════════════

Escribí un número para ejecutar una skill, o "atrás" para volver:

  1. api-endpoint.md
     → Agrega un nuevo endpoint a un módulo existente

  2. crud-generator.md
     → Genera un módulo CRUD completo (backend + frontend)

  3. react-form.md
     → Crea un formulario React siguiendo patrones del proyecto

  4. prisma-db-management.md
     → Protocolo para Prisma, migraciones y BD en producción

  5. architecture-expert.md
     → Análisis arquitectónico del backend

─────────────────────────────────────────────────────────────────
Escribe el número (1-5) o "atrás":
```

**Regla**: también permitir "atrás" para volver al Paso 1.

### ### Paso 3 — Ejecutar la skill seleccionada

Lee `ia-skills/<categoria>/<skill>.md` en su totalidad.

Seguí ese documento como el workflow principal de la skill. Interactúa con el usuario siguiendo las instrucciones que tiene ese archivo:

```
Leyendo ia-skills/development/crud-generator.md...

┌─────────────────────────────────────────────────────────────┐
│ Skill: CRUD Generator                                       │
│ Genera un módulo CRUD completo (backend + frontend)         │
└─────────────────────────────────────────────────────────────┘

[Aquí continúa el workflow de crud-generator.md...]
```

### ### Paso 4 — Ofrecer continuar

Una vez que termina la skill, preguntá:

```
═════════════════════════════════════════════════════════════════
                    ✅ SKILL COMPLETADA
═════════════════════════════════════════════════════════════════

¿Deseas ejecutar otra skill?

  1. Sí  → volver al menú de categorías
  2. No  → terminar

Escribe tu respuesta:
```

**Si sí**: volver al Paso 1.  
**Si no**: terminar con despedida amable.

---

## Notas técnicas

- Las 8 categorías son fijas (no necesitan lectura dinámica del filesystem).
- Para listar skills, sí leer el directorio `ia-skills/<categoria>/` y mostrar solo los `.md`.
- **Excluir del menú**: `loop-status.md`, `loop-runner.*`, `next-prompt.md`, `orchestration.md` (raíz).
  Estos NO son skills ejecutables:
  - `loop-status.md`, `next-prompt.md` → archivos de estado
  - `loop-runner.sh`, `loop-runner.ps1` → scripts de runner
  - `orchestration.md` (raíz) → spec del orquestador, no skill
- Si una categoría está vacía, mostrar: "No hay skills en esta categoría aún."
- Siempre mostrar la descripción de cada skill (primera línea del blockquote `>`) junto al nombre del archivo.

---

## Casos especiales

| Caso                                  | Acción                                                           |
| ------------------------------------- | ---------------------------------------------------------------- |
| Usuario escribe número fuera de rango | Mostrar error y repetir el menú                                  |
| Usuario escribe "atrás" en Paso 2     | Volver a Paso 1                                                  |
| Usuario escribe "no" en Paso 4        | Terminar con despedida                                           |
| Carpeta vacía                         | Mostrar "No hay skills en esta categoría aún." y volver a Paso 1 |

---

## Ejemplo de sesión completa

```
🎯 ORQUESTADOR DE SKILLS
¿En qué área deseas trabajar? (1-8)
> 1

SKILLS EN: development/
  1. api-endpoint.md ...
  2. crud-generator.md ...
  [etc]
Escribe el número o "atrás":
> 2

[Leyendo ia-skills/development/crud-generator.md...]
Skill: CRUD Generator
Genera un módulo CRUD completo (backend + frontend)

¿Genera un CRUD para [NombreModelo] con los campos: [lista]
> Usuario...

[Ejecuta el workflow de crud-generator.md...]

✅ SKILL COMPLETADA
¿Deseas ejecutar otra skill? (1=Sí, 2=No)
> 1

🎯 ORQUESTADOR DE SKILLS
¿En qué área deseas trabajar? (1-8)
> 3

[...]
```
