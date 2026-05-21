# Análisis Arquitectónico del Backend — Amauta

**Fecha:** Mayo 2026  
**Stack:** NestJS + Fastify + Prisma + PostgreSQL  
**Estado:** Análisis completo — 18 módulos + capa común

---

## Resumen Ejecutivo

El backend sigue una **arquitectura modular layered clean** con excelente separación inicial pero tiene oportunidades de mejora en:

1. **Acoplamiento implícito** entre módulos (falta de abstracciones)
2. **Falta de capa repository** (services tocan Prisma directamente)
3. **Validación duplicada** en DTOs (Zod repetido módulo a módulo)
4. **Carencia de eventos/pubsub** (cambios no se comunican entre módulos)
5. **Estructura de permisos confusa** (guards + decorators sin patrón claro)

El código **NO viola SOLID gravemente**, pero sí **pierde oportunidades de extensibilidad**. Con 18 módulos actuales y 9 más planificados en F4c, esto se tornará crítico.

### Capas del Sistema

```
┌─────────────────────────────────────┐
│         HTTP Controllers            │  Input: REST endpoints
├─────────────────────────────────────┤
│       Business Logic (Services)     │  Core: Lógica de negocio
├─────────────────────────────────────┤
│    Data Access (Prisma ORM)         │  Output: PostgreSQL
├─────────────────────────────────────┤
│      Guards, Decorators, Filters    │  Cross-cutting: Auth, validation
└─────────────────────────────────────┘
```

### Módulos Principales

| Módulo         | Responsabilidad         | Estado | Archivos |
| -------------- | ----------------------- | ------ | -------- |
| auth           | JWT, roles, permisos    | ✅     | 3        |
| cursos         | CRUD de cursos          | ✅     | 6        |
| lecciones      | CRUD de lecciones       | ⚠️     | 6        |
| inscripciones  | Inscripción a cursos    | ✅     | 6        |
| progreso       | Tracking de estudiantes | ✅     | 6        |
| evaluaciones   | Quizzes y evaluaciones  | ✅     | 5        |
| calificaciones | Calificaciones finales  | ✅     | 4        |
| asistencias    | Asistencia escolar      | ✅     | 5        |
| instituciones  | Gestión de escuelas     | ✅     | 5        |
| foros          | Discusión y Q&A         | ✅     | 5        |
| notificaciones | Sistema de alertas      | ✅     | 4        |

---

## Estructura de Módulos

### Inventario

| Módulo             | Controllers | Services | DTOs | Files | Responsabilidad                  |
| ------------------ | ----------- | -------- | ---- | ----- | -------------------------------- |
| **auth**           | 1           | 1        | 2    | 3     | Login/registro, JWT              |
| **cursos**         | 1           | 1        | 4    | 6     | CRUD cursos, búsqueda            |
| **lecciones**      | 1           | 1        | 3    | 6     | CRUD lecciones, reorden          |
| **inscripciones**  | 1           | 1        | 2    | 6     | Enroll/unenroll, progreso        |
| **evaluaciones**   | 1           | 1        | 3    | 5     | CRUD evaluaciones, preguntas     |
| **progreso**       | 1           | 1        | 2    | 6     | Tracking lecciones completadas   |
| **uploads**        | 1           | 2\*      | 2    | 5     | Archivos, procesamiento imágenes |
| **instituciones**  | 1           | 1        | 5    | 5     | Períodos, escalas, usuarios      |
| **grupos**         | 1           | 1        | 7    | 5     | Clases, asignaciones, reportes   |
| **asistencias**    | 1           | 1        | 2    | 5     | Registro de asistencia           |
| **calificaciones** | 1           | 1        | 2    | 4     | Notas por materia                |
| **boletin**        | 1           | 1        | 1    | 4     | Reportes de boletín              |
| **foros**          | 1           | 1        | 3    | 5     | Posts, respuestas, reacciones    |
| **notificaciones** | 1           | 1        | 2    | 4     | Alertas en tiempo real           |
| **comunicados**    | 1           | 1        | 2    | 4     | Comunicados institucionales      |
| **categorias**     | 1           | 1        | 1    | 3     | Categorías de cursos             |
| **prisma**         | —           | 1        | —    | 3     | ORM wrapper                      |
| **common**         | —           | —        | —    | 8     | Guards, decorators, shared       |

