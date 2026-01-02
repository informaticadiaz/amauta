/**
 * DTO para query params de listado de cursos
 */

import { z } from 'zod';

export const queryCursosSchema = z.object({
  // Paginación
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),

  // Filtros
  categoriaId: z.string().cuid('ID de categoría inválido').optional(),
  nivel: z.enum(['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO']).optional(),
  estado: z.enum(['BORRADOR', 'REVISION', 'PUBLICADO', 'ARCHIVADO']).optional(),

  // Búsqueda
  buscar: z.string().max(100).optional(),

  // Ordenamiento
  ordenarPor: z
    .enum(['createdAt', 'titulo', 'publicadoEn'])
    .default('createdAt'),
  orden: z.enum(['asc', 'desc']).default('desc'),
});

export type QueryCursosDto = z.infer<typeof queryCursosSchema>;
