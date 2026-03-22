import { z } from 'zod';

export const upsertEscalaSchema = z
  .object({
    notaMinima: z
      .number()
      .min(0, 'La nota mínima debe ser mayor o igual a 0')
      .default(0),
    notaMaxima: z
      .number()
      .positive('La nota máxima debe ser un número positivo')
      .default(10),
    notaAprobacion: z
      .number()
      .min(0, 'La nota de aprobación debe ser mayor o igual a 0')
      .default(6),
    descripcion: z.string().max(500).optional().nullable(),
  })
  .refine((data) => data.notaAprobacion <= data.notaMaxima, {
    message: 'La nota de aprobación no puede ser mayor que la nota máxima',
    path: ['notaAprobacion'],
  })
  .refine((data) => data.notaAprobacion >= data.notaMinima, {
    message: 'La nota de aprobación no puede ser menor que la nota mínima',
    path: ['notaAprobacion'],
  });

export type UpsertEscalaDto = z.infer<typeof upsertEscalaSchema>;
