-- Catálogo institucional de materias del segmento escolar formal.
CREATE TABLE "materias" (
  "id" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "descripcion" TEXT,
  "institucionId" TEXT NOT NULL,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "materias_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "materias_institucionId_nombre_key" ON "materias"("institucionId", "nombre");
CREATE INDEX "materias_institucionId_activo_idx" ON "materias"("institucionId", "activo");
ALTER TABLE "materias" ADD CONSTRAINT "materias_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "instituciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "grupos_materias" (
  "grupoId" TEXT NOT NULL,
  "materiaId" TEXT NOT NULL,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "grupos_materias_pkey" PRIMARY KEY ("grupoId", "materiaId")
);
CREATE INDEX "grupos_materias_materiaId_activo_idx" ON "grupos_materias"("materiaId", "activo");
ALTER TABLE "grupos_materias" ADD CONSTRAINT "grupos_materias_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "grupos_materias" ADD CONSTRAINT "grupos_materias_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "materias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Preserve every existing grade: its legacy name becomes one institutional subject.
ALTER TABLE "calificaciones" ADD COLUMN "materiaId" TEXT;
INSERT INTO "materias" ("id", "nombre", "institucionId", "updatedAt")
SELECT 'legacy-' || md5(c."grupoId" || ':' || c."materia"), c."materia", g."institucionId", CURRENT_TIMESTAMP
FROM "calificaciones" c JOIN "grupos" g ON g."id" = c."grupoId"
GROUP BY c."grupoId", c."materia", g."institucionId"
ON CONFLICT ("institucionId", "nombre") DO NOTHING;
UPDATE "calificaciones" c SET "materiaId" = m."id"
FROM "grupos" g JOIN "materias" m ON m."institucionId" = g."institucionId" AND m."nombre" = c."materia"
WHERE g."id" = c."grupoId";
ALTER TABLE "calificaciones" ALTER COLUMN "materiaId" SET NOT NULL;
INSERT INTO "grupos_materias" ("grupoId", "materiaId", "updatedAt")
SELECT DISTINCT "grupoId", "materiaId", CURRENT_TIMESTAMP FROM "calificaciones"
ON CONFLICT ("grupoId", "materiaId") DO NOTHING;
ALTER TABLE "calificaciones" DROP CONSTRAINT "calificaciones_grupoId_estudianteId_periodoAcademicoId_materia_key";
ALTER TABLE "calificaciones" DROP COLUMN "materia";
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "materias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_grupoId_estudianteId_periodoAcademicoId_materiaId_key" UNIQUE ("grupoId", "estudianteId", "periodoAcademicoId", "materiaId");
