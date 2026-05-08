# Módulo: Asistencias

> Registro diario y resumen mensual de asistencias por grupo.

---

## Descripción Funcional

Permite tomar asistencia por grupo y fecha, editar registros del mismo día con observación obligatoria cuando ya existía un estado previo, y consultar un consolidado mensual básico.

### Roles y Permisos

| Acción                              | ESTUDIANTE | EDUCADOR | ADMIN_ESCUELA | SUPER_ADMIN |
| ----------------------------------- | ---------- | -------- | ------------- | ----------- |
| Ver mis propias asistencias         | ✅         | ❌       | ❌            | ❌          |
| Ver nómina diaria del grupo         | ❌         | ✅       | ✅            | ❌          |
| Registrar/editar asistencia del día | ❌         | ✅       | ✅            | ❌          |
| Ver resumen mensual del grupo       | ❌         | ✅       | ✅            | ❌          |

---

## Archivos del Módulo

### Backend

| Archivo                                                     | Propósito                  |
| ----------------------------------------------------------- | -------------------------- |
| `apps/api/src/asistencias/asistencias.module.ts`            | Módulo NestJS              |
| `apps/api/src/asistencias/asistencias.controller.ts`        | Endpoints REST             |
| `apps/api/src/asistencias/asistencias.service.ts`           | Lógica de negocio          |
| `apps/api/src/asistencias/dto/query-asistencias.dto.ts`     | Fecha para nómina diaria   |
| `apps/api/src/asistencias/dto/registrar-asistencias.dto.ts` | Payload masivo de registro |
| `apps/api/src/asistencias/dto/query-resumen-mensual.dto.ts` | Parámetros de mes y año    |
| `apps/api/src/asistencias/asistencias.controller.spec.ts`   | Tests del controller       |
| `apps/api/src/asistencias/asistencias.service.spec.ts`      | Tests del service          |

### Frontend

| Archivo                                                           | Propósito                                   |
| ----------------------------------------------------------------- | ------------------------------------------- |
| `apps/web/src/app/dashboard/asistencias/page.tsx`                 | Pantalla principal de carga rápida          |
| `apps/web/src/components/asistencias/AsistenciaRapidaSection.tsx` | Selector, grilla y guardado masivo          |
| `apps/web/src/app/api/grupos/[id]/asistencias/route.ts`           | Proxy GET/PUT de asistencias                |
| `apps/web/src/app/api/educadores/me/grupos/route.ts`              | Proxy para grupos del educador              |
| `apps/web/src/app/api/mi-institucion/route.ts`                    | Proxy para grupos del admin vía institución |

---

## Endpoints API

Base: `/api/v1`

| Método | Ruta                                           | Auth | Roles                   | Descripción                             |
| ------ | ---------------------------------------------- | ---- | ----------------------- | --------------------------------------- |
| GET    | `/grupos/:grupoId/asistencias`                 | Sí   | ADMIN_ESCUELA, EDUCADOR | Devuelve nómina activa y estado del día |
| PUT    | `/grupos/:grupoId/asistencias`                 | Sí   | ADMIN_ESCUELA, EDUCADOR | Registra o ajusta asistencias del día   |
| GET    | `/grupos/:grupoId/asistencias/resumen-mensual` | Sí   | ADMIN_ESCUELA, EDUCADOR | Devuelve consolidado mensual del grupo  |

### Body `PUT /grupos/:grupoId/asistencias`

```json
{
  "fecha": "2026-03-29",
  "asistencias": [
    {
      "estudianteId": "clx-est-1",
      "estado": "PRESENTE",
      "observaciones": "Ingresó con justificativo"
    }
  ]
}
```

### Estados válidos

- `PRESENTE`
- `AUSENTE`
- `TARDANZA`
- `JUSTIFICADO`

---

## Respuestas Relevantes

### Nómina diaria

```json
{
  "grupoId": "grp1",
  "fecha": "2026-03-29",
  "estudiantes": [
    {
      "id": "est1",
      "nombre": "Ana",
      "apellido": "Pérez",
      "email": "estudiante1@amauta.test",
      "asistencia": {
        "estado": "PRESENTE",
        "observaciones": null
      }
    }
  ]
}
```

### Registro masivo

```json
{
  "resultado": {
    "grupoId": "grp1",
    "fecha": "2026-03-29",
    "procesadas": 20,
    "creadas": 18,
    "actualizadas": 2
  },
  "message": "Asistencias registradas exitosamente"
}
```

---

## Reglas de Validación

1. **Acceso**: solo `ADMIN_ESCUELA` y educadores asignados al grupo.
2. **Grupo activo**: no se puede registrar asistencia en grupos inactivos.
3. **Nómina**: solo admite estudiantes activos asignados al grupo en esa fecha.
4. **Edición del mismo día**: si ya existía asistencia, la edición exige observación.
5. **Idempotencia**: el registro reutiliza la combinación `grupoId + estudianteId + fecha`.
6. **Resumen mensual**: consolida solo estudiantes activos del grupo.
7. **Porcentaje mensual**: usa `(presentes + justificados) / totalRegistros * 100`.

---

## Notas para IA

1. La UI usa `/api/mi-institucion` para admins y `/api/educadores/me/grupos` para educadores.
2. El componente frontend mantiene un `draft` local y envía solo cambios pendientes.
3. El contrato público expone una primera versión de reportes; no mezclar con boletines ni exportaciones.
