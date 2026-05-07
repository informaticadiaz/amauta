import { z } from 'zod';

export const busquedaCursosSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  buscar: z.string().min(1).max(100).optional(),
  categoriaId: z.string().cuid('ID de categoría inválido').optional(),
  nivel: z.enum(['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO']).optional(),
  duracion: z.enum(['corta', 'media', 'larga']).optional(),
  idioma: z.string().max(10).optional(),
  // Si no se especifica: relevancia cuando hay buscar, publicadoEn cuando no hay
  ordenarPor: z.enum(['relevancia', 'publicadoEn', 'titulo']).optional(),
  orden: z.enum(['asc', 'desc']).default('desc'),
});

export type BusquedaCursosDto = z.infer<typeof busquedaCursosSchema>;
