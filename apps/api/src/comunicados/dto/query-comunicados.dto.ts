import { z } from 'zod';

export const queryComunicadosSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  tipo: z
    .enum(['GENERAL', 'ACADEMICO', 'ADMINISTRATIVO', 'EVENTO', 'URGENTE'])
    .optional(),
  prioridad: z.enum(['BAJA', 'NORMAL', 'ALTA', 'URGENTE']).optional(),
});

export type QueryComunicadosDto = z.infer<typeof queryComunicadosSchema>;
