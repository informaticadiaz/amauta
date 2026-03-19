# Prompts para NotebookLM — Serie "Roles de Verificación"

> Prompts para generar Audio Overview con NotebookLM basados en esta serie.

---

## Instrucciones de Uso

1. Subir TODOS los documentos de la serie como fuentes en un mismo cuaderno
2. Copiar el prompt del episodio deseado
3. Pegar en Audio Overview → Customize → Generate

---

## Episodio 0: Introducción a la Serie

**Documentos fuente:** `00-indice.md`

```
Genera una introducción de 5-7 minutos a la serie sobre roles de verificación en software.

Audiencia: Developers que quieren entender el ecosistema más allá del código.

Estilo: Conversacional, como dos colegas charlando en un café.

Puntos clave a cubrir:
1. Por qué existen roles dedicados a verificar software (no alcanza con buenos developers)
2. Los tres pilares: calidad, entrega, operación
3. Breve mención de los 6 roles principales (QA, SRE, Release Manager, TPM, EM, PO)
4. Cómo estos roles escalan según el tamaño del equipo
5. Qué va a cubrir cada episodio de la serie

Tono: Informativo pero accesible. Evitar jerga excesiva.
No usar frases como "en este documento" o "según el archivo".
Hablar como si fuera conocimiento propio de los hosts.
```

---

## Episodio 1: Por Qué Existen Estos Roles

**Documento fuente:** `01-fundamentos.md`

```
Genera un episodio de 10-12 minutos sobre por qué existen los roles de verificación en software.

Audiencia: Developers con 2-5 años de experiencia que trabajan principalmente en código.

Estilo: Narrativo con ejemplos concretos. Incluir al menos una historia de un incidente famoso.

Puntos clave:
1. El costo exponencial de los bugs (1x en desarrollo, 500x en producción)
2. Historia de la verificación: de "el programador hace todo" a DevOps/SRE
3. El caso de Knight Capital (pérdida de $440M en 45 minutos)
4. Por qué el creador del código tiene puntos ciegos
5. Los tres tipos de verificación: construcción, entrega, operación
6. El modelo de madurez: desde ad-hoc hasta optimizado

Tono: Serio pero no alarmista. El objetivo es crear conciencia, no asustar.
Incluir analogías con otras industrias (aviación, medicina) cuando sea útil.
Terminar con una reflexión sobre cuándo tiene sentido agregar estos roles.
```

---

## Episodio 2: Roles Técnicos — QA, SRE, Release Manager

**Documento fuente:** `02-roles-tecnicos.md`

```
Genera un episodio de 12-15 minutos sobre los tres roles técnicos de verificación.

Audiencia: Developers que interactúan con estos roles o están considerando transicionar a ellos.

Estilo: Práctico y concreto. Describir un día típico de cada rol.

Estructura sugerida:
1. QA Lead (5 min)
   - Qué hace realmente (no solo "encontrar bugs")
   - Un día típico
   - Herramientas principales
   - Métricas que mide

2. SRE (5 min)
   - La filosofía de SRE (error budgets, SLOs)
   - Diferencia con DevOps tradicional
   - Cómo funciona el on-call
   - El concepto de "toil" y automatización

3. Release Manager (3 min)
   - Release gates y por qué existen
   - Estrategias de deploy (canary, blue/green)
   - Cuándo bloquear un release

4. Cómo interactúan (2 min)
   - El flujo desde código hasta producción
   - Quién llama a quién cuando hay problemas

Tono: Desmitificador. Mostrar que estos roles son accesibles, no cajas negras.
Evitar hacer parecer que son roles "superiores" a developer.
```

---

## Episodio 3: Roles de Gestión — TPM, EM, Product Owner

**Documento fuente:** `03-roles-gestion.md`

```
Genera un episodio de 12-15 minutos sobre los roles de gestión y coordinación.

Audiencia: Developers senior considerando transicionar a gestión, o que quieren entender mejor a sus managers.

Estilo: Honesto sobre los trade-offs de cada rol. No romantizar la gestión.

Estructura sugerida:
1. TPM - Technical Program Manager (4 min)
   - Qué coordina (programas, no personas)
   - Diferencia con PM y Project Manager
   - El arte de gestionar dependencias
   - Por qué los TPMs no escriben código

2. Engineering Manager (5 min)
   - El balance personas vs técnico
   - Por qué los mejores developers no siempre son buenos managers
   - La transición de Tech Lead a EM
   - 1:1s y por qué importan

3. Product Owner (4 min)
   - Maximizar valor, no features
   - El backlog como herramienta de comunicación
   - Cómo priorizar (RICE, MoSCoW)
   - Decir "no" a stakeholders

4. Cómo trabajan juntos (2 min)
   - Decisiones que toma cada rol
   - Cuándo escalar a cada uno

Tono: Balanceado. Mostrar tanto lo gratificante como lo difícil de estos roles.
Incluir al menos un anti-patrón de cada rol.
```

---

## Episodio 4: Equipos Pequeños — Consolidando Roles

**Documento fuente:** `04-equipos-pequenos.md`

