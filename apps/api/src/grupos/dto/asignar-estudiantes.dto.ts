import { z } from 'zod';

export const asignarEstudiantesGrupoSchema = z.object({
  estudiantesIds: z
    .array(z.string().cuid('ID de estudiante inválido'))
    .min(1, 'Debe enviar al menos un estudiante'),
});

export type AsignarEstudiantesGrupoDto = z.infer<
  typeof asignarEstudiantesGrupoSchema
>;
