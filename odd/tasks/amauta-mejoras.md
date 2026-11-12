# ODD Plan — Amauta: consolidación técnica y búsqueda

Estado: en curso; T1, T2, T3 y T4 realizados con evidencia local; próximo trabajo: T5. Fase 4c iniciada con implementación de F4c-001.
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

- Estado: completado
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
- Evidencia:
  - Backend: `apps/api/src/cursos/cursos.controller.ts:80-93`, `apps/api/src/cursos/dto/busqueda-cursos.dto.ts:3-16` y `apps/api/src/cursos/cursos.service.ts:609-731`.
  - Frontend: `apps/web/src/app/cursos/page.tsx:54-105`, `apps/web/src/components/catalogo/BuscadorCursos.tsx`, `FiltrosCursos.tsx`, `PaginacionCursos.tsx` y `CatalogoCursos.tsx`.
  - Diseño funcional: `docs/project-management/fase-6-diseno-funcional-busqueda.md:43-148`.
  - Tests: `apps/api/src/cursos/cursos.service.spec.ts:583-701` y suites de `apps/web/src/components/catalogo/__tests__/`.
- Matriz resumida:
  - `GET /api/v1/cursos/buscar` → `BusquedaCursosDto` → `buscarCursos` → sin proxy GET dedicado → catálogo y componentes → cobertura parcial del service y componentes.
  - Parámetros backend: `page`, `limit`, `buscar`, `categoriaId`, `nivel`, `duracion`, `idioma`, `ordenarPor`, `orden`. La UI solo conserva `page`, `buscar`, `categoriaId`, `nivel`, `ordenarPor` y `orden`.
  - Respuesta: `{ cursos, total, page, limit, totalPages }`; los cursos incluyen relaciones de educador/categoría y contadores según la consulta backend.
  - Orden: backend define `publicadoEn` sin búsqueda y relevancia con búsqueda; la UI llama `GET /cursos`, cuya semántica de listado general no coincide con ese contrato.
  - Vacíos y errores: el backend distingue lista vacía válida de error de validación; la página captura errores y los convierte en una lista vacía, mientras el componente muestra un único estado vacío.
- Brechas registradas:
  1. La página de catálogo usa `GET /cursos?estado=PUBLICADO` en lugar de `GET /cursos/buscar`.
  2. `duracion`, `idioma` y el selector de orden exigido por el diseño funcional no están disponibles en la UI.
  3. La UI no diferencia catálogo sin cursos, búsqueda sin resultados y error de carga.
  4. No hay test de integración página → API ni test del método `controller.buscar`; la cobertura del service no cubre todos los filtros, límites, desempates, orden explícito ni paginación de relevancia.
  5. La implementación de relevancia prioriza coincidencias literales en título y pagina en memoria; requiere decisión posterior basada en evidencia, no un cambio dentro de T2.
- Propuesta de contrato compartido: estabilizar primero el contrato público de `GET /cursos/buscar` y sus estados observables; no extraer tipos ni cambiar nombres hasta completar T3 y resolver la divergencia entre catálogo y endpoint.
- Commit: pendiente

### T3 — Auditar búsqueda funcionalmente y establecer baseline

- Estado: completado
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
- Resultado parcial: tests focalizados API (2 suites, 51 tests) y catálogo web (5 suites, 58 tests) pasan. La infraestructura local ya quedó disponible: PostgreSQL 15 y Redis 7 saludables, migraciones aplicadas y seed corregido ejecutado con 40 asistencias, 16 calificaciones y 4 comunicados. La baseline API funcional pasó con búsquedas de texto, filtros combinados, sin resultados, paginación y validación; latencias locales observadas: 3–9 ms.
- Resultado final: baseline API/SQL y smoke E2E headless completados. PostgreSQL 15 y Redis 7 saludables; migraciones y seed local correctos; búsquedas funcionales; SQL e índices registrados; catálogo público y detalle verificados.
- Hallazgo corregido: `/cursos` y `/cursos/*` quedaron públicos en `apps/web/src/proxy.ts`, alineados con la documentación.
- Limitación: el runner estándar no pudo instalar su revisión Chromium en `ubuntu26.04-x64`; el smoke se ejecutó con Playwright headless usando el Chromium compatible ya instalado y `executablePath` explícito.
- Evidencia: `odd/evidence/search-baseline-t3.txt`.
- Riesgo: item 6 — el resultado depende del entorno y de datos representativos; no se debe extrapolar sin evidencia.
- Commit: `7a008a0`

