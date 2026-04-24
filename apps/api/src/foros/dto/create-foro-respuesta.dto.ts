import { z } from 'zod';

export const createForoRespuestaSchema = z.object({
  contenido: z
    .string()
    .trim()
    .min(3, 'El contenido debe tener al menos 3 caracteres')
    .max(5000, 'El contenido no puede exceder 5000 caracteres'),
  respuestaParentId: z
    .string()
    .cuid('ID de respuesta padre inválido')
    .optional(),
});

export type CreateForoRespuestaDto = z.infer<typeof createForoRespuestaSchema>;
