# Prompts para NotebookLM - Serie "Trabajo Profesional con IA"

> Prompts para generar videos/podcasts con NotebookLM basados en la documentación de esta carpeta.

---

## Instrucciones de Uso

1. Subir el documento correspondiente a NotebookLM
2. Copiar el prompt del video que quieres generar
3. Pegar en la sección "Audio Overview" o "Customize"
4. Generar el audio/video

---

## Video 0: Introducción a la Serie (Opcional)

**Documento fuente:** `00-indice.md`

```
Genera una conversación breve que presente la serie "Trabajo Profesional con IA para Desarrolladores".

CONTENIDO:
- Por qué esta serie existe: la mayoría usa IA de forma ineficiente
- Qué aprenderán en cada episodio:
  1. Fundamentos: cómo funciona realmente la IA
  2. Contexto: el secreto para buenas respuestas
  3. Prompting: técnicas profesionales
  4. Skills: automatizar tareas repetitivas
  5. Flujos: integrar IA en el día a día
  6. Casos: ejemplos prácticos reales
- Para quién es: desarrolladores de cualquier nivel que quieren multiplicar su productividad
- Adelanto de los 5 principios fundamentales

TONO: Gancho inicial, generar curiosidad, prometer valor concreto.
DURACIÓN: 3-4 minutos
```

---

## Video 1: Fundamentos de IA

**Documento fuente:** `01-fundamentos-ia.md`

```
Genera una conversación introductoria sobre "Qué es realmente la IA y cómo funciona para desarrolladores".

AUDIENCIA: Desarrolladores que usan IA pero no entienden bien cómo funciona por dentro.

PUNTOS CLAVE A CUBRIR:
- Qué es un LLM: un predictor de texto muy sofisticado, no una base de datos de hechos
- La analogía del colega nuevo: sabe muchísimo de tecnología pero no conoce tu proyecto específico
- Tokens y ventana de contexto explicados de forma simple y accesible
- Fortalezas reales donde la IA brilla: generar boilerplate, explicar código, refactoring, escribir tests
- Debilidades reales que hay que conocer: alucinaciones, información desactualizada, matemáticas imprecisas
- Los diferentes modos de interacción: chat conversacional, one-shot, few-shot, chain of thought

ESTILO:
- Didáctico y desmitificador
- Con ejemplos concretos de código
- Usar analogías accesibles
- Sin hype excesivo, ser realistas

TONO: Educativo, claro, con ejemplos que cualquier dev entienda.
DURACIÓN: 6-8 minutos
```

---

## Video 2: Contexto Efectivo

**Documento fuente:** `02-contexto-efectivo.md`

```
Genera una conversación sobre "El secreto para obtener buenas respuestas de la IA: el contexto".

AUDIENCIA: Desarrolladores frustrados porque la IA les da respuestas genéricas o incorrectas.

PUNTOS CLAVE A CUBRIR:
- El principio fundamental: "La IA solo sabe lo que le proporcionas"
- Mostrar la diferencia dramática entre preguntas vagas y específicas con ejemplos reales
- Qué información incluir siempre: código relevante, mensajes de error, stack tecnológico, restricciones del proyecto
- Qué NO incluir: archivos irrelevantes, contexto excesivo que confunde
- La técnica de "contexto progresivo": empezar simple, agregar información según la necesidad
- Cómo estructurar el contexto para máxima claridad

ESTILO:
- Muy práctico con muchos ejemplos antes/después
- Mostrar transformaciones reales de prompts malos a buenos
- Revelador, como descubrir un truco que cambia todo

TONO: Práctico, transformador, con "aha moments".
DURACIÓN: 6-8 minutos
```

---

## Video 3: Prompting Profesional

**Documento fuente:** `03-prompting-profesional.md`

```
Genera una conversación sobre "Técnicas de prompting que usan los profesionales".

AUDIENCIA: Desarrolladores que quieren pasar de usuario básico a usuario avanzado de IA.

PUNTOS CLAVE A CUBRIR:
- La fórmula maestra: Rol + Contexto + Tarea + Formato + Restricciones
- Role Prompting: por qué decir "Eres un DBA senior con 15 años de experiencia" cambia dramáticamente las respuestas
- Chain of Thought: cómo hacer que la IA razone paso a paso para problemas complejos
- Few-shot prompting: enseñar con ejemplos el patrón exacto que quieres
- Prompts negativos: cuándo y cómo usar "NO hagas X"
- Errores comunes que cometen los principiantes y cómo evitarlos

ESTILO:
- Como revelar trucos del oficio
- Mostrar ejemplos transformadores de prompts básicos a profesionales
- Práctico y aplicable inmediatamente

TONO: Revelador, como un mentor compartiendo secretos del trade.
DURACIÓN: 8-10 minutos
```

---

## Video 4: Skills y Agentes

**Documento fuente:** `04-skills-y-agentes.md`

