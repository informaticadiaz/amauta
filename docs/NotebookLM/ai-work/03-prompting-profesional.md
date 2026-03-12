# Prompting Profesional

> Técnicas avanzadas para comunicarte efectivamente con IAs y obtener mejores resultados.

---

## Anatomía de un Buen Prompt

```
┌─────────────────────────────────────────────────────────────┐
│ ROL                                                         │
│ "Eres un desarrollador senior de TypeScript..."             │
├─────────────────────────────────────────────────────────────┤
│ CONTEXTO                                                    │
│ "En un proyecto Next.js 14 con App Router..."               │
├─────────────────────────────────────────────────────────────┤
│ TAREA                                                       │
│ "Crea una función que valide formularios..."                │
├─────────────────────────────────────────────────────────────┤
│ FORMATO                                                     │
│ "Retorna un objeto con { valid, errors }..."                │
├─────────────────────────────────────────────────────────────┤
│ RESTRICCIONES                                               │
│ "Sin librerías externas, compatible con Edge Runtime..."    │
├─────────────────────────────────────────────────────────────┤
│ EJEMPLOS (opcional)                                         │
│ "Por ejemplo: validate({ email: 'test' }) → { valid: false }│
└─────────────────────────────────────────────────────────────┘
```

---

## Técnicas de Prompting

### 1. Role Prompting (Asignación de Rol)

Definir quién es la IA para obtener respuestas especializadas:

```
❌ Sin rol:
"¿Cómo optimizo esta query SQL?"

✅ Con rol:
"Eres un DBA senior con 15 años de experiencia en PostgreSQL.
Analiza esta query y sugiere optimizaciones considerando
índices, plan de ejecución y mejores prácticas."
```

**Roles útiles para desarrollo:**

| Rol                                    | Uso                            |
| -------------------------------------- | ------------------------------ |
| "Desarrollador senior de [tecnología]" | Código de calidad              |
| "Arquitecto de software"               | Decisiones de diseño           |
| "Experto en seguridad"                 | Revisión de vulnerabilidades   |
| "Tech lead"                            | Code review, mejores prácticas |
| "DevOps engineer"                      | Infraestructura, CI/CD         |
| "QA engineer"                          | Testing, edge cases            |

### 2. Chain of Thought (Cadena de Pensamiento)

Pedir que razone paso a paso:

```
❌ Directo:
"¿Por qué falla este código?"

✅ Chain of Thought:
"Analiza este código paso a paso:
1. Primero, describe qué intenta hacer cada línea
2. Identifica posibles puntos de fallo
3. Explica por qué podría fallar
4. Sugiere una solución"
```

**Frases que activan CoT:**

- "Piensa paso a paso"
- "Analiza esto sistemáticamente"
- "Primero..., luego..., finalmente..."
- "Descompón el problema"
- "Razona antes de responder"

### 3. Few-Shot Prompting (Con Ejemplos)

Mostrar ejemplos del patrón deseado:

```
Convierte estos nombres de función de camelCase a snake_case:

getUserById → get_user_by_id
calculateTotalPrice → calculate_total_price
isValidEmail → is_valid_email

Ahora convierte:
- fetchDataFromAPI →
- handleUserAuthentication →
- parseJsonResponse →
```

**Cuándo usar:**

- Formato específico requerido
- Transformaciones de texto/código
- Establecer un patrón de respuesta

### 4. Zero-Shot con Instrucciones Claras

Sin ejemplos, pero con instrucciones muy específicas:

```
Crea una función TypeScript que:
- Nombre: validatePassword
- Parámetro: password (string)
- Retorna: { valid: boolean; errors: string[] }
- Validaciones:
  - Mínimo 8 caracteres
  - Al menos una mayúscula
  - Al menos un número
  - Al menos un carácter especial (!@#$%^&*)
- Los errores deben ser mensajes en español
- No usar regex complejos, preferir métodos de string
```

### 5. Prompt Negativo

Especificar qué NO hacer:

```
Crea un componente de botón en React.

NO HAGAS:
- No uses class components
- No uses inline styles
- No uses any en TypeScript
- No agregues props innecesarias
- No uses bibliotecas UI externas

SÍ HAZ:
- Usa función con tipos explícitos
- Usa CSS modules o Tailwind
- Incluye estados hover/disabled
- Hazlo accesible (aria labels)
```