```
Genera un episodio de 10-12 minutos sobre cómo manejar la verificación en equipos pequeños.

Audiencia: Founders técnicos, freelancers, developers en startups tempranas.

Estilo: Práctico y empático. Reconocer las limitaciones de recursos.

Puntos clave:
1. La realidad del solo founder (todos los roles en una persona)
   - Estrategias de supervivencia
   - Herramientas que actúan como "roles"
   - Usar IA como segundo par de ojos

2. Equipo de 2-4 personas
   - Cross-review: por qué es esencial
   - Dividir responsabilidades sin formalizar roles

3. Startup temprana (5-10)
   - Señales de que necesitas un QA dedicado
   - El perfil del "primer QA"
   - Roles híbridos comunes

4. Scale-up (10-20)
   - El problema del "primer manager"
   - Cuándo dividir roles
   - Introducir procesos sin burocracia

5. Tabla de decisión: cuándo contratar cada rol

Tono: Pragmático. No hacer sentir mal a equipos pequeños por no tener todos los roles.
Enfatizar que la automatización puede reemplazar mucho trabajo manual.
```

---

## Episodio 5: Procesos de Auditoría en la Práctica

**Documento fuente:** `05-procesos-auditoria.md`

```
Genera un episodio de 12-15 minutos sobre procesos concretos de verificación.

Audiencia: Developers y leads que quieren implementar procesos en sus equipos.

Estilo: Tutorial práctico. Dar pasos concretos que se puedan aplicar mañana.

Estructura:
1. Feature Audit (4 min)
   - Qué es y cuándo hacerla
   - Los 5 pasos de una auditoría
   - Template de informe
   - Clasificación: aprobado / con observaciones / rechazado

2. Code Review (4 min)
   - Filosofía: compartir conocimiento, no demostrar superioridad
   - Tipos de comentarios (blocker, suggestion, nit)
   - Cómo dar feedback constructivo
   - Template de PR description

3. Release Gates (3 min)
   - Gates automatizados vs manuales
   - Qué debe bloquear un release
   - El checklist pre-deploy

4. Incident Management y Post-Mortems (4 min)
   - Clasificación de severidades
   - El proceso de respuesta
   - Post-mortems blameless
   - Los "Cinco Por Qués"

Tono: Instructor pero no prescriptivo. Ofrecer templates pero aclarar que deben adaptarse.
Incluir al menos un ejemplo real de cada proceso.
```

---

## Episodio Completo: Serie Condensada

**Documentos fuente:** Todos

```
Genera un episodio de 15-18 minutos que cubra toda la serie de roles de verificación.

Audiencia: Alguien que quiere una visión general sin profundizar en cada tema.

Estructura sugerida:
1. Intro: Por qué importa la verificación (2 min)
   - El costo de los bugs, el sesgo del creador

2. Los 6 roles principales (6 min)
   - QA Lead: calidad del código
   - SRE: confiabilidad en producción
   - Release Manager: proceso de deploy
   - TPM: coordinación de programas
   - Engineering Manager: personas y técnica
   - Product Owner: valor al usuario

3. Cómo escala según el tamaño (4 min)
   - Solo founder: todo-en-uno + automatización
   - Startup: roles híbridos
   - Scale-up: roles dedicados
   - Enterprise: equipos especializados

4. Procesos clave (4 min)
   - Code review: colaboración, no gate-keeping
   - Release gates: automatizar lo posible
   - Post-mortems: mejorar el sistema, no culpar personas

5. Cierre: Cómo elegir qué implementar primero (2 min)
   - Señales de que necesitas cada rol
   - Empezar por automatización

Tono: Panorámico pero útil. El oyente debe salir con una visión clara del ecosistema.
Evitar ser superficial — dar al menos un insight no obvio de cada área.
```

---

## Notas para Todos los Episodios

### Estilo General

- Conversación natural entre dos hosts
- Evitar leer listas o tablas literalmente
- Usar analogías y ejemplos concretos
- Incluir anécdotas cuando sea posible

### Evitar

- "Según el documento..."
- "En la tabla podemos ver..."
- Jerga excesiva sin explicación
- Hacer parecer que un rol es "mejor" que otro

### Incluir

- Trade-offs reales de cada decisión
- Reconocer que cada equipo es diferente
- Humor ocasional para mantener engagement
- Call to action al final (qué hacer con esta información)

---

## Combinaciones Temáticas

### Para Founders Técnicos

**Documentos:** `01-fundamentos.md` + `04-equipos-pequenos.md`

```
Genera un episodio de 12 minutos para founders técnicos sobre cómo manejar la calidad de software sin tener un equipo grande.

Cubrir: por qué importa (brevemente), estrategias para equipos de 1-5, cuándo contratar el primer QA, herramientas que escalan.

Tono: Empático con las limitaciones de recursos. Pragmático.
```

### Para Developers Considerando Gestión

**Documentos:** `03-roles-gestion.md` + `02-roles-tecnicos.md`

```
Genera un episodio de 12 minutos para developers senior considerando transicionar a roles de gestión o especializados.

Cubrir: las opciones (EM, TPM, QA Lead, SRE), qué se gana y qué se pierde en cada camino, cómo saber cuál es el fit correcto.

Tono: Honesto sobre los trade-offs. No romantizar ningún camino.
```

### Para Equipos Implementando Procesos

**Documentos:** `05-procesos-auditoria.md` + `04-equipos-pequenos.md`

```
Genera un episodio de 12 minutos sobre cómo implementar procesos de verificación sin crear burocracia.

Cubrir: mínimo proceso viable, code reviews que funcionan, release gates automatizados, cuándo agregar más proceso.

Tono: Anti-burocrático. Enfatizar que el proceso debe servir al equipo, no al revés.
```
