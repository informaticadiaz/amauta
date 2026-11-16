-- AlterEnum
ALTER TYPE "Rol" ADD VALUE 'TUTOR';
ALTER TYPE "TipoNotificacion" ADD VALUE 'COMUNICADO_URGENTE';

-- CreateEnum
CREATE TYPE "RelacionTutor" AS ENUM ('PADRE', 'MADRE', 'TUTOR_LEGAL', 'OTRO');

-- CreateTable
CREATE TABLE "tutores_estudiantes" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "relacion" "RelacionTutor" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutores_estudiantes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tutores_estudiantes_tutorId_estudianteId_key" ON "tutores_estudiantes"("tutorId", "estudianteId");
CREATE INDEX "tutores_estudiantes_tutorId_activo_idx" ON "tutores_estudiantes"("tutorId", "activo");
CREATE INDEX "tutores_estudiantes_estudianteId_activo_idx" ON "tutores_estudiantes"("estudianteId", "activo");

-- AddForeignKey
ALTER TABLE "tutores_estudiantes" ADD CONSTRAINT "tutores_estudiantes_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tutores_estudiantes" ADD CONSTRAINT "tutores_estudiantes_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "notificaciones" ADD COLUMN "comunicadoId" TEXT;

-- CreateIndex
CREATE INDEX "notificaciones_comunicadoId_idx" ON "notificaciones"("comunicadoId");
CREATE UNIQUE INDEX "notificaciones_usuarioId_comunicadoId_tipo_key" ON "notificaciones"("usuarioId", "comunicadoId", "tipo");

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_comunicadoId_fkey" FOREIGN KEY ("comunicadoId") REFERENCES "comunicados"("id") ON DELETE CASCADE ON UPDATE CASCADE;