**18 módulos totales** · ~87 archivos TypeScript

### Patrón Estándar (Clean Layered)

Todos los módulos siguen este patrón **CONSISTENTE**:

```
módulo/
├── nombre.module.ts           # Declaración, imports, exports
├── nombre.controller.ts        # HTTP routing, responses
├── nombre.service.ts           # Business logic
├── nombre.controller.spec.ts   # Tests HTTP
├── nombre.service.spec.ts      # Tests lógica
└── dto/
    ├── create-nombre.dto.ts    # Zod schema + type
    ├── update-nombre.dto.ts    # Zod schema + type
    └── query-nombre.dto.ts     # Query params
```

---

## Hallazgos Clave

### 1. SIN Capa Repository — Services Acoplados a Prisma

**Severidad:** MEDIA  
**Impacto:** Difícil de testear, acoplamiento a ORM

Todos los 18 servicios inyectan directamente `PrismaService`. NO hay abstracción:

```typescript
// Todos los servicios:
constructor(private readonly prisma: PrismaService) {}

// Esperado (mejor):
constructor(private readonly repository: CursosRepository) {}
```

**Patrón SOLID violado:** Dependency Inversion — los servicios dependen de detalles concretos (Prisma), no de abstracciones (Repository interfaces).

### 2. Falta de Comunicación Entre Módulos — Sin EventEmitter

**Severidad:** ALTA  
**Impacto:** Efectos secundarios repartidos, lógica de negocio dispersa

**Prueba:** Ningún módulo inyecta OTRO servicio (excepción: `UploadsService` inyecta `ImageProcessorService` — mismo módulo):

```bash
$ grep "constructor.*Service" apps/api/src/*/*.service.ts | grep -v Prisma | grep -v "Upload"
# (sin resultados)
```

**Problema:** Si un usuario se inscribe en un curso, necesita:

- Crear inscripción (inscripciones.service)
- Enviar notificación (notificaciones.service)
- Crear auditoría (?)
- Actualizar estadísticas (?)

HOY: Cada responsabilidad está en su servicio, sin coordinación. MAÑANA (F4c): Pesadilla.

### 3. Validación Duplicada en DTOs

**Severidad:** BAJA

Cada módulo define sus propios schemas Zod. Patrones comunes reutilizables:

- Paginación (limit, offset, page)
- Búsqueda (buscar, ordenarPor, orden)
- Timestamps (desde, hasta)

Cada módulo repite estos.

### 4. Estructura de Permisos Confusa

**Severidad:** MEDIA

Distribución de lógica de permisos:

1. **JWT extraction** → `jwt-auth.guard.ts`
2. **Rol validation** → `roles.guard.ts` (chequea `@Roles()`)
3. **Ownership check** → **DENTRO de cada servicio**

Cada servicio implementa su propia lógica de resource ownership (e.g., `LeccionesService.verificarPropietarioCurso`). No hay policy engine centralizado.

### 5. Modelos Complejos Sin Aggregate Roots Claros

**Severidad:** MEDIA

Usuario es agregado que atraviesa 12+ tablas. No hay:

- `UserAggregate` que encapsule acceso a datos relacionados
- Boundaries claros de qué datos "pertenecen" a qué contexto
- Validaciones en el límite del agregado

---

## Conformidad SOLID

