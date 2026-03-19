/**
 * DTO para publicar/despublicar una evaluación
 */

import { z } from 'zod';

export const publicarEvaluacionSchema = z.object({
  publicar: z.boolean({
    message: 'El campo publicar es requerido',
  }),
});

export type PublicarEvaluacionDto = z.infer<typeof publicarEvaluacionSchema>;
