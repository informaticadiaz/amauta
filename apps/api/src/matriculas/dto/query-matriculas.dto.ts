import { z } from 'zod';

export const queryMatriculasSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  periodoAcademicoId: z
    .string()
    .cuid('ID de período académico inválido')
    .optional(),
  estado: z
    .enum(['ACTIVA', 'BAJA', 'EGRESADO'], {
      message: 'Estado de matrícula inválido',
    })
    .optional(),
  buscar: z.string().trim().optional(),
});

export type QueryMatriculasDto = z.infer<typeof queryMatriculasSchema>;
