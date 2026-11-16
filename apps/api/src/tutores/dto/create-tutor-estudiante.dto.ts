import { z } from 'zod';

export const createTutorEstudianteSchema = z.object({
  tutorId: z.string().min(1, 'El tutor es obligatorio'),
  estudianteId: z.string().min(1, 'El estudiante es obligatorio'),
  relacion: z.enum(['PADRE', 'MADRE', 'TUTOR_LEGAL', 'OTRO'], {
    message: 'Relación de tutor inválida',
  }),
});

export type CreateTutorEstudianteDto = z.infer<
  typeof createTutorEstudianteSchema
>;
