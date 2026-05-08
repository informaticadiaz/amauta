# Módulo: Boletín Académico

> Genera el boletín académico del estudiante agregando calificaciones y asistencias para un período y grupo.

---

## Endpoints

| Método | Ruta                                       | Roles      | Descripción                        |
| ------ | ------------------------------------------ | ---------- | ---------------------------------- |
| GET    | `/api/v1/me/boletin?periodoId=X&grupoId=Y` | ESTUDIANTE | Boletín del estudiante autenticado |
| GET    | `/api/v1/me/grupos`                        | ESTUDIANTE | Grupos activos del estudiante      |

---

## GET /me/boletin

### Query params (ambos obligatorios)

- `periodoId` (CUID): ID del período académico
- `grupoId` (CUID): ID del grupo

### Respuesta

```json
{
  "estudiante": { "nombre": "Ana", "apellido": "García" },
  "institucion": { "id": "...", "nombre": "Escuela Nacional" },
  "periodo": {
    "nombre": "Primer Trimestre",
    "fechaInicio": "...",
    "fechaFin": "..."
  },
  "grupo": { "nombre": "3° A" },
  "calificaciones": [
    { "materia": "Matemáticas", "nota": 8.5, "observaciones": null }
  ],
  "asistencia": {
    "total": 20,
    "presente": 18,
    "ausente": 1,
    "tardanza": 1,
    "justificado": 0,
    "porcentaje": 90
  },
  "escala": { "notaMinima": 0, "notaMaxima": 10, "notaAprobacion": 6 },
  "generadoEn": "2026-05-08T..."
}
```

### Errores

- `403 Forbidden`: El estudiante no pertenece al grupo o está inactivo
- `404 Not Found`: Grupo o período no encontrado
- `400 Bad Request`: `periodoId` o `grupoId` inválidos (no son CUID)

---

## GET /me/grupos

### Respuesta

```json
{
  "grupos": [
    {
      "id": "...",
      "nombre": "3° A",
      "grado": "3°",
      "seccion": "A",
      "institucion": { "id": "...", "nombre": "Escuela Nacional" },
      "periodoAcademico": { "id": "...", "nombre": "Primer Trimestre" }
    }
  ]
}
```

---

## Archivos

```
apps/api/src/boletin/
├── boletin.module.ts
├── boletin.controller.ts
├── boletin.service.ts
├── boletin.service.spec.ts
└── dto/
    └── query-boletin.dto.ts
```

---

## Notas

- Las asistencias del boletín se filtran por las fechas del período (fechaInicio–fechaFin), no por periodoAcademicoId directamente (Asistencia no tiene esa FK)
- `escala` puede ser null si la institución no tiene EscalaCalificacion configurada
- El endpoint está en BoletinModule, registrado en AppModule
