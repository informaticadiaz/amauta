# CLAUDE.md

## Información del Proyecto Amauta

Este documento proporciona contexto e información relevante para Claude Code al trabajar en el proyecto Amauta.

## Descripción del Proyecto

Amauta es un sistema educativo para la gestión del aprendizaje.

## Estructura del Proyecto

```
amauta/
├── README.md
├── CLAUDE.md
├── WORKFLOW.md          # ⭐ Metodología de trabajo con issues
├── LICENSE
├── .gitignore
└── docs/
    ├── project-management/
    │   ├── README.md
    │   ├── metodologia.md
    │   ├── roadmap.md
    │   ├── sprints.md
    │   └── tareas.md
    └── technical/
        ├── README.md
        ├── architecture.md
        ├── coding-standards.md
        ├── database.md
        └── setup.md
```

## Convenciones del Proyecto

### Commits
- Mensajes de commit en español
- Seguir formato descriptivo y claro
- Incluir contexto del cambio

### Documentación
- Toda la documentación en español
- Mantener documentos actualizados en `/docs`
- Separar documentación técnica de gestión de proyecto

## Referencias Importantes

- **Metodología de trabajo**: `WORKFLOW.md` ⭐ **LEER PRIMERO**
- Documentación técnica: `docs/technical/`
- Gestión de proyecto: `docs/project-management/`
- Arquitectura del sistema: `docs/technical/architecture.md`
- Estándares de código: `docs/technical/coding-standards.md`

## Flujo de Trabajo con Issues

**IMPORTANTE**: Antes de trabajar en cualquier issue, leer `WORKFLOW.md` que contiene:

1. ✅ Proceso completo paso a paso
2. ✅ Cómo usar GitHub CLI para gestionar issues
3. ✅ Formato de commits y mensajes
4. ✅ Uso de TodoWrite para tracking
5. ✅ Checklist de calidad
6. ✅ Ejemplos completos

### Resumen del Flujo

```bash
# 1. Listar issues
gh issue list --limit 100

# 2. Ver detalles
gh issue view <número> --json title,body,labels | jq -r '"\(.title)\n\n\(.body)"'

# 3. Crear todo list (TodoWrite)

# 4. Implementar solución

# 5. Commit con formato estándar
git commit -m "$(cat <<'EOF'
<tipo>: <descripción>
...
Resuelve: #<número>
EOF
)"

# 6. Cerrar issue
gh issue close <número> --comment "✅ Tarea completada..."
```

## Notas para Claude Code

- El proyecto está en fase inicial de desarrollo
- Usar español para toda la comunicación y documentación
- **SIEMPRE seguir el workflow definido en `WORKFLOW.md`**
- Usar TodoWrite para issues con 3+ pasos
- Commits descriptivos que referencien el issue
- Verificar checklist de calidad antes de cerrar issues
