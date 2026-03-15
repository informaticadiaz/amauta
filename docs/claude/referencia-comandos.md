# Referencia de Comandos de Claude Code

Guía completa de comandos, atajos y opciones disponibles en Claude Code.

---

## Slash Commands

### Sesión y Navegación

| Comando                    | Descripción                                                          |
| -------------------------- | -------------------------------------------------------------------- |
| `/help`                    | Muestra ayuda y comandos disponibles                                 |
| `/clear`                   | Limpia el historial de conversación (alias: `/reset`, `/new`)        |
| `/compact [instrucciones]` | Compacta la conversación con foco opcional                           |
| `/rewind`                  | Retrocede la conversación a un punto anterior (alias: `/checkpoint`) |
| `/resume [sesión]`         | Retoma una conversación por ID o nombre (alias: `/continue`)         |
| `/fork [nombre]`           | Crea un fork de la conversación en el punto actual                   |
| `/rename [nombre]`         | Renombra la sesión actual                                            |
| `/export [archivo]`        | Exporta la conversación como texto plano                             |

### Modelos y Configuración

| Comando                                  | Descripción                                           |
| ---------------------------------------- | ----------------------------------------------------- |
| `/model [modelo]`                        | Seleccionar o cambiar el modelo de IA                 |
| `/effort [low\|medium\|high\|max\|auto]` | Definir nivel de esfuerzo del modelo                  |
| `/config`                                | Abrir interfaz de configuración (alias: `/settings`)  |
| `/theme`                                 | Cambiar tema de color (light, dark, colorblind, ANSI) |
| `/fast [on\|off]`                        | Activar/desactivar modo rápido                        |
| `/vim`                                   | Alternar entre modo Vim y Normal                      |

### Contexto y Costos

| Comando    | Descripción                                                 |
| ---------- | ----------------------------------------------------------- |
| `/cost`    | Ver estadísticas de uso de tokens                           |
| `/context` | Visualizar uso del contexto con sugerencias de optimización |
| `/status`  | Ver versión, modelo, cuenta y conectividad                  |
| `/usage`   | Ver límites de uso del plan                                 |
| `/stats`   | Visualizar historial de uso y rachas                        |

### Herramientas e Integraciones

| Comando        | Descripción                                               |
| -------------- | --------------------------------------------------------- |
| `/mcp`         | Gestionar servidores MCP y autenticación OAuth            |
| `/hooks`       | Ver configuraciones de hooks para eventos de herramientas |
| `/permissions` | Ver o actualizar permisos (alias: `/allowed-tools`)       |
| `/ide`         | Gestionar integraciones con IDEs                          |
| `/skills`      | Listar skills disponibles                                 |
| `/agents`      | Gestionar configuraciones de agentes                      |

### Memoria y Documentación

| Comando        | Descripción                                        |
| -------------- | -------------------------------------------------- |
| `/memory`      | Editar archivos CLAUDE.md y gestionar auto-memoria |
| `/init`        | Inicializar proyecto con guía CLAUDE.md            |
| `/keybindings` | Abrir o crear configuración de atajos de teclado   |

### Utilidades

| Comando           | Descripción                                               |
| ----------------- | --------------------------------------------------------- |
| `/btw <pregunta>` | Hacer una pregunta rápida sin agregarla a la conversación |
| `/copy`           | Copiar última respuesta al portapapeles                   |
| `/diff`           | Abrir visor de diferencias para cambios no commiteados    |
| `/tasks`          | Listar y gestionar tareas en segundo plano                |
| `/color [color]`  | Cambiar color de la barra de prompt                       |
| `/exit`           | Salir de Claude Code (alias: `/quit`)                     |

### Desarrollo y Debug

| Comando             | Descripción                                          |
| ------------------- | ---------------------------------------------------- |
| `/doctor`           | Diagnosticar y verificar instalación y configuración |
| `/pr-comments [PR]` | Obtener comentarios de un PR de GitHub               |
| `/security-review`  | Analizar cambios pendientes por vulnerabilidades     |
| `/feedback`         | Enviar feedback sobre Claude Code (alias: `/bug`)    |
| `/release-notes`    | Ver el changelog completo                            |

---

## Atajos de Teclado

### Control General

