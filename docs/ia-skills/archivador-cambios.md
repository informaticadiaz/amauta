# Skill: archivador-cambios

**Responsable de**: Fase 7 - Cierre  
**Entrada**: `06-verificacion.md` (existe y aprobado)  
**Salida**: `docs/architecture/sdd/cambios/{cambio-id}/07-cierre.md` + actualización INDICE.md

---

## Propósito

**CERRAR el cambio**: crear el documento final que resume todo lo hecho, documenta lecciones aprendidas y desbloquea fases siguientes. Este es el cierre administrativo de la arquitectura.

---

## Invocación

```bash
/archivador-cambios {cambio-id}

# Ejemplo:
/archivador-cambios soft-delete-lecciones
```

---

## Proceso

### Step 1: Leer contexto

- Leer todos los 6 documentos anteriores (01-propuesta through 06-verificacion)
- Leer template: `docs/architecture/sdd/plantillas/07-cierre-template.md`
- Leer INDICE.md para entender estado general

### Step 2: Recopilar datos

Extraer de cada fase:

**De Propuesta (01)**:

- Problema original, solución propuesta
- Módulos afectados

**De Especificación (02)**:

- Requirements definidos

**De Diseño (03)**:

- Decisiones arquitectónicas
- Archivos a modificar

**De Tareas (04)**:

- Total de tasks estimadas
- Esfuerzo estimado

**De Implementación (05)**:

- Esfuerzo real
- Archivos realmente modificados
- Commits
- Tests agregados

**De Verificación (06)**:

- Veredicto final
- Coverage metrics
- Deviations (si las hay)

### Step 3: Calcular Timeline

Tabla: Fase | Estimado | Real | Varianza

```markdown
| Fase           | Estimado  | Real   | Varianza    |
| -------------- | --------- | ------ | ----------- |
| Propuesta      | 1h        | 0.5h   | -50% ✅     |
| Especificación | 2h        | 1.5h   | -25% ✅     |
| Diseño         | 2h        | 2h     | 0% ✓        |
| Tareas         | 1h        | 0.75h  | -25% ✅     |
| Implementación | 3h        | 2.5h   | -17% ✅     |
| Verificación   | 1h        | 0.75h  | -25% ✅     |
| Cierre         | 0.5h      | 0.25h  | -50% ✅     |
| **TOTAL**      | **10.5h** | **8h** | **-24% ✅** |
```

La varianza real vs estimado es CRÍTICA para mejorar estimaciones futuras.

### Step 4: Documentar cambios realizados

- Lista de archivos modificados
- Commits asociados
- Resumen de líneas añadidas/eliminadas

### Step 5: Documentar métrica de calidad

- Coverage: statements, branches, functions, lines
- TypeScript: 0 errors
- ESLint: passing
- Build: successful
- Tests: N/N passing

### Step 6: Deployabilidad

Checklist:

- [x] Tests: 100% passing
- [x] Cobertura: ≥80%
- [x] TypeScript: 0 errors
- [x] Build: successful
- [x] Migration: reversible
- [x] Zero breaking changes
- [x] Documentado: SÍ

Estado: ✅ LISTO PARA PRODUCCIÓN

### Step 7: Objetivos alcanzados

Tabla: Objetivo (de 01-propuesta) | Logrado | Evidencia

```markdown
| Objetivo (01-Propuesta)        | Logrado | Evidencia          |
| ------------------------------ | ------- | ------------------ |
| Resolver violación soft delete | ✅ SÍ   | {archivo}:{líneas} |
| Mantener tests passing         | ✅ SÍ   | 41/41 tests        |
| Aumentar cobertura             | ✅ SÍ   | 95% statements     |
| Zero breaking changes          | ✅ SÍ   | API compatible     |
| Documentado completamente      | ✅ SÍ   | 7 fases            |
```

Veredicto: ✅ 100% de objetivos cumplidos

### Step 8: Lecciones aprendidas

Sección crítica — captura conocimiento para futuros cambios:

```markdown
## 📚 Lecciones Aprendidas

### Lo que funcionó bien

1. **Arquitectura SDD de 7 fases** — Proporcionó estructura clara, evitó rework
2. **Templates reutilizables** — Aceleró documentación
3. **Tests escritos primero** — Detectó edge cases al implementar
4. **Commits granulares** — Historial limpio

### Áreas de mejora para próximos cambios

1. **Estimaciones** — Real fue 24% más rápido. Acción: ajustar referencias
2. **Jest environment** — Issue no blocker pero debe resolverse. Acción: upgrade Jest
3. **Documentación** — Excelente pero repetitiva. Acción: consolidar templates
```

### Step 9: Notas para el equipo

Mensajes importantes:

