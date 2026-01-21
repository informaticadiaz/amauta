/**
 * DTO para query de lecciones
 */

import { z } from 'zod';

export const queryLeccionesSchema = z.object({
  publicadas: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

export type QueryLeccionesDto = z.infer<typeof queryLeccionesSchema>;
