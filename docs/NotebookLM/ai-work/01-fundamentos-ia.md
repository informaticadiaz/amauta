# Fundamentos del Trabajo con IA

> Conceptos esenciales para entender y trabajar efectivamente con modelos de lenguaje.

---

## ¿Qué es un LLM?

Un **Large Language Model** (Modelo de Lenguaje Grande) es un sistema de IA entrenado para:

- Predecir la siguiente palabra/token más probable
- Entender y generar texto en lenguaje natural
- Seguir instrucciones y mantener conversaciones
- Razonar sobre problemas (con limitaciones)

### Modelos Principales (2024-2025)

| Modelo          | Empresa   | Fortalezas                                 |
| --------------- | --------- | ------------------------------------------ |
| Claude 3.5/Opus | Anthropic | Razonamiento, código, instrucciones largas |
| GPT-4/4o        | OpenAI    | Generalista, multimodal, plugins           |
| Gemini          | Google    | Contexto largo, integración Google         |
| Llama 3         | Meta      | Open source, personalizable                |

---

## Modelo Mental: La IA como Asistente

### Lo que la IA ES

- Un asistente muy rápido con conocimiento amplio
- Un generador de texto basado en patrones
- Una herramienta de productividad

### Lo que la IA NO ES

- Una base de datos de hechos infalibles
- Un reemplazo del juicio humano
- Capaz de "recordar" entre sesiones separadas

### Analogía Útil

```
Piensa en la IA como un colega muy leído pero nuevo en tu proyecto:

✓ Conoce muchos lenguajes y frameworks
✓ Puede escribir código rápidamente
✓ Sigue instrucciones detalladas
✗ No conoce tu codebase específico
✗ No sabe tus preferencias
✗ Puede cometer errores sutiles

→ Tu trabajo: darle el contexto que necesita
```

---

## Conceptos Clave

### 1. Tokens

Los LLMs procesan texto en "tokens" (~4 caracteres promedio en inglés, ~3 en español):

```
"Hola mundo" = ["Hola", " mundo"] = 2 tokens (aprox)
"function getData()" = ["function", " get", "Data", "()"] = 4 tokens (aprox)
```

**¿Por qué importa?**

- Los modelos tienen límite de tokens (contexto)
- Más tokens = más costo en APIs
- Código es más "denso" en tokens que prosa

### 2. Ventana de Contexto

Cantidad máxima de tokens que el modelo puede "ver" a la vez:

| Modelo     | Ventana de Contexto |
| ---------- | ------------------- |
| GPT-4      | 8K - 128K tokens    |
| Claude 3   | 200K tokens         |
| Gemini 1.5 | hasta 1M tokens     |

**Implicaciones:**

- Puedes incluir archivos completos en contexto
- Contextos más largos = más capacidad pero más costo
- El modelo puede "perder" información en contextos muy largos

### 3. Temperature (Temperatura)

Controla la "creatividad" vs "determinismo" de las respuestas:

| Valor | Comportamiento   | Uso           |
| ----- | ---------------- | ------------- |
| 0.0   | Muy determinista | Código, datos |
| 0.5   | Balanceado       | General       |
| 1.0+  | Muy creativo     | Brainstorming |

### 4. System Prompt

Instrucciones iniciales que definen el comportamiento del modelo:

```
Eres un desarrollador senior de TypeScript.
Siempre sigues las mejores prácticas.
Respondes de manera concisa.
Usas español para comunicarte.
```

---

## Fortalezas y Debilidades

### Donde la IA Excede

| Tarea                          | Por qué funciona bien                  |
| ------------------------------ | -------------------------------------- |
| **Generar código boilerplate** | Patrones repetitivos bien documentados |
| **Explicar código**            | Procesamiento de lenguaje natural      |
| **Refactoring**                | Transformaciones de patrones           |
| **Documentación**              | Generar texto descriptivo              |
| **Debugging inicial**          | Identificar errores comunes            |
| **Traducciones**               | Entrenado en múltiples idiomas         |
| **Tests unitarios**            | Generar casos de prueba                |

### Donde la IA Falla

| Tarea                          | Por qué falla                            |
| ------------------------------ | ---------------------------------------- |
| **Lógica de negocio compleja** | No conoce tu dominio específico          |
| **Código con estado oculto**   | No puede ejecutar el código              |
| **Matemáticas precisas**       | Predice texto, no calcula                |
| **Información actual**         | Conocimiento limitado por fecha de corte |
| **Arquitectura completa**      | Necesita visión global que no tiene      |
| **Seguridad crítica**          | Puede introducir vulnerabilidades        |

---

## Modos de Interacción

### 1. Chat (Conversacional)

