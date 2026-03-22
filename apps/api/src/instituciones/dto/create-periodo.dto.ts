import { z } from 'zod';

export const createPeriodoSchema = z
  .object({
    nombre: z
      .string()
      .min(1, 'El nombre del período es requerido')
      .max(100, 'El nombre no puede exceder 100 caracteres'),
    fechaInicio: z.coerce.date({
      error: () => ({ message: 'La fecha de inicio es inválida' }),
    }),
    fechaFin: z.coerce.date({
      error: () => ({ message: 'La fecha de fin es inválida' }),
    }),
  })
  .refine((data) => data.fechaFin > data.fechaInicio, {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['fechaFin'],
  });

export type CreatePeriodoDto = z.infer<typeof createPeriodoSchema>;
