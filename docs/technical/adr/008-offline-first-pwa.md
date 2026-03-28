# ADR-008: Estrategia offline-first para la PWA

## Estado

Aceptado

## Fecha

2026-03-28

## Contexto

La visión del proyecto Amauta prioriza acceso universal y uso en contextos con conectividad inestable. Eso hace que “funcionar online solamente” no sea suficiente.

Además, el proyecto ya incorporó capacidades PWA y almacenamiento local para:

- descarga de cursos y lecciones
- caché de assets
- reproducción offline de contenido compatible
- cola de sincronización diferida

La decisión no es cosmética: define cómo se modelan datos, errores, UX y sincronización.

## Opciones Consideradas

### Opción A: Aplicación online-only

- **Pros**:
  - Menor complejidad inicial
  - Menos estados de sincronización
  - Menos superficie de testing
- **Contras**:
  - Incompatible con el propósito social del proyecto
  - Mala experiencia en zonas con conectividad deficiente
  - Hace inviable el consumo continuo de contenidos educativos

### Opción B: Caché básica de assets sin dominio offline

- **Pros**:
  - Implementación moderada
  - Mejora tiempos de carga
- **Contras**:
  - No resuelve continuidad pedagógica sin conexión
  - No cubre progreso local, descargas ni sincronización posterior

### Opción C: Offline-first con PWA, almacenamiento local y sync diferido (elegida)

- **Pros**:
  - Alineado con la visión de accesibilidad universal
  - Permite consumo y avance parcial sin red
  - Hace explícita la resiliencia como requisito arquitectónico
- **Contras**:
  - Aumenta complejidad de estados, conflictos y testing
  - Obliga a diseñar estrategias de caché y sincronización
  - Requiere disciplina documental y técnica

## Decisión

Amauta adopta una estrategia **offline-first** en el frontend web/PWA, basada en:

- **Service Worker / Workbox** para caché de assets y requests compatibles
- **IndexedDB (Dexie)** para datos descargados y cola local
- **Cache API** para contenido multimedia cacheable
- **Background Sync** o fallback equivalente cuando el navegador no lo soporte
- UI explícita de estado offline/sincronización

El backend sigue siendo la fuente de verdad final, pero el frontend puede operar con estado local temporal y sincronizar después.

## Consecuencias

### Positivas

- Refuerza la misión educativa del proyecto.
- Mejora resiliencia frente a cortes de red.
- Permite modelar descargas, progreso y sincronización de manera explícita.

### Negativas

- Hay más complejidad en testing, debugging y manejo de conflictos.
- No todas las operaciones son igualmente aptas para offline.
- Requiere distinguir con cuidado qué se cachea y qué no.

### Neutras

- El frontend deja de ser un simple cliente HTTP y pasa a ser una aplicación con almacenamiento y sincronización local.

## Referencias

- `C:\Users\infor\DevHome\amauta\docs\technical\architecture.md`
- `C:\Users\infor\DevHome\amauta\apps\web\src\lib\db\offline-db.ts`
- `C:\Users\infor\DevHome\amauta\apps\web\src\lib\sync\sync-manager.ts`
- `C:\Users\infor\DevHome\amauta\apps\web\src\lib\offline\video-cache.ts`
- `C:\Users\infor\DevHome\amauta\apps\web\src\components\offline\OfflineBanner.tsx`
