# Flujos de Trabajo Autónomos con IA: Skills, TDD y Documentación

> Cómo configurar una IA para que complete tareas de desarrollo de principio a fin, reduciendo la intervención humana sin perder control sobre la calidad del código.

---

## ¿Qué es un Flujo Autónomo con IA?

Un flujo autónomo es cuando le das a una IA una tarea bien definida (como un issue de GitHub) y ella la ejecuta completamente: lee el contexto necesario, escribe los tests, implementa el código, actualiza la documentación, hace el commit y cierra la tarea.

La diferencia con "pedirle a la IA que escriba código" es que aquí la IA sigue un **protocolo fijo** definido de antemano, no improvisa. Ese protocolo se llama **skill**: un documento de instrucciones que la IA lee antes de empezar y sigue paso a paso.

El objetivo no es reemplazar al desarrollador, sino eliminar el trabajo repetitivo y mecánico, que en proyectos de software puede ocupar entre el 40% y el 60% del tiempo.

---

## Modelo Mental: El Cirujano y el Protocolo

```
SIN PROTOCOLO (IA improvisando):
──────────────────────────────────────────
Desarrollador: "Implementa el sistema de inscripciones"
IA: [adivina la estructura, inventa campos, omite tests,
     ignora patrones existentes, no actualiza docs]
Resultado: código que hay que revisar y reescribir

CON SKILL (IA siguiendo protocolo):
──────────────────────────────────────────
Desarrollador: "Ejecuta el issue #42 con el skill complete-issue"
IA: [lee el issue → carga contexto → escribe tests → implementa
     → verifica que pasan → actualiza docs → commit → cierra]
Resultado: tarea completa y verificable
```

Igual que un cirujano que sigue un checklist preoperatorio independientemente de su experiencia: el protocolo no limita, garantiza.

---

## Conceptos Clave

### 1. Skill

Un skill es un archivo markdown con instrucciones detalladas para que la IA ejecute un tipo de tarea específica. No es código — es un documento de proceso.

**Estructura típica de un skill:**

```markdown
# Skill: Nombre de la Tarea

## Uso
Frase exacta para activarlo

## Parámetros
| Parámetro | Descripción |

## Proceso (pasos numerados)
### PASO 1 — ...
### PASO 2 — ...

## Checklist Final
- [ ] Item 1
- [ ] Item 2
```

La IA lee este documento y lo usa como hoja de ruta. Cualquier IA que entienda lenguaje natural puede seguirlo — es agnóstico al modelo.

---

### 2. Carga de Contexto Obligatoria

El error más común en flujos autónomos es que la IA inventa cosas que no existen: campos de base de datos, nombres de funciones, endpoints. La solución es forzar la lectura de documentos específicos **antes** de escribir una sola línea.

```
FLUJO SIN CARGA DE CONTEXTO:
────────────────────────────
IA escribe:  prisma.user.findMany({ where: { role: 'ADMIN' } })
Realidad:    el campo se llama 'rol' y es un enum Rol.ADMIN_ESCUELA
Resultado:   error en runtime, tiempo perdido

FLUJO CON CARGA DE CONTEXTO:
────────────────────────────
IA lee schema.prisma ANTES de escribir código
IA escribe:  prisma.usuario.findMany({ where: { rol: Rol.ADMIN_ESCUELA } })
Resultado:   correcto desde el primer intento
```

El skill define exactamente qué leer según el tipo de tarea:
- ¿Toca base de datos? → leer el schema
- ¿Toca backend? → leer los patrones del proyecto
- ¿Toca frontend? → leer los componentes existentes

---

### 3. TDD como Especificación Ejecutable

En un flujo autónomo, el TDD cumple un rol diferente al TDD tradicional: los tests son la **especificación** que le dice a la IA exactamente qué construir.

```
FLUJO TDD AUTÓNOMO:

1. RED   → IA escribe tests basados en el checklist del issue
           Los tests describen el comportamiento esperado
           Los tests FALLAN porque no hay implementación aún

2. GREEN → IA escribe el código MÍNIMO para que los tests pasen
           No puede agregar funcionalidad no testeada
           No puede omitir casos del checklist

3. REFACTOR → IA limpia el código sin cambiar comportamiento
              Los tests siguen pasando = el comportamiento se preserva
```

El ciclo RED → GREEN actúa como un contrato: si los tests pasan, el issue está resuelto. Si fallan, la IA sabe exactamente qué arreglar sin necesidad de intervención humana.

---

### 4. Documentación como Fuente de Verdad

La IA no tiene memoria entre sesiones. Cada vez que se activa, empieza desde cero. Esto significa que **toda la información que necesita debe estar escrita en algún lugar que pueda leer**.

```
INFORMACIÓN EN LA CABEZA DEL DEV (inaccesible para la IA):
──────────────────────────────────────────────────────────
"Los endpoints siempre devuelven { data, message }"
"Nunca hacemos delete físico, siempre archivamos"
"El enum de estados tiene solo estos 4 valores"

INFORMACIÓN EN DOCUMENTOS (accesible para la IA):
──────────────────────────────────────────────────
docs/ai-context/_patterns.md  ← patrones de código
docs/ai-context/database/schema.md  ← estructura de datos
docs/ai-skills/complete-issue.md  ← proceso a seguir
```

