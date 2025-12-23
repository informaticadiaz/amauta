# Guía de Code Review - Amauta

## Filosofía

El code review no es un obstáculo, es una **herramienta de aprendizaje y calidad**. Cada review es una oportunidad para:

- Compartir conocimiento
- Detectar bugs temprano
- Mantener consistencia en el código
- Mejorar como equipo

---

## Principios

### Para el Autor del PR

1. **PRs pequeños**: Más fáciles de revisar, menos errores
2. **Descripción clara**: Explica el "qué" y el "por qué"
3. **Auto-review primero**: Revisá tu propio código antes de pedir review
4. **No tomarlo personal**: Los comentarios son sobre el código, no sobre vos

### Para el Revisor

1. **Ser constructivo**: Sugerir mejoras, no solo señalar problemas
2. **Ser específico**: "Este nombre podría ser más claro" → "Sugiero renombrar `d` a `daysUntilExpiration`"
3. **Priorizar**: Distinguir entre "blocker" y "nice to have"
4. **Reconocer lo bueno**: Si algo está bien hecho, decirlo

---

## Proceso de Review

### Flujo

```
1. Autor crea PR
       ↓
2. CI pasa (lint, tests, build)
       ↓
3. Revisor(es) asignado(s)
       ↓
4. Review: comentarios y discusión
       ↓
5. Autor hace cambios (si necesario)
       ↓
6. Aprobación
       ↓
7. Merge
```

### Tiempos Esperados

| Acción                       | Tiempo Máximo |
| ---------------------------- | ------------- |
| Asignar revisor              | 1 día         |
| Primera revisión             | 2 días        |
| Responder a comentarios      | 1 día         |
| Re-review después de cambios | 1 día         |

**Total máximo**: 5 días desde la creación del PR

---

## Creando un Buen PR

### Template de PR

```markdown
## Descripción

[Explicación breve de qué hace este PR]

## Tipo de cambio

- [ ] Bug fix
- [ ] Nueva feature
- [ ] Refactor
- [ ] Documentación
- [ ] Otro: \_\_\_

## Issue relacionado

Resuelve #[número]

## Cambios realizados

- Cambio 1
- Cambio 2
- Cambio 3

## Screenshots (si aplica)

[Capturas de pantalla para cambios de UI]

## Checklist

- [ ] Mi código sigue los estándares del proyecto
- [ ] He agregado tests para los cambios
- [ ] Todos los tests pasan
- [ ] He actualizado la documentación (si aplica)
- [ ] He revisado mi propio código

## Notas para el revisor

[Cualquier contexto adicional que ayude al review]
```

### Tamaño del PR

| Líneas cambiadas | Clasificación | Recomendación            |
| ---------------- | ------------- | ------------------------ |
| < 50             | Pequeño       | Ideal                    |
| 50-200           | Mediano       | Aceptable                |
| 200-500          | Grande        | Dividir si es posible    |
| > 500            | Muy grande    | Dividir obligatoriamente |

**Excepción**: PRs de generación automática (migraciones, tipos generados)

### Buenos Títulos de PR

```
✅ feat: agregar endpoint de inscripción a cursos
✅ fix: corregir cálculo de progreso cuando hay lecciones opcionales
✅ refactor: extraer lógica de autenticación a servicio dedicado
✅ docs: documentar API de evaluaciones

❌ cambios varios
❌ fix bug
❌ WIP
❌ asdfgh
```

---

## Haciendo Code Review

### Qué Buscar

#### 1. Correctitud

- ¿El código hace lo que dice que hace?
- ¿Maneja todos los casos (incluidos edge cases)?
- ¿Maneja errores apropiadamente?

```typescript
// ❌ Revisar: no maneja caso de array vacío
function getFirst(items: string[]) {
  return items[0].toUpperCase(); // Crash si items está vacío
}

// ✅ Mejor
function getFirst(items: string[]): string | null {
  if (items.length === 0) return null;
  return items[0].toUpperCase();
}
```

#### 2. Seguridad

- ¿Hay validación de inputs?
- ¿Se manejan datos sensibles correctamente?
- ¿Hay riesgo de inyección (SQL, XSS)?
- ¿Los permisos están verificados?

```typescript
// ❌ Peligroso: SQL injection
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Seguro: parametrizado
const user = await prisma.user.findUnique({ where: { email } });
```

#### 3. Legibilidad

- ¿Los nombres son claros y descriptivos?
- ¿La estructura es fácil de seguir?
- ¿Hay comentarios donde son necesarios?

```typescript
// ❌ Poco claro
const d = calcD(u, c);
if (d > 0) doThing();

// ✅ Claro
const daysUntilExpiration = calculateDaysUntilExpiration(user, certificate);
if (daysUntilExpiration > 0) {
  sendExpirationReminder();
}
```

#### 4. Mantenibilidad

- ¿El código es fácil de modificar?
- ¿Hay duplicación que debería extraerse?
- ¿Sigue los patrones del proyecto?

#### 5. Performance

- ¿Hay queries N+1?
- ¿Se están cargando datos innecesarios?
- ¿Hay operaciones costosas en loops?

```typescript
// ❌ N+1 query
const cursos = await prisma.curso.findMany();
for (const curso of cursos) {
  const educador = await prisma.usuario.findUnique({
    where: { id: curso.educadorId },
  });
  // ...
}

// ✅ Una sola query con include
const cursos = await prisma.curso.findMany({
  include: { educador: true },
});
```

#### 6. Tests

- ¿Hay tests para el código nuevo?
- ¿Los tests cubren casos importantes?
- ¿Los tests son legibles y mantenibles?

---

### Cómo Escribir Comentarios

#### Clasificación de Comentarios