| Principio                 | Estado     | Evidencia                                                                    |
| ------------------------- | ---------- | ---------------------------------------------------------------------------- |
| **S**ingle Responsibility | ⚠️ PARCIAL | Services crecen sin límite (ProgresoService, GruposService: 15+ métodos c/u) |
| **O**pen/Closed           | ⚠️ DÉBIL   | Añadir permisos requiere editar services + guards                            |
| **L**iskov Substitution   | ✅ BIEN    | Interfaces de DTOs claras, types explícitos                                  |
| **I**nterface Segregation | ✅ BIEN    | Controllers y services tienen responsabilidades claras                       |
| **D**ependency Inversion  | ❌ VIOLADO | Services dependen de PrismaService (detalle concreto), no abstracciones      |

### Patrones Correctamente Aplicados

✅ **Layered Architecture:** Controller → Service → Data (Prisma)  
✅ **Guards + Decorators:** Autenticación centralizada (`JwtAuthGuard`, `RolesGuard`, `@Public()`)  
✅ **Zod Validation:** Entrada validada con schemas tipados + safeParse  
✅ **Error Handling:** Excepciones NestJS estandarizadas  
✅ **Testing:** Specs para controllers y services  
✅ **Consistent Naming:** Snake_case en BD, camelCase en código  
✅ **Response Structure:** Singular `{ modelo, message }`, Plural `{ modelos, total, page, limit }`

---

---

## Propuestas de Mejora — Priorizadas

### CORTO PLAZO (Sprint próximo)

#### 1. Crear Capa Repository Abstracta

**Esfuerzo:** MEDIO (2-3 días)  
**Beneficio:** Testabilidad, independencia de ORM

```typescript
// apps/api/src/common/repositories/base.repository.ts
export abstract class BaseRepository<T> {
  abstract findById(id: string): Promise<T>;
  abstract findMany(filter: any): Promise<T[]>;
  abstract create(data: any): Promise<T>;
  abstract update(id: string, data: any): Promise<T>;
  abstract delete(id: string): Promise<void>;
}

// apps/api/src/cursos/cursos.repository.ts
export class CursosRepository extends BaseRepository<Curso> {
  constructor(private prisma: PrismaService) { super(); }

  async findById(id: string): Promise<Curso> {
    return this.prisma.curso.findUnique({ where: { id } });
  }
  // ...
}

// En cursos.module.ts:
providers: [CursosService, CursosRepository]

// En cursos.service.ts:
constructor(private repository: CursosRepository) {}
```

**Impact:**

- Services inyectan `CursosRepository`, no `PrismaService`
- Tests mockean repositorio, no Prisma
- Cambio de ORM = cambio en 1 lugar

#### 2. Centralizar Validación Compartida

**Esfuerzo:** BAJO (1 día)

```typescript
// apps/api/src/common/dto/shared-schemas.ts
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

export const searchSchema = z.object({
  buscar: z.string().optional(),
  ordenarPor: z.string().optional(),
  orden: z.enum(['asc', 'desc']).default('desc'),
});

// En cada módulo:
export const queryCursosSchema = paginationSchema
  .merge(searchSchema)
  .merge(z.object({ categoriaId: z.string().optional() }));
```

**Impact:** Reducir duplicación ~20%, consistencia

#### 3. Crear Policy Engine Centralizado

**Esfuerzo:** MEDIO (2 días)

```typescript
// apps/api/src/common/policies/policy-engine.ts
@Injectable()
export class PolicyEngine {
  constructor(private repository: CursosRepository) {}

  async canEditCurso(user: RequestUser, cursoId: string): Promise<boolean> {
    const curso = await this.repository.findById(cursoId);
    return curso?.educadorId === user.id;
  }

  async canEditLeccion(user: RequestUser, leccionId: string): Promise<boolean> {
    // Verificar propietario del curso + leccion
  }
}

// En services:
constructor(
  private repository: CursosRepository,
  private policies: PolicyEngine
) {}

async actualizarLeccion(leccionId: string, user: RequestUser, dto: any) {
  if (!await this.policies.canEditLeccion(user, leccionId)) {
    throw new ForbiddenException();
  }
  // ...
}
```

