# TAREAS — {cambio-id}

**Generado desde**: 03-diseño.md  
**Skill Responsable**: `desglosador-tareas`  
**Estado**: 📋 Breakdown ejecutable

**Esfuerzo Total Estimado**: X horas

---

## 📝 TASK 1: {Título Claro}

**Type**: {Database Schema | Code Change | Test Changes | Verification | Git}  
**Blocker**: {Sí/No — ¿Bloquea otras tasks?}  
**Esfuerzo**: 15 minutos  
**Dependencias**: {Ninguna / Task X debe completarse primero}

### Steps

- [ ] {Paso 1 accionable}
- [ ] {Paso 2 accionable}
- [ ] {Paso 3 accionable}

### Verification

- [ ] {Cómo validar que está completado}
- [ ] {Otra validación}

---

## 📝 TASK 2: {Título Claro}

**Type**: {Code Change}  
**Blocker**: {Depende de Task 1}  
**Esfuerzo**: 30 minutos  
**Archivo**: {path/to/file.ts}

### Steps

- [ ] Leer código actual
- [ ] Implementar cambio
- [ ] Verificar que compila

### Verification

- [ ] {Validación 1}
- [ ] {Validación 2}

---

## 📝 TASK 3: {Título Claro}

**Type**: {Code Change}  
**Blocker**: {No}  
**Esfuerzo**: 15 minutos  
**Archivo**: {path/to/file.ts}

### Steps

- [ ] {Paso 1}
- [ ] {Paso 2}

### Verification

- [ ] {Validación}

---

## 📝 TASK 4: {Título Claro}

**Type**: {Test Changes}  
**Blocker**: {No}  
**Esfuerzo**: 45 minutos  
**Archivo**: {path/to/file.spec.ts}

### Steps

- [ ] Escribir N test cases
- [ ] Ejecutar tests
- [ ] Verificar cobertura

### Verification

- [ ] Tests: N/N passing
- [ ] Coverage: ≥80%

---

## 📝 TASK 5: {Título Claro}

**Type**: {Verification}  
**Blocker**: {No}  
**Esfuerzo**: 15 minutos

### Steps

- [ ] npm run build
- [ ] npx tsc --noEmit
- [ ] npm test

### Verification

- [ ] Build: ✅
- [ ] TypeScript: 0 errors
- [ ] Tests: passing

---

## 📝 TASK 6: {Título Claro}

**Type**: {Git}  
**Blocker**: {No}  
**Esfuerzo**: 5 minutos

### Steps

- [ ] git add {files}
- [ ] git commit -m "{mensaje}"
- [ ] Verificar commit

### Verification

- [ ] Commit message sigue conventional commits
- [ ] Todos los archivos incluidos

---

## 📊 Resumen de Tareas

| Task      | Título   | Tipo   | Esfuerzo       | Blocker | Estado |
| --------- | -------- | ------ | -------------- | ------- | ------ |
| 1         | {título} | Schema | 15 min         | Sí      | [ ]    |
| 2         | {título} | Code   | 30 min         | No      | [ ]    |
| 3         | {título} | Code   | 15 min         | No      | [ ]    |
| 4         | {título} | Tests  | 45 min         | No      | [ ]    |
| 5         | {título} | Verify | 15 min         | No      | [ ]    |
| 6         | {título} | Git    | 5 min          | No      | [ ]    |
| **TOTAL** |          |        | **~2-3 horas** |         |        |

---

## 🔗 Trazabilidad: Diseño → Tasks

| Decisión (03) | Task (04) |
| ------------- | --------- |
| Decisión 1    | Task 1-2  |
| Decisión 2    | Task 3    |
| Patrones      | Task 4-6  |

---

## ✅ Criterios de Éxito Global

- [ ] Todas las tasks completadas (6/6)
- [ ] Build successful
- [ ] Tests: 100% passing
- [ ] TypeScript: 0 errors
- [ ] Commits creados
- [ ] Code review aprobado (próximo paso)

---

**Generado por**: `desglosador-tareas` skill  
**Próximo**: 05-implementacion.md (Skill: `implementador-tareas`)
