import { z } from 'zod';

const sobrescrituraSchema = z.object({
  grupoId: z.string().cuid('ID de grupo inválido'),
  estudianteId: z.string().cuid('ID de estudiante inválido'),
  estado: z.enum(['PROMOVIDO', 'REPITENTE'], {
    message: 'El estado sobrescrito debe ser PROMOVIDO o REPITENTE',
  }),
  justificacion: z.string().trim().optional(),
});

export const confirmarCierreSchema = z.object({
  sobrescrituras: z.array(sobrescrituraSchema).optional().default([]),
});

export type ConfirmarCierreDto = z.infer<typeof confirmarCierreSchema>;
