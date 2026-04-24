import { z } from 'zod';

export const createForoPostSchema = z.object({
  tipo: z.enum(['PREGUNTA', 'DISCUSION', 'ANUNCIO'], {
    message: 'Tipo de post inválido',
  }),
  titulo: z
    .string()
    .trim()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  contenido: z
    .string()
    .trim()
    .min(3, 'El contenido debe tener al menos 3 caracteres')
    .max(5000, 'El contenido no puede exceder 5000 caracteres'),
  etiquetas: z
    .array(
      z
        .string()
        .trim()
        .min(1, 'Las etiquetas no pueden estar vacías')
        .max(30, 'Las etiquetas no pueden exceder 30 caracteres')
    )
    .max(10, 'No se permiten más de 10 etiquetas')
    .optional()
    .default([]),
});

export type CreateForoPostDto = z.infer<typeof createForoPostSchema>;
