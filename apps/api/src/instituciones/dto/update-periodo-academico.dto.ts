/**
 * DTO para actualizar periodo académico
 */

import { z } from 'zod';

export const updatePeriodoAcademicoSchema = z
  .object({
    nombre: z
      .string()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres')
      .optional(),
    fechaInicio: z.coerce
      .date({
        message: 'Fecha de inicio inválida',
      })
      .optional(),
    fechaFin: z.coerce
      .date({
        message: 'Fecha de fin inválida',
      })
      .optional(),
    orden: z.coerce
      .number()
      .int('El orden debe ser un número entero')
      .positive('El orden debe ser positivo')
      .optional(),
    activo: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.fechaInicio && data.fechaFin && data.fechaFin < data.fechaInicio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La fecha de fin debe ser posterior a la fecha de inicio',
        path: ['fechaFin'],
      });
    }
  });

export type UpdatePeriodoAcademicoDto = z.infer<
  typeof updatePeriodoAcademicoSchema
>;
