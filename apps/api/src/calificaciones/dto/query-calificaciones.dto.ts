import { z } from 'zod';

export const queryCalificacionesSchema = z.object({
  periodoAcademicoId: z.string().cuid('ID de período académico inválido'),
  materia: z
    .string()
    .min(1, 'La materia no puede estar vacía')
    .max(100, 'La materia no puede exceder 100 caracteres'),
});

export type QueryCalificacionesDto = z.infer<typeof queryCalificacionesSchema>;
