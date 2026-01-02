/**
 * DTO para actualizar un curso
 */

import { z } from 'zod';

export const updateCursoSchema = z.object({
  titulo: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres')
    .optional(),
  descripcion: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(5000, 'La descripción no puede exceder 5000 caracteres')
    .optional(),
  categoriaId: z.string().cuid('ID de categoría inválido').optional(),
  nivel: z
    .enum(['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'], {
      message: 'Nivel inválido. Debe ser PRINCIPIANTE, INTERMEDIO o AVANZADO',
    })
    .optional(),
  imagen: z.string().url('URL de imagen inválida').nullable().optional(),
  duracion: z
    .number()
    .int('La duración debe ser un número entero')
    .positive('La duración debe ser positiva')
    .nullable()
    .optional(),
  idioma: z
    .string()
    .length(2, 'El idioma debe ser un código de 2 letras')
    .optional(),
});

export type UpdateCursoDto = z.infer<typeof updateCursoSchema>;

export const publicarCursoSchema = z.object({
  publicar: z.boolean({
    message: 'El campo publicar es requerido',
  }),
});

export type PublicarCursoDto = z.infer<typeof publicarCursoSchema>;
