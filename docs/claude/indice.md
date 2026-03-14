# Documentación de Claude Code para Amauta

Índice de guías y referencias sobre el uso de Claude Code en este proyecto.

---

## Documentos Disponibles

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| [referencia-comandos.md](referencia-comandos.md) | Slash commands, atajos de teclado, CLI y skills del proyecto | ✅ Disponible |
| [glosario.md](glosario.md) | Terminología y conceptos clave de Claude Code | ✅ Disponible |
| [tips-y-trucos.md](tips-y-trucos.md) | Técnicas y patrones para usar Claude Code de forma efectiva | 📋 Pendiente |
| [configuracion-proyecto.md](configuracion-proyecto.md) | Configuración de Claude Code específica para Amauta | 📋 Pendiente |
| [mcp-servers.md](mcp-servers.md) | Servidores MCP disponibles y cómo integrarlos | 📋 Pendiente |
| [flujo-de-trabajo.md](flujo-de-trabajo.md) | Cómo usar Claude Code integrado al workflow del proyecto | 📋 Pendiente |
| [memoria-contexto.md](memoria-contexto.md) | Sistema de memoria, CLAUDE.md y gestión del contexto | 📋 Pendiente |

---

## Hooks

Todo lo relacionado a hooks está agrupado en `hooks/`:

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| [hooks/README.md](hooks/README.md) | Índice de hooks: tabla de activos, cómo funcionan, cómo agregar uno nuevo | ✅ Disponible |
| [hooks/desde-cero.md](hooks/desde-cero.md) | Qué son los hooks, diferencia con CLAUDE.md, primer hook paso a paso | ✅ Disponible |
| [hooks/referencia.md](hooks/referencia.md) | Referencia completa: todos los eventos, tipos de handlers, configuración | ✅ Disponible |
| [hooks/configuracion-amauta.md](hooks/configuracion-amauta.md) | Hooks activos en el proyecto: qué hacen y por qué existen | ✅ Disponible |
| [hooks/subagentes.md](hooks/subagentes.md) | Cómo interactúan los hooks con los subagentes | ✅ Disponible |
| [hooks/casos-practicos.md](hooks/casos-practicos.md) | Scripts listos para copiar: seguridad, git, prisma, calidad | ✅ Disponible |

### Hooks Implementados

Documentación individual de cada script en `.claude/hooks/`:

| Archivo | Script |
|---------|--------|
| [hooks/implementados/contexto-sesion.md](hooks/implementados/contexto-sesion.md) | `contexto-sesion.sh` |
| [hooks/implementados/bloquear-destructivos.md](hooks/implementados/bloquear-destructivos.md) | `bloquear-destructivos.sh` |
| [hooks/implementados/advertir-prisma.md](hooks/implementados/advertir-prisma.md) | `advertir-prisma.sh` |
| [hooks/implementados/proteger-archivos.md](hooks/implementados/proteger-archivos.md) | `proteger-archivos.sh` |
| [hooks/implementados/detectar-secretos.md](hooks/implementados/detectar-secretos.md) | `detectar-secretos.sh` |
| [hooks/implementados/validar-schema-prisma.md](hooks/implementados/validar-schema-prisma.md) | `validar-schema-prisma.sh` |

---

## Estructura de Carpetas

```
docs/claude/
├── indice.md                        ← este archivo
├── referencia-comandos.md
├── glosario.md
└── hooks/
    ├── README.md                    ← punto de entrada para todo lo de hooks
    ├── desde-cero.md
    ├── referencia.md
    ├── configuracion-amauta.md
    ├── subagentes.md
    ├── casos-practicos.md
    └── implementados/
        ├── contexto-sesion.md
        ├── bloquear-destructivos.md
        ├── advertir-prisma.md
        ├── proteger-archivos.md
        ├── detectar-secretos.md
        └── validar-schema-prisma.md
```

---

## Cómo Contribuir a Esta Documentación

1. Elegí un tema pendiente de la tabla de arriba
2. Creá el archivo en la carpeta correspondiente
3. Actualizá el estado en este índice (📋 → ✅)
4. Seguí el estilo de los documentos existentes como referencia

---

> Esta documentación es específica para el uso de Claude Code en el proyecto Amauta.
> Para documentación técnica del proyecto, ver `docs/technical/`.
> Para gestión del proyecto, ver `docs/project-management/`.
