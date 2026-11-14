import { z } from 'zod';

const diaSemana = z.enum(['LUN', 'MAR', 'MIE', 'JUE', 'VIE']);
const hora = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'La hora debe tener formato HH:mm');

export const createHorarioSchema = z
  .object({
    materiaId: z.string().cuid('ID de materia inválido'),
    educadorId: z.string().cuid('ID de educador inválido'),
    diaSemana,
    horaInicio: hora,
    horaFin: hora,
  })
  .superRefine((data, ctx) => {
    if (data.horaInicio >= data.horaFin) {
      ctx.addIssue({
        code: 'custom',
        path: ['horaFin'],
        message: 'La hora de inicio debe ser menor que la hora de fin',
      });
    }
  });

export const updateHorarioSchema = createHorarioSchema.partial();

export const queryHorarioSchema = z.object({
  diaSemana: diaSemana.optional(),
});

export type CreateHorarioDto = z.infer<typeof createHorarioSchema>;
export type UpdateHorarioDto = z.infer<typeof updateHorarioSchema>;
export type QueryHorarioDto = z.infer<typeof queryHorarioSchema>;
