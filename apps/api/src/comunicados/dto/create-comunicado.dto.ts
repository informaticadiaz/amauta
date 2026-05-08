import { z } from 'zod';

export const createComunicadoSchema = z.object({
  titulo: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  contenido: z
    .string()
    .min(10, 'El contenido debe tener al menos 10 caracteres')
    .max(10000, 'El contenido no puede exceder 10000 caracteres'),
  tipo: z
    .enum(['GENERAL', 'ACADEMICO', 'ADMINISTRATIVO', 'EVENTO', 'URGENTE'], {
      message: 'Tipo inválido',
    })
    .default('GENERAL'),
  prioridad: z
    .enum(['BAJA', 'NORMAL', 'ALTA', 'URGENTE'], {
      message: 'Prioridad inválida',
    })
    .default('NORMAL'),
});

export type CreateComunicadoDto = z.infer<typeof createComunicadoSchema>;
