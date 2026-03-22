import { z } from 'zod';

export const updatePeriodoSchema = z
  .object({
    nombre: z
      .string()
      .min(1, 'El nombre del período es requerido')
      .max(100, 'El nombre no puede exceder 100 caracteres')
      .optional(),
    fechaInicio: z.coerce
      .date({ error: () => ({ message: 'La fecha de inicio es inválida' }) })
      .optional(),
    fechaFin: z.coerce
      .date({ error: () => ({ message: 'La fecha de fin es inválida' }) })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.fechaInicio && data.fechaFin) {
        return data.fechaFin > data.fechaInicio;
      }
      return true;
    },
    {
      message: 'La fecha de fin debe ser posterior a la fecha de inicio',
      path: ['fechaFin'],
    }
  );

export type UpdatePeriodoDto = z.infer<typeof updatePeriodoSchema>;
