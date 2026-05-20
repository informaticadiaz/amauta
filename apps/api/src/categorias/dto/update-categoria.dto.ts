/**
 * DTO para actualizar una categoría
 */

import { z } from 'zod';

export const updateCategoriaSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),
  descripcion: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .nullable(),
  icono: z
    .string()
    .max(50, 'El icono no puede exceder 50 caracteres')
    .optional()
    .nullable(),
});

export type UpdateCategoriaDto = z.infer<typeof updateCategoriaSchema>;
