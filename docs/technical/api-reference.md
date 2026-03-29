# Referencia de API - Convenciones y Formato

Esta guía define el formato estándar para documentar endpoints de la API de Amauta.
Su objetivo es mantener consistencia, facilitar el onboarding y asegurar que cada
nuevo endpoint tenga una descripción clara y comparable.

## Alcance

- Aplica a todos los endpoints REST expuestos por `@amauta/api`.
- No reemplaza la documentación técnica por módulo, sino que define el formato base.

## Base URL y Versionado

- Producción: `https://amauta-api.diazignacio.ar/api/v1`
- Local: `http://localhost:3001/api/v1`
- Versionado: siempre en la ruta (`/api/v1`).

## Autenticación

- Autenticación por JWT en header `Authorization: Bearer <token>`.
- Endpoints públicos deben indicarse explícitamente como `Public`.
- Endpoints protegidos deben listar roles permitidos.

## Convenciones REST

- Recursos en plural: `/cursos`, `/lecciones`, `/categorias`.
- IDs en path: `/cursos/:id`.
- Relaciones anidadas: `/cursos/:cursoId/lecciones`.
- No exponer acciones como verbos en la ruta; usar `POST` para acciones.
- Eliminación lógica por defecto (soft delete), no borrado físico.

## Formato de Respuestas

### Respuesta singular

```json
{
  "curso": { ... },
  "message": "Curso creado exitosamente"
}
```

### Respuesta de lista (paginada)

```json
{
  "cursos": [ ... ],
  "total": 120,
  "page": 1,
  "limit": 10,
  "totalPages": 12
}
```

## Paginación, filtros y orden

Parámetros estándar:

- `page`: número de página (default `1`)
- `limit`: ítems por página (default `10`, máximo `100`)
- `ordenarPor`: campo de orden (según recurso)
- `orden`: `asc` | `desc`
- `buscar`: texto libre (si aplica)

## Códigos de Estado

- `200 OK`: operación exitosa
- `201 Created`: recurso creado
- `204 No Content`: eliminación lógica exitosa
- `400 Bad Request`: datos inválidos
- `401 Unauthorized`: no autenticado
- `403 Forbidden`: sin permisos
- `404 Not Found`: recurso inexistente

## Convenciones de Datos

- JSON en `camelCase`.
- Fechas en formato ISO 8601.
- IDs tipo `cuid` en string.
- Campos opcionales deben indicarse explícitamente.

## Template para Documentar Endpoints

Copiar y completar el siguiente template por cada endpoint:

````markdown
### [NOMBRE DEL ENDPOINT]

- **Método**: `GET | POST | PATCH | DELETE`
- **URL**: `/api/v1/[recurso]/[...parametros]`
- **Auth**: `Public` | `JWT`
- **Roles** (si aplica): `EDUCADOR`, `ADMIN_ESCUELA`, `SUPER_ADMIN`
- **Descripción**: 1-2 líneas con el objetivo del endpoint

#### Path Params

| Param | Tipo          | Requerido | Descripción    |
| ----- | ------------- | --------- | -------------- |
| id    | string (cuid) | Sí        | ID del recurso |

#### Query Params

| Param | Tipo   | Requerido | Default | Descripción |
| ----- | ------ | --------- | ------- | ----------- |
| page  | number | No        | 1       | Página      |

#### Body (si aplica)

```json
{
  "campo": "valor"
}
```
````

#### Respuestas

**200 OK**

```json
{
  "recurso": { ... },
  "message": "Operación exitosa"
}
```

**400 Bad Request**

```json
{
  "message": "Datos inválidos"
}
```

````

## Consideraciones para Swagger/OpenAPI

Cuando se incorpore Swagger/OpenAPI:

- Mantener el template como base para la descripción humana.
- Usar los mismos nombres de recursos y parámetros.
- Asegurar que cada endpoint tenga ejemplos de request/response.

## Checklist para Nuevos Endpoints

- [ ] Ruta REST en plural
- [ ] Roles documentados
- [ ] Request y response con ejemplos
- [ ] Códigos de estado definidos
- [ ] Paginación y filtros si aplica

---

## Endpoints Documentados

### Obtener Nómina de Asistencia por Grupo y Fecha

- **Método**: `GET`
- **URL**: `/api/v1/grupos/:grupoId/asistencias`
- **Auth**: `JWT`
- **Roles**: `ADMIN_ESCUELA`, `EDUCADOR`
- **Descripción**: Devuelve la nómina activa del grupo para una fecha y, si existe, el estado de asistencia ya registrado para cada estudiante.

#### Path Params

| Param   | Tipo          | Requerido | Descripción |
| ------- | ------------- | --------- | ----------- |
| grupoId | string (cuid) | Sí        | ID del grupo |

#### Query Params

| Param | Tipo   | Requerido | Default | Descripción |
| ----- | ------ | --------- | ------- | ----------- |
| fecha | string | Sí        | -       | Fecha en formato `YYYY-MM-DD` |

#### Respuestas

**200 OK**

```json
{
  "grupoId": "ckr0000000000000000000101",
  "fecha": "2026-03-29",
  "estudiantes": [
    {
      "id": "ckr0000000000000000000104",
      "nombre": "Ana",
      "apellido": "Alvarez",
      "email": "ana@amauta.test",
      "asistencia": {
        "estado": "PRESENTE",
        "observaciones": null,
        "updatedAt": "2026-03-29T12:30:00.000Z"
      }
    },
    {
      "id": "ckr0000000000000000000105",
      "nombre": "Bruno",
      "apellido": "Benitez",
      "email": "bruno@amauta.test",
      "asistencia": null
    }
  ]
}
````

**403 Forbidden**

```json
{
  "message": "No tienes permiso para operar sobre este grupo"
}
```

### Registrar Asistencias por Grupo y Fecha

- **Método**: `PUT`
- **URL**: `/api/v1/grupos/:grupoId/asistencias`
- **Auth**: `JWT`
- **Roles**: `ADMIN_ESCUELA`, `EDUCADOR`
- **Descripción**: Registra o actualiza en bloque las asistencias de un grupo para una fecha. La edición de un registro existente solo se permite el mismo día y exige observación cuando cambia el valor previo.

#### Path Params

| Param   | Tipo          | Requerido | Descripción  |
| ------- | ------------- | --------- | ------------ |
| grupoId | string (cuid) | Sí        | ID del grupo |

#### Body

```json
{
  "fecha": "2026-03-29",
  "asistencias": [
    {
      "estudianteId": "ckr0000000000000000000104",
      "estado": "PRESENTE",
      "observaciones": "Llegó luego de la revisión inicial"
    },
    {
      "estudianteId": "ckr0000000000000000000105",
      "estado": "TARDANZA"
    }
  ]
}
```

#### Respuestas

**200 OK**

```json
{
  "resultado": {
    "grupoId": "ckr0000000000000000000101",
    "fecha": "2026-03-29",
    "procesadas": 2,
    "creadas": 1,
    "actualizadas": 1
  },
  "message": "Asistencias registradas exitosamente"
}
```

**400 Bad Request**

```json
{
  "message": "Debes indicar una observación para editar una asistencia del mismo día"
}
```

```

```