**Impact:** Auditoría centralizada, caché de permisos posible, reutilización

---

### MEDIANO PLAZO (Sprints 2-3)

#### 4. Implementar Event-Driven Architecture

**Esfuerzo:** ALTO (4-5 días)

```typescript
// apps/api/src/common/events/domain-events.ts
export abstract class DomainEvent {
  abstract get eventName(): string;
  timestamp = new Date();
}

export class EstudianteInscritoEvent extends DomainEvent {
  constructor(
    public usuarioId: string,
    public cursoId: string,
    public inscripcionId: string
  ) { super(); }

  get eventName() { return 'estudiante.inscrito'; }
}

// apps/api/src/common/events/event-bus.ts
@Injectable()
export class EventBus {
  private listeners = new Map<string, Function[]>();

  subscribe(eventName: string, handler: Function) {
    // ...
  }

  emit(event: DomainEvent) {
    // ...
  }
}

// apps/api/src/inscripciones/inscripciones.service.ts
async inscribirse(cursoId: string, usuarioId: string) {
  const inscripcion = await this.repository.create({
    cursoId, usuarioId, estado: 'ACTIVO'
  });

  // Emitir evento — otros módulos se suscriben
  this.eventBus.emit(new EstudianteInscritoEvent(usuarioId, cursoId, inscripcion.id));

  return inscripcion;
}

// apps/api/src/notificaciones/notificaciones.listener.ts
@Injectable()
export class NotificacionesListener implements OnModuleInit {
  constructor(private eventBus: EventBus, private notificaciones: NotificacionesService) {}

  onModuleInit() {
    this.eventBus.subscribe('estudiante.inscrito', async (event) => {
      await this.notificaciones.enviarBienvenida(event.usuarioId, event.cursoId);
    });
  }
}
```

**Impact:**

- Módulos se comunican sin acoplamiento
- Lógica cruzada separada en listeners
- Auditoría y replay de eventos posible

#### 5. Definir Aggregate Roots

**Esfuerzo:** ALTO (5-6 días)

Aggregates propuestos:

| Aggregate       | Root        | Entidades Incluidas                         |
| --------------- | ----------- | ------------------------------------------- |
| **Usuario**     | Usuario     | Perfil, relaciones de grupo                 |
| **Curso**       | Curso       | Lecciones, Categoría, Evaluaciones          |
| **Inscripción** | Inscripción | Progreso, Evaluación                        |
| **Grupo**       | Grupo       | GrupoEstudiante, GrupoEducador, Asistencias |
| **Institución** | Institución | PeriodoAcademico, EscalaCalificacion        |

---

### LARGO PLAZO (Post F4c)

#### 6. Implementar CQRS

**Esfuerzo:** MUY ALTO (2-3 semanas)

Separar operaciones de lectura (queries) y escritura (commands). Esto permite:

- Lectura desde DB optimizada (replicas, cache)
- Escritura transaccional en DB principal
- Event sourcing opcional
- Reportes en tiempo real

---

## Estrategia de Refactorización

### Fase 1: Foundations (Sprint actual)

1. Crear `BaseRepository` y adaptar `CursosRepository`, `LeccionesRepository`
2. Centralizar schemas compartidos
3. Crear `PolicyEngine` básico

**Inversión:** ~40 horas  
**Riesgo:** BAJO (cambios interiores, APIs sin cambios)

### Fase 2: Communication (Sprint +1)

4. Implementar `EventBus` y `DomainEvent`
5. Migrar módulos principales a eventos (Inscripciones → Notificaciones)

**Inversión:** ~50 horas  
**Riesgo:** MEDIO (cambios de flujo, testing exhaustivo)

### Fase 3: Modeling (Sprint +2)

6. Definir Aggregates y validaciones
7. Implementar Sagas para operaciones complejas (e.g., cierre de ciclo F4c)

