-- AlterTable
ALTER TABLE "grupos_estudiantes" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "asignadoPorId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "removidoEn" TIMESTAMP(3),
ADD COLUMN     "removidoPorId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "grupos_estudiantes_grupoId_activo_idx" ON "grupos_estudiantes"("grupoId", "activo");

-- CreateIndex
CREATE INDEX "grupos_estudiantes_estudianteId_activo_idx" ON "grupos_estudiantes"("estudianteId", "activo");

-- AddForeignKey
ALTER TABLE "grupos_estudiantes" ADD CONSTRAINT "grupos_estudiantes_asignadoPorId_fkey" FOREIGN KEY ("asignadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos_estudiantes" ADD CONSTRAINT "grupos_estudiantes_removidoPorId_fkey" FOREIGN KEY ("removidoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
