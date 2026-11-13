-- CreateEnum
CREATE TYPE "EstadoPromocionTipo" AS ENUM ('PROMOVIDO', 'REPITENTE', 'EGRESADO');

-- CreateTable
CREATE TABLE "estados_promocion" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "periodoAcademicoId" TEXT NOT NULL,
    "estado" "EstadoPromocionTipo" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estados_promocion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "estados_promocion_estudianteId_periodoAcademicoId_idx" ON "estados_promocion"("estudianteId", "periodoAcademicoId");

-- CreateIndex
CREATE INDEX "estados_promocion_grupoId_periodoAcademicoId_idx" ON "estados_promocion"("grupoId", "periodoAcademicoId");

-- CreateIndex
CREATE UNIQUE INDEX "estados_promocion_estudianteId_grupoId_periodoAcademicoId_key" ON "estados_promocion"("estudianteId", "grupoId", "periodoAcademicoId");

-- AddForeignKey
ALTER TABLE "estados_promocion" ADD CONSTRAINT "estados_promocion_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estados_promocion" ADD CONSTRAINT "estados_promocion_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estados_promocion" ADD CONSTRAINT "estados_promocion_periodoAcademicoId_fkey" FOREIGN KEY ("periodoAcademicoId") REFERENCES "periodos_academicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
