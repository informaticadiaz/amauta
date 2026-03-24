/**
 * DTO para crear periodo académico
 */

import { z } from 'zod';

export const createPeriodoAcademicoSchema = z
  .object({
    nombre: z
      .string()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres'),
    fechaInicio: z.coerce.date({
      message: 'Fecha de inicio inválida',
    }),
    fechaFin: z.coerce.date({
      message: 'Fecha de fin inválida',
    }),
    orden: z.coerce
      .number()
      .int('El orden debe ser un número entero')
      .positive('El orden debe ser positivo')
      .default(1),
  })
  .refine((data) => data.fechaFin >= data.fechaInicio, {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['fechaFin'],
  });

export type CreatePeriodoAcademicoDto = z.infer<
  typeof createPeriodoAcademicoSchema
>;