```
Genera una conversación sobre "Skills y Agentes: automatizar tareas repetitivas con IA".

AUDIENCIA: Desarrolladores que quieren sistematizar y escalar su uso de IA.

PUNTOS CLAVE A CUBRIR:
- Qué es un skill: una instrucción reutilizable empaquetada como un "comando"
- La diferencia entre usar prompts ad-hoc y tener skills documentados
- Ejemplos concretos: skill para generar CRUD completo, skill para code review automatizado
- Qué son los agentes: IA que puede ejecutar acciones de forma autónoma
- Cuándo usar agentes versus prompts manuales
- Cómo crear tus propios skills personalizados para tu proyecto

ESTILO:
- Orientado a productividad y ahorro de tiempo
- Con ejemplos de cuánto tiempo se ahorra
- Práctico, que inspire a crear sus propios skills

TONO: Productividad, eficiencia, escalar el trabajo.
DURACIÓN: 6-8 minutos
```

---

## Video 5: Flujos de Trabajo

**Documento fuente:** `05-flujos-trabajo.md`

```
Genera una conversación sobre "Cómo integrar IA en tu flujo de desarrollo diario".

AUDIENCIA: Desarrolladores que quieren un proceso sistemático, no uso esporádico.

PUNTOS CLAVE A CUBRIR:
- La filosofía central: "La IA es un multiplicador, no un reemplazo"
- Flujo para desarrollo de features: entender requisito → explorar con IA → planificar → implementar con IA → testing → revisar
- Flujo para debugging: reproducir el bug → analizar con IA → formar hipótesis → verificar
- Flujo para code review: usar checklist + IA para detectar patrones problemáticos
- Cuándo NO usar IA: decisiones de arquitectura críticas, código de seguridad sensible
- El balance correcto: saber cuándo pensar por ti mismo y cuándo delegar a la IA

ESTILO:
- Estructurado, como un mentor explicando su proceso probado
- Con diagramas mentales de los flujos
- Práctico y aplicable desde mañana

TONO: Mentor experimentado, sistemático, profesional.
DURACIÓN: 8-10 minutos
```

---

## Video 6: Casos de Uso Prácticos

**Documento fuente:** `06-casos-uso.md`

```
Genera una conversación sobre "Ejemplos prácticos: IA en acción para desarrolladores".

AUDIENCIA: Desarrolladores que quieren ver aplicaciones concretas y reales.

PUNTOS CLAVE A CUBRIR:
- Caso 1: Generar un CRUD completo en minutos (prompt, resultado, ajustes)
- Caso 2: Debugging de un error críptico paso a paso
- Caso 3: Refactorizar código legacy de forma segura
- Caso 4: Escribir tests para código existente sin tests
- Caso 5: Documentar código que no tiene documentación
- Para cada caso mostrar: el prompt usado, el resultado obtenido, los ajustes que fueron necesarios

ESTILO:
- Storytelling práctico
- Mostrar el proceso real incluyendo errores y correcciones
- Que se sienta como pair programming real

TONO: Práctico, honesto sobre limitaciones, mostrando el proceso real con sus imperfecciones.
DURACIÓN: 10-12 minutos
```

---

## Video Completo (Alternativa)

**Documentos fuente:** Todos los documentos de la carpeta

```
Genera una conversación completa entre dos hosts sobre "Cómo trabajar profesionalmente con IA en desarrollo de software".

ESTILO GENERAL:
- Tono conversacional pero informativo, como un podcast educativo de calidad
- Los hosts deben intercalar conceptos teóricos con ejemplos prácticos
- Usar analogías accesibles (ej: "la IA es como un colega muy leído pero nuevo en tu proyecto")
- Dirigido a desarrolladores de cualquier nivel que quieren mejorar su productividad

ESTRUCTURA:

1. INTRO (1-2 min)
   - Por qué es crucial aprender a trabajar con IA hoy
   - El problema: mucha gente usa IA de forma ineficiente

2. FUNDAMENTOS (2-3 min)
   - Qué es realmente un LLM y qué esperar de él
   - Fortalezas vs debilidades reales
   - El modelo mental correcto

3. CONTEXTO (2-3 min)
   - "La IA solo sabe lo que le proporcionas"
   - Ejemplos de preguntas vagas vs específicas

4. PROMPTING (2-3 min)
   - La fórmula: Rol + Contexto + Tarea + Formato + Restricciones
   - Técnicas clave: Chain of Thought, Few-shot

5. FLUJOS DE TRABAJO (2-3 min)
   - La IA como multiplicador
   - Cuándo usar y cuándo no usar IA

6. CONCLUSIONES (1-2 min)
   - Los 5 principios fundamentales
   - Llamado a la acción

TONO:
- Entusiasta pero realista (sin hype excesivo)
- Con humor ocasional y natural
- Crítico cuando corresponde
- En español latinoamericano natural

DURACIÓN TOTAL: 12-15 minutos
```

---

## Notas Adicionales

### Personalización del Tono

Si prefieres un tono diferente, puedes agregar al final de cualquier prompt:

```
PERSONALIZACIÓN DE TONO:
- Más formal / Más casual
- Más técnico / Más accesible
- Más humorístico / Más serio
- Ritmo más rápido / Más pausado
```

### Para Videos Más Cortos

Agrega esta instrucción:

```
VERSIÓN CORTA: Genera una versión condensada de 3-4 minutos
enfocándote solo en los 3 puntos más importantes.
```

### Para Audiencias Específicas

```
AUDIENCIA ESPECÍFICA:
- Estudiantes de programación
- Desarrolladores senior
- Tech leads y arquitectos
- Desarrolladores frontend/backend específicamente
```
