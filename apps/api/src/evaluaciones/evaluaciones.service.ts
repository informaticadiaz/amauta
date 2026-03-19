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
import {
  queryEvaluacionesSchema,
  type QueryEvaluacionesDto,
} from './dto/query-evaluaciones.dto';
import {
  publicarEvaluacionSchema,
  type PublicarEvaluacionDto,
} from './dto/publicar-evaluacion.dto';
import type { Evaluacion } from '@prisma/client';

export type EvaluacionResponse = Evaluacion;
export interface ListaEvaluacionesResponse {
  evaluaciones: Evaluacion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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

  /**
   * Lista evaluaciones de un curso con paginación
   */
  async listarPorCurso(
    cursoId: string,
    query: QueryEvaluacionesDto,
    usuarioId: string
  ): Promise<ListaEvaluacionesResponse> {
    const result = queryEvaluacionesSchema.safeParse(query);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Parámetros inválidos';
      throw new BadRequestException(message);
    }

    const { page, limit, publicada } = result.data;
    const skip = (page - 1) * limit;

    await this.verificarPropietarioCurso(cursoId, usuarioId);

    const where = {
      cursoId,
      ...(publicada !== undefined ? { publicada } : {}),
    };

    const [evaluaciones, total] = await Promise.all([
      this.prisma.evaluacion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.evaluacion.count({ where }),
    ]);

    return {
      evaluaciones,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtiene el detalle de una evaluación (sin preguntas)
   */
  async obtenerDetalle(
    evaluacionId: string,
    usuarioId: string
  ): Promise<EvaluacionResponse> {
    const evaluacion = await this.prisma.evaluacion.findUnique({
      where: { id: evaluacionId },
      include: { curso: { select: { educadorId: true } } },
    });

    if (!evaluacion) {
      throw new NotFoundException('Evaluación no encontrada');
    }

    if (evaluacion.curso.educadorId !== usuarioId) {
      throw new ForbiddenException(
        'No tienes permiso para ver esta evaluación'
      );
    }

    const { curso: _curso, ...detalle } = evaluacion;
    return detalle;
  }

  /**
   * Publica o despublica una evaluación
   */
  async cambiarEstadoPublicacion(
    evaluacionId: string,
    dto: PublicarEvaluacionDto,
    usuarioId: string
  ): Promise<EvaluacionResponse> {
    const result = publicarEvaluacionSchema.safeParse(dto);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Datos inválidos';
      throw new BadRequestException(message);
    }

    const evaluacion = await this.prisma.evaluacion.findUnique({
      where: { id: evaluacionId },
      include: { curso: { select: { educadorId: true } } },
    });

    if (!evaluacion) {
      throw new NotFoundException('Evaluación no encontrada');
    }

    if (evaluacion.curso.educadorId !== usuarioId) {
      throw new ForbiddenException(
        'No tienes permiso para modificar esta evaluación'
      );
    }

    const { publicar } = result.data;
    const publicada = publicar;
    const publicadoEn = publicar ? new Date() : null;

    const actualizado = await this.prisma.evaluacion.update({
      where: { id: evaluacionId },
      data: { publicada, publicadoEn },
    });

    return actualizado;
  }
}