Cuanto mejor documentado está el proyecto, más autónoma puede ser la IA. La documentación es la inversión que multiplica la autonomía.

---

### 5. Todo List como Estado de Progreso

Las IAs no tienen estado persistente dentro de una sesión larga. El todo list es el mecanismo que les permite saber en qué paso van y qué falta.

```
Estado visible en tiempo real:
─────────────────────────────
✅ Leer issue #42
✅ Cargar schema de base de datos
✅ Cargar patrones del proyecto
🔄 Escribir tests del servicio (EN PROGRESO)
⬜ Verificar que los tests fallan
⬜ Implementar el servicio
⬜ Verificar que los tests pasan
⬜ Actualizar documentación
⬜ Hacer commit
⬜ Cerrar issue
```

Si la sesión se interrumpe o hay un error, el desarrollador puede ver exactamente en qué punto está la tarea.

---

## Cómo Funciona en la Práctica

### Caso 1: Activar un flujo autónomo completo

El desarrollador da una sola instrucción:

```
Lee docs/ai-skills/complete-issue.md
y ejecuta el issue #42 de forma autónoma
```

La IA entonces:

1. Lee el skill (hoja de ruta)
2. Lee el issue (qué construir)
3. Lee los contextos correspondientes (schema, patrones)
4. Crea el todo list
5. Escribe los tests → los ejecuta → confirma que fallan
6. Escribe la implementación → ejecuta los tests → confirma que pasan
7. Actualiza la documentación del sistema
8. Hace el commit incluyendo tests e implementación
9. Cierra el issue con el checklist completo

El desarrollador puede irse a hacer otra cosa. Cuando vuelve, el trabajo está hecho y verificado.

---

### Caso 2: La IA encuentra ambigüedad

El issue dice "el usuario puede inscribirse a un curso" pero no especifica qué pasa si ya está inscripto.

**Sin protocolo:** la IA inventa un comportamiento (puede devolver 200, 400 o 409 según lo que "adivine").

**Con el skill:** el protocolo define que ante ambigüedad se elige "la interpretación más conservadora" y se documenta la decisión en el comentario de cierre del issue.

```bash
gh issue close 42 --comment "
...
**Decisión tomada:**
- Si el usuario ya está inscripto, devuelve 409 Conflict
  (más conservador que silenciosamente ignorar la duplicidad)
"
```

El desarrollador puede revisar la decisión en el historial del issue, no en el código.

---

### Caso 3: La IA detecta que un test no puede fallar

Al ejecutar los tests en el paso RED, todos pasan sin implementación. Esto indica que la funcionalidad ya existe.

El skill define la respuesta: documentar que el comportamiento ya estaba implementado y continuar con el resto del issue.

```
Resultado del paso RED:
✅ 3/5 tests fallan correctamente (nuevo comportamiento)
⚠️  2/5 tests pasan sin implementación (ya existían)

Acción: documentar en el commit y continuar
```

---

## Comparativa: Con vs Sin Flujo Autónomo

| Aspecto                  | Sin flujo autónomo              | Con flujo autónomo (skill + TDD)     |
| ------------------------ | ------------------------------- | ------------------------------------ |
| Inicio de tarea          | Dev explica qué hacer cada vez  | Dev da el número de issue            |
| Consistencia del código  | Varía según el "humor" de la IA | Siempre sigue los mismos patrones    |
| Campos de DB             | Puede inventar nombres          | Lee el schema antes, siempre correcto|
| Tests                    | Opcionales, al final o no existen | Obligatorios, antes de implementar  |
| Documentación            | Se olvida frecuentemente        | Parte del protocolo, no opcional     |
| Rastreabilidad           | Solo en el código               | Issue + commit + comentario de cierre|
| Intervención humana      | Continua                        | Solo al inicio y para revisar        |
| Horas-hombre por feature | 3-6 horas (con ida y vuelta)    | 15-30 minutos de revisión            |

---

## Errores Comunes al Diseñar Flujos Autónomos

### ❌ Error 1: Skill demasiado vago

```markdown
# Mal
## Proceso
1. Leer el issue
2. Implementar
3. Hacer commit

# Bien
## Proceso
### PASO 1 — Leer el Issue
Ejecutar: gh issue view [número] --json title,body,labels
Extraer: objetivo, checklist, labels, dependencias

### PASO 2 — Cargar Contexto
Si label contiene 'database': leer schema.prisma
Si label contiene 'backend': leer _patterns.md
```

**Por qué es un problema:** un skill vago produce resultados inconsistentes. La IA necesita instrucciones específicas, no intenciones.

---

### ❌ Error 2: Contexto no documentado

```typescript
// La IA escribe esto porque no leyó los patrones:
const data = schema.parse(dto);  // ❌ parse directo

// El proyecto usa este patrón (estaba en _patterns.md):
const result = schema.safeParse(dto);
if (!result.success) throw new BadRequestException(...);
```

