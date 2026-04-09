-- Migración: Comunidad y Foros base
-- Issue: #86 F5-004
-- Fecha: 2026-04-09
-- Descripción: Crea los modelos base para foros por curso: ForoPost, ForoRespuesta, ReaccionForo, Notificacion

-- ==================================
-- ENUMS
-- ==================================

-- Tipo de publicación en el foro
CREATE TYPE "TipoForoPost" AS ENUM ('PREGUNTA', 'DISCUSION', 'ANUNCIO');

-- Estado de una publicación en el foro
CREATE TYPE "EstadoForoPost" AS ENUM ('PUBLICADO', 'CERRADO', 'ELIMINADO');

-- Tipo de notificación del sistema
CREATE TYPE "TipoNotificacion" AS ENUM ('NUEVA_RESPUESTA', 'SOLUCION_MARCADA', 'PREGUNTA_SIN_RESPONDER');

-- ==================================
-- TABLAS
-- ==================================

-- Publicación en el foro de un curso
CREATE TABLE "foro_posts" (
    "id" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "tipo" "TipoForoPost" NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "estado" "EstadoForoPost" NOT NULL DEFAULT 'PUBLICADO',
    "etiquetas" TEXT[],
    "vistas" INTEGER NOT NULL DEFAULT 0,
    "eliminado" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "foro_posts_pkey" PRIMARY KEY ("id")
);

-- Respuesta a una publicación del foro
CREATE TABLE "foro_respuestas" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "respuestaParentId" TEXT,
    "esSolucion" BOOLEAN NOT NULL DEFAULT false,
    "eliminado" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "foro_respuestas_pkey" PRIMARY KEY ("id")
);

-- Reacción "útil" en una respuesta del foro
CREATE TABLE "reacciones_foro" (
    "id" TEXT NOT NULL,
    "respuestaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reacciones_foro_pkey" PRIMARY KEY ("id")
);

-- Notificación del sistema para un usuario
CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoNotificacion" NOT NULL,
    "postId" TEXT,
    "respuestaId" TEXT,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- ==================================
-- ÍNDICES
-- ==================================

-- foro_posts
CREATE INDEX "foro_posts_cursoId_idx" ON "foro_posts"("cursoId");
CREATE INDEX "foro_posts_autorId_idx" ON "foro_posts"("autorId");
CREATE INDEX "foro_posts_estado_idx" ON "foro_posts"("estado");
CREATE INDEX "foro_posts_tipo_idx" ON "foro_posts"("tipo");

-- foro_respuestas
CREATE INDEX "foro_respuestas_postId_idx" ON "foro_respuestas"("postId");
CREATE INDEX "foro_respuestas_autorId_idx" ON "foro_respuestas"("autorId");
CREATE INDEX "foro_respuestas_respuestaParentId_idx" ON "foro_respuestas"("respuestaParentId");

-- reacciones_foro
CREATE UNIQUE INDEX "reacciones_foro_respuestaId_usuarioId_key" ON "reacciones_foro"("respuestaId", "usuarioId");
CREATE INDEX "reacciones_foro_respuestaId_idx" ON "reacciones_foro"("respuestaId");
CREATE INDEX "reacciones_foro_usuarioId_idx" ON "reacciones_foro"("usuarioId");

-- notificaciones
CREATE INDEX "notificaciones_usuarioId_idx" ON "notificaciones"("usuarioId");
CREATE INDEX "notificaciones_leida_idx" ON "notificaciones"("leida");
CREATE INDEX "notificaciones_tipo_idx" ON "notificaciones"("tipo");

-- ==================================
-- FOREIGN KEYS
-- ==================================

-- foro_posts
ALTER TABLE "foro_posts" ADD CONSTRAINT "foro_posts_cursoId_fkey"
    FOREIGN KEY ("cursoId") REFERENCES "cursos"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "foro_posts" ADD CONSTRAINT "foro_posts_autorId_fkey"
    FOREIGN KEY ("autorId") REFERENCES "usuarios"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- foro_respuestas
ALTER TABLE "foro_respuestas" ADD CONSTRAINT "foro_respuestas_postId_fkey"
    FOREIGN KEY ("postId") REFERENCES "foro_posts"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "foro_respuestas" ADD CONSTRAINT "foro_respuestas_autorId_fkey"
    FOREIGN KEY ("autorId") REFERENCES "usuarios"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "foro_respuestas" ADD CONSTRAINT "foro_respuestas_respuestaParentId_fkey"
    FOREIGN KEY ("respuestaParentId") REFERENCES "foro_respuestas"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- reacciones_foro
ALTER TABLE "reacciones_foro" ADD CONSTRAINT "reacciones_foro_respuestaId_fkey"
    FOREIGN KEY ("respuestaId") REFERENCES "foro_respuestas"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reacciones_foro" ADD CONSTRAINT "reacciones_foro_usuarioId_fkey"
    FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- notificaciones
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuarioId_fkey"
    FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_postId_fkey"
    FOREIGN KEY ("postId") REFERENCES "foro_posts"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_respuestaId_fkey"
    FOREIGN KEY ("respuestaId") REFERENCES "foro_respuestas"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
