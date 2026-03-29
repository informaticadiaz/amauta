import { z } from 'zod';

export const queryResumenMensualSchema = z.object({
  mes: z.coerce
    .number()
    .int('El mes debe ser un número entero')
    .min(1, 'El mes debe estar entre 1 y 12')
    .max(12, 'El mes debe estar entre 1 y 12'),
  anio: z.coerce
    .number()
    .int('El año debe ser un número entero')
    .min(1900, 'El año debe ser válido')
    .max(3000, 'El año debe ser válido'),
});

export type QueryResumenMensualDto = z.infer<typeof queryResumenMensualSchema>;
