import { z } from 'zod';

export const updateMatriculaSchema = z
  .object({
    estado: z
      .enum(['ACTIVA', 'BAJA', 'EGRESADO'], {
        message: 'Estado de matrícula inválido',
      })
      .optional(),
    observaciones: z
      .string()
      .trim()
      .max(2000, 'Las observaciones no pueden exceder 2000 caracteres')
      .nullable()
      .optional(),
  })
  .refine(
    (data) => data.estado !== undefined || data.observaciones !== undefined,
    {
      message: 'Debe enviar al menos un campo para actualizar',
    }
  );

export type UpdateMatriculaDto = z.infer<typeof updateMatriculaSchema>;
