import { z } from 'zod';

export const queryReporteRendimientoSchema = z.object({
  periodoId: z.string().optional(),
});

export type QueryReporteRendimientoDto = z.infer<
  typeof queryReporteRendimientoSchema
>;
