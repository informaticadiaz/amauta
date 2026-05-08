import { z } from 'zod';

export const queryReporteAsistenciaSchema = z.object({
  periodoId: z.string().optional(),
  desde: z.string().optional(),
  hasta: z.string().optional(),
});

export type QueryReporteAsistenciaDto = z.infer<
  typeof queryReporteAsistenciaSchema
>;