**Por qué es un problema:** la IA no adivina las convenciones del proyecto. Si no están escritas en algún lugar que pueda leer, las ignora.

---

### ❌ Error 3: Tests escritos después de la implementación

```
ORDEN INCORRECTO:
1. Implementar
2. Escribir tests para que pasen
→ Los tests son una formalidad, no una especificación

ORDEN CORRECTO (TDD):
1. Escribir tests que describen el comportamiento
2. Implementar hasta que pasen
→ Los tests son el contrato de la funcionalidad
```

**Por qué es un problema:** los tests post-implementación tienden a testear lo que el código hace, no lo que debería hacer. No detectan comportamientos faltantes.

---

### ❌ Error 4: Ignorar el paso de documentación

Un flujo autónomo que no actualiza la documentación crea deuda: la próxima vez que se active la IA, el contexto estará desactualizado y cometerá errores basados en información vieja.

```
Iteración 1: IA implementa módulo A → no actualiza docs
Iteración 2: IA lee docs desactualizados → inventa relaciones con módulo A
Resultado: código incorrecto, tiempo perdido en debug
```

---

## Cuándo Usar (y Cuándo No)

### ✅ Usar flujos autónomos cuando:
- El issue tiene un checklist claro y acotado
- El módulo que se va a tocar ya tiene contexto documentado
- La tarea es principalmente CRUD o extensión de funcionalidad existente
- El schema de base de datos no va a cambiar radicalmente
- Hay tests existentes como referencia de patrones

### ❌ No usar (o usar con revisión obligatoria) cuando:
- La tarea requiere decisiones de arquitectura que afectan múltiples módulos
- El issue es ambiguo o tiene dependencias no resueltas
- Se van a introducir nuevas dependencias externas
- La tarea toca código de seguridad crítico (autenticación, autorización)
- No existe documentación de contexto para el módulo involucrado

---

## Preguntas de Estudio

> Preguntas diseñadas para hacerle a NotebookLM después de cargar este documento.

**Conceptuales:**
1. ¿Cuál es la diferencia entre pedirle código a una IA y usar un skill de flujo autónomo?
2. ¿Por qué la carga de contexto obligatoria es la clave para evitar errores de la IA?
3. ¿Cómo cambia el rol del TDD cuando la IA es quien escribe los tests primero?

**Prácticas:**
4. ¿Qué información mínima debe estar documentada en un proyecto para que un flujo autónomo funcione bien?
5. ¿Cómo usarías el todo list para recuperar un flujo autónomo que se interrumpió a mitad?
6. Dame un ejemplo de cómo la IA decide qué documentos leer antes de implementar un endpoint nuevo.

**Comparativas:**
7. ¿Qué ventajas tiene el ciclo RED → GREEN sobre escribir tests al final de la implementación?
8. ¿Cuál es el trade-off entre mayor autonomía de la IA y control del desarrollador?

**Avanzadas:**
9. ¿Qué pasa con la calidad del código si el skill no tiene instrucciones sobre patrones de validación?
10. ¿Cómo evolucionaría el skill a medida que el proyecto crece y cambia?

---

## Prompt para Audio Overview (NotebookLM)

> Copiar este prompt en la sección "Customize" del Audio Overview de NotebookLM.

```
Genera una conversación educativa sobre "Flujos de trabajo autónomos con IA para desarrollo de software" basada en este documento.

AUDIENCIA: Desarrolladores que quieren que la IA haga más trabajo de forma independiente, pero sin perder control sobre la calidad del código.

PUNTOS CLAVE A CUBRIR:
- Qué es un skill y por qué cambia la forma de trabajar con IA
- Por qué la carga de contexto obligatoria elimina los errores de "campos inventados"
- Cómo el TDD se convierte en una especificación ejecutable para la IA
- El rol de la documentación como memoria persistente entre sesiones
- El todo list como mecanismo de estado visible y recuperable
- Cuándo tiene sentido activar autonomía total y cuándo mantener revisión humana

ESTILO:
- Comparar constantemente "sin protocolo" vs "con skill"
- Ejemplos concretos de qué sale mal sin el flujo y qué sale bien con él
- Honesto sobre las limitaciones: la IA no toma buenas decisiones de arquitectura

TONO: Pragmático. No es hype sobre IA, es ingeniería de procesos aplicada al desarrollo.
DURACIÓN: 10-12 minutos
```

---

## Referencias

### Conceptos Relacionados
- **TDD (Test-Driven Development)** — el ciclo RED/GREEN/REFACTOR es la base del paso de testing en este flujo
- **Prompt Engineering** — diseñar buenos skills es un ejercicio de prompting estructurado
- **Documentation as Code** — mantener la documentación en el repo es lo que hace posible la carga de contexto
- **Issue-Driven Development** — trabajar con issues bien definidos es el prerequisito del flujo autónomo

### Para Profundizar
- "The Checklist Manifesto" — Atul Gawande (por qué los protocolos fijos reducen errores en tareas complejas)
- "Test-Driven Development: By Example" — Kent Beck (fundamentos del ciclo RED/GREEN/REFACTOR)
- Documentación oficial de GitHub CLI (`gh`) — para entender los comandos de gestión de issues
