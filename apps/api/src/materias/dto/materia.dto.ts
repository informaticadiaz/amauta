import { z } from 'zod';

export const createMateriaSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
  descripcion: z.string().trim().max(500).nullable().optional(),
});
export const updateMateriaSchema = createMateriaSchema.partial().extend({
  activo: z.boolean().optional(),
});
export type CreateMateriaDto = z.infer<typeof createMateriaSchema>;
export type UpdateMateriaDto = z.infer<typeof updateMateriaSchema>;
