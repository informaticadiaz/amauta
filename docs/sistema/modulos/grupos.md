# Grupos / Clases

> Los grupos (o clases) permiten organizar estudiantes dentro de una institución educativa, facilitando el registro de asistencias, calificaciones y comunicaciones.

**Estado**: ✅ Funcional (API + UI)
**Última actualización**: 2026-03-26

---

## ¿Qué puedo hacer?

### Como Administrador de Escuela

- Crear nuevos grupos para tu institución
- Editar información de grupos existentes
- Activar o desactivar grupos
- Filtrar grupos por periodo académico
- Filtrar grupos por estado (activo/inactivo)
- Ver la lista de todos los grupos de tu institución

### Como Educador

- Ver los grupos donde estás asignado
- Ver la lista de estudiantes de tus grupos
- (Próximamente) Tomar asistencia de tus grupos
- (Próximamente) Cargar calificaciones

### Como Estudiante

- Ver los grupos a los que pertenecés
- (Próximamente) Ver tu asistencia por grupo
- (Próximamente) Ver tus calificaciones por grupo

---

## Funcionalidades Detalladas

### Crear un Grupo

**¿Qué es?**
Crear una nueva clase o división dentro de tu institución.

**¿Cómo accedo?**
Desde el panel de administración: "Grupos" → "Nuevo Grupo".

**¿Quién puede usarlo?**
Administradores de escuela y Super administradores.

**¿Qué necesito completar?**

- **Nombre** (obligatorio): Nombre del grupo (ej: "3ro A", "Matemáticas Turno Mañana")
- **Periodo Académico** (obligatorio): El periodo al que pertenece el grupo
- **Descripción** (opcional): Información adicional sobre el grupo
- **Educador** (opcional): Asignar un educador responsable

---

### Editar un Grupo

**¿Qué es?**
Modificar la información de un grupo existente.

**¿Cómo accedo?**
Desde la lista de grupos, hacé clic en el ícono de editar.

**¿Quién puede usarlo?**
Administradores de la institución.

**¿Qué puedo cambiar?**

- Nombre
- Descripción
- Periodo académico
- Educador asignado

---

### Desactivar un Grupo

**¿Qué es?**
Marcar un grupo como inactivo sin eliminarlo.

**¿Cómo accedo?**
Desde la lista de grupos, hacé clic en "Desactivar".

**¿Quién puede usarlo?**
Administradores de la institución.

**¿Qué pasa?**

- El grupo no aparece en las listas activas
- No se pueden agregar nuevos estudiantes
- Se conserva todo el historial (asistencias, calificaciones)
- Podés reactivarlo en cualquier momento

---

### Filtrar Grupos

**¿Qué es?**
Buscar grupos por diferentes criterios.

**¿Cómo accedo?**
Desde la página de grupos, usá los filtros disponibles.

**Filtros disponibles:**

- Por periodo académico (ej: "2026 - Primer Semestre")
- Por estado (Activo / Inactivo)

---

## Estados de un Grupo

| Estado       | Significado                      | ¿Se pueden agregar estudiantes? |
| ------------ | -------------------------------- | ------------------------------- |
| **Activo**   | Grupo en funcionamiento          | Sí                              |
| **Inactivo** | Grupo cerrado pero con historial | No                              |

---

## Flujos Comunes

### Crear un grupo para el nuevo ciclo lectivo

1. Asegurate de tener un periodo académico activo
2. Andá a "Grupos" en el panel de administración
3. Hacé clic en "Nuevo Grupo"
4. Completá el nombre y seleccioná el periodo
5. (Opcional) Asigná un educador responsable
6. Guardá el grupo

### Cerrar grupos del año anterior

1. Andá a "Grupos"
2. Filtrá por el periodo académico anterior
3. Para cada grupo, hacé clic en "Desactivar"
4. Los grupos quedan inactivos pero conservan su historial

---

## Preguntas Frecuentes

### ¿Puedo eliminar un grupo?

No se pueden eliminar grupos, solo desactivar. Esto preserva el historial académico.

### ¿Un estudiante puede estar en varios grupos?

Sí. Un estudiante puede pertenecer a múltiples grupos (ej: diferentes materias).

### ¿Qué pasa si desactivo un grupo con estudiantes?

Los estudiantes mantienen su historial pero no pueden recibir nuevas asistencias o calificaciones en ese grupo.

### ¿Puedo ver grupos de otras instituciones?

No. Cada institución solo ve sus propios grupos.

---

## Próximas Mejoras

- [ ] Asignación masiva de estudiantes a grupos
- [ ] Asignación de múltiples educadores por grupo
- [ ] Exportar lista de estudiantes por grupo
- [ ] Duplicar grupos de un periodo a otro
