import { z } from 'zod';

export const createMatriculaSchema = z.object({
  estudianteId: z.string().cuid('ID de estudiante inválido'),
  periodoAcademicoId: z.string().cuid('ID de período académico inválido'),
  observaciones: z
    .string()
    .trim()
    .max(2000, 'Las observaciones no pueden exceder 2000 caracteres')
    .optional(),
});

export type CreateMatriculaDto = z.infer<typeof createMatriculaSchema>;
