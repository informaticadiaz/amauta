-- AlterTable
ALTER TABLE "lecciones" ADD COLUMN "estado" VARCHAR(50) NOT NULL DEFAULT 'ACTIVO';

-- CreateIndex
CREATE INDEX "lecciones_estado_idx" ON "lecciones"("estado");
