import { z } from 'zod';

export const queryTutorEstudianteSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  buscar: z.string().trim().optional(),
});

export type QueryTutorEstudianteDto = z.infer<
  typeof queryTutorEstudianteSchema
>;
