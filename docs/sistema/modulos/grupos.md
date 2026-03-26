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
- Asignar múltiples estudiantes a un grupo en una sola acción
- Asignar uno o más educadores a un grupo con rol titular o suplente
- Ver el listado de estudiantes por grupo
- Ver el listado de educadores por grupo
- Remover estudiantes sin borrar el historial
- Remover educadores sin borrar el historial

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

### Asignar Estudiantes a un Grupo

**¿Qué es?**
Agregar varios estudiantes a un grupo en una sola operación.

**¿Quién puede usarlo?**
Administradores de escuela y Super administradores.

**¿Qué valida el sistema?**

- Que el estudiante exista
- Que tenga rol de estudiante
- Que pertenezca a la misma institución del grupo
- Que no esté ya asignado activamente

**¿Qué devuelve?**

Un resumen con estudiantes agregados, duplicados y errores detectados.

Si una asignación fue removida antes, el sistema puede reactivarla sin perder historial.

---

### Asignar Educadores a un Grupo

**¿Qué es?**
Agregar educadores a un grupo indicando si actúan como titular o suplente.

**¿Quién puede usarlo?**
Administradores de escuela y Super administradores.

**¿Qué valida el sistema?**

- Que el educador exista
- Que tenga rol de educador
- Que pertenezca a la misma institución del grupo
- Que no esté ya asignado activamente al mismo grupo

**¿Qué devuelve?**

La asignación creada con el rol definido. Si la asignación había sido removida antes, el sistema la reactiva sin perder historial.

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

### ¿Un grupo puede tener varios educadores?

Sí. Un grupo puede tener un educador titular y uno o más suplentes, siempre dentro de la misma institución.

### ¿Qué pasa si remuevo un estudiante de un grupo?

La asignación no se borra físicamente. Se desactiva y conserva el historial para auditoría o futura reactivación.

### ¿Qué pasa si desactivo un grupo con estudiantes?

Los estudiantes mantienen su historial pero no pueden recibir nuevas asistencias o calificaciones en ese grupo.

### ¿Puedo ver grupos de otras instituciones?

No. Cada institución solo ve sus propios grupos.

---

## Próximas Mejoras

- [ ] Exportar lista de estudiantes por grupo
- [ ] Duplicar grupos de un periodo a otro