### T4 — Decidir y aplicar la estrategia de búsqueda

- Estado: completado
- Spec: S2-S3
- Ruta: backend, Prisma/migraciones si corresponde, documentación y tests
- Dependencias: T3
- Entregables:
  - ADR breve con decisión: mantener `contains`, agregar índices o implementar PostgreSQL FTS.
  - Si se modifica la consulta: migración versionada cuando corresponda, preservación del orden de relevancia y paginación eficiente.
  - Tests de regresión para el contrato público.
  - Comparación antes/después con el baseline.
- Resultado: se acepta mantener `contains` y la relevancia actual por ahora. No se agregan índices ni migraciones porque la evidencia disponible representa solo cuatro cursos y no demuestra un cuello de botella. La página del catálogo se alinea con `/cursos/buscar`; se agregan regresiones de controller y servicio.
- Criterio de cierre: la estrategia elegida mejora o preserva comportamiento y tiene evidencia de rendimiento suficiente.
- Verificación: 55 tests API focalizados, 58 tests web de catálogo, type-check y lint web; baseline SQL preservado y ADR registrado.
- Evidencia: `docs/technical/adr/010-estrategia-busqueda-catalogo.md` y `odd/evidence/search-strategy-t4.txt`.
- Riesgo: item 3 — búsqueda es contrato público; la decisión se limita al volumen medido y debe reabrirse con datos representativos.
- Commit: `e97d237`

### T5 — Definir contratos compartidos mínimos

- Estado: completado
- Spec: S2
- Ruta: `packages/shared`, `packages/types`, DTOs y tipos del frontend
- Dependencias: T2
- Entregables:
  - Decisión sobre qué contratos son canónicos y dónde viven.
  - Tipos/validaciones compartidas solamente para parámetros y respuestas estabilizados.
  - Eliminación gradual de duplicación, sin convertir todo Prisma en contrato público.
  - Tests de compatibilidad del contrato.
- Resultado: `@amauta/types` concentra los tipos wire de búsqueda y catálogo; `@amauta/shared` concentra la validación Zod de `GET /cursos/buscar`. El backend y el frontend consumen esos contratos sin duplicar las interfaces del catálogo.
- Criterio de cierre: frontend y backend consumen una representación única de los contratos incorporados en este task.
- Verificación: builds de packages, type-check de types/shared/API/web, lint de types/shared/API/web, 55 tests API focalizados, 58 tests web de catálogo y `git diff --check` aprobados.
- Riesgo: item 3 — modificar tipos compartidos puede alterar consumidores no incluidos inicialmente; el alcance se limitó al contrato estabilizado de búsqueda.
- Evidencia: `odd/evidence/search-contract-t5.txt`.
- Commit: `116d0ff`

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

### L2

> "2"

Se completó T2 mediante lectura del flujo backend/frontend, documentación funcional y tests existentes. Se registró la matriz del contrato actual y las brechas sin modificar todavía la semántica pública ni el código de producción. La divergencia principal es que el catálogo Next.js consume `GET /cursos` mientras el contrato enriquecido de búsqueda vive en `GET /cursos/buscar`; T3 debe aportar evidencia funcional y baseline antes de decidir una corrección.

La verificación focalizada pasó sin cambios funcionales: API `cursos.service.spec.ts` y `cursos.controller.spec.ts` (51 tests), más las cuatro suites de catálogo web (47 tests). La cobertura existente confirma componentes y servicio, pero no cubre la integración página → API ni los estados de error diferenciados.

### L3

Se inició T3 y se confirmó que existen tests E2E generales, pero ninguno específico de búsqueda (`apps/e2e/tests/api` y `apps/e2e/tests/frontend`). Se autorizó un entorno local aislado, pero Docker Compose no pudo iniciar PostgreSQL porque el daemon Docker no está disponible (`/var/run/docker.sock`). No se usó producción ni se modificó código funcional. El baseline queda bloqueado hasta disponer de un entorno local operativo o staging no productivo.

### L4

