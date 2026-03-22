-- CreateTable
CREATE TABLE "periodos_academicos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "institucionId" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "periodos_academicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escalas_calificacion" (
    "id" TEXT NOT NULL,
    "institucionId" TEXT NOT NULL,
    "notaMinima" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notaMaxima" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "notaAprobacion" DOUBLE PRECISION NOT NULL DEFAULT 6,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escalas_calificacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "periodos_academicos_institucionId_idx" ON "periodos_academicos"("institucionId");

-- CreateIndex
CREATE UNIQUE INDEX "escalas_calificacion_institucionId_key" ON "escalas_calificacion"("institucionId");

-- AddForeignKey
ALTER TABLE "periodos_academicos" ADD CONSTRAINT "periodos_academicos_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "instituciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalas_calificacion" ADD CONSTRAINT "escalas_calificacion_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "instituciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