**Inversión:** ~60 horas  
**Riesgo:** MEDIO-ALTO (impacto en lógica de negocio)

### Fase 4: Query Optimization (Post F4c)

8. CQRS si el volumen de datos lo justifica

---

## Checklist de Evaluación

- [ ] Refactorizar `CursosService` para usar `CursosRepository`
- [ ] Crear `shared-schemas.ts` con validadores comunes
- [ ] Implementar `PolicyEngine` con 3 políticas principales
- [ ] Crear `EventBus` y test de evento
- [ ] Publicar evento desde `InscripcionesService`
- [ ] Suscribir listener en `NotificacionesModule`
- [ ] Tests de integración de evento
- [ ] Documentar patrones en `docs/architecture/patterns.md`

---

## Diagrama de Dependencias (Actual vs Propuesto)

### Hoy (Acoplado a Prisma)

```
┌─────────────────────┐
│   App Controller    │
└──────────┬──────────┘
           │
    ┌──────┴──────────────────────────────┐
    │                                      │
┌───▼───────────────┐  ┌─────────────────┐
│  JWT Guard        │  │  Roles Guard    │
│  Validation       │  │  @Roles()       │
└───────────────────┘  └─────────────────┘
           ↓
 (18 módulos independientes)
    ↓        ↓         ↓
  Services ─→ PrismaService ← DB

Problem: Services dependen de Prisma, NO pueden comunicarse entre sí
```

### Propuesto (Event-Driven)

```
┌─────────────────────┐
│   App Controller    │
└──────────┬──────────┘
           │
    ┌──────┴──────────────────────────────┐
    │                                      │
┌───▼───────────────┐  ┌─────────────────┐
│  JWT Guard        │  │  Roles Guard    │
│  Validation       │  │  @Roles()       │
└───────────────────┘  └─────────────────┘
           ↓
┌─────────────────────────────────────────┐
│          18 Módulos (desacoplados)      │
├─────────────────────────────────────────┤
│  Services ─→ Repository ─→ Prisma       │
│       ↓            ↑                     │
│   EventBus (async communication)        │
│       ↓            ↓                     │
│  Listeners ←→ Listeners ←→ DB           │
└─────────────────────────────────────────┘
```

---

## Archivos Clave

| Ruta                                          | Propósito                                |
| --------------------------------------------- | ---------------------------------------- |
| `apps/api/src/app.module.ts`                  | Declaración de módulos, guards globales  |
| `apps/api/src/cursos/cursos.service.ts`       | Template de servicio actual              |
| `apps/api/src/lecciones/lecciones.service.ts` | Ejemplo de acoplamiento Prisma           |
| `apps/api/src/uploads/uploads.service.ts`     | Ejemplo de inyección intra-módulo        |
| `apps/api/src/common/guards/`                 | Guards de auth y roles                   |
| `apps/api/src/common/decorators/`             | Decorators @Public, @Roles, @CurrentUser |
| `apps/api/prisma/schema.prisma`               | Definición de aggregates                 |
| `CLAUDE.md`                                   | Patrones y convenciones del proyecto     |

---

## Conclusión

**Diagnóstico:** Arquitectura **clean pero aislada**. Módulos bien estructurados internamente, pero sin mecanismos para comunicarse o compartir lógica transversal.

**Riesgo inmediato:** Con F4c (9 módulos más), sin event-driven o repositories, los servicios crecerán incontroladamente.

**Recomendación:**

1. Implementar **Fase 1** ahora (repositories + validación compartida + policies)
2. **Fase 2** en sprint +1 (eventos)

Esto prepara el camino para F4c sin deuda técnica.

**Esfuerzo total estimado:** ~150 horas en 2 sprints. **ROI: ALTO** — proporciona escalabilidad para los próximos 2 años.

---

**Última Actualización:** 2026-05-21  
**Generado por:** Claude Code  
**Estado:** Listo para implementación por fases
