# ADR-010: Mantener la estrategia de búsqueda del catálogo hasta contar con evidencia representativa

## Estado

Aceptado

## Fecha

2026-11-12

## Contexto

El catálogo público busca en `titulo` y `descripcion` usando `contains` insensible a mayúsculas. Cuando se solicita relevancia, la API recupera las coincidencias, prioriza las coincidencias en el título y pagina después en memoria.

La baseline de T3 verificó el contrato funcional, la API, el catálogo público y el flujo headless en un entorno local. También registró `EXPLAIN ANALYZE`: con cuatro cursos, la consulta textual terminó en 0.237 ms usando el índice de estado y aplicando el filtro textual después. Ese volumen no permite extrapolar comportamiento de producción.

## Opciones consideradas

### Opción A: Mantener `contains` y la relevancia actual

- **Pros**: no cambia el contrato público, no requiere migración ni extensiones, y conserva el orden observado.
- **Contras**: la búsqueda textual con comodín inicial no aprovecha un B-tree convencional; la ruta de relevancia carga todas las coincidencias y pagina en memoria.

### Opción B: Agregar índices convencionales

- **Pros**: puede mejorar el listado publicado ordenado por fecha o filtros selectivos.
- **Contras**: no resuelve directamente `contains` sobre título/descripción y agrega costo de escritura sin evidencia de que ese sea el cuello de botella.

### Opción C: Implementar PostgreSQL FTS o trigram

- **Pros**: ofrece una ruta de escalabilidad para búsquedas textuales y puede aprovechar capacidades preparadas en el entorno local.
- **Contras**: requiere migración y SQL revisado, garantizar extensiones en cada entorno, definir actualización/reconstrucción del índice y preservar semántica de relevancia, acentos, coincidencias parciales y paginación.

## Decisión

Adoptamos la **Opción A** por ahora:

1. Se mantiene `contains` y la semántica actual de relevancia.
2. No se agregan índices ni extensiones de búsqueda sin una medición con un volumen representativo.
3. El contrato público se refuerza con tests de controller, filtros, orden, paginación y regresiones del servicio.
4. La página del catálogo consume el endpoint específico `/cursos/buscar` para que la medición y el contrato observado sean los mismos en backend y frontend.
5. Se reevalúa trigram o FTS cuando el catálogo tenga datos representativos o las mediciones demuestren degradación.

## Consecuencias

### Positivas

- Evita una migración prematura y cambios visibles en resultados.
- Mantiene compatibilidad con Prisma y PostgreSQL actuales.
- Deja una baseline reproducible y un criterio explícito para cambiar de estrategia.
- Alinea la página con el endpoint público de búsqueda.

### Negativas

- La ruta de relevancia continúa ordenando coincidencias en memoria.
- La baseline actual no demuestra escalabilidad para grandes volúmenes.
- La futura adopción de trigram/FTS requerirá una migración y una nueva comparación antes/después.

### Neutras

- Redis queda fuera de esta decisión: T6 documenta su rol operativo por separado.

## Referencias

- `odd/tasks/amauta-mejoras.md`, T3-T4
- `odd/evidence/search-baseline-t3.txt`
- `apps/api/src/cursos/cursos.service.ts`
- `apps/api/src/cursos/dto/busqueda-cursos.dto.ts`
- `apps/web/src/app/cursos/page.tsx`
