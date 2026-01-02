# Roles y Permisos

> Qué puede hacer cada tipo de usuario en Amauta.

## Roles Disponibles

El sistema tiene 4 roles con diferentes niveles de acceso:

```
SUPER_ADMIN
    │
    ├── ADMIN_ESCUELA
    │       │
    │       └── EDUCADOR
    │               │
    │               └── ESTUDIANTE
```

## Descripción de Roles

### SUPER_ADMIN (Super Administrador)

**Quién es**: Administrador global del sistema.

**Puede hacer**:

- Todo lo que pueden hacer los otros roles
- Gestionar todas las instituciones
- Ver y modificar todos los usuarios
- Acceder a configuraciones del sistema
- Ver estadísticas globales

**Usuario de prueba**: `superadmin@amauta.test`

---

### ADMIN_ESCUELA (Administrador de Escuela)

**Quién es**: Director o administrador de una institución específica.

**Puede hacer**:

- Gestionar usuarios de su institución
- Crear y administrar grupos (clases)
- Publicar comunicados institucionales
- Registrar asistencias
- Ver reportes de su institución
- Asignar roles a usuarios de su institución

**No puede hacer**:

- Gestionar otras instituciones
- Acceder a configuraciones globales

**Usuarios de prueba**:

- `admin1@amauta.test` (Escuela Belgrano)
- `admin2@amauta.test` (Colegio San Martín)

---

### EDUCADOR (Profesor/Docente)

**Quién es**: Profesor que crea y gestiona contenido educativo.

**Puede hacer**:

- Crear cursos
- Agregar lecciones a sus cursos
- Publicar y despublicar cursos
- Ver estudiantes inscritos en sus cursos
- Ver progreso de estudiantes
- Calificar estudiantes
- Inscribirse en cursos de otros (como estudiante)

**No puede hacer**:

- Gestionar usuarios
- Publicar comunicados institucionales
- Ver cursos de otros educadores (solo los suyos)

**Usuarios de prueba**:

- `educador1@amauta.test` (Ana - Matemáticas)
- `educador2@amauta.test` (Pedro - Lengua)
- `educador3@amauta.test` (Laura - Ciencias)

---

### ESTUDIANTE

**Quién es**: Alumno que consume contenido educativo.

**Puede hacer**:

- Ver catálogo de cursos
- Inscribirse en cursos
- Ver contenido de cursos inscritos
- Marcar lecciones como completadas
- Ver su progreso
- Ver sus calificaciones

**No puede hacer**:

- Crear cursos
- Ver progreso de otros estudiantes
- Gestionar usuarios

**Usuarios de prueba**:

- `estudiante1@amauta.test` (Juan)
- `estudiante2@amauta.test` (Sofía)
- `estudiante3@amauta.test` (Mateo)
- `estudiante4@amauta.test` (Valentina)

## Matriz de Permisos

| Acción                                | ESTUDIANTE | EDUCADOR | ADMIN_ESCUELA | SUPER_ADMIN |
| ------------------------------------- | :--------: | :------: | :-----------: | :---------: |
| Ver catálogo de cursos                |     ✅     |    ✅    |      ✅       |     ✅      |
| Inscribirse en cursos                 |     ✅     |    ✅    |      ✅       |     ✅      |
| Ver contenido de curso inscrito       |     ✅     |    ✅    |      ✅       |     ✅      |
| Marcar lecciones completadas          |     ✅     |    ✅    |      ✅       |     ✅      |
| Ver progreso propio                   |     ✅     |    ✅    |      ✅       |     ✅      |
| **Crear cursos**                      |     ❌     |    ✅    |      ✅       |     ✅      |
| Editar cursos propios                 |     ❌     |    ✅    |      ✅       |     ✅      |
| Ver progreso de estudiantes           |     ❌     |    ✅    |      ✅       |     ✅      |
| Calificar estudiantes                 |     ❌     |    ✅    |      ✅       |     ✅      |
| **Gestionar grupos**                  |     ❌     |    ❌    |      ✅       |     ✅      |
| Publicar comunicados                  |     ❌     |    ❌    |      ✅       |     ✅      |
| Registrar asistencias                 |     ❌     |    ❌    |      ✅       |     ✅      |
| Gestionar usuarios de institución     |     ❌     |    ❌    |      ✅       |     ✅      |
| **Gestionar todas las instituciones** |     ❌     |    ❌    |      ❌       |     ✅      |
| Configurar sistema                    |     ❌     |    ❌    |      ❌       |     ✅      |

## Navegación por Rol

Según tu rol, verás diferentes opciones en el menú:

### Menú de ESTUDIANTE

- Dashboard
- Mis cursos
- Explorar cursos

### Menú de EDUCADOR

- Dashboard
- Mis cursos
- Gestionar cursos
- Explorar cursos

### Menú de ADMIN_ESCUELA

- Dashboard
- Mis cursos
- Gestionar cursos
- Usuarios
- Configuración

### Menú de SUPER_ADMIN

- Todo lo anterior
- Instituciones
- Configuración global

## Cambio de Rol

Los usuarios no pueden cambiar su propio rol. Solo un ADMIN_ESCUELA o SUPER_ADMIN puede cambiar roles de otros usuarios.

| Puede cambiar roles de |    ADMIN_ESCUELA    | SUPER_ADMIN |
| ---------------------- | :-----------------: | :---------: |
| ESTUDIANTE             | ✅ (su institución) |     ✅      |
| EDUCADOR               | ✅ (su institución) |     ✅      |
| ADMIN_ESCUELA          |         ❌          |     ✅      |
| SUPER_ADMIN            |         ❌          |     ✅      |

---

**Implementado en**: F1-002 (Issue #29)
**Fecha**: 01/01/2026
