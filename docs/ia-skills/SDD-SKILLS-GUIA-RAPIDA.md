# Guía Rápida: 7 Skills SDD de Amauta

Las 7 skills ejecutan el ciclo completo de Spec-Driven Development. Cada skill genera un artefacto en `docs/architecture/sdd/cambios/{cambio-id}/`.

---

## 🚀 Flujo Completo

```
arquitecto-proyecto (01-propuesta)
        ↓
especificador-cambios (02-especificacion)
        ↓
diseñador-arquitectura (03-diseño)
        ↓
desglosador-tareas (04-tareas)
        ↓
implementador-tareas (05-implementacion) + código real
        ↓
verificador-cambios (06-verificacion)
        ↓
archivador-cambios (07-cierre)
```

---

## 📝 Cada Skill

### 1️⃣ arquitecto-proyecto

**Entrada**: Descripción del problema  
**Salida**: `docs/architecture/sdd/cambios/{cambio-id}/01-propuesta.md`

```bash
/arquitecto-proyecto

Prompt:
{
  cambio_id: "soft-delete-lecciones",
  problema: "El patrón de eliminación en Lecciones usa delete() físico...",
  contexto: "Módulo lecciones, violación de soft-delete pattern",
  modules_afectados: ["lecciones"],
  criterios_exito: ["Zero breaking changes", "Tests passing", "Cobertura ≥80%"]
}
```

**Genera**: Análisis completo del problema, violaciones SOLID, opciones evaluadas, plan de refactoring.

---

### 2️⃣ especificador-cambios

**Entrada**: `01-propuesta.md` existe  
**Salida**: `docs/architecture/sdd/cambios/{cambio-id}/02-especificacion.md`

```bash
/especificador-cambios soft-delete-lecciones
```

**Genera**: 5-7 requirements con escenarios Given/When/Then, criterios de aceptación, trazabilidad.

---

### 3️⃣ diseñador-arquitectura

**Entrada**: `01-propuesta.md` + `02-especificacion.md` existen  
**Salida**: `docs/architecture/sdd/cambios/{cambio-id}/03-diseño.md`

```bash
/diseñador-arquitectura soft-delete-lecciones
```

**Genera**: Decisiones arquitectónicas, archivos a modificar, patrones aplicados, impacto en BD.

---

### 4️⃣ desglosador-tareas

**Entrada**: `02-especificacion.md` + `03-diseño.md` existen  
**Salida**: `docs/architecture/sdd/cambios/{cambio-id}/04-tareas.md`

```bash
/desglosador-tareas soft-delete-lecciones
```

**Genera**: 6+ tasks granulares (DB schema, code, tests, verify, git) con steps y verificaciones.

---

### 5️⃣ implementador-tareas

**Entrada**: `04-tareas.md` + especificación + diseño existen  
**Salida**: `docs/architecture/sdd/cambios/{cambio-id}/05-implementacion.md` + código modificado + commits

```bash
/implementador-tareas soft-delete-lecciones
```

**Genera**: Código real, tests, migraciones, commits. Documenta qué se implementó, dónde, con qué líneas.

**Requisitos**:

- npm run build → PASSING
- npx tsc --noEmit → 0 ERRORS
- Tests compilables
- Commits con convencional commits en español

---

### 6️⃣ verificador-cambios

**Entrada**: `05-implementacion.md` + código implementado existen  
**Salida**: `docs/architecture/sdd/cambios/{cambio-id}/06-verificacion.md`

```bash
/verificador-cambios soft-delete-lecciones
```

**Genera**: Validación completa:

- ✅ Cada requirement especificado está implementado
- ✅ Cada decisión de diseño se implementó fielmente
- ✅ Tests pasan (N/N)
- ✅ Cobertura ≥80%
- ✅ TypeScript: 0 errors
- ✅ Build: ✅ successful
- ✅ Deviations documentadas (o ninguno)

**Veredicto**: ✅ APROBADO PARA PRODUCCIÓN / ⚠️ PARCIAL / ❌ RECHAZADO

---

### 7️⃣ archivador-cambios

**Entrada**: `06-verificacion.md` aprobado  
**Salida**: `docs/architecture/sdd/cambios/{cambio-id}/07-cierre.md`

```bash
/archivador-cambios soft-delete-lecciones
```

**Genera**: Documento final:

- Timeline real vs estimado
- Lecciones aprendidas
- Objetivos alcanzados (100%)
- Próximas fases desbloqueadas
- Conclusión visual

**Resultado**: Cambio 100% documentado, auditable, en Git.

---

## 📊 Artefactos Generados

Cada cambio crea una carpeta:

```
docs/architecture/sdd/cambios/soft-delete-lecciones/
├── 01-propuesta.md          (Fase 1)
├── 02-especificacion.md     (Fase 2)
├── 03-diseño.md             (Fase 3)
├── 04-tareas.md             (Fase 4)
├── 05-implementacion.md     (Fase 5)
├── 06-verificacion.md       (Fase 6)
└── 07-cierre.md             (Fase 7)
```