### 6. Refinamiento Iterativo

Mejorar respuestas progresivamente:

```
Iteración 1:
"Crea una función de ordenamiento"

→ [La IA genera algo básico]

Iteración 2:
"Ahora hazla genérica con TypeScript"

→ [La IA mejora con tipos]

Iteración 3:
"Agrega soporte para ordenar por múltiples campos"

→ [La IA agrega funcionalidad]

Iteración 4:
"Optimiza para arrays grandes (más de 10,000 elementos)"

→ [La IA optimiza]
```

### 7. Prompt de Comparación

Pedir análisis de alternativas:

```
Necesito manejar estado global en React.

Compara estas opciones:
1. Redux Toolkit
2. Zustand
3. Jotai
4. React Context + useReducer

Para cada una, describe:
- Curva de aprendizaje
- Boilerplate necesario
- Performance
- Cuándo elegirla

Mi caso: App mediana, 20 componentes, actualización frecuente de estado
```

### 8. Metacognitive Prompting

Pedir que evalúe su propia respuesta:

```
[Después de recibir una respuesta]

"Revisa tu respuesta anterior:
1. ¿Hay algún error o imprecisión?
2. ¿Falta considerar algún edge case?
3. ¿Se puede simplificar el código?
4. ¿Es la solución más idiomática para [tecnología]?"
```

---

## Patrones de Prompts para Desarrollo

### Patrón: Debugging

````
CÓDIGO:
```[lenguaje]
[código con bug]
````

ERROR:

```
[mensaje de error completo]
```

COMPORTAMIENTO ESPERADO:
[qué debería pasar]

COMPORTAMIENTO ACTUAL:
[qué está pasando]

YA INTENTÉ:

- [intento 1]
- [intento 2]

Analiza el código y el error paso a paso.
Identifica la causa raíz y proporciona una solución.

```

### Patrón: Code Review

```

Revisa este código como un tech lead senior.

```[lenguaje]
[código a revisar]
```

Evalúa:

1. **Correctitud**: ¿Funciona como se espera?
2. **Legibilidad**: ¿Es fácil de entender?
3. **Mantenibilidad**: ¿Será fácil modificarlo?
4. **Performance**: ¿Hay problemas de rendimiento?
5. **Seguridad**: ¿Hay vulnerabilidades?

Formato de respuesta:

- 🟢 Bien: [aspectos positivos]
- 🟡 Sugerencias: [mejoras opcionales]
- 🔴 Problemas: [issues que deben arreglarse]

```

### Patrón: Refactoring

```

CÓDIGO ACTUAL:

```[lenguaje]
[código a refactorizar]
```

OBJETIVO:
[qué quiero lograr con el refactor]

RESTRICCIONES:

- Mantener la API pública igual
- No cambiar el comportamiento
- [otras restricciones]

Refactoriza el código explicando cada cambio y por qué lo haces.

```

### Patrón: Implementación de Feature

```

FEATURE: [nombre de la feature]

CONTEXTO:

- Proyecto: [descripción]
- Stack: [tecnologías]
- Archivos relacionados: [lista]

REQUISITOS:

1. [requisito 1]
2. [requisito 2]
3. [requisito 3]

CÓDIGO EXISTENTE RELEVANTE:

```[lenguaje]
[código]
```

RESTRICCIONES:

- [restricción 1]
- [restricción 2]

Implementa la feature siguiendo los patrones existentes en el código.

```

### Patrón: Explicación de Código

```

Explica este código como si fuera para:
[ ] Un desarrollador junior
[ ] Un desarrollador de otro lenguaje
[x] Alguien no técnico

```[lenguaje]
[código]
```

Incluye:

- Qué hace en términos simples
- Por qué está estructurado así
- Posibles puntos de confusión

```

### Patrón: Generación de Tests

```

CÓDIGO A TESTEAR:

```[lenguaje]
[código]
```

FRAMEWORK DE TESTING: [jest/vitest/pytest/etc]

Genera tests que cubran:

- Happy path (caso exitoso)
- Edge cases (valores límite)
- Error cases (entradas inválidas)
- [casos específicos de mi dominio]

Incluye:

- Descripción clara de cada test
- Arrange/Act/Assert bien separados
- Mocks donde sea necesario

```

