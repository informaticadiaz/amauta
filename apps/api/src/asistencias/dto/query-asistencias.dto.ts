import { z } from 'zod';

export const queryAsistenciasSchema = z.object({
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD'),
});

export type QueryAsistenciasDto = z.infer<typeof queryAsistenciasSchema>;
