-- CreateEnum
CREATE TYPE "EstadoCierrePeriodo" AS ENUM ('ABIERTO', 'CERRADO');

-- AlterTable
ALTER TABLE "estados_promocion" ADD COLUMN     "estadoCalculado" "EstadoPromocionTipo",
ADD COLUMN     "justificacionSobrescritura" TEXT,
ADD COLUMN     "materiasAprobadas" INTEGER,
ADD COLUMN     "materiasSinCalificacion" INTEGER,
ADD COLUMN     "materiasTotales" INTEGER,
ADD COLUMN     "notaAprobacion" DOUBLE PRECISION,
ADD COLUMN     "porcentajeAsistencia" DOUBLE PRECISION,
ADD COLUMN     "porcentajeAsistenciaMinimo" DOUBLE PRECISION,
ADD COLUMN     "sobrescritoEn" TIMESTAMP(3),
ADD COLUMN     "sobrescritoPorId" TEXT;

-- AlterTable
ALTER TABLE "periodos_academicos" ADD COLUMN     "cerradoEn" TIMESTAMP(3),
ADD COLUMN     "cerradoPorId" TEXT,
ADD COLUMN     "estadoCierre" "EstadoCierrePeriodo" NOT NULL DEFAULT 'ABIERTO',
ADD COLUMN     "porcentajeAsistenciaMinimo" DOUBLE PRECISION NOT NULL DEFAULT 75;

-- AddForeignKey
ALTER TABLE "periodos_academicos" ADD CONSTRAINT "periodos_academicos_cerradoPorId_fkey" FOREIGN KEY ("cerradoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estados_promocion" ADD CONSTRAINT "estados_promocion_sobrescritoPorId_fkey" FOREIGN KEY ("sobrescritoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
