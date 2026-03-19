/**
 * DTO para query params de listado de evaluaciones
 */

import { z } from 'zod';

const publicadaSchema = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((value) =>
    typeof value === 'boolean' ? value : value === 'true'
  );

export const queryEvaluacionesSchema = z.object({
  // Paginación
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),

  // Filtros
  publicada: publicadaSchema.optional(),
});

export type QueryEvaluacionesDto = z.infer<typeof queryEvaluacionesSchema>;
