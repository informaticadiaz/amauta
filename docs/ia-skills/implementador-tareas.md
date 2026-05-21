# Skill: implementador-tareas

**Responsable de**: Fase 5 - Implementación  
**Entrada**: `04-tareas.md` (existe), especificación, diseño  
**Salida**: `docs/architecture/sdd/cambios/{cambio-id}/05-implementacion.md` + código modificado + commits

---

## Propósito

Ejecutar las **TAREAS** definidas: escribir código real, crear migraciones, escribir tests, hacer commits. Este skill realmente hace el trabajo. Al final, documenta qué se implementó.

---

## Invocación

```bash
/implementador-tareas {cambio-id}

# Ejemplo:
/implementador-tareas soft-delete-lecciones
```

---

## Proceso

### Step 1: Leer contexto

- Leer tareas: `docs/architecture/sdd/cambios/{cambio-id}/04-tareas.md`
- Leer diseño: `docs/architecture/sdd/cambios/{cambio-id}/03-diseño.md`
- Leer especificación: `docs/architecture/sdd/cambios/{cambio-id}/02-especificacion.md`
- Leer template: `docs/architecture/sdd/plantillas/05-implementacion-template.md`
- Leer código actual en archivos que se van a modificar

### Step 2: Ejecutar tareas en orden

Por cada tarea:

1. **Leer la tarea completa** — Steps y Verification
2. **Leer código existente** — Si es Code Change
3. **Implementar** — Escribir código, crear migrations, escribir tests
4. **Verificar** — Ejecutar verificación de la tarea
5. **Documentar** — Qué se hizo, dónde, qué líneas

NO OMITIR TAREAS. Si Task 1 es "Create migration", créalo aunque parezca obvio.

### Step 3: Seguir patrones del proyecto

- Antes de modificar un archivo, leer código existente
- Usar convenciones de nombres (camelCase, PascalCase, SNAKE_CASE según contexto)
- Seguir estructura de carpetas existente
- No introduzir nuevos patterns sin justificación

### Step 4: Tests

Si Task incluye tests:

- Escribir tests que verifiquen behavior (no solo cobertura)
- Incluir casos positivos y negativos
- Seguir convención: `describe('NombreService', () => { it('should...', ...)})`
- Ejecutar tests para verificar que pasan

### Step 5: Compilación y Lint

- `npm run build` — Must pass
- `npx tsc --noEmit` — 0 errors required
- ESLint, Prettier — Auto-fix si aplica
- No permitir TypeScript errors

### Step 6: Commits

Crear commit por tarea o grupo de tareas relacionadas:

```bash
git commit -m "feat: descripción

Implementa {requirement de spec}.

Cambios:
- Agregar {campo/lógica}
- Modificar {función}
- {Cambio 3}

Resuelve: {referencia a issue si aplica}"
```

Mensajes en español, convencional commits:

- `feat:` — nueva funcionalidad
- `fix:` — bug fix
- `docs:` — documentación
- `test:` — tests
- `refactor:` — refactoring sin cambios funcionales

### Step 7: Documentar implementación

Completar template 05-implementacion.md:

```markdown
## ✅ TASK N Completada

**Título**: {Nombre task}  
**Archivo**: {path/to/file.ts}  
**Cambio**: {Descripción breve}  
**Líneas**: {rango de líneas modificadas}  
**Commit**: {hash del commit}

**Lo que se hizo**:
\`\`\`typescript
[snippet de código relevante]
\`\`\`

**Verificación**: ✅ {Cómo se verificó}
```

### Step 8: Resumen de cambios

Tabla:

```
| Archivo | Acción | Cambios | Razón |
|---------|--------|---------|-------|
| apps/api/prisma/schema.prisma | Modified | +estado field | Nuevo campo |
```

### Step 9: Build & Test Status

```
✅ npm run build → PASSING
✅ npx tsc --noEmit → 0 ERRORS
✅ npm test → {N}/{N} PASSING
✅ ESLint → PASSING
```

### Step 10: Persistir artefacto

```
docs/architecture/sdd/cambios/{cambio-id}/05-implementacion.md
```

### Step 11: Actualizar INDICE.md

```markdown
## {cambio-id}

- **Estado**: ⏳ Implementación completada (Fase 5)
- **Commits**: {hashes de commits}
- **Archivos Modificados**: M
- **Tests**: {N}/{N} passing
- **Artefactos**:
  - ✅ 01-propuesta.md
  - ✅ 02-especificacion.md
  - ✅ 03-diseño.md
  - ✅ 04-tareas.md
  - ✅ 05-implementacion.md (creado)
  - [ ] 06-verificacion.md (próximo)
```

### Step 12: Retornar resumen

```markdown
## ✅ Implementación Completada

**Cambio**: {cambio-id}  
**Archivo**: docs/architecture/sdd/cambios/{cambio-id}/05-implementacion.md  
**Tasks**: N/N completadas  
**Archivos Modificados**: M  
**Commits**: {lista}  
**Build Status**: ✅ PASSING  
**Tests**: {N} passing

**Próximo paso**: Ejecutar `/verificador-cambios` para crear 06-verificacion.md
```

---

## Reglas

- ✅ Leer cada task ANTES de implementar
- ✅ Verificar que el código compila
- ✅ Verificar que TypeScript tiene 0 errores
- ✅ Escribir tests para cambios de código
- ✅ Documentar cada task completada
- ✅ Crear commits granulares (por feature o archivo)
- ✅ Usar convencional commits en español
- ✅ Ejecutar build antes de declarar "listo"
- ❌ NO ignorar tareas porque "parezcan obvias"
- ❌ NO dejar TypeScript errors sin resolver
- ❌ NO commitear código sin verificar compilation
- ❌ NO asumir que los tests pasan sin ejecutarlos

---

## Checklist de Completitud

- [ ] Todas las tareas ejecutadas (N/N)
- [ ] Código escrito y compilable
- [ ] TypeScript: 0 errors
- [ ] Tests escritos y passing
- [ ] ESLint/Prettier: OK
- [ ] Build: ✅ successful
- [ ] Commits creados y con mensajes convencionales
- [ ] Cada task documentada en 05-implementacion.md
- [ ] Resumen de cambios incluido
- [ ] Build & Test Status section completado
- [ ] Archivo creado en ubicación correcta
- [ ] INDICE.md actualizado
- [ ] Próximo paso comunicado (verificador-cambios)
