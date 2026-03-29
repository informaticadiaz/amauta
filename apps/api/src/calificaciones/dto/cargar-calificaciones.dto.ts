import { z } from 'zod';

const calificacionItemSchema = z.object({
  estudianteId: z.string().cuid('ID de estudiante inválido'),
  nota: z.number({ message: 'La nota debe ser un número' }),
  observaciones: z
    .string()
    .trim()
    .min(1, 'La observación no puede estar vacía')
    .optional()
    .nullable(),
});

export const cargarCalificacionesSchema = z
  .object({
    periodoAcademicoId: z.string().cuid('ID de período académico inválido'),
    materia: z
      .string()
      .min(1, 'La materia no puede estar vacía')
      .max(100, 'La materia no puede exceder 100 caracteres'),
    calificaciones: z
      .array(calificacionItemSchema)
      .min(1, 'Debes enviar al menos una calificación'),
  })
  .superRefine((data, ctx) => {
    const seen = new Set<string>();

    data.calificaciones.forEach((item, index) => {
      if (seen.has(item.estudianteId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'No se puede repetir un estudiante en la misma carga',
          path: ['calificaciones', index, 'estudianteId'],
        });
        return;
      }
      seen.add(item.estudianteId);
    });
  });

export type CargarCalificacionesDto = z.infer<
  typeof cargarCalificacionesSchema
>;
