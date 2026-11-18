-- CreateEnum
CREATE TYPE "EstadoJustificacionAusencia" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- AlterEnum
ALTER TYPE "TipoNotificacion" ADD VALUE 'RESULTADO_JUSTIFICACION_AUSENCIA';

-- AlterTable
ALTER TABLE "notificaciones" ADD COLUMN     "justificacionAusenciaId" TEXT;

-- CreateTable
CREATE TABLE "justificaciones_ausencias" (
    "id" TEXT NOT NULL,
    "asistenciaId" TEXT NOT NULL,
    "solicitanteId" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "archivoStorageKey" TEXT NOT NULL,
    "archivoNombre" TEXT NOT NULL,
    "archivoMimeType" TEXT NOT NULL,
    "archivoTamano" INTEGER NOT NULL,
    "estado" "EstadoJustificacionAusencia" NOT NULL DEFAULT 'PENDIENTE',
    "revisadaPorId" TEXT,
    "motivoRechazo" TEXT,
    "fechaRevision" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "justificaciones_ausencias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "justificaciones_ausencias_asistenciaId_estado_idx" ON "justificaciones_ausencias"("asistenciaId", "estado");

-- CreateIndex
CREATE INDEX "justificaciones_ausencias_solicitanteId_estado_idx" ON "justificaciones_ausencias"("solicitanteId", "estado");

-- CreateIndex
CREATE INDEX "justificaciones_ausencias_revisadaPorId_idx" ON "justificaciones_ausencias"("revisadaPorId");

-- CreateIndex
CREATE INDEX "notificaciones_justificacionAusenciaId_idx" ON "notificaciones"("justificacionAusenciaId");

-- AddForeignKey
ALTER TABLE "justificaciones_ausencias" ADD CONSTRAINT "justificaciones_ausencias_asistenciaId_fkey" FOREIGN KEY ("asistenciaId") REFERENCES "asistencias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "justificaciones_ausencias" ADD CONSTRAINT "justificaciones_ausencias_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "justificaciones_ausencias" ADD CONSTRAINT "justificaciones_ausencias_revisadaPorId_fkey" FOREIGN KEY ("revisadaPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_justificacionAusenciaId_fkey" FOREIGN KEY ("justificacionAusenciaId") REFERENCES "justificaciones_ausencias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