---

## Modificadores de Prompt

Palabras y frases que modifican el comportamiento:

### Para Concisión

```

"Sé conciso"
"Respuesta breve"
"Solo el código, sin explicación"
"Máximo 5 líneas"

```

### Para Detalle

```

"Explica en detalle"
"Incluye comentarios en el código"
"Describe cada paso"
"Proporciona ejemplos"

```

### Para Formato

```

"Responde en formato markdown"
"Usa una tabla para comparar"
"Lista con viñetas"
"Código con sintaxis highlighting"

```

### Para Perspectiva

```

"Desde la perspectiva de seguridad"
"Considerando performance"
"Para un equipo de 5 desarrolladores"
"En un contexto de startup"

```

---

## Errores Comunes y Soluciones

### Error 1: Prompt Ambiguo

```

❌ "Mejora este código"

✅ "Mejora este código en términos de: - Legibilidad: nombres descriptivos - Performance: evitar loops innecesarios - Tipos: agregar tipos TypeScript explícitos"

```

### Error 2: Falta de Contexto

```

❌ "¿Por qué falla?"

✅ "Este código falla con 'undefined is not a function'
cuando items es un array vacío.
¿Por qué falla y cómo lo arreglo?"

```

### Error 3: Demasiadas Preguntas

```

❌ "¿Qué hace este código, por qué está mal,
cómo lo arreglo, qué alternativas hay,
y cuál es mejor para producción?"

✅ Pregunta 1: "¿Qué hace este código?"
[respuesta]
Pregunta 2: "¿Cuáles son los problemas?"
[respuesta]
Pregunta 3: "¿Cómo lo arreglarías?"

```

### Error 4: Asumir Conocimiento

```

❌ "Usa el patrón que siempre usamos"

✅ "Usa este patrón de repositorio:
`typescript
    [ejemplo del patrón]
    `"

```

### Error 5: No Especificar Formato

```

❌ "Dame ejemplos de validación"

✅ "Dame 3 ejemplos de validación en TypeScript.
Formato: función con tipo de retorno explícito,
comentario JSDoc, un caso de prueba."

```

---

## Prompts para Situaciones Específicas

### Cuando Estás Trabado

```

"Estoy trabado con [problema].

He intentado:

1. [intento 1] - no funcionó porque [razón]
2. [intento 2] - no funcionó porque [razón]

Mi hipótesis actual: [lo que crees que pasa]

¿Puedes sugerir otras aproximaciones que no haya considerado?"

```

### Cuando Necesitas Aprender

```

"Explícame [concepto] como si tuviera que enseñarlo mañana.

Incluye:

- Definición simple
- Por qué existe/qué problema resuelve
- Ejemplo básico
- Ejemplo más avanzado
- Errores comunes a evitar
- Recursos para profundizar"

```

### Cuando Necesitas Decidir

```

"Tengo que decidir entre [opción A] y [opción B] para [contexto].

Criterios importantes:

1. [criterio 1]
2. [criterio 2]
3. [criterio 3]

Analiza ambas opciones contra estos criterios
y recomienda una con justificación."

```

---

## Referencia Rápida

### Fórmula Universal

```

ROL + CONTEXTO + TAREA + FORMATO + RESTRICCIONES

```

### Checklist de Prompt

```

□ ¿Asigné un rol apropiado?
□ ¿Proporcioné contexto suficiente?
□ ¿La tarea es específica?
□ ¿Especifiqué el formato de respuesta?
□ ¿Incluí restricciones importantes?
□ ¿Agregué ejemplos si es necesario?

```

### Frases Útiles

| Situación | Frase |
|-----------|-------|
| Más detalle | "Elabora más sobre..." |
| Más conciso | "Resume en una oración" |
| Alternativas | "Dame 3 alternativas" |
| Pros/Cons | "Analiza ventajas y desventajas" |
| Verificar | "¿Estás seguro? Verifica tu respuesta" |
| Simplificar | "Simplifica el código" |
| Paso a paso | "Explica paso a paso" |
```
