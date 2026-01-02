/**
 * DTO para crear un curso
 */

import { z } from 'zod';

export const createCursoSchema = z.object({
  titulo: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  descripcion: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(5000, 'La descripción no puede exceder 5000 caracteres'),
  categoriaId: z.string().cuid('ID de categoría inválido'),
  nivel: z.enum(['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'], {
    message: 'Nivel inválido. Debe ser PRINCIPIANTE, INTERMEDIO o AVANZADO',
  }),
  imagen: z.string().url('URL de imagen inválida').optional(),
  duracion: z
    .number()
    .int('La duración debe ser un número entero')
    .positive('La duración debe ser positiva')
    .optional(),
  idioma: z
    .string()
    .length(2, 'El idioma debe ser un código de 2 letras')
    .default('es'),
});

export type CreateCursoDto = z.infer<typeof createCursoSchema>;
