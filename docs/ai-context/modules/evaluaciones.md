# Módulo: Evaluaciones

> Creación básica de evaluaciones por educadores.

---

## Descripción Funcional

El módulo de evaluaciones permite a educadores crear una evaluación asociada a un curso, definiendo datos básicos como título, descripción, tiempo límite, puntaje mínimo e intentos máximos.

### Roles y Permisos

| Acción                   | ESTUDIANTE | EDUCADOR    | ADMIN_ESCUELA | SUPER_ADMIN |
| ------------------------ | ---------- | ----------- | ------------- | ----------- |
| Crear evaluación (curso) | -          | Sí (propio) | Sí            | Sí          |

---

## Archivos del Módulo

### Backend

| Archivo                                                     | Propósito                  |
| ----------------------------------------------------------- | -------------------------- |
| `apps/api/src/evaluaciones/evaluaciones.module.ts`          | Módulo NestJS              |
| `apps/api/src/evaluaciones/evaluaciones.controller.ts`      | Endpoint REST              |
| `apps/api/src/evaluaciones/evaluaciones.service.ts`         | Lógica de negocio          |
| `apps/api/src/evaluaciones/dto/create-evaluacion.dto.ts`    | Schema Zod para crear      |
| `apps/api/src/evaluaciones/dto/query-evaluaciones.dto.ts`   | Schema Zod para listado    |
| `apps/api/src/evaluaciones/evaluaciones.controller.spec.ts` | Tests unitarios controller |
| `apps/api/src/evaluaciones/evaluaciones.service.spec.ts`    | Tests unitarios service    |

### Frontend

| Archivo                                                        | Propósito                     |
| -------------------------------------------------------------- | ----------------------------- |
| `apps/web/src/app/api/evaluaciones/route.ts`                   | Proxy POST (crear evaluación) |
| `apps/web/src/app/dashboard/evaluaciones/page.tsx`             | Listado base + feedback       |
| `apps/web/src/app/dashboard/evaluaciones/nueva/page.tsx`       | Crear evaluación (página)     |
| `apps/web/src/components/evaluaciones/EvaluacionForm.tsx`      | Formulario                    |
| `apps/web/src/components/evaluaciones/EvaluacionForm.test.tsx` | Tests del formulario          |

---

## Endpoints API

Base: `/api/v1/evaluaciones`

| Método | Ruta                            | Auth | Roles     | Descripción                     |
| ------ | ------------------------------- | ---- | --------- | ------------------------------- |
| POST   | `/`                             | Sí   | EDUCADOR+ | Crear evaluación básica         |
| GET    | `/cursos/:cursoId/evaluaciones` | Sí   | EDUCADOR+ | Listar evaluaciones de un curso |

### Body (POST /)

| Campo             | Tipo          | Requerido | Descripción                   |
| ----------------- | ------------- | --------- | ----------------------------- |
| `titulo`          | string        | Sí        | Título de la evaluación       |
| `descripcion`     | string/null   | No        | Descripción opcional          |
| `cursoId`         | string (cuid) | Sí        | Curso asociado                |
| `tiempoLimiteMin` | number        | No        | Tiempo límite en minutos      |
| `puntajeMinimo`   | number        | No        | Puntaje mínimo para aprobar   |
| `intentosMaximos` | number        | No        | Máximo de intentos permitidos |

### Query (GET /cursos/:cursoId/evaluaciones)

| Campo       | Tipo                | Requerido | Descripción                         |
| ----------- | ------------------- | --------- | ----------------------------------- |
| `page`      | number (default 1)  | No        | Página de resultados                |
| `limit`     | number (default 10) | No        | Cantidad por página (máx 100)       |
| `publicada` | boolean             | No        | Filtrar por evaluaciones publicadas |

---

## Modelo Prisma

```prisma
model Evaluacion {
  id          String  @id @default(cuid())
  titulo      String
  descripcion String?

  cursoId String
  curso   Curso  @relation(fields: [cursoId], references: [id], onDelete: Cascade)

  creadorId String
  creador   Usuario @relation("Evaluador", fields: [creadorId], references: [id])

  tiempoLimiteMin Int?
  puntajeMinimo   Float?
  intentosMaximos Int?

  publicada  Boolean @default(false)
  publicadoEn DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  preguntas Pregunta[]
  intentos  IntentoEvaluacion[]
}
```

---

## Notas para IA

1. **Validación**: usar `safeParse` en el service con `createEvaluacionSchema`.
2. **Propiedad**: verificar que el curso exista y pertenezca al educador.
3. **Publicación**: por defecto `publicada` es `false`, no se setea al crear.
4. **Listado**: usar `queryEvaluacionesSchema` y respuesta paginada estándar.
