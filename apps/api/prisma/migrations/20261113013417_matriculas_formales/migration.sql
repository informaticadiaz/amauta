-- CreateEnum
CREATE TYPE "EstadoMatricula" AS ENUM ('ACTIVA', 'BAJA', 'EGRESADO');

-- AlterTable
ALTER TABLE "lecciones" ALTER COLUMN "estado" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "matriculas" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "institucionId" TEXT NOT NULL,
    "periodoAcademicoId" TEXT NOT NULL,
    "estado" "EstadoMatricula" NOT NULL DEFAULT 'ACTIVA',
    "fechaInscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matriculas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "matriculas_institucionId_periodoAcademicoId_estado_idx" ON "matriculas"("institucionId", "periodoAcademicoId", "estado");

-- CreateIndex
CREATE INDEX "matriculas_estudianteId_estado_idx" ON "matriculas"("estudianteId", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "matriculas_estudianteId_institucionId_periodoAcademicoId_key" ON "matriculas"("estudianteId", "institucionId", "periodoAcademicoId");

-- AddForeignKey
ALTER TABLE "matriculas" ADD CONSTRAINT "matriculas_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matriculas" ADD CONSTRAINT "matriculas_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "instituciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matriculas" ADD CONSTRAINT "matriculas_periodoAcademicoId_fkey" FOREIGN KEY ("periodoAcademicoId") REFERENCES "periodos_academicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "calificaciones_grupoId_estudianteId_periodoAcademicoId_materiaI" RENAME TO "calificaciones_grupoId_estudianteId_periodoAcademicoId_mate_key";
