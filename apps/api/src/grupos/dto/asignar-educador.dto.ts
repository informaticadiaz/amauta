import { z } from 'zod';

export const asignarEducadorGrupoSchema = z.object({
  educadorId: z.string().cuid('ID de educador inválido'),
  rol: z.enum(['TITULAR', 'SUPLENTE'], {
    message: 'Rol inválido. Debe ser TITULAR o SUPLENTE',
  }),
});

export type AsignarEducadorGrupoDto = z.infer<
  typeof asignarEducadorGrupoSchema
>;
