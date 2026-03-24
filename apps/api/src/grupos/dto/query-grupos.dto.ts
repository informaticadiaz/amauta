import { z } from 'zod';

export const queryGruposSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  activo: z
    .preprocess((value) => {
      if (value === 'true' || value === true) return true;
      if (value === 'false' || value === false) return false;
      return value;
    }, z.boolean())
    .optional(),
  periodoAcademicoId: z.string().cuid().optional(),
});

export type QueryGruposDto = z.infer<typeof queryGruposSchema>;
