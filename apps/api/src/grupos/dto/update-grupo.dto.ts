import { z } from 'zod';

export const updateGrupoSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(120, 'El nombre no puede exceder 120 caracteres')
    .optional(),
  grado: z
    .string()
    .min(1, 'El grado no puede estar vacío')
    .max(50, 'El grado no puede exceder 50 caracteres')
    .optional()
    .nullable(),
  seccion: z
    .string()
    .min(1, 'La sección no puede estar vacía')
    .max(50, 'La sección no puede exceder 50 caracteres')
    .optional()
    .nullable(),
  educadorId: z.string().cuid('ID de educador inválido').optional(),
  periodoAcademicoId: z
    .string()
    .cuid('ID de periodo académico inválido')
    .optional(),
  activo: z.boolean().optional(),
});

export type UpdateGrupoDto = z.infer<typeof updateGrupoSchema>;