Más el índice:

```
docs/architecture/sdd/cambios/INDICE.md
```

---

## 🎯 Ejemplo Completo: soft-delete-lecciones

### Fase 1 (arquitecto-proyecto)

```bash
/arquitecto-proyecto

Entrada:
- Problema: Lecciones usa delete() físico (violación soft-delete pattern)
- Módulos: [lecciones]
- Objetivos: 0 breaking changes, 95% cobertura, tests 100% passing

Salida: 01-propuesta.md
├ Problema descrito
├ Violaciones SOLID identificadas
├ Solución elegida (soft delete con campo estado)
├ Opciones evaluadas (alternativas descartadas)
└ Plan de refactoring (fases, dependencias)
```

### Fase 2 (especificador-cambios)

```bash
/especificador-cambios soft-delete-lecciones

Salida: 02-especificacion.md
├ Req 1: Agregar campo estado a modelo Leccion
│  ├ Given: Tabla lecciones sin estado field
│  ├ When: Migración ejecutada
│  └ Then: Campo estado existe con default ACTIVO
├ Req 2: Cambiar delete() a soft delete
│  ├ Given: Leccion con id=123
│  ├ When: Usuario llama eliminarLeccion(123)
│  └ Then: Leccion.estado = ARCHIVADO (no delete físico)
├ Req 3: Filtrar lecciones archivadas en listados
├ Req 4: Reordenar lecciones activas tras eliminar
└ Req 5: Mantener tests passing
```

### Fase 3 (diseñador-arquitectura)

```bash
/diseñador-arquitectura soft-delete-lecciones

Salida: 03-diseño.md
├ Decisión 1: Soft delete con campo estado
│  ├ Problema: Necesario marcar como deleted sin perder datos
│  ├ Solución: Campo VARCHAR(50) estado = ACTIVO | ARCHIVADO
│  ├ Alternativas: (logical flags, tombstone pattern, etc.)
│  └ Código: Prisma schema update + index
├ Decisión 2: Filter en queries
│  ├ Código: where: { estado: { not: 'ARCHIVADO' } }
│  └ Aplicar en: listarPorCurso, listarActivas, etc.
└ Archivos:
  ├ apps/api/prisma/schema.prisma (+1 field)
  ├ apps/api/prisma/migrations/...migration.sql (nueva)
  ├ apps/api/src/lecciones/lecciones.service.ts (modificar eliminar, listar)
  └ apps/api/src/lecciones/lecciones.service.spec.ts (+tests)
```

### Fase 4 (desglosador-tareas)

```bash
/desglosador-tareas soft-delete-lecciones

Salida: 04-tareas.md
├ Task 1: Add estado field to schema (DB Schema, 15 min)
├ Task 2: Create migration (DB Schema, 15 min, blocker)
├ Task 3: Implement soft delete en eliminar() (Code, 30 min)
├ Task 4: Update filters en listar queries (Code, 20 min)
├ Task 5: Write tests (Tests, 45 min)
├ Task 6: Build + verify (Verify, 15 min)
└ Task 7: Git commit (Git, 5 min)
Total: ~2.5 horas estimado
```

### Fase 5 (implementador-tareas)

```bash
/implementador-tareas soft-delete-lecciones

Salida: 05-implementacion.md + código real
├ Task 1 ✅: schema.prisma modificado (líneas 184-186)
├ Task 2 ✅: migration.sql creado
├ Task 3 ✅: eliminar() ahora usa update() + estado = ARCHIVADO
├ Task 4 ✅: listarPorCurso() filtra estado != ARCHIVADO
├ Task 5 ✅: 6 nuevos tests (soft delete, filtering, reordering)
├ Task 6 ✅: Build passing, TypeScript 0 errors, Tests compilables
├ Task 7 ✅: Commit e7c12a5 "fix: implementar soft delete..."
└ Esfuerzo real: 2h (24% más rápido que estimado)
```

### Fase 6 (verificador-cambios)

```bash
/verificador-cambios soft-delete-lecciones

Salida: 06-verificacion.md
├ Req 1 ✅ APROBADO: estado field existe (schema.prisma:184)
├ Req 2 ✅ APROBADO: eliminar() usa soft delete (lecciones.service.ts:237)
├ Req 3 ✅ APROBADO: queries filtran archivadas (listarPorCurso:176)
├ Req 4 ✅ APROBADO: Reordenamiento implementado (eliminar():250-263)
├ Req 5 ✅ APROBADO: Tests passing (41/41), Coverage 95%
├ Decisión 1 ✅ IMPLEMENTADA: Soft delete pattern aplicado
├ Decisión 2 ✅ IMPLEMENTADA: Filters en lugar correcto
└ VEREDICTO: ✅ APROBADO PARA PRODUCCIÓN
```

