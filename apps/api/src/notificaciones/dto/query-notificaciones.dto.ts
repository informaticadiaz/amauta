import { z } from 'zod';

const leidaSchema = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((value) =>
    typeof value === 'boolean' ? value : value === 'true'
  );

export const queryNotificacionesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  leida: leidaSchema.optional(),
});

export type QueryNotificacionesDto = z.infer<typeof queryNotificacionesSchema>;
