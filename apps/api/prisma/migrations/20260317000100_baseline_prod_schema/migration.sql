-- Baseline reconstructed from the schema currently deployed in production on 2026-03-17.
-- This migration is intended to be marked as already applied in environments where
-- the schema already exists, so Prisma regains a versioned migration history.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ESTUDIANTE', 'EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "Nivel" AS ENUM ('PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO');

-- CreateEnum
CREATE TYPE "EstadoCurso" AS ENUM ('BORRADOR', 'REVISION', 'PUBLICADO', 'ARCHIVADO');

-- CreateEnum
CREATE TYPE "TipoLeccion" AS ENUM ('VIDEO', 'TEXTO', 'QUIZ', 'INTERACTIVO', 'DESCARGABLE');

-- CreateEnum
CREATE TYPE "EstadoInscripcion" AS ENUM ('ACTIVO', 'COMPLETADO', 'ABANDONADO');

-- CreateEnum
CREATE TYPE "TipoInstitucion" AS ENUM ('ESCUELA', 'COLEGIO', 'UNIVERSIDAD', 'CENTRO_FORMACION');

-- CreateEnum
CREATE TYPE "EstadoAsistencia" AS ENUM ('PRESENTE', 'AUSENTE', 'TARDANZA', 'JUSTIFICADO');

-- CreateEnum
CREATE TYPE "TipoComunicado" AS ENUM ('GENERAL', 'ACADEMICO', 'ADMINISTRATIVO', 'EVENTO', 'URGENTE');

-- CreateEnum
CREATE TYPE "Prioridad" AS ENUM ('BAJA', 'NORMAL', 'ALTA', 'URGENTE');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'ESTUDIANTE',
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "emailVerificado" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfiles" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "bio" TEXT,
    "telefono" TEXT,
    "pais" TEXT,
    "ciudad" TEXT,
    "institucion" TEXT,
    "matricula" TEXT,
    "grado" TEXT,
    "especialidad" TEXT[],
    "experiencia" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "icono" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cursos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "educadorId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "nivel" "Nivel" NOT NULL,
    "estado" "EstadoCurso" NOT NULL DEFAULT 'BORRADOR',
    "imagen" TEXT,
    "duracion" INTEGER,
    "idioma" TEXT NOT NULL DEFAULT 'es',
    "publicadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecciones" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL,
    "cursoId" TEXT NOT NULL,
    "tipo" "TipoLeccion" NOT NULL,
    "duracion" INTEGER,
    "contenido" JSONB NOT NULL,
    "publicada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lecciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recursos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tamano" INTEGER,
    "leccionId" TEXT NOT NULL,
    "disponibleOffline" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscripciones" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "estado" "EstadoInscripcion" NOT NULL DEFAULT 'ACTIVO',
    "progreso" INTEGER NOT NULL DEFAULT 0,
    "inscritoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completadoEn" TIMESTAMP(3),

    CONSTRAINT "inscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progresos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "leccionId" TEXT NOT NULL,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "porcentaje" INTEGER NOT NULL DEFAULT 0,
    "ultimoAcceso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completadoEn" TIMESTAMP(3),
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "mejorPuntaje" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progresos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instituciones" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoInstitucion" NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instituciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "grado" TEXT,
    "seccion" TEXT,
    "institucionId" TEXT NOT NULL,
    "educadorId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos_estudiantes" (
    "grupoId" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "inscritoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grupos_estudiantes_pkey" PRIMARY KEY ("grupoId","estudianteId")
);

