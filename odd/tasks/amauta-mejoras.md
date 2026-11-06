# ODD Plan — Amauta: consolidación técnica y búsqueda

Estado: planificado, sin implementación iniciada.
Repositorio: `/home/ignacio/amauta`
Fuente de análisis: arquitectura actual, documentación del proyecto y estado de Fase 6.

## Specs

### S1 — Consolidación de estado y documentación

> "quiero que uses este analisis para crear un plan con odd para atender las mejoras que creas conveniente"

Amauta necesita una única fuente de verdad para fase, sprint, funcionalidades implementadas, producción y próximos pasos. La documentación de `AGENTS.md`, `docs/project-management/roadmap.md`, `docs/project-management/README.md`, `docs/project-management/project-board.md`, `apps/api/README.md` y `apps/web/README.md` no debe presentar estados incompatibles entre sí.

### S2 — Contrato verificable de búsqueda

El flujo de búsqueda debe tener un contrato explícito y consistente entre endpoint backend, DTOs, proxy Next.js, componentes, estados de UI y tests. El contrato debe definir parámetros, filtros, orden, paginación, resultados vacíos, errores y compatibilidad.

### S3 — Evidencia funcional y de rendimiento

La búsqueda debe auditarse de punta a punta antes de optimizarse. La decisión entre mantener la estrategia actual, agregar índices o implementar PostgreSQL full-text search debe basarse en tests, consultas observadas, volumen representativo y mediciones reproducibles.

### S4 — Contrato operativo de Redis

El proyecto debe documentar si Redis es una dependencia utilizada actualmente, una capacidad preparada o una infraestructura futura. No se incorporará caché de búsqueda ni otra dependencia crítica sin definir invalidación, TTL, comportamiento ante caída, observabilidad y pruebas.

### S5 — Cobertura de riesgos críticos

La cobertura debe priorizar contratos y regresiones relevantes: búsqueda backend, serialización del proxy, estados de UI, flujo E2E mínimo y soft delete de lecciones cuando su dependencia de implementación esté disponible. No se perseguirá cobertura porcentual sin valor funcional.

## Tasks

### T1 — Elegir fuente de verdad y limpiar estados documentales

- Estado: completado
- Spec: S1
- Ruta: documentación y gestión del proyecto
- Dependencias: ninguna
- Entregables:
  - Inventario de contradicciones y estados sin evidencia.
  - Decisión documentada de fuente canónica.
  - Actualización coordinada de `AGENTS.md`, roadmap, board, README técnico de API y README técnico de web.
  - Conservación explícita de historial cuando una métrica vieja no pueda reemplazarse con seguridad.
- Criterio de cierre: ningún documento principal declara una fase o capacidad incompatible con la fuente canónica.
- Verificación: revisión cruzada de enlaces, fechas, fase actual y funcionalidades implementadas.
- Riesgo: item 3 — los documentos son contratos de orientación para colaboradores y pueden inducir trabajo incorrecto.
- Evidencia: revisión cruzada de los encabezados de estado, enlaces al roadmap y claims obsoletos en los ocho archivos autorizados; checks estructurales ejecutados sobre la documentación modificada.
- Commit: pendiente (no se realizó commit)

### T2 — Mapear el contrato actual de búsqueda

- Spec: S2
- Ruta: `apps/api/src/cursos`, `apps/web/src/app`, `apps/web/src/components`, documentación y tests de búsqueda
- Dependencias: T1
- Entregables:
  - Matriz endpoint → DTO → proxy → componente → test.
  - Inventario de parámetros, filtros, orden, paginación, errores y estados vacíos.
  - Identificación de cualquier diferencia entre diseño funcional, implementación y comportamiento probado.
  - Propuesta de contrato compartido sin cambiar todavía la semántica pública.
- Criterio de cierre: cada comportamiento observable de búsqueda tiene una fuente y un test o una brecha registrada.
- Verificación: lectura del flujo completo y tests existentes ejecutados sin modificaciones funcionales.
- Riesgo: item 3 — cambios de nombres o semántica pueden romper consumidores existentes.
- Commit: pendiente

### T3 — Auditar búsqueda funcionalmente y establecer baseline

- Spec: S3
- Ruta: búsqueda backend, proxy/frontend y `apps/e2e`
- Dependencias: T2
- Entregables:
  - Tests de texto, filtros combinados, orden, paginación, sin resultados y errores.
  - Smoke E2E catálogo → búsqueda → resultado → detalle.
  - Registro de consultas generadas, índices involucrados y latencia en un entorno reproducible.
  - Baseline con datos representativos, sin modificar producción.
- Criterio de cierre: se conoce qué funciona, qué falla y cuál es el costo actual antes de elegir una optimización.
- Verificación: tests públicos, type-check, lint y medición documentada.
- Riesgo: item 6 — el resultado depende del entorno y de datos representativos; no se debe extrapolar sin evidencia.
- Commit: pendiente

### T4 — Decidir y aplicar la estrategia de búsqueda

- Spec: S2-S3
- Ruta: backend, Prisma/migraciones si corresponde, documentación y tests
- Dependencias: T3
- Entregables:
  - ADR breve con decisión: mantener `contains`, agregar índices o implementar PostgreSQL FTS.
  - Si se modifica la consulta: migración versionada cuando corresponda, preservación del orden de relevancia y paginación eficiente.
  - Tests de regresión para el contrato público.
  - Comparación antes/después con el baseline.
