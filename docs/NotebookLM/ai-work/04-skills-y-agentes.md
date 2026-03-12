# Skills y Agentes: Automatización con IA

> Cómo crear instrucciones reutilizables y trabajar con IAs que ejecutan acciones.

---

## ¿Qué es un Skill?

Un **skill** es un conjunto de instrucciones predefinidas que la IA puede ejecutar para tareas específicas. Es como una "función" para la IA.

```
SKILL = Instrucciones + Parámetros + Templates + Checklist

Ejemplo: "CRUD Generator"
├── Instrucciones: Cómo generar un módulo CRUD
├── Parámetros: nombre, campos, relaciones
├── Templates: código para controller, service, etc.
└── Checklist: pasos post-generación
```

### Beneficios

| Sin Skills                     | Con Skills                       |
| ------------------------------ | -------------------------------- |
| Repetir instrucciones cada vez | Una vez definido, reutilizable   |
| Inconsistencia entre sesiones  | Resultados consistentes          |
| Depender de la memoria         | Documentado y versionable        |
| Difícil de compartir           | Fácil de compartir con el equipo |

---

## Anatomía de un Skill

### Estructura Básica

```markdown
# Skill: [Nombre del Skill]

## Propósito

[Qué hace este skill]

## Uso

[Cómo invocarlo]

## Parámetros

| Parámetro | Tipo   | Requerido | Descripción       |
| --------- | ------ | --------- | ----------------- |
| nombre    | string | Sí        | Nombre del módulo |
| campos    | lista  | Sí        | Campos a incluir  |

## Instrucciones

[Instrucciones detalladas para la IA]

## Templates

[Código base a usar]

## Checklist Post-Ejecución

- [ ] Paso 1
- [ ] Paso 2

## Ejemplos

[Ejemplos de uso]
```

---

## Ejemplos de Skills

### Skill 1: Generador de Componentes React

```markdown
# Skill: React Component Generator

## Propósito

Genera un componente React con TypeScript siguiendo las convenciones del proyecto.

## Uso
```

Genera componente: [NombreComponente]
Props: [lista de props con tipos]
Tipo: [funcional/cliente]
Estilos: [css-modules/tailwind]

````

## Parámetros
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| nombre | string | requerido | PascalCase |
| props | objeto | {} | Props con tipos |
| tipo | enum | funcional | funcional/cliente |
| estilos | enum | css-modules | css-modules/tailwind |

## Instrucciones

1. Crear archivo `[Nombre].tsx`:
   - Si tipo=cliente, agregar 'use client'
   - Definir interface Props
   - Exportar componente nombrado

2. Si estilos=css-modules, crear `[Nombre].module.css`

3. Estructura del componente:
```tsx
// Imports
// Interface Props
// Componente
// Export
````

## Template

```tsx
'use client'; // Solo si tipo=cliente

import styles from './[Nombre].module.css';

interface [Nombre]Props {
  // props aquí
}

export function [Nombre]({ ...props }: [Nombre]Props) {
  return (
    <div className={styles.container}>
      {/* contenido */}
    </div>
  );
}
```

## Ejemplo

Entrada:

```
Genera componente: UserCard
Props: user (User), onEdit (function), compact (boolean opcional)
Tipo: cliente
Estilos: css-modules
```

Salida: [componente completo]

````

### Skill 2: Generador de Endpoints API

```markdown
# Skill: API Endpoint Generator

## Propósito
Agrega un nuevo endpoint a un módulo NestJS existente.

## Uso
````

Nuevo endpoint:
Módulo: [nombre]
Método: [GET/POST/PATCH/DELETE]
Ruta: [path]
Descripción: [qué hace]
Auth: [público/roles]

````

## Parámetros
| Parámetro | Requerido | Descripción |
|-----------|-----------|-------------|
| módulo | Sí | Nombre del módulo |
| método | Sí | HTTP method |
| ruta | Sí | Path del endpoint |
| descripción | Sí | Qué hace |
| auth | No | público o lista de roles |
| body | No | Schema del body |
| response | No | Schema de respuesta |

## Instrucciones

1. Agregar método al Controller:
   - Decoradores: @[Método]('[ruta]')
   - Si auth=público: @Public()
   - Si auth=roles: @Roles(...roles)
   - Parámetros: @Param, @Body, @Query, @CurrentUser

2. Agregar lógica al Service:
   - Validar con Zod si hay body
   - Implementar lógica de negocio
   - Manejar errores con excepciones NestJS

3. Crear DTO si necesario:
   - Schema Zod
   - Tipo inferido

## Template Controller

