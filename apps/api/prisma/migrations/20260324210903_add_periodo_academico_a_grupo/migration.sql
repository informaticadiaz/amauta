-- AlterTable
ALTER TABLE "grupos" ADD COLUMN     "periodoAcademicoId" TEXT;

-- CreateTable
CREATE TABLE "periodos_academicos" (
    "id" TEXT NOT NULL,
    "institucionId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "orden" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "periodos_academicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escalas_calificacion" (
    "id" TEXT NOT NULL,
    "institucionId" TEXT NOT NULL,
    "minima" DOUBLE PRECISION NOT NULL,
    "maxima" DOUBLE PRECISION NOT NULL,
    "minimaAprobacion" DOUBLE PRECISION NOT NULL,
    "decimales" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escalas_calificacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "periodos_academicos_institucionId_idx" ON "periodos_academicos"("institucionId");

-- CreateIndex
CREATE INDEX "periodos_academicos_activo_idx" ON "periodos_academicos"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "escalas_calificacion_institucionId_key" ON "escalas_calificacion"("institucionId");

-- CreateIndex
CREATE INDEX "escalas_calificacion_institucionId_idx" ON "escalas_calificacion"("institucionId");

-- CreateIndex
CREATE INDEX "grupos_periodoAcademicoId_idx" ON "grupos"("periodoAcademicoId");

-- AddForeignKey
ALTER TABLE "periodos_academicos" ADD CONSTRAINT "periodos_academicos_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "instituciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalas_calificacion" ADD CONSTRAINT "escalas_calificacion_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "instituciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_periodoAcademicoId_fkey" FOREIGN KEY ("periodoAcademicoId") REFERENCES "periodos_academicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
