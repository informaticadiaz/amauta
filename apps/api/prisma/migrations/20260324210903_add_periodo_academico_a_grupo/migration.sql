-- Add column to existing periodos_academicos
ALTER TABLE "periodos_academicos" ADD COLUMN "orden" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "grupos" ADD COLUMN "periodoAcademicoId" TEXT;

-- CreateIndex
CREATE INDEX "periodos_academicos_activo_idx" ON "periodos_academicos"("activo");

-- CreateIndex
CREATE INDEX "grupos_periodoAcademicoId_idx" ON "grupos"("periodoAcademicoId");

-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_periodoAcademicoId_fkey" FOREIGN KEY ("periodoAcademicoId") REFERENCES "periodos_academicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
