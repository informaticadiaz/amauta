/**
 * DTO para inscribirse en un curso
 * El cursoId viene de la URL, este DTO es para validaciones futuras
 */

import { z } from 'zod';

export const inscribirseSchema = z.object({
  cursoId: z.string().cuid('ID de curso inválido'),
});

export type InscribirseDto = z.infer<typeof inscribirseSchema>;
