# Módulo Notificaciones

## Contrato público

Base path: `notificaciones`

### Endpoints

- `GET /notificaciones`
  - Lista las notificaciones del usuario autenticado.
  - Soporta `page`, `limit` y filtro opcional `leida`.
  - Ordena de la más reciente a la más antigua.

- `PATCH /notificaciones/:id/leida`
  - Marca una notificación del usuario autenticado como leída.
  - Es idempotente: si ya estaba leída, devuelve el mismo recurso.

## Reglas de negocio

- Tipos mínimos soportados: `NUEVA_RESPUESTA` y `SOLUCION_MARCADA`.
- `NUEVA_RESPUESTA` no se duplica si ya existe otra notificación no leída para el mismo `postId` y usuario.
- No se generan notificaciones si el actor y el destinatario son la misma persona.
- Se omiten silenciosamente destinatarios con cuenta desactivada.

## Integraciones

- `ForosService.responderPost` dispara `NUEVA_RESPUESTA`.
- `ForosService.marcarRespuestaComoSolucion` dispara `SOLUCION_MARCADA`.
