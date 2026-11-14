-- CreateEnum
CREATE TYPE "TipoAlertaAcademica" AS ENUM ('ASISTENCIA_BAJA', 'NOTA_EN_RIESGO');

-- CreateEnum
CREATE TYPE "EstadoAlertaAcademica" AS ENUM ('ACTIVA', 'RESUELTA');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoNotificacion" ADD VALUE 'ALERTA_ASISTENCIA_BAJA';
ALTER TYPE "TipoNotificacion" ADD VALUE 'ALERTA_NOTA_EN_RIESGO';

-- AlterTable
ALTER TABLE "escalas_calificacion" ADD COLUMN     "notaAlertaMinima" DOUBLE PRECISION NOT NULL DEFAULT 4;

-- AlterTable
ALTER TABLE "notificaciones" ADD COLUMN     "alertaId" TEXT;

-- CreateTable
CREATE TABLE "alertas_academicas" (
    "id" TEXT NOT NULL,
    "tipo" "TipoAlertaAcademica" NOT NULL,
    "estado" "EstadoAlertaAcademica" NOT NULL DEFAULT 'ACTIVA',
    "institucionId" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "periodoAcademicoId" TEXT NOT NULL,
    "valorActual" DOUBLE PRECISION NOT NULL,
    "umbral" DOUBLE PRECISION NOT NULL,
    "detalle" TEXT,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadaEn" TIMESTAMP(3) NOT NULL,
    "resueltaEn" TIMESTAMP(3),

    CONSTRAINT "alertas_academicas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alertas_academicas_institucionId_estado_idx" ON "alertas_academicas"("institucionId", "estado");

-- CreateIndex
CREATE INDEX "alertas_academicas_grupoId_estado_idx" ON "alertas_academicas"("grupoId", "estado");

-- CreateIndex
CREATE INDEX "alertas_academicas_estudianteId_estado_idx" ON "alertas_academicas"("estudianteId", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "alertas_academicas_tipo_grupoId_estudianteId_periodoAcademi_key" ON "alertas_academicas"("tipo", "grupoId", "estudianteId", "periodoAcademicoId");

-- CreateIndex
CREATE INDEX "notificaciones_alertaId_idx" ON "notificaciones"("alertaId");

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_alertaId_fkey" FOREIGN KEY ("alertaId") REFERENCES "alertas_academicas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_academicas" ADD CONSTRAINT "alertas_academicas_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "instituciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_academicas" ADD CONSTRAINT "alertas_academicas_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_academicas" ADD CONSTRAINT "alertas_academicas_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_academicas" ADD CONSTRAINT "alertas_academicas_periodoAcademicoId_fkey" FOREIGN KEY ("periodoAcademicoId") REFERENCES "periodos_academicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