```
Usuario: ¿Cómo ordeno un array en JavaScript?
IA: Puedes usar array.sort()...
Usuario: ¿Y si quiero orden descendente?
IA: Usa array.sort((a, b) => b - a)...
```

**Cuándo usar**: Exploración, aprendizaje, debugging interactivo

### 2. Instrucción Única (One-shot)

```
Convierte este JSON a TypeScript interfaces:
{
  "user": { "id": 1, "name": "Juan" }
}
```

**Cuándo usar**: Tareas bien definidas, transformaciones

### 3. Few-shot (Con Ejemplos)

```
Convierte estos nombres a slug:
"Mi Primer Post" → "mi-primer-post"
"¡Hola Mundo!" → "hola-mundo"

Ahora convierte: "Curso de TypeScript 2024"
```

**Cuándo usar**: Establecer formato específico, tareas con patrones

### 4. Chain of Thought (Razonamiento)

```
Analiza este problema paso a paso:
1. Primero, identifica qué hace la función
2. Luego, encuentra posibles errores
3. Finalmente, sugiere correcciones
```

**Cuándo usar**: Problemas complejos, debugging, diseño

---

## Buenas Prácticas Fundamentales

### 1. Proporcionar Contexto Suficiente

❌ Malo:

```
Arregla el bug
```

✅ Bueno:

```
Tengo una función que debería retornar la suma de un array,
pero retorna NaN cuando el array tiene strings.

Código actual:
[código aquí]

Error que veo:
[error aquí]
```

### 2. Ser Específico

❌ Malo:

```
Haz que el código sea mejor
```

✅ Bueno:

```
Refactoriza esta función para:
- Usar async/await en lugar de callbacks
- Manejar errores con try/catch
- Agregar tipos TypeScript
```

### 3. Dividir Tareas Grandes

❌ Malo:

```
Crea una aplicación completa de e-commerce
```

✅ Bueno:

```
Paso 1: Define el schema de la base de datos para productos
[completar]

Paso 2: Crea el endpoint GET /products
[completar]

...
```

### 4. Iterar y Refinar

```
Primera iteración:
"Crea una función de validación de email"

Segunda iteración:
"Ahora agrega soporte para dominios .co"

Tercera iteración:
"Agrega mensajes de error en español"
```

### 5. Verificar Siempre

- Ejecutar el código generado
- Revisar la lógica
- Verificar edge cases
- Correr tests

---

## Limitaciones Importantes

### 1. Alucinaciones

La IA puede "inventar" información que parece plausible pero es incorrecta:

```
Usuario: ¿Cuál es la función lodash.deepMerge()?
IA: lodash.deepMerge() combina objetos recursivamente...

Realidad: ¡Esa función no existe! Es _.merge() o _.mergeWith()
```

**Mitigación**: Verificar en documentación oficial

### 2. Conocimiento Desactualizado

Los modelos tienen fecha de corte de entrenamiento:

```
Usuario: ¿Cómo uso Next.js 15?
IA: [Puede dar información de versiones anteriores]
```

**Mitigación**: Especificar versiones, proporcionar documentación actual

### 3. Contexto Perdido

En conversaciones largas, el modelo puede "olvidar" el inicio:

```
[Mensaje 1]: Mi proyecto usa PostgreSQL
[...50 mensajes después...]
[Mensaje 52]: ¿Qué base de datos recomiendas?
IA: Podrías usar MongoDB...  ← Olvidó el contexto inicial
```

**Mitigación**: Repetir contexto importante, usar system prompts

### 4. Sesgo hacia Patrones Comunes

La IA prefiere soluciones "populares" aunque no sean las mejores para tu caso:

```
Usuario: ¿Cómo manejo estado en React?
IA: Usa Redux... ← Porque es muy común

Realidad: Para tu caso simple, useState bastaría
```

**Mitigación**: Describir tu caso específico, pedir alternativas

---

## Referencia Rápida

### Fórmula para Buenos Prompts

```
[Rol/Contexto] + [Tarea específica] + [Formato deseado] + [Restricciones]
```

Ejemplo:

```
Eres un desarrollador TypeScript senior.           ← Rol
Crea una función que valide emails.                ← Tarea
Retorna un objeto { valid: boolean, error?: string }. ← Formato
Usa solo JavaScript nativo, sin librerías.         ← Restricciones
```

### Checklist Antes de Preguntar

- [ ] ¿Incluí el código/error relevante?
- [ ] ¿Especifiqué el resultado deseado?
- [ ] ¿Mencioné restricciones importantes?
- [ ] ¿La pregunta es lo suficientemente específica?

### Señales de que Necesitas Más Contexto

- Respuestas muy genéricas
- La IA pregunta muchas clarificaciones
- El código generado no aplica a tu caso
- Sugerencias que ignoran tus restricciones
