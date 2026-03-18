/**
 * Servicio de Evaluaciones
 *
 * Maneja la lógica de negocio para creación de evaluaciones
 */

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { PrismaService } from '../prisma/prisma.service';
import {
  createEvaluacionSchema,
  type CreateEvaluacionDto,
} from './dto/create-evaluacion.dto';
import type { Evaluacion } from '@prisma/client';

export type EvaluacionResponse = Evaluacion;

@Injectable()
export class EvaluacionesService {
  constructor(private readonly prisma: PrismaService) {}

  private async verificarPropietarioCurso(
    cursoId: string,
    usuarioId: string
  ): Promise<void> {
    const curso = await this.prisma.curso.findUnique({
      where: { id: cursoId },
      select: { educadorId: true },
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    if (curso.educadorId !== usuarioId) {
      throw new ForbiddenException(
        'No tienes permiso para crear evaluaciones en este curso'
      );
    }
  }

  /**
   * Crea una evaluación con datos básicos
   */
  async crear(
    dto: CreateEvaluacionDto,
    usuarioId: string
  ): Promise<EvaluacionResponse> {
    const result = createEvaluacionSchema.safeParse(dto);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Datos inválidos';
      throw new BadRequestException(message);
    }

    const {
      titulo,
      descripcion,
      cursoId,
      tiempoLimiteMin,
      puntajeMinimo,
      intentosMaximos,
    } = result.data;

    await this.verificarPropietarioCurso(cursoId, usuarioId);

    const evaluacion = await this.prisma.evaluacion.create({
      data: {
        titulo,
        descripcion,
        cursoId,
        tiempoLimiteMin,
        puntajeMinimo,
        intentosMaximos,
        creadorId: usuarioId,
      },
    });

    return evaluacion;
  }
}
