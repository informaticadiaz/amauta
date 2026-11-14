-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('LUN', 'MAR', 'MIE', 'JUE', 'VIE');

-- CreateTable
CREATE TABLE "franjas_horarias" (
    "id" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    "educadorId" TEXT NOT NULL,
    "diaSemana" "DiaSemana" NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "franjas_horarias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "franjas_horarias_grupoId_activo_diaSemana_idx" ON "franjas_horarias"("grupoId", "activo", "diaSemana");

-- CreateIndex
CREATE INDEX "franjas_horarias_educadorId_activo_diaSemana_idx" ON "franjas_horarias"("educadorId", "activo", "diaSemana");

-- CreateIndex
CREATE INDEX "franjas_horarias_materiaId_activo_idx" ON "franjas_horarias"("materiaId", "activo");

-- AddForeignKey
ALTER TABLE "franjas_horarias" ADD CONSTRAINT "franjas_horarias_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "franjas_horarias" ADD CONSTRAINT "franjas_horarias_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "materias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "franjas_horarias" ADD CONSTRAINT "franjas_horarias_educadorId_fkey" FOREIGN KEY ("educadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
