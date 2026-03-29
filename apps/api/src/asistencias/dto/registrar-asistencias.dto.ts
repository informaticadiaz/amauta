import { z } from 'zod';

const asistenciaItemSchema = z.object({
  estudianteId: z.string().cuid('ID de estudiante inválido'),
  estado: z.enum(['PRESENTE', 'AUSENTE', 'TARDANZA', 'JUSTIFICADO'], {
    message:
      'Estado inválido. Debe ser PRESENTE, AUSENTE, TARDANZA o JUSTIFICADO',
  }),
  observaciones: z
    .string()
    .trim()
    .min(1, 'La observación no puede estar vacía')
    .optional()
    .nullable(),
});

export const registrarAsistenciasSchema = z
  .object({
    fecha: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD'),
    asistencias: z
      .array(asistenciaItemSchema)
      .min(1, 'Debes enviar al menos una asistencia'),
  })
  .superRefine((data, ctx) => {
    const seen = new Set<string>();

    data.asistencias.forEach((asistencia, index) => {
      if (seen.has(asistencia.estudianteId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'No se puede repetir un estudiante en la misma carga',
          path: ['asistencias', index, 'estudianteId'],
        });
        return;
      }

      seen.add(asistencia.estudianteId);
    });
  });

export type RegistrarAsistenciasDto = z.infer<
  typeof registrarAsistenciasSchema
>;