| Prefijo        | Significado                    | Acción Requerida |
| -------------- | ------------------------------ | ---------------- |
| `[blocker]`    | Debe corregirse antes de merge | Sí               |
| `[suggestion]` | Mejora recomendada             | Opcional         |
| `[question]`   | Necesito entender algo         | Respuesta        |
| `[nit]`        | Detalle menor, cosmético       | Opcional         |
| `[praise]`     | Algo que está bien hecho       | Ninguna          |

#### Ejemplos de Buenos Comentarios

```markdown
[blocker] Esta query puede causar N+1. Sugiero usar `include` para cargar
las relaciones en una sola query.

[suggestion] Este bloque de lógica podría extraerse a una función
`validateUserPermissions()` para mejorar legibilidad.

[question] ¿Por qué usamos `any` aquí? ¿Podemos definir un tipo más específico?

[nit] Falta punto al final del comentario.

[praise] Excelente uso del patrón early return, hace el código mucho más legible.
```

#### Comentarios Constructivos vs Destructivos

```markdown
❌ "Esto está mal"
✅ "[blocker] Este approach puede causar race conditions. Una alternativa
sería usar un mutex o mover la lógica a una transacción de base de datos."

❌ "No entiendo esto"
✅ "[question] ¿Podrías explicar la lógica de este cálculo? Me cuesta seguir
el flujo con tantas transformaciones."

❌ "Nombre horrible"
✅ "[suggestion] El nombre `d` no es muy descriptivo. ¿Qué te parece
`daysUntilExpiration` para que sea más claro?"
```

---

## Respondiendo a Reviews

### Como Autor

1. **Agradecer el feedback**: Aunque no estés de acuerdo
2. **Responder a todos los comentarios**: Aunque sea "Hecho" o "De acuerdo"
3. **Explicar decisiones**: Si no vas a hacer un cambio, explicá por qué
4. **Pedir clarificación**: Si no entendés un comentario

```markdown
> [suggestion] Podrías usar un enum aquí

Gracias por la sugerencia. Lo pensé pero preferí usar string literal types
porque [razón]. ¿Te parece bien o preferís que cambie a enum?
```

### Resolver Desacuerdos

1. **Discutir en el PR**: Mantener la conversación documentada
2. **Buscar un tercero**: Si no hay consenso, pedir opinión de otro dev
3. **Priorizar consistencia**: Seguir lo que ya hace el proyecto
4. **No bloquear por nimiedades**: Si es [nit], no debería bloquear merge

---

## Checklist de Review

### Para el Revisor

```markdown
## Funcionalidad

- [ ] El código hace lo que el PR dice que hace
- [ ] Maneja edge cases y errores
- [ ] No introduce regresiones

## Código

- [ ] Sigue los estándares del proyecto
- [ ] Nombres claros y descriptivos
- [ ] Sin código duplicado innecesario
- [ ] Sin console.log o código de debug

## Seguridad

- [ ] Inputs validados
- [ ] Permisos verificados
- [ ] Sin datos sensibles hardcodeados
- [ ] Sin vulnerabilidades obvias (XSS, injection)

## Tests

- [ ] Hay tests para código nuevo
- [ ] Tests existentes siguen pasando
- [ ] Cobertura no disminuyó significativamente

## Documentación

- [ ] README actualizado si es necesario
- [ ] Comentarios donde la lógica no es obvia
- [ ] API documentada si hay endpoints nuevos
```

---

## Code Review con Claude Code

Cuando trabajamos con Claude Code, el proceso es similar pero con algunas consideraciones:

### El código generado por IA también se revisa

- Claude Code genera código de alta calidad, pero siempre revisar
- Verificar que sigue los patrones del proyecto
- Asegurar que no hay sobre-ingeniería

### Firma en commits

Los commits de Claude Code incluyen:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

Esto indica que el código fue asistido por IA y puede requerir revisión extra en áreas como:

- Lógica de negocio específica del dominio
- Integraciones con sistemas externos
- Código de seguridad crítico

---

## Anti-Patrones de Code Review

| Anti-Patrón               | Problema                             | Solución                           |
| ------------------------- | ------------------------------------ | ---------------------------------- |
| **Review Zombie**         | PRs abandonados por semanas          | Establecer tiempos máximos         |
| **Nitpick Storm**         | Solo comentarios de formato          | Usar linter automático             |
| **LGTM ciego**            | Aprobar sin revisar                  | Tomarse el tiempo necesario        |
| **Ego Battle**            | Discusiones interminables            | Buscar tercero, priorizar          |
| **Review de última hora** | Pedir cambios grandes al final       | Comunicar blockers temprano        |
| **Gatekeeping**           | Bloquear por preferencias personales | Distinguir estándares de opiniones |

---

## Métricas de Code Review

### Métricas Saludables

| Métrica                       | Objetivo        |
| ----------------------------- | --------------- |
| Tiempo hasta primer review    | < 24 horas      |
| Tiempo hasta merge            | < 5 días        |
| PRs abiertos simultáneos      | < 5 por persona |
| Comentarios por PR (promedio) | 3-10            |

### Métricas a Evitar

- **Número de comentarios como KPI**: Incentiva nitpicking
- **Velocidad sobre todo**: Sacrifica calidad
- **PRs rechazados**: Genera miedo a contribuir

---

## Recursos

- [Google Engineering Practices - Code Review](https://google.github.io/eng-practices/review/)
- [How to Do Code Reviews Like a Human](https://mtlynch.io/human-code-reviews-1/)
- [The Standard of Code Review](https://google.github.io/eng-practices/review/reviewer/standard.html)

---

**Última actualización**: 2025-12-23
**Versión**: 1.0.0