| Atajo    | Acción                                             |
| -------- | -------------------------------------------------- |
| `Ctrl+C` | Cancelar entrada o generación actual               |
| `Ctrl+D` | Salir de Claude Code                               |
| `Ctrl+L` | Limpiar pantalla del terminal (mantiene historial) |
| `Ctrl+R` | Búsqueda reversa en historial de comandos          |
| `Ctrl+T` | Mostrar/ocultar lista de tareas                    |
| `Ctrl+B` | Mover tarea actual a segundo plano                 |
| `Ctrl+O` | Alternar salida verbose                            |

### Edición de Texto

| Atajo    | Acción                                 |
| -------- | -------------------------------------- |
| `Ctrl+K` | Borrar desde cursor hasta fin de línea |
| `Ctrl+U` | Borrar línea completa                  |
| `Ctrl+Y` | Pegar texto borrado                    |
| `Alt+B`  | Mover cursor una palabra atrás         |
| `Alt+F`  | Mover cursor una palabra adelante      |

### Navegación y Modos

| Atajo         | Acción                                   |
| ------------- | ---------------------------------------- |
| `Shift+Tab`   | Cambiar modo de permisos                 |
| `Alt+P`       | Cambiar modelo de IA                     |
| `Alt+T`       | Activar/desactivar pensamiento extendido |
| `Esc` + `Esc` | Rewind o resumir conversación            |
| `↑` / `↓`     | Navegar historial de comandos            |

### Entrada Multilínea

| Método               | Atajo          |
| -------------------- | -------------- |
| Escape rápido        | `\` + `Enter`  |
| macOS                | `Option+Enter` |
| Todos los terminales | `Ctrl+J`       |

---

## Modo Bash (Prefijo `!`)

Ejecutar comandos del sistema directamente:

```bash
! git status
! npm test
! ls -la
! cat archivo.txt
```

---

## CLI desde Terminal

### Inicio de Sesión

```bash
claude                          # Iniciar sesión interactiva
claude "tu pregunta"            # Iniciar con prompt inicial
claude -p "query"               # Consulta puntual y salir
claude -c                       # Continuar conversación reciente
claude -r "session-id" "query"  # Retomar sesión específica
cat archivo | claude -p "query" # Procesar contenido desde pipe
```

### Autenticación

```bash
claude auth login --email usuario@ejemplo.com
claude auth logout
claude auth status
```

### Gestión

```bash
claude update        # Actualizar a la última versión
claude agents        # Listar subagentes configurados
claude mcp           # Configurar servidores MCP
```

### Flags Comunes

| Flag                | Propósito                                  |
| ------------------- | ------------------------------------------ |
| `--model`           | Definir modelo de IA (sonnet, opus, etc.)  |
| `--effort`          | Nivel de esfuerzo (low, medium, high, max) |
| `--permission-mode` | Modo de permisos (plan, auto-accept)       |
| `--debug`           | Activar modo debug                         |
| `--tools`           | Restringir herramientas disponibles        |
| `-w` / `--worktree` | Usar git worktree aislado                  |
| `-n` / `--name`     | Nombrar la sesión                          |
| `--add-dir`         | Agregar directorios de trabajo             |
| `--max-turns`       | Limitar turnos agénticos                   |

---

## Skills del Proyecto Amauta

Skills personalizados disponibles en este proyecto:

| Skill               | Descripción                                      |
| ------------------- | ------------------------------------------------ |
| `/complete-issue`   | Ejecutar un issue de GitHub de forma autónoma    |
| `/claude-api`       | Construir apps con la API de Claude              |
| `/simplify`         | Revisar código cambiado por calidad y eficiencia |
| `/loop`             | Ejecutar comandos en intervalos recurrentes      |
| `/keybindings-help` | Personalizar atajos de teclado                   |

---

## Consejos Rápidos

- Usá `/btw` para preguntas rápidas sin interrumpir el flujo de trabajo principal
- Usá `/context` antes de operaciones costosas para ver cuánto contexto disponés
- Usá `/diff` para revisar todos los cambios antes de commitear
- Usá `/color` para identificar visualmente distintas sesiones
- Presioná `?` en modo interactivo para ver todos los atajos disponibles en tu terminal
