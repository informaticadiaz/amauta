-- Eliminar datos de calificaciones existentes (datos de seed con periodo libre,
-- incompatibles con la nueva FK a periodos_academicos)
DELETE FROM "calificaciones";

-- Eliminar índices anteriores
DROP INDEX IF EXISTS "calificaciones_grupoId_idx";
DROP INDEX IF EXISTS "calificaciones_estudianteId_idx";

-- Eliminar columnas que se reemplazan
ALTER TABLE "calificaciones" DROP COLUMN "periodo";
ALTER TABLE "calificaciones" DROP COLUMN "notaMaxima";

-- Agregar relación con periodos_academicos
ALTER TABLE "calificaciones" ADD COLUMN "periodoAcademicoId" TEXT NOT NULL;

-- Agregar constraint de FK
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_periodoAcademicoId_fkey"
  FOREIGN KEY ("periodoAcademicoId") REFERENCES "periodos_academicos"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Unique constraint: un estudiante solo puede tener una calificación por grupo, periodo y materia
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_grupoId_estudianteId_periodoAcademicoId_materia_key"
  UNIQUE ("grupoId", "estudianteId", "periodoAcademicoId", "materia");

-- Índices para consultas por grupo+periodo y estudiante+periodo
CREATE INDEX "calificaciones_grupoId_periodoAcademicoId_idx" ON "calificaciones"("grupoId", "periodoAcademicoId");
CREATE INDEX "calificaciones_estudianteId_periodoAcademicoId_idx" ON "calificaciones"("estudianteId", "periodoAcademicoId");
