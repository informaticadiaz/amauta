-- CreateEnum
CREATE TYPE "TipoPregunta" AS ENUM ('OPCION_MULTIPLE', 'SELECCION_MULTIPLE', 'VERDADERO_FALSO', 'RESPUESTA_CORTA', 'RESPUESTA_LARGA', 'EMPAREJAMIENTO');

-- CreateTable
CREATE TABLE "evaluaciones" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "cursoId" TEXT NOT NULL,
    "creadorId" TEXT NOT NULL,
    "tiempoLimiteMin" INTEGER,
    "puntajeMinimo" DOUBLE PRECISION,
    "intentosMaximos" INTEGER,
    "publicada" BOOLEAN NOT NULL DEFAULT false,
    "publicadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preguntas" (
    "id" TEXT NOT NULL,
    "enunciado" TEXT NOT NULL,
    "tipo" "TipoPregunta" NOT NULL,
    "orden" INTEGER NOT NULL,
    "puntaje" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "opciones" JSONB,
    "respuesta" JSONB,
    "evaluacionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preguntas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intentos_evaluacion" (
    "id" TEXT NOT NULL,
    "evaluacionId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL DEFAULT 1,
    "puntaje" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "tiempoEmpleadoSeg" INTEGER,
    "iniciadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "intentos_evaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "evaluaciones_cursoId_idx" ON "evaluaciones"("cursoId");

-- CreateIndex
CREATE INDEX "evaluaciones_creadorId_idx" ON "evaluaciones"("creadorId");

-- CreateIndex
CREATE INDEX "preguntas_evaluacionId_idx" ON "preguntas"("evaluacionId");

-- CreateIndex
CREATE INDEX "preguntas_orden_idx" ON "preguntas"("orden");

-- CreateIndex
CREATE INDEX "intentos_evaluacion_evaluacionId_idx" ON "intentos_evaluacion"("evaluacionId");

-- CreateIndex
CREATE INDEX "intentos_evaluacion_usuarioId_idx" ON "intentos_evaluacion"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "intentos_evaluacion_evaluacionId_usuarioId_numero_key" ON "intentos_evaluacion"("evaluacionId", "usuarioId", "numero");

-- AddForeignKey
ALTER TABLE "evaluaciones" ADD CONSTRAINT "evaluaciones_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "cursos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones" ADD CONSTRAINT "evaluaciones_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preguntas" ADD CONSTRAINT "preguntas_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "evaluaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intentos_evaluacion" ADD CONSTRAINT "intentos_evaluacion_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "evaluaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intentos_evaluacion" ADD CONSTRAINT "intentos_evaluacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
