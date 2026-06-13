/**
 * DTO para crear una lección
 */

import { z } from 'zod';

const contenidoTextoSchema = z.object({
  texto: z.string().min(1, 'El contenido de texto es requerido'),
});

const contenidoVideoSchema = z.object({
  videoUrl: z.string().url('URL de video inválida'),
  duracionSegundos: z.number().int().positive().optional(),
  // Campos adicionales para media subida (video/audio vía MinIO, F7-003)
  provider: z.enum(['youtube', 'vimeo', 'local']).optional(),
  storageKey: z.string().optional(),
  mimeType: z.string().optional(),
  size: z.number().int().positive().optional(),
});

const contenidoMixtoSchema = z.object({
  texto: z.string().optional(),
  videoUrl: z.string().url('URL de video inválida').optional(),
  duracionSegundos: z.number().int().positive().optional(),
  provider: z.enum(['youtube', 'vimeo', 'local']).optional(),
  storageKey: z.string().optional(),
  mimeType: z.string().optional(),
  size: z.number().int().positive().optional(),
});

export const createLeccionSchema = z
  .object({
    titulo: z
      .string()
      .min(3, 'El título debe tener al menos 3 caracteres')
      .max(200, 'El título no puede exceder 200 caracteres'),
    descripcion: z
      .string()
      .max(1000, 'La descripción no puede exceder 1000 caracteres')
      .optional(),
    tipo: z.enum(['VIDEO', 'TEXTO', 'QUIZ', 'INTERACTIVO', 'DESCARGABLE'], {
      message: 'Tipo inválido',
    }),
    duracion: z
      .number()
      .int('La duración debe ser un número entero')
      .positive('La duración debe ser positiva')
      .optional(),
    contenido: z.union([
      contenidoTextoSchema,
      contenidoVideoSchema,
      contenidoMixtoSchema,
      z.record(z.string(), z.unknown()),
    ]),
    publicada: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.tipo === 'TEXTO') {
        return contenidoTextoSchema.safeParse(data.contenido).success;
      }
      if (data.tipo === 'VIDEO') {
        return contenidoVideoSchema.safeParse(data.contenido).success;
      }
      return true;
    },
    {
      message: 'El contenido no coincide con el tipo de lección',
    }
  );

export type CreateLeccionDto = z.infer<typeof createLeccionSchema>;
