import { z } from 'zod';

export const queryCalificacionesSchema = z.object({
  periodoAcademicoId: z.string().cuid('ID de período académico inválido'),
  materiaId: z.string().cuid('ID de materia inválido'),
});

export type QueryCalificacionesDto = z.infer<typeof queryCalificacionesSchema>;