La revisión del historial reciente y del último issue cerrado corrigió el estado documental del proyecto. El último issue cerrado es #104 (F4b-004), pero los commits posteriores `feat(materias): incorporar catalogo escolar y calificaciones` y `feat(materias): agregar gestion escolar en la web` muestran que Fase 4c ya comenzó y que F4c-001 tiene implementación en el repositorio. El roadmap y `AGENTS.md` ahora distinguen implementación existente de cierre formal del issue y verificación pendiente.

### L5

Se retomó T3 con una exploración acotada y checks focalizados, sin modificar código funcional ni consultar producción. Los tests del servicio/controlador de cursos pasaron: 2 suites y 51 tests. Las suites del catálogo web pasaron mediante `test:ci`: 5 suites y 58 tests. La ejecución inicial del script web con `--watch` agotó el timeout aunque las suites habían pasado; se repitió correctamente en modo CI y quedó confirmada. `docker info` confirma que el cliente 29.8.2 existe, pero el daemon no está disponible (`/var/run/docker.sock` inexistente). Por eso T3 permanece bloqueado: todavía faltan base local aislada, datos representativos, E2E, consultas SQL, índices y latencias. La evidencia quedó en `odd/evidence/search-baseline-t3.txt`. La página de catálogo sigue consumiendo `/cursos` en lugar de `/cursos/buscar`; esto se registra como hallazgo de T3, no se corrige dentro de la baseline.

### L6

El daemon Docker fue iniciado por el usuario y PostgreSQL 15/Redis 7 quedaron saludables. `prisma migrate deploy` pasó contra `amauta_dev`. El seed administrativo falló inicialmente por usar campos obsoletos (`materia` y `periodo`) frente al schema actual (`materiaId` y `periodoAcademicoId`); se corrigió `apps/api/prisma/seeds/administrativo.ts` sin cambiar el schema ni producción. El seed corregido pasó con 40 asistencias, 16 calificaciones y 4 comunicados. API type-check y lint pasaron. La API local quedó saludable en `localhost:3101` y la baseline funcional de búsqueda pasó con texto, filtro combinado, sin resultados, paginación y validación, con latencias observadas de 3–9 ms. La Web arrancó en `localhost:3002` porque `3000` estaba ocupado; `/cursos` redirige a login sin sesión, confirmando una brecha en `apps/web/src/proxy.ts` respecto del catálogo documentado como público. Playwright no pudo ejecutar porque falta el navegador Chromium local; no se descargó. T3 sigue abierto hasta resolver el E2E y decidir cómo tratar la visibilidad pública del catálogo. No se registraron SQL/índices/EXPLAIN ANALYZE.

### L7

Se decidió que el catálogo debe ser público. Se modificó `apps/web/src/proxy.ts` para permitir `/cursos` y `/cursos/*` sin sesión. La verificación HTTP local pasó: catálogo HTTP 200 con `Catálogo de Cursos` y `Álgebra Básica`; detalle `algebra-basica` HTTP 200. Web type-check, lint y las 5 suites del catálogo (58 tests) pasaron. La instalación autorizada de Chromium para Playwright falló porque el entorno `ubuntu26.04-x64` no es compatible con ese navegador; no se reintentó ni se cambió de navegador. El smoke E2E queda bloqueado por capacidad no disponible, mientras la evidencia HTTP y SQL queda registrada.

### L8

Se completó el smoke E2E con Playwright en modo headless usando el Chromium compatible ya instalado en `/home/ignacio/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`. El flujo verificó catálogo público, búsqueda de `Álgebra`, resultado visible y navegación exacta a `/cursos/algebra-basica`, con título `Álgebra Básica | Amauta`. T3 queda completado. T4 sigue pendiente del gate de decisión sobre mantener la consulta actual, agregar índices o implementar PostgreSQL full-text search; no se tomó esa decisión con solo cuatro cursos locales.

### L9

Se completó T4 aceptando la estrategia actual de `contains` y relevancia en memoria como decisión de bajo riesgo, documentada en ADR-010. No se agregaron índices ni migraciones: la baseline de 4 cursos y los `EXPLAIN ANALYZE` de T3 no justifican un cambio de esquema o de semántica. Se alineó `apps/web/src/app/cursos/page.tsx` con `/cursos/buscar` y se agregaron regresiones del controller y servicio para filtros, paginación y prioridad de título. Pasaron 55 tests API focalizados, 58 tests web de catálogo, type-check y lint web. La evidencia quedó en `odd/evidence/search-strategy-t4.txt`. El commit queda pendiente.