- Criterio de cierre: la estrategia elegida mejora o preserva comportamiento y tiene evidencia de rendimiento suficiente.
- Verificación: tests críticos, migración validada, `EXPLAIN ANALYZE` en entorno autorizado y comparación de salida.
- Riesgo: item 1 — cambios de índices, consultas o formatos pueden afectar datos y rendimiento; item 3 — búsqueda es contrato público.
- Commit: pendiente

### T5 — Definir contratos compartidos mínimos

- Spec: S2
- Ruta: `packages/shared`, `packages/types`, DTOs y tipos del frontend
- Dependencias: T2
- Entregables:
  - Decisión sobre qué contratos son canónicos y dónde viven.
  - Tipos/validaciones compartidas solamente para parámetros y respuestas estabilizados.
  - Eliminación gradual de duplicación, sin convertir todo Prisma en contrato público.
  - Tests de compatibilidad del contrato.
- Criterio de cierre: frontend y backend consumen una representación única de los contratos incorporados en este task.
- Verificación: type-check de todos los workspaces y tests de API/web.
- Riesgo: item 3 — modificar tipos compartidos puede alterar consumidores no incluidos inicialmente.
- Commit: pendiente

### T6 — Aclarar el rol operativo de Redis

- Spec: S4
- Ruta: `docker-compose.yml`, `apps/api`, README técnico y documentación de arquitectura
- Dependencias: T1; T3 como evidencia para cualquier uso en búsqueda
- Entregables:
  - Inventario de usos reales y dependencias.
  - ADR sobre caché, sesiones, rate limiting, colas o estado de “preparado”.
  - Comportamiento documentado ante caída, TTL, claves, invalidación y observabilidad si existe uso real.
  - Explicitación de lo que queda fuera de alcance.
- Criterio de cierre: un colaborador puede saber si Redis es obligatorio para desarrollo, test, producción y qué ocurre si no está disponible.
- Verificación: revisión de configuración y prueba funcional únicamente si existe integración real.
- Riesgo: item 6 — declarar una dependencia crítica sin evidencia puede bloquear entornos o esconder fallos.
- Commit: pendiente

### T7 — Cubrir huecos críticos de pruebas

- Spec: S5
- Ruta: tests de API, web y E2E; soft delete cuando esté implementado
- Dependencias: T3 para búsqueda; dependencia de soft delete según `.sdd/proposal-backend/TASKS.md`
- Entregables:
  - Pruebas backend de contrato y errores de búsqueda.
  - Pruebas de proxy y estados loading/empty/error.
  - Flujo E2E mínimo.
  - Pruebas de soft delete de lecciones cuando la implementación y migración estén disponibles.
  - Corrección de tests que dependan de mocks sin validar efectos observables.
- Criterio de cierre: cada regla prioritaria prueba salida, error, efectos observables y ausencia de mutación en entradas rechazadas.
- Verificación: tests focalizados, `test:all`, type-check, lint y build cuando sean aplicables.
- Riesgo: item 6 — un test que no cubra el comportamiento observable no ofrece evidencia suficiente.
- Commit: pendiente

### T8 — Cerrar documentación con evidencia

- Spec: S1-S5
- Ruta: documentación de gestión, ADRs y README técnicos
- Dependencias: T4, T5, T6 y T7
- Entregables:
  - Estado final de cada task con enlaces a commits, tests y decisiones.
  - Roadmap y board alineados con evidencia real.
  - Registro de pendientes explícitos y decisiones postergadas.
- Criterio de cierre: el estado documental se puede reconstruir desde commits y verificaciones, sin depender de memoria de la conversación.
- Verificación: revisión final de consistencia y enlaces.
- Riesgo: none
- Commit: pendiente

## Orden ODD y gates

1. **Autorizar y entender:** este documento define planificación; no autoriza cambios de producción, despliegue, migraciones aplicadas sobre datos reales, publicación, push ni PR.
2. **T1 — Consolidar estado:** primero se corrige la fuente de verdad documental.
3. **T2 — Contrato de búsqueda:** se fija qué comportamiento debe preservarse.
4. **T3 — Evidencia:** se mide la implementación actual antes de optimizar.
5. **Gate de decisión:** T4 solo comienza después de revisar el baseline y elegir explícitamente la estrategia.
6. **T5 — Contratos compartidos:** se implementa únicamente el subconjunto estabilizado por T2-T3.
7. **T6 — Redis:** se documenta primero; cualquier implementación queda separada y requiere evidencia.
8. **T7 — Verificación:** tests y checks se agregan junto con cada comportamiento, no como una etapa de cobertura mecánica.
9. **T8 — Cierre:** se actualiza el estado y se registran evidencias.

## Definición de terminado global

- La documentación principal tiene una fuente de verdad única.
- La búsqueda tiene contrato, pruebas funcionales y baseline de rendimiento.
- Toda optimización está justificada por mediciones y mantiene el contrato público.
- Redis tiene una responsabilidad operativa explícita o está marcado como infraestructura futura.
- Los contratos compartidos reducen duplicación sin exponer modelos internos de persistencia.
- Los checks aplicables pasan y los fallos o verificadores no disponibles quedan registrados como blockers.
- Cada task tiene un commit trazable cuando se implemente.

## Log

### L1

> "quiero que uses este analisis para crear un plan con odd para atender las mejoras que creas conveniente"

El análisis inicial identificó una arquitectura funcional pero con desalineación entre código y documentación, una búsqueda que requiere auditoría funcional y de rendimiento, paquetes compartidos mínimos, uso incierto de Redis y cobertura crítica por reforzar. Este plan prioriza consolidar evidencia y contratos antes de introducir optimizaciones o nuevas dependencias.
