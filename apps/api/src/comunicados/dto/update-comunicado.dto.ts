import { z } from 'zod';

export const updateComunicadoSchema = z.object({
  titulo: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres')
    .optional(),
  contenido: z
    .string()
    .min(10, 'El contenido debe tener al menos 10 caracteres')
    .max(10000, 'El contenido no puede exceder 10000 caracteres')
    .optional(),
  tipo: z
    .enum(['GENERAL', 'ACADEMICO', 'ADMINISTRATIVO', 'EVENTO', 'URGENTE'], {
      message: 'Tipo inválido',
    })
    .optional(),
  prioridad: z
    .enum(['BAJA', 'NORMAL', 'ALTA', 'URGENTE'], {
      message: 'Prioridad inválida',
    })
    .optional(),
});

export type UpdateComunicadoDto = z.infer<typeof updateComunicadoSchema>;
