/**
 * DTO para actualizar una lección
 */

import { z } from 'zod';

export const updateLeccionSchema = z.object({
  titulo: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres')
    .optional(),
  descripcion: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional(),
  tipo: z
    .enum(['VIDEO', 'TEXTO', 'QUIZ', 'INTERACTIVO', 'DESCARGABLE'], {
      message: 'Tipo inválido',
    })
    .optional(),
  duracion: z
    .number()
    .int('La duración debe ser un número entero')
    .positive('La duración debe ser positiva')
    .nullable()
    .optional(),
  contenido: z.record(z.string(), z.unknown()).optional(),
  publicada: z.boolean().optional(),
});

export type UpdateLeccionDto = z.infer<typeof updateLeccionSchema>;

export const reordenarLeccionesSchema = z.object({
  lecciones: z
    .array(
      z.object({
        id: z.string().cuid('ID de lección inválido'),
        orden: z.number().int().min(0),
      })
    )
    .min(1, 'Debe proporcionar al menos una lección'),
});

export type ReordenarLeccionesDto = z.infer<typeof reordenarLeccionesSchema>;
