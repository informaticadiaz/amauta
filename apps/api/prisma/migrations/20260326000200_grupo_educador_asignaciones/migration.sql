-- CreateEnum
CREATE TYPE "RolGrupoEducador" AS ENUM ('TITULAR', 'SUPLENTE');

-- CreateTable
CREATE TABLE "grupos_educadores" (
    "grupoId" TEXT NOT NULL,
    "educadorId" TEXT NOT NULL,
    "rol" "RolGrupoEducador" NOT NULL,
    "asignadoPorId" TEXT,
    "removidoPorId" TEXT,
    "asignadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "removidoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grupos_educadores_pkey" PRIMARY KEY ("grupoId","educadorId")
);

-- CreateIndex
CREATE INDEX "grupos_educadores_grupoId_activo_idx" ON "grupos_educadores"("grupoId", "activo");

-- CreateIndex
CREATE INDEX "grupos_educadores_educadorId_activo_idx" ON "grupos_educadores"("educadorId", "activo");

-- AddForeignKey
ALTER TABLE "grupos_educadores" ADD CONSTRAINT "grupos_educadores_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos_educadores" ADD CONSTRAINT "grupos_educadores_educadorId_fkey" FOREIGN KEY ("educadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos_educadores" ADD CONSTRAINT "grupos_educadores_asignadoPorId_fkey" FOREIGN KEY ("asignadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos_educadores" ADD CONSTRAINT "grupos_educadores_removidoPorId_fkey" FOREIGN KEY ("removidoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
