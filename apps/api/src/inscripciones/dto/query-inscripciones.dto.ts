/**
 * DTO para query params de listado de inscripciones
 */

import { z } from 'zod';

export const queryInscripcionesSchema = z.object({
  // Paginación
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),

  // Filtros
  estado: z.enum(['ACTIVO', 'COMPLETADO', 'ABANDONADO']).optional(),

  // Ordenamiento
  ordenarPor: z.enum(['inscritoEn', 'progreso']).default('inscritoEn'),
  orden: z.enum(['asc', 'desc']).default('desc'),
});

export type QueryInscripcionesDto = z.infer<typeof queryInscripcionesSchema>;