```markdown
## 📌 Notas Importantes para el Equipo

1. **Soft delete es now mandatory** — Todo nuevo delete usa estado = ARCHIVADO
2. **Migration is live** — Columna existe en prod
3. **Tests are reliable** — 95% coverage = confianza en el cambio
4. **Architecture SDD** — Este es el primer cambio con nueva arquitectura (7 fases)
```

### Step 10: Próximas fases desbloqueadas

Documentar qué cambios dependen de este y ahora están listos:

```markdown
## 🔮 Próximas Fases Desbloqueadas

Este cambio completado desbloquea:

- [ ] **Fase 2: Event-Driven Pattern** — Ahora soft delete está en place
  - Puede proceder con `event-driven-modulos` cambio
  - Dependencia: Este cambio ✅ COMPLETADO

- [ ] **Fase 3: Module Boundaries** — Con Event-Driven implementado
  - Documentar límites de módulos
  - Dependencia: Fase 2 COMPLETADO
```

### Step 11: Conclusión visual

Crear un box ASCII que resuma el cierre:

```markdown
## 🎉 Conclusión

\`\`\`
╔═══════════════════════════════════════════════════════════╗
║ ║
║ ✅ CAMBIO COMPLETADO EXITOSAMENTE ║
║ ║
║ ├─ Violación SOLID: RESUELTA ✅ ║
║ ├─ Tests: 41/41 PASSING ✅ ║
║ ├─ Cobertura: 95% ✅ ║
║ ├─ Documentación: COMPLETA (7 fases) ✅ ║
║ └─ Producción: LISTO ✅ ║
║ ║
║ Esfuerzo real: 8 horas (24% más rápido) ║
║ ║
║ Gracias a la arquitectura SDD de Amauta: ║
║ • Especificación clara → implementación precisa ║
║ • Diseño explícito → menos rework ║
║ • Tasks granulares → progreso visible ║
║ • Documentación viva → fácil de auditar ║
║ ║
╚═══════════════════════════════════════════════════════════╝
\`\`\`
```

### Step 12: Persistir artefacto

```
docs/architecture/sdd/cambios/{cambio-id}/07-cierre.md
```

### Step 13: Actualizar INDICE.md

Cambiar estado a COMPLETADO:

```markdown
## {cambio-id}

- **Estado**: ✅ COMPLETADO
- **Fecha Cierre**: {YYYY-MM-DD}
- **Esfuerzo Real**: 8 horas
- **Esfuerzo Estimado**: 10.5 horas
- **Varianza**: -24% ✅
- **Veredicto**: ✅ Listo para producción
- **Documentación**: 7 fases completas
- **Commits**: {lista de hashes}
- **Bloques Desbloqueados**: Fase 2, Fase 3
```

### Step 14: Crear entrada en índice global (si aplica)

Si hay un índice maestro de cambios completados, agregar allí.

### Step 15: Retornar resumen

```markdown
## ✅ Cambio CERRADO

**Cambio**: {cambio-id}  
**Archivo**: docs/architecture/sdd/cambios/{cambio-id}/07-cierre.md  
**Estado Final**: ✅ COMPLETADO  
**Esfuerzo Real**: X horas (Y% varianza)  
**Próximas Fases Desbloqueadas**: {lista}

**Lecciones Clave**:

- {Aprendizaje 1}
- {Aprendizaje 2}

El cambio está 100% documentado, verificado y listo para producción.
```

---

## Reglas

- ✅ Leer template ANTES de escribir
- ✅ Leer TODOS los 6 documentos anteriores
- ✅ Calcular timeline real vs estimado
- ✅ Incluir lecciones aprendidas (crítico para mejorar)
- ✅ Documentar todo lo que funcionó bien
- ✅ Documentar áreas de mejora para futuros cambios
- ✅ Desbloquear fases siguientes
- ✅ Crear conclusión visual
- ❌ NO omitir lecciones aprendidas
- ❌ NO dejar tareas pendientes sin documentar
- ❌ NO cerrar cambio que no fue verificado como OK

---

## Checklist de Completitud

- [ ] Cierre escrito siguiendo template
- [ ] Timeline real vs estimado calculado
- [ ] Cambios realizados documentados (archivos, commits)
- [ ] Métricas de calidad incluidas (coverage, tests, TypeScript)
- [ ] Deployabilidad checklist completado
- [ ] Objetivos alcanzados documentados (100% logrados)
- [ ] Lecciones aprendidas capturadas
- [ ] Notas para el equipo incluidas
- [ ] Próximas fases desbloqueadas documentadas
- [ ] Conclusión visual incluida
- [ ] Archivo creado en ubicación correcta
- [ ] INDICE.md actualizado a COMPLETADO
- [ ] Cambio está 100% documentado y auditable
- [ ] Listo para compartir con equipo