```typescript
/**
 * [Descripción]
 *
 * [MÉTODO] /api/v1/[ruta]
 */
@[Auth]
@[Método]('[path]')
async [nombreMetodo](
  @Param('id') id: string,
  @Body() dto: [Dto],
  @CurrentUser() user: RequestUser
): Promise<[Response]> {
  return this.[servicio].[metodo](...);
}
````

## Template Service

```typescript
async [nombreMetodo](...params): Promise<[Return]> {
  // Validar
  const result = schema.safeParse(dto);
  if (!result.success) {
    throw new BadRequestException(result.error.issues[0]?.message);
  }

  // Lógica
  // ...

  return resultado;
}
```

````

### Skill 3: Revisor de Código

```markdown
# Skill: Code Reviewer

## Propósito
Revisa código como un tech lead senior.

## Uso
````

Revisa este código:

```[lenguaje]
[código]
```

Enfoque: [seguridad/performance/legibilidad/todo]
Severidad: [strict/normal/lenient]

````

## Instrucciones

1. Analizar el código en estos aspectos:
   - Correctitud funcional
   - Seguridad
   - Performance
   - Legibilidad
   - Mantenibilidad
   - Tests

2. Clasificar issues:
   - 🔴 Crítico: Debe arreglarse
   - 🟡 Importante: Debería arreglarse
   - 🟢 Sugerencia: Opcional

3. Para cada issue:
   - Línea(s) afectada(s)
   - Descripción del problema
   - Sugerencia de solución
   - Código corregido (si aplica)

## Formato de Respuesta

```markdown
## Resumen
[Evaluación general]

## Issues

### 🔴 Críticos
1. **[Título]** (línea X)
   - Problema: [descripción]
   - Solución: [sugerencia]
   ```[lenguaje]
   [código corregido]
````

### 🟡 Importantes

...

### 🟢 Sugerencias

...

## Aspectos Positivos

- [cosa buena 1]
- [cosa buena 2]

```

```

---

## ¿Qué es un Agente?

Un **agente** es una IA que puede:

- Tomar decisiones autónomamente
- Ejecutar acciones (leer/escribir archivos, ejecutar comandos)
- Iterar hasta completar una tarea

```
IA SIMPLE                      AGENTE
────────────                   ──────
Pregunta → Respuesta           Tarea → [múltiples pasos] → Resultado

"¿Cómo creo un archivo?"       "Crea un módulo CRUD"
→ Explicación                  → Lee código existente
                               → Genera archivos
                               → Ejecuta tests
                               → Reporta resultado
```

### Herramientas con Agentes

| Herramienta              | Capacidades del Agente                        |
| ------------------------ | --------------------------------------------- |
| Claude Code              | Leer/escribir archivos, ejecutar bash, buscar |
| Cursor Composer          | Editar múltiples archivos, crear proyectos    |
| GitHub Copilot Workspace | Planificar y ejecutar cambios en repo         |
| Devin                    | Agente de desarrollo completo                 |

---

## Trabajando con Agentes

### Principio 1: Dar Autonomía Apropiada

```
POCA AUTONOMÍA (micro-managing):
"Lee archivo X, luego edita línea 15, cambia 'foo' por 'bar'"
→ Pierdes el beneficio del agente

MUCHA AUTONOMÍA (peligroso):
"Arregla todos los bugs del proyecto"
→ Cambios impredecibles

AUTONOMÍA APROPIADA:
"Arregla el bug de validación en el módulo de usuarios.
 El error es: [error]. Solo modifica archivos en src/users/"
→ Claro pero permite que el agente trabaje
```

### Principio 2: Establecer Límites

```
LÍMITES BUENOS:
- "Solo modifica archivos en src/components/"
- "No cambies la API pública"
- "Ejecuta tests antes de terminar"
- "Pide confirmación antes de eliminar archivos"

DEMASIADO RESTRICTIVO:
- "Solo puedes editar exactamente 5 líneas"
- "No uses ningún comando de terminal"
```

### Principio 3: Verificar Progreso

```
BUENAS PRÁCTICAS:
- Revisar cambios antes de commit
- Pedir resumen de lo que hizo
- Ejecutar tests después
- Hacer code review del resultado

ANTI-PATRONES:
- Confiar ciegamente en cambios grandes
- No revisar código generado
- Hacer commit sin verificar
```

---

## Patrones de Uso de Agentes

### Patrón 1: Tarea Acotada

```
"En el archivo src/utils/validators.ts:
1. Lee la función validateEmail
2. Agrega soporte para dominios .co.uk
3. Agrega tests en validators.test.ts
4. Ejecuta los tests para verificar"
```

**Características:**

- Archivos específicos
- Cambio claro
- Verificación incluida

### Patrón 2: Exploración + Acción

```
"Primero, busca en el código dónde se maneja la autenticación.
Luego, explícame cómo funciona.
Después, yo te diré qué cambiar."
```

**Características:**

- Fase de exploración
- Pausa para revisión humana
- Acción después de confirmación

### Patrón 3: Plan + Ejecución

```
"Necesito agregar un sistema de notificaciones.

Paso 1: Genera un plan de implementación
[esperar respuesta]

Paso 2: Confirmo el plan, procede con la implementación
[el agente ejecuta]
```

**Características:**

