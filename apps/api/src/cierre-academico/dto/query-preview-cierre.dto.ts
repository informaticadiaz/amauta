import { z } from 'zod';

export const queryPreviewCierreSchema = z.object({
  institucionId: z.string().cuid('ID de institución inválido'),
  periodoId: z.string().cuid('ID de período inválido'),
});

export type QueryPreviewCierreDto = z.infer<typeof queryPreviewCierreSchema>;
