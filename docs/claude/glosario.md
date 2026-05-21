# Glosario de Claude Code

Terminología y conceptos clave para entender y usar Claude Code de forma efectiva.

---

## A

**Agent / Agente**
Instancia de Claude que puede ejecutar tareas de forma autónoma usando herramientas. Puede leer archivos, ejecutar comandos, buscar código y más, sin intervención manual en cada paso.

**Allowed Tools**
Lista de herramientas que Claude tiene permitido usar. Se configura con `/permissions` o `--tools` en la CLI. Permite restringir qué acciones puede tomar Claude automáticamente.

**Auto-accept**
Modo de permisos donde Claude ejecuta todas las acciones sin pedir confirmación. Se activa con `Shift+Tab`. Útil para tareas largas donde confiás en el agente.

---

## C

**CLAUDE.md**
Archivo de instrucciones del proyecto que Claude lee automáticamente. Define reglas, contexto, convenciones y comportamientos esperados. Es la principal forma de personalizar Claude para un proyecto.

**Compact**
Operación que comprime la conversación para liberar espacio en el contexto. Se ejecuta con `/compact`. Útil cuando la sesión se vuelve muy larga.

**Context Window**
Límite de tokens que Claude puede procesar en una sola conversación. Incluye el historial de mensajes, archivos leídos, resultados de herramientas y la respuesta en construcción.

---

## H

**Hook**
Comando shell que se ejecuta automáticamente en respuesta a eventos de Claude Code (antes/después de usar una herramienta, al enviar un mensaje, etc.). Se configuran en los ajustes del sistema.

---

## M

**MCP (Model Context Protocol)**
Protocolo estándar para extender las capacidades de Claude mediante servidores externos. Permite conectar bases de datos, APIs, navegadores y otras herramientas externas de forma estandarizada.

**Memoria Automática**
Sistema de archivos `.md` en `~/.claude/projects/` donde Claude persiste información importante entre conversaciones. Se gestiona con `/memory`.

**Modo Plan**
Modo de trabajo donde Claude solo puede leer y planificar, sin escribir ni ejecutar acciones. Se activa con `/plan` o `EnterPlanMode`. Útil para revisar el enfoque antes de ejecutar.

---

## P

**Permission Mode**
Modo que define cómo Claude pide confirmación antes de ejecutar acciones. Modos disponibles: normal (pide para acciones riesgosas), auto-accept (ejecuta todo sin preguntar), plan (solo lee).

**Prompt**
Instrucción o pregunta que se envía a Claude. Un buen prompt es claro, específico y proporciona el contexto necesario.

---

## S

**Session / Sesión**
Conversación individual con Claude Code. Tiene un ID único, puede tener nombre, y puede retomarse con `/resume`. El historial se mantiene durante la sesión.

**Skill**
Comando personalizado definido en el proyecto (o a nivel usuario) que expande un prompt predefinido. Se invoca con `/nombre-del-skill`. En Amauta: `/complete-issue`, `/simplify`, etc.

**Slash Command**
Comando que empieza con `/` en la interfaz de Claude Code. Puede ser un comando integrado (`/help`, `/clear`) o un skill personalizado (`/complete-issue`).

**Subagente**
Agente secundario lanzado por el agente principal para manejar una tarea específica. Corre de forma independiente y devuelve resultados al agente principal.

---

## T

**Token**
Unidad básica de texto que procesa Claude (aproximadamente 4 caracteres en inglés, 3 en español). El contexto, los prompts y las respuestas se miden en tokens.

**Tool / Herramienta**
Capacidad específica que Claude puede usar para interactuar con el sistema: leer archivos (`Read`), editar (`Edit`), ejecutar bash (`Bash`), buscar (`Grep`, `Glob`), navegar la web (`WebFetch`), etc.

**Turbo / Turborepo**
En el contexto de Amauta: herramienta de gestión del monorepo. No confundir con características de Claude Code.

---

## W

**Worktree**
Copia aislada del repositorio git en una rama temporal. Claude puede trabajar en un worktree para hacer cambios sin afectar el directorio principal. Se activa con `--worktree` o `-w`.

---

## Conceptos Relacionados con Amauta

**ai-context**
Carpeta `docs/ai-context/` con contexto específico por módulo para que Claude entienda el código existente antes de modificarlo.

**ai-skills**
Carpeta `ia-skills/` con templates y guías para que Claude genere código siguiendo los patrones del proyecto.

**complete-issue**
Skill del proyecto que permite a Claude ejecutar un issue de GitHub de forma autónoma: leer el issue, planificar, implementar, commitear y cerrar.

---

> Para referencia de comandos, ver [referencia-comandos.md](referencia-comandos.md).
> Para el índice completo de esta documentación, ver [indice.md](indice.md).
