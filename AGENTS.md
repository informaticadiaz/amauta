# AGENTS.md

## Amauta

Amauta es un sistema educativo para la gestión del aprendizaje. Su visión está en `README.md`: la educación es un derecho social, con acceso universal y enfoque offline-first. El contexto de este archivo aplica únicamente a `/home/ignacio/amauta`.

## Fuentes canónicas

- **Visión y principios:** `README.md`.
- **Estado de producto, fases y sprint:** `docs/project-management/roadmap.md`.
- **Proceso de trabajo con issues:** `WORKFLOW.md`.
- **Estado operativo de esta sesión y del workspace:** `CODEX_STATE.md`.
- **Arquitectura y decisiones técnicas:** `docs/technical/`.
- **Contexto de IA y patrones:** `docs/ai-context/`.
- **Documentación funcional del sistema:** `docs/sistema/`.

No dupliques en este archivo el historial completo de fases, el backlog ni la implementación de cada funcionalidad. Cuando exista una diferencia entre documentos, el roadmap es la autoridad para el estado del producto y el código/tests son la autoridad para la implementación verificable.

## Desarrollo ordenado

Antes de implementar una feature nueva:

1. Leer `README.md` para entender la visión.
2. Leer la sección correspondiente de `docs/project-management/roadmap.md`.
3. Leer `WORKFLOW.md` si el trabajo corresponde a un issue.
4. Consultar la documentación técnica y de contexto del módulo afectado.
5. Definir criterios de aceptación observables y pruebas antes de cambiar código cuando exista un runner aplicable.

Para trabajo de varios pasos, usar el plan ODD en `odd/tasks/` y mantener sincronizados el documento de tarea, el estado operativo y la lista visible de tareas. No modificar producción, publicar, crear PR ni hacer push salvo autorización explícita.

## Stack y estructura

- Monorepo Turborepo con `apps/web` (Next.js/App Router) y `apps/api` (NestJS + Fastify).
- Packages compartidos en `packages/`.
- TypeScript en modo strict.
- PostgreSQL y Prisma para persistencia.
- Redis está preparado como infraestructura opcional; la API actual no debe asumirlo como dependencia sin una decisión documentada.
- Deployment documentado en Dokploy; los servicios públicos son `https://amauta.diazignacio.ar` y `https://amauta-api.diazignacio.ar`.

## Base de datos y Prisma — reglas obligatorias

El entorno habitual no tiene una base local: PostgreSQL está en el VPS y los comandos Prisma pueden afectar producción.

- Antes de cualquier trabajo sobre Prisma, leer `docs/ai-context/database/schema.md` y `apps/api/prisma/schema.prisma`.
- Antes de cambiar el schema, ejecutar `npx prisma migrate status`.
- Todo cambio en `apps/api/prisma/schema.prisma` requiere una migración versionada en `apps/api/prisma/migrations/`.
- Después de cambiar el schema, ejecutar `npx prisma validate`.
- Revisar el SQL generado antes de aplicar una migración.
- En producción, usar únicamente `npx prisma migrate deploy` como flujo normal.
- No usar `prisma db push` como sustituto de migraciones.
- Si aparece drift o desalineación entre base y schema, detenerse y resolverlo antes de continuar.
- No eliminar físicamente datos cuando el dominio exige soft delete.

## Patrones de código

- Para validación Zod usar `safeParse`; no usar `parse` directamente en endpoints.
- Verificar nombres, relaciones, tipos y enums en el schema antes de escribir queries Prisma.
- Mantener contratos públicos de respuesta consistentes: respuestas singulares incluyen el recurso y el mensaje; listas incluyen colección, total y paginación cuando corresponda.
- Al tocar una opción, parser, helper o contrato compartido, verificar también los consumidores existentes no mencionados por la tarea.
- Los cambios de comandos, opciones o mensajes deben actualizar ayuda, documentación y tests correspondientes.

## Frontend y backend

Antes de crear o modificar un endpoint, leer `docs/ai-context/_patterns.md` y el contexto del módulo en `docs/ai-context/modules/`. Para páginas, formularios, hooks o componentes, consultar `docs/ai-context/frontend/` y los patrones existentes.

Los tests deben comprobar efectos observables a través de la interfaz pública: código de salida o respuesta, stdout/stderr cuando corresponda, mensajes, estados y persistencia. Los casos nombrados por el requisito —incluidos límites, errores, entradas rechazadas y estados vacíos— deben quedar cubiertos cuando sean aplicables.

## Documentación funcional

Al completar una funcionalidad:

- actualizar `docs/sistema/` cuando cambie la comprensión funcional del sistema;
- mantener `docs/technical/` para arquitectura, instalación, testing y operación;
- actualizar el roadmap sólo con evidencia de implementación/verificación y respetando su fuente canónica;
- registrar decisiones duraderas en el plan ODD o en el documento técnico adecuado, no en este archivo como historial.

## Convenciones de trabajo

- Documentación y comunicación del repositorio: español, salvo que una herramienta o formato existente exija otro idioma.
- Antes de commit, ejecutar el equivalente de `lint-staged`: ESLint/prettier para código y Prettier para Markdown/JSON/YAML.
- Los commits del proyecto usan mensajes descriptivos en español y referencian el issue cuando existe.
- No incluir secretos, credenciales, tokens, datos privados ni `.env` en documentación o Git.
- Preservar cambios existentes no relacionados; no usar reset, clean ni restauraciones masivas para resolver conflictos.

## Contexto específico para IA

La carga mínima previa a escribir código es:

- visión: `README.md`;
- estado: `CODEX_STATE.md` y `docs/project-management/roadmap.md`;
- reglas: este archivo y `WORKFLOW.md`;
- datos: `docs/ai-context/database/schema.md` y schema Prisma cuando corresponda;
- módulo o frontend afectado: el contexto específico disponible en `docs/ai-context/`.

Las skills de generación y calidad están bajo `ia-skills/`; sus instrucciones se leen sólo cuando la tarea activa las necesita. No inventar módulos, campos, enums, permisos ni rutas.

## No confundir fuentes

- `CODEX_STATE.md` registra continuidad operativa; no reemplaza el roadmap.
- `docs/project-management/roadmap.md` registra planificación; no prueba por sí solo que una feature esté implementada.
- Los README describen orientación o implementación documentada; no deben convertirse en un segundo backlog.
- Los informes de auditoría y documentos ODD conservan evidencia e historial; no sustituyen las fuentes canónicas.
