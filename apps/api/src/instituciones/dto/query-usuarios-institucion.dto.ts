import { z } from 'zod';

export const queryUsuariosInstitucionSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  buscar: z
    .string()
    .trim()
    .min(1, 'El término de búsqueda no puede estar vacío')
    .optional(),
});

export type QueryUsuariosInstitucionDto = z.infer<
  typeof queryUsuariosInstitucionSchema
>;
