# 02 — El Tool RemoteTrigger

## Qué es

`RemoteTrigger` es el tool de Claude Code que permite **disparar una nueva sesión de agente desde dentro de una sesión existente**. Es el mecanismo técnico que hace posibles los agentic loops.

Sin `RemoteTrigger`, cuando una sesión termina, termina todo. Con `RemoteTrigger`, la sesión puede dejar programada la siguiente antes de cerrar.

---

## Cómo funciona conceptualmente

Cuando Claude llama a `RemoteTrigger` dentro de una sesión:

1. Claude Code registra un trigger con el prompt indicado
2. La sesión actual continúa hasta terminar normalmente
3. Una vez finalizada, el sistema lanza una **nueva sesión independiente** con ese prompt
4. La nueva sesión no tiene acceso al historial de conversación de la anterior

```
Sesión A (activa)
  │
  ├── hace su trabajo
  ├── llama RemoteTrigger(prompt="ejecuta el issue #43")
  └── termina normalmente
                │
                ▼
         Sesión B (nueva, independiente)
           ├── inicia con prompt="ejecuta el issue #43"
           ├── hace su trabajo
           ├── llama RemoteTrigger(prompt="/project-manager-autonomo")
           └── termina
                         │
                         ▼
                   Sesión C...
```

---

## Parámetros del tool

`RemoteTrigger` recibe básicamente un **prompt** — el mensaje con el que arrancará la nueva sesión. Este prompt es todo lo que tenés para comunicar contexto entre sesiones.

```
RemoteTrigger(
  prompt: "El texto completo que iniciará la próxima sesión"
)
```

El prompt puede contener:

- El nombre del skill a ejecutar
- Parámetros concretos (número de issue, fase, etc.)
- Instrucciones adicionales de contexto
- Condiciones o modos de operación

---

## Lo que NO persiste entre sesiones

Este es el punto más importante. Entre sesión A y sesión B, **nada del contexto de conversación persiste**:

| Lo que NO persiste              | Lo que SÍ persiste        |
| ------------------------------- | ------------------------- |
| Historial del chat              | Archivos en disco         |
| Variables en memoria            | Commits en Git            |
| Resultado de tools previos      | Issues en GitHub          |
| Decisiones tomadas en la sesión | Documentación actualizada |
| Errores que ocurrieron          | CLAUDE.md actualizado     |

**Implicación directa**: Todo lo que la siguiente sesión necesita saber debe estar escrito en algún lado — en un archivo, en un commit, en el estado de GitHub, o en el prompt mismo.

---

## El prompt como vector de información

Como el prompt es la única comunicación directa entre sesiones, hay que usarlo bien.

**Prompt pobre** (la sesión B no sabe nada):

```
"ejecuta el siguiente issue"
```

**Prompt rico** (la sesión B tiene contexto):

```
"Ejecutá el issue #43 de forma autónoma siguiendo complete-issue.
Contexto: venís de completar el #42 (F4-016 UI Calificaciones).
Fase actual: Fase 4, Sprint 15.
El issue #43 es el siguiente según roadmap.md.
Verificá las condiciones de parada antes de iniciar."
```

Un prompt rico reduce el tiempo que la nueva sesión dedica a "descubrir" el estado actual.

---

## El momento correcto para llamar RemoteTrigger

RemoteTrigger debe llamarse **después** de que la sesión completó su trabajo, pero **antes** de terminar. El orden correcto:

```
1. Hacer el trabajo de la sesión
2. Verificar que el trabajo está bien (tests pasan, issue cerrado, etc.)
3. Evaluar la condición de parada del loop
4. Si continúa → llamar RemoteTrigger con el prompt de la siguiente sesión
5. Terminar la sesión actual
```

Si llamás RemoteTrigger antes de terminar el trabajo, la siguiente sesión arranca mientras la actual sigue ejecutando — comportamiento impredecible.

Si no chequeás la condición de parada, tenés un loop infinito.

---

## RemoteTrigger vs /schedule

Son herramientas distintas para casos distintos:

|                    | RemoteTrigger                               | /schedule                                 |
| ------------------ | ------------------------------------------- | ----------------------------------------- |
| **Cuándo dispara** | Cuando la sesión termina                    | En un horario fijo (cron)                 |
| **Dependencia**    | Depende del resultado de la sesión anterior | Independiente de cualquier resultado      |
| **Caso de uso**    | Pipelines secuenciales con estado           | Tareas periódicas sin dependencias        |
| **Ejemplo**        | issue #42 → issue #43 → issue #44           | Revisar el estado del proyecto cada lunes |

Para un agentic loop de desarrollo, `RemoteTrigger` es la herramienta correcta.

---

## Siguiente paso

[03-patron-handoff.md](03-patron-handoff.md) — Cómo diseñar el traspaso de contexto entre sesiones.
