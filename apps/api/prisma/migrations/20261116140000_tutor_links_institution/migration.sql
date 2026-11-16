-- Add the institution boundary to tutor-student links without guessing
-- when existing data belongs to multiple or no active institutions.
ALTER TABLE "tutores_estudiantes" ADD COLUMN "institucionId" TEXT;

UPDATE "tutores_estudiantes" AS te
SET "institucionId" = source."institucionId"
FROM (
    SELECT te2."id", MIN(m."institucionId") AS "institucionId"
    FROM "tutores_estudiantes" AS te2
    INNER JOIN "matriculas" AS m ON m."estudianteId" = te2."estudianteId"
    WHERE m."estado" = 'ACTIVA'
    GROUP BY te2."id"
    HAVING COUNT(DISTINCT m."institucionId") = 1
) AS source
WHERE te."id" = source."id";

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "tutores_estudiantes"
        WHERE "institucionId" IS NULL
    ) THEN
        RAISE EXCEPTION
            'No se pudo asignar una institución única a todos los vínculos tutor-estudiante existentes';
    END IF;
END $$;

ALTER TABLE "tutores_estudiantes" ALTER COLUMN "institucionId" SET NOT NULL;

DROP INDEX "tutores_estudiantes_tutorId_estudianteId_key";
CREATE UNIQUE INDEX "tutores_estudiantes_tutorId_estudianteId_institucionId_key"
    ON "tutores_estudiantes"("tutorId", "estudianteId", "institucionId");
CREATE INDEX "tutores_estudiantes_institucionId_activo_idx"
    ON "tutores_estudiantes"("institucionId", "activo");

ALTER TABLE "tutores_estudiantes"
    ADD CONSTRAINT "tutores_estudiantes_institucionId_fkey"
    FOREIGN KEY ("institucionId") REFERENCES "instituciones"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