-- CreateTable
CREATE TABLE "asistencias" (
    "id" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoAsistencia" NOT NULL,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calificaciones" (
    "id" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "materia" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "nota" DOUBLE PRECISION NOT NULL,
    "notaMaxima" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comunicados" (
    "id" TEXT NOT NULL,
    "institucionId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "tipo" "TipoComunicado" NOT NULL,
    "prioridad" "Prioridad" NOT NULL DEFAULT 'NORMAL',
    "publicadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comunicados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_email_idx" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_rol_idx" ON "usuarios"("rol");

-- CreateIndex
CREATE UNIQUE INDEX "perfiles_usuarioId_key" ON "perfiles"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_key" ON "categorias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_slug_key" ON "categorias"("slug");

-- CreateIndex
CREATE INDEX "categorias_slug_idx" ON "categorias"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cursos_slug_key" ON "cursos"("slug");

-- CreateIndex
CREATE INDEX "cursos_educadorId_idx" ON "cursos"("educadorId");

-- CreateIndex
CREATE INDEX "cursos_categoriaId_idx" ON "cursos"("categoriaId");

-- CreateIndex
CREATE INDEX "cursos_estado_idx" ON "cursos"("estado");

-- CreateIndex
CREATE INDEX "cursos_slug_idx" ON "cursos"("slug");

-- CreateIndex
CREATE INDEX "lecciones_cursoId_idx" ON "lecciones"("cursoId");

-- CreateIndex
CREATE INDEX "lecciones_orden_idx" ON "lecciones"("orden");

-- CreateIndex
CREATE INDEX "recursos_leccionId_idx" ON "recursos"("leccionId");

-- CreateIndex
CREATE INDEX "inscripciones_usuarioId_idx" ON "inscripciones"("usuarioId");

-- CreateIndex
CREATE INDEX "inscripciones_cursoId_idx" ON "inscripciones"("cursoId");

-- CreateIndex
CREATE UNIQUE INDEX "inscripciones_usuarioId_cursoId_key" ON "inscripciones"("usuarioId", "cursoId");

-- CreateIndex
CREATE INDEX "progresos_usuarioId_idx" ON "progresos"("usuarioId");

-- CreateIndex
CREATE INDEX "progresos_leccionId_idx" ON "progresos"("leccionId");

-- CreateIndex
CREATE UNIQUE INDEX "progresos_usuarioId_leccionId_key" ON "progresos"("usuarioId", "leccionId");

-- CreateIndex
CREATE INDEX "grupos_institucionId_idx" ON "grupos"("institucionId");

-- CreateIndex
CREATE INDEX "grupos_educadorId_idx" ON "grupos"("educadorId");

-- CreateIndex
CREATE INDEX "asistencias_grupoId_fecha_idx" ON "asistencias"("grupoId", "fecha");

-- CreateIndex
CREATE INDEX "asistencias_estudianteId_idx" ON "asistencias"("estudianteId");

-- CreateIndex
CREATE UNIQUE INDEX "asistencias_grupoId_estudianteId_fecha_key" ON "asistencias"("grupoId", "estudianteId", "fecha");

-- CreateIndex
CREATE INDEX "calificaciones_grupoId_idx" ON "calificaciones"("grupoId");

-- CreateIndex
CREATE INDEX "calificaciones_estudianteId_idx" ON "calificaciones"("estudianteId");

-- CreateIndex
CREATE INDEX "comunicados_institucionId_idx" ON "comunicados"("institucionId");

-- CreateIndex
CREATE INDEX "comunicados_tipo_idx" ON "comunicados"("tipo");

-- AddForeignKey
ALTER TABLE "perfiles" ADD CONSTRAINT "perfiles_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cursos" ADD CONSTRAINT "cursos_educadorId_fkey" FOREIGN KEY ("educadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cursos" ADD CONSTRAINT "cursos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecciones" ADD CONSTRAINT "lecciones_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "cursos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recursos" ADD CONSTRAINT "recursos_leccionId_fkey" FOREIGN KEY ("leccionId") REFERENCES "lecciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresos" ADD CONSTRAINT "progresos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresos" ADD CONSTRAINT "progresos_leccionId_fkey" FOREIGN KEY ("leccionId") REFERENCES "lecciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "instituciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_educadorId_fkey" FOREIGN KEY ("educadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos_estudiantes" ADD CONSTRAINT "grupos_estudiantes_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos_estudiantes" ADD CONSTRAINT "grupos_estudiantes_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunicados" ADD CONSTRAINT "comunicados_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "instituciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunicados" ADD CONSTRAINT "comunicados_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
