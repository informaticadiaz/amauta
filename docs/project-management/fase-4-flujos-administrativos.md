# F4-003: Diseño funcional de flujos administrativos (roles)

## Objetivo

Definir los flujos administrativos por rol para orientar UI, backend y criterios de aceptación en el Módulo Escolar (Fase 4).

## Alcance

- Documentación funcional y de gestión.
- Sin cambios de código.
- Aplica a grupos/clases, asistencias, calificaciones y comunicados.

## Roles involucrados

- **Admin Escolar**: configura y gestiona la institución.
- **Educador**: opera sobre sus grupos asignados.
- **Estudiante/Apoderado**: consulta información académica y comunicados.

## Flujo Admin Escolar: gestión de grupos/clases

1. Entrar a **Módulo Escolar** → **Grupos**.
2. **Crear grupo** con: nombre, grado/nivel, turno y ciclo lectivo.
3. **Asignar educadores** al grupo (titular/suplente).
4. **Asignar estudiantes** con carga masiva (vista previa de altas/duplicados/errores).
5. **Editar** datos del grupo cuando sea necesario.
6. **Desactivar** el grupo si no recibe nuevas asignaciones.
7. Consultar **historial** de asignaciones y cambios.

## Flujo Admin/Educador: registro de asistencias diarias

1. Seleccionar **grupo** y **fecha**.
2. Cargar asistencia rápida por estudiante:
   - Presente
   - Ausente
   - Tardanza
   - Justificado
3. Guardar y ver **resumen** de asistencias del día.
4. **Editar** asistencia dentro del mismo día con motivo obligatorio.
5. Consultar historial por fecha o rango.

## Flujo Admin/Educador: carga de calificaciones por periodo

1. Seleccionar **periodo académico** y **materia**.
2. Ver **escala de calificación** activa de la institución.
3. Cargar notas por estudiante (tabla editable).
4. Validación de rango y consistencia antes de guardar.
5. **Publicar** calificaciones del periodo.
6. Exportar resumen por grupo.

## Flujo Admin/Educador: comunicados institucionales

1. Crear comunicado con **tipo** y **prioridad** (general, académico, urgente).
2. Definir audiencia (institución, grupo o curso).
3. **Publicar** o programar publicación.
4. Estudiantes/apoderados reciben notificación.
5. Consultar **historial** de comunicados y estado.

## Flujo Estudiante/Apoderado: consulta académica

1. Entrar al panel del estudiante.
2. Ver **asistencias** por rango de fechas.
3. Ver **calificaciones** por periodo y materia.
4. Recibir y leer **comunicados**.
5. Descargar **boletín** si está disponible.

## Casos límite y permisos por rol

- **Admin Escolar**:
  - Acceso total a grupos, asistencias, calificaciones y comunicados.
  - Puede configurar periodos académicos y escalas.
- **Educador**:
  - Solo opera sobre grupos asignados.
  - No puede modificar configuración institucional.
- **Estudiante/Apoderado**:
  - Acceso de solo lectura a asistencias, calificaciones y comunicados propios.
- **Asistencias**:
  - Edición permitida solo el mismo día con motivo obligatorio.
- **Calificaciones**:
  - Bloqueo de edición si el periodo está cerrado.
- **Comunicados**:
  - Los urgentes generan notificación destacada.

## Estados funcionales

- **Grupo**: Activo → Inactivo
- **Asistencia**: Registrada → Editada (con motivo)
- **Calificación**: Borrador → Publicada → Cerrada
- **Comunicado**: Borrador → Programado → Publicado → Archivado

## Prioridades por sprint (implementación)

- **Sprint 11**: configuración institucional + gestión de grupos/clases.
- **Sprint 12**: registro de asistencias y edición con motivo.
- **Sprint 13**: carga y publicación de calificaciones por periodo.
- **Sprint 14**: comunicados institucionales + reportes básicos.

## Salidas esperadas

- **Admin Escolar**: reportes de asistencia y rendimiento por grupo.
- **Educador**: panel rápido de asistencia y carga de notas por grupo.
- **Estudiante/Apoderado**: historial académico claro y comunicados relevantes.

## Referencias

- `docs/project-management/roadmap.md` → Fase 4
- `docs/project-management/backlog.md`
- `docs/human-context/issue-66-diseno-funcional-flujos-administrativos-roles.md`
