import { z } from 'zod';

export const queryBoletinSchema = z.object({
  periodoId: z.string().cuid('ID de período inválido'),
  grupoId: z.string().cuid('ID de grupo inválido'),
});

export type QueryBoletinDto = z.infer<typeof queryBoletinSchema>;
