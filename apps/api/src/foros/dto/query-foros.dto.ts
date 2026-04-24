import { z } from 'zod';

const booleanFromQuery = z.preprocess((value) => {
  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }

  return value;
}, z.boolean());

export const queryForosSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(20).default(20),
  tipo: z.enum(['PREGUNTA', 'DISCUSION', 'ANUNCIO']).optional(),
  etiqueta: z.string().trim().min(1).max(30).optional(),
  sinResponder: booleanFromQuery.optional(),
});

export type QueryForosDto = z.infer<typeof queryForosSchema>;
