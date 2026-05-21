# PROPUESTA — {cambio-id}

**Fecha Análisis**: {YYYY-MM-DD}  
**Skill Responsable**: `arquitecto-proyecto`  
**Estado**: 📋 Propuesta inicial

---

## 📊 Resumen Ejecutivo

{1-2 párrafos describiendo qué se va a cambiar y por qué}

---

## 🔴 El Problema

### Situación Actual

{Descripción de cómo está ahora. Qué no funciona. Dolor/ineficiencia/violación SOLID}

### Síntomas

- {síntoma 1}
- {síntoma 2}
- {síntoma 3}

### Impacto

- **Magnitud**: {Alto/Medio/Bajo}
- **Usuarios afectados**: {X% del sistema}
- **Urgencia**: {Crítica/Alta/Media/Baja}

---

## 💡 Solución Propuesta

### Qué Cambiar

{Descripción clara de la solución}

### Por Qué Esta Solución

- {Razón 1}
- {Razón 2}
- {Razón 3}

### Alternativas Consideradas y Rechazadas

| Alternativa  | Pros | Contras | Por qué NO   |
| ------------ | ---- | ------- | ------------ |
| A            | ...  | ...     | ...          |
| B            | ...  | ...     | ...          |
| Seleccionada | ...  | ...     | ✅ Mejor ROI |

---

## 📋 Módulos Afectados

```
{módulo-1}/
  └─ {archivo-1}.ts (cambios específicos)
  └─ {archivo-2}.ts (cambios específicos)

{módulo-2}/
  └─ {archivo-3}.ts (cambios específicos)
```

---

## 🚨 Violaciones SOLID Identificadas

| Principio             | Módulo   | Problema   | Línea   | Severidad  |
| --------------------- | -------- | ---------- | ------- | ---------- |
| Single Responsibility | {módulo} | {problema} | {línea} | 🔴 Crítica |
| Dependency Inversion  | {módulo} | {problema} | {línea} | 🟡 Media   |

---

## 📈 Arquitectura Actual vs Propuesta

### Estado Actual

```
[diagram ASCII del estado actual]
```

### Estado Propuesto

```
[diagram ASCII del estado propuesto]
```

---

## 🗓️ Plan de Refactorización

### Fase 1: {Nombre} — {Tipo}

**Severidad**: Crítica | **Bloqueante**: Sí  
**Esfuerzo estimado**: X horas

**Cambios**:

- [ ] {cambio 1}
- [ ] {cambio 2}
- [ ] {cambio 3}

---

### Fase 2: {Nombre} — {Tipo}

**Severidad**: Media | **Bloqueante**: Sí  
**Esfuerzo estimado**: X horas

**Cambios**:

- [ ] {cambio 1}
- [ ] {cambio 2}

---

### Fase 3: {Nombre} — {Tipo}

**Severidad**: Baja | **Bloqueante**: No  
**Esfuerzo estimado**: X horas

**Cambios**:

- [ ] {cambio 1}

---

## ✅ Criterios de Éxito

- [ ] Violación SOLID resuelta
- [ ] Todos los tests pasan
- [ ] Cobertura ≥ 80%
- [ ] TypeScript: 0 errores
- [ ] Performance no se degrada (o mejora)
- [ ] Documentación actualizada

---

## 📊 Impacto Estimado

| Métrica                 | Antes | Después | Mejora |
| ----------------------- | ----- | ------- | ------ |
| Complejidad ciclomática | X     | Y       | -Z% ✅ |
| Líneas de código        | X     | Y       | -Z% ✅ |
| Test coverage           | X%    | Y%      | +Z% ✅ |
| Rendimiento             | X ms  | Y ms    | -Z% ✅ |

---

## 🔗 Referencias

- Issue: #{número}
- Roadmap: {link}
- CLAUDE.md: {sección}

---

**Generado por**: `arquitecto-proyecto` skill  
**Próximo**: 02-especificacion.md (Skill: `especificador-cambios`)