- Planificación explícita
- Aprobación humana
- Ejecución autónoma

### Patrón 4: Iteración Supervisada

```
Iteración 1: "Crea la estructura básica del módulo"
[revisar]

Iteración 2: "Agrega la validación"
[revisar]

Iteración 3: "Agrega manejo de errores"
[revisar]

Iteración 4: "Agrega tests"
[revisar y aprobar]
```

**Características:**

- Cambios incrementales
- Revisión frecuente
- Control granular

---

## Creando tus Propios Skills

### Paso 1: Identificar Tareas Repetitivas

```
¿Qué hago frecuentemente?
- Crear componentes React ✓
- Agregar endpoints a la API ✓
- Escribir tests para funciones ✓
- Revisar PRs ✓
- Documentar funciones ✓
```

### Paso 2: Documentar el Proceso Manual

```
Cuando creo un componente React:
1. Creo archivo [Nombre].tsx
2. Agrego 'use client' si tiene estado
3. Defino interface Props
4. Creo la función del componente
5. Creo archivo de estilos
6. Exporto desde index.ts del directorio
```

### Paso 3: Convertir en Instrucciones

````markdown
## Instrucciones para Crear Componente

1. Crear archivo `components/[nombre]/[Nombre].tsx`

2. Estructura del archivo:

   ```tsx
   'use client'; // Solo si necesita estado/efectos

   import styles from './[Nombre].module.css';

   interface [Nombre]Props {
     // Props definidas por el usuario
   }

   export function [Nombre]({ ...props }: [Nombre]Props) {
     return (
       <div className={styles.container}>
         {/* Implementación */}
       </div>
     );
   }
   ```
````

3. Crear archivo `components/[nombre]/[Nombre].module.css`

4. Actualizar `components/[nombre]/index.ts`:
   ```ts
   export { [Nombre] } from './[Nombre]';
   ```

````

### Paso 4: Agregar Parámetros

```markdown
## Parámetros

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| nombre | string | requerido | Nombre del componente |
| props | Props[] | [] | Lista de props |
| cliente | boolean | false | Si necesita 'use client' |
| estilos | 'css-modules' \| 'tailwind' | 'css-modules' | Sistema de estilos |
````

### Paso 5: Agregar Ejemplos

```markdown
## Ejemplo de Uso

Entrada:
```

Crea componente Button
Props:

- children: React.ReactNode
- variant: 'primary' | 'secondary'
- disabled?: boolean
- onClick?: () => void
  Cliente: true
  Estilos: css-modules

```

Salida esperada:
[código completo del componente]
```

### Paso 6: Probar y Refinar

```
1. Usar el skill varias veces
2. Identificar casos no cubiertos
3. Agregar instrucciones para edge cases
4. Documentar errores comunes
5. Iterar hasta que sea robusto
```

---

## Biblioteca de Skills Útiles

### Para Desarrollo

| Skill           | Descripción                        |
| --------------- | ---------------------------------- |
| CRUD Generator  | Genera módulo completo             |
| API Endpoint    | Agrega endpoint a módulo existente |
| React Component | Genera componente con estilos      |
| Test Generator  | Genera tests para función          |
| DB Migration    | Genera migración Prisma            |

### Para Calidad

| Skill             | Descripción                         |
| ----------------- | ----------------------------------- |
| Code Reviewer     | Revisa código en profundidad        |
| Security Audit    | Busca vulnerabilidades              |
| Performance Check | Identifica problemas de rendimiento |
| Refactor Guide    | Sugiere refactoring                 |

### Para Documentación

| Skill           | Descripción                 |
| --------------- | --------------------------- |
| JSDoc Generator | Genera documentación JSDoc  |
| README Creator  | Crea README para módulo     |
| API Docs        | Documenta endpoints         |
| Changelog Entry | Genera entrada de changelog |

---

## Referencia Rápida

### Cuándo Usar Skills vs Prompts Simples

| Situación                     | Usar          |
| ----------------------------- | ------------- |
| Tarea única, simple           | Prompt simple |
| Tarea repetitiva              | Skill         |
| Tarea con formato específico  | Skill         |
| Exploración/aprendizaje       | Prompt simple |
| Generación de código estándar | Skill         |

### Cuándo Usar Agentes vs IA Simple

| Situación                     | Usar      |
| ----------------------------- | --------- |
| Pregunta conceptual           | IA simple |
| Cambios en un archivo         | IA simple |
| Cambios en múltiples archivos | Agente    |
| Tarea con múltiples pasos     | Agente    |
| Necesita ejecutar comandos    | Agente    |

### Template de Skill

```markdown
# Skill: [Nombre]

## Propósito

[Una oración]

## Uso

[Cómo invocarlo]

## Parámetros

[Tabla de parámetros]

## Instrucciones

[Pasos detallados]

## Templates

[Código base]

## Ejemplos

[Ejemplos de uso]

## Notas

[Advertencias, casos especiales]
```