### Fase 7 (archivador-cambios)

```bash
/archivador-cambios soft-delete-lecciones

Salida: 07-cierre.md
├ Timeline:
│  ├ Propuesta:      1h estimado, 0.5h real (-50% ✅)
│  ├ Especificación: 2h estimado, 1.5h real (-25% ✅)
│  ├ Diseño:         2h estimado, 2h real (0% ✓)
│  ├ Tareas:         1h estimado, 0.75h real (-25% ✅)
│  ├ Implementación: 3h estimado, 2h real (-33% ✅)
│  ├ Verificación:   1h estimado, 0.75h real (-25% ✅)
│  ├ Cierre:         0.5h estimado, 0.25h real (-50% ✅)
│  └ TOTAL:          10.5h estimado, 8h real (-24% ✅)
├ Lecciones Aprendidas:
│  ├ ✅ Arquitectura SDD de 7 fases proporcionó estructura clara
│  ├ ✅ Templates reutilizables aceleraron documentación
│  ├ ✅ Tests escritos primero detectaron edge cases
│  └ 🔧 Estimaciones fueron 24% altas (ajustar para próximos cambios)
├ Objetivos Alcanzados: 100% (5/5)
│  ├ ✅ Resolver violación soft delete
│  ├ ✅ Mantener tests passing (41/41)
│  ├ ✅ Aumentar cobertura (95% > 80%)
│  ├ ✅ Zero breaking changes (API compatible)
│  └ ✅ Documentado completamente (7 fases)
└ Próximas Fases Desbloqueadas:
   ├ 🔓 Fase 2: Event-Driven Pattern (soft delete ahora en place)
   └ 🔓 Fase 3: Module Boundaries (depende de event-driven)
```

---

## 💡 Tips

- **Cambio-id único**: Usa naming como `soft-delete-lecciones`, `event-driven-modulos`, `caching-cursos`
- **Ejecuta secuencialmente**: No saltes fases. Cada skill necesita el artefacto anterior.
- **Actualiza INDICE.md**: Cada skill actualiza `docs/architecture/sdd/cambios/INDICE.md`
- **Commits reales**: El implementador genera commits reales, no simulados. Verifica git log después.
- **Lecciones aprendidas**: El archivador captura aprendizajes para mejorar futuras estimaciones.
- **100% documentado**: Al final, el cambio vive 100% en Git. Auditable, replicable, historial completo.

---

## 🔗 Ubicaciones Clave

```
docs/architecture/sdd/
├── README.md                          (Guía maestra del SDD)
├── plantillas/
│   ├── 01-propuesta-template.md
│   ├── 02-especificacion-template.md
│   ├── 03-diseño-template.md
│   ├── 04-tareas-template.md
│   ├── 05-implementacion-template.md
│   ├── 06-verificacion-template.md
│   └── 07-cierre-template.md
├── cambios/
│   ├── INDICE.md                      (Índice de todos los cambios)
│   ├── soft-delete-lecciones/         (Ejemplo completado)
│   │   ├── 01-propuesta.md
│   │   ├── 02-especificacion.md
│   │   ├── 03-diseño.md
│   │   ├── 04-tareas.md
│   │   ├── 05-implementacion.md
│   │   ├── 06-verificacion.md
│   │   └── 07-cierre.md
│   └── {próximo-cambio}/              (Comenzar nuevo cambio aquí)

docs/ia-skills/
├── arquitecto-proyecto.md
├── especificador-cambios.md
├── diseñador-arquitectura.md
├── desglosador-tareas.md
├── implementador-tareas.md
├── verificador-cambios.md
├── archivador-cambios.md
└── SDD-SKILLS-GUIA-RAPIDA.md           (Este archivo)
```

---

## ✅ Checklist: Nuevo Cambio

Para iniciar un nuevo cambio `{cambio-id}`:

- [ ] Crear carpeta `docs/architecture/sdd/cambios/{cambio-id}/`
- [ ] Ejecutar `/arquitecto-proyecto` → genera 01-propuesta.md
- [ ] Ejecutar `/especificador-cambios {cambio-id}` → genera 02-especificacion.md
- [ ] Ejecutar `/diseñador-arquitectura {cambio-id}` → genera 03-diseño.md
- [ ] Ejecutar `/desglosador-tareas {cambio-id}` → genera 04-tareas.md
- [ ] Ejecutar `/implementador-tareas {cambio-id}` → genera 05-implementacion.md + código
- [ ] Ejecutar `/verificador-cambios {cambio-id}` → genera 06-verificacion.md
- [ ] Ejecutar `/archivador-cambios {cambio-id}` → genera 07-cierre.md
- [ ] Actualizar `docs/architecture/sdd/cambios/INDICE.md` con entrada de cambio
- [ ] Git commit y push
- [ ] ✅ Cambio completado, documentado, auditable

---

**Sistema SDD completamente independiente de Anthropic. Puro Amauta. 🚀**
