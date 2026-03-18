/**
 * DTO para crear una evaluación
 */

import { z } from 'zod';

export const createEvaluacionSchema = z.object({
  titulo: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  descripcion: z
    .string()
    .max(5000, 'La descripción no puede exceder 5000 caracteres')
    .optional()
    .nullable(),
  cursoId: z.string().cuid('ID de curso inválido'),
  tiempoLimiteMin: z
    .number()
    .int('El tiempo límite debe ser un número entero')
    .positive('El tiempo límite debe ser positivo')
    .optional(),
  puntajeMinimo: z
    .number()
    .min(0, 'El puntaje mínimo no puede ser negativo')
    .optional(),
  intentosMaximos: z
    .number()
    .int('Los intentos máximos deben ser un número entero')
    .positive('Los intentos máximos deben ser positivos')
    .optional(),
});

export type CreateEvaluacionDto = z.infer<typeof createEvaluacionSchema>;
