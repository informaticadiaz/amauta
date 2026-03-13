/**
 * Servicio de Inscripciones
 *
 * Maneja la lógica de negocio para inscripción de estudiantes en cursos
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { PrismaService } from '../prisma/prisma.service';
import {
  queryInscripcionesSchema,
  type QueryInscripcionesDto,
} from './dto/query-inscripciones.dto';
import type { EstadoInscripcion } from '@prisma/client';

export interface InscripcionConCurso {
  id: string;
  estado: EstadoInscripcion;
  progreso: number;
  inscritoEn: Date;
  completadoEn: Date | null;
  curso: {
    id: string;
    titulo: string;
    slug: string;
    imagen: string | null;
    nivel: string;
    educador: {
      id: string;
      nombre: string;
      apellido: string;
    };
    _count: {
      lecciones: number;
    };
  };
}

interface ListaInscripcionesResult {
  inscripciones: InscripcionConCurso[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class InscripcionesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Inscribe a un estudiante en un curso
   */
  async inscribirse(
    cursoId: string,
    usuarioId: string
  ): Promise<InscripcionConCurso> {
    // Verificar que el curso existe y está publicado
    const curso = await this.prisma.curso.findUnique({
      where: { id: cursoId },
      select: { id: true, estado: true, titulo: true },
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    if (curso.estado !== 'PUBLICADO') {
      throw new BadRequestException(
        'Solo puedes inscribirte en cursos publicados'
      );
    }

    // Verificar si ya está inscrito
    const inscripcionExistente = await this.prisma.inscripcion.findUnique({
      where: {
        usuarioId_cursoId: {
          usuarioId,
          cursoId,
        },
      },
    });

    if (inscripcionExistente) {
      if (inscripcionExistente.estado === 'ACTIVO') {
        throw new ConflictException('Ya estás inscrito en este curso');
      }
      if (inscripcionExistente.estado === 'COMPLETADO') {
        throw new ConflictException('Ya completaste este curso');
      }
      // Si abandonó, reactivar la inscripción
      if (inscripcionExistente.estado === 'ABANDONADO') {
        const inscripcion = await this.prisma.inscripcion.update({
          where: { id: inscripcionExistente.id },
          data: {
            estado: 'ACTIVO',
            inscritoEn: new Date(),
          },
          include: this.getInscripcionInclude(),
        });
        return inscripcion;
      }
    }

    // Crear inscripción
    const inscripcion = await this.prisma.inscripcion.create({
      data: {
        usuarioId,
        cursoId,
      },
      include: this.getInscripcionInclude(),
    });

    return inscripcion;
  }

  /**
   * Cancela/abandona una inscripción (soft delete)
   */
  async cancelarInscripcion(cursoId: string, usuarioId: string): Promise<void> {
    const inscripcion = await this.prisma.inscripcion.findUnique({
      where: {
        usuarioId_cursoId: {
          usuarioId,
          cursoId,
        },
      },
    });

    if (!inscripcion) {
      throw new NotFoundException('No estás inscrito en este curso');
    }

    if (inscripcion.estado === 'ABANDONADO') {
      throw new BadRequestException(
        'Ya cancelaste tu inscripción en este curso'
      );
    }

    // Soft delete: cambiar estado a ABANDONADO
    await this.prisma.inscripcion.update({
      where: { id: inscripcion.id },
      data: { estado: 'ABANDONADO' },
    });
  }

  /**
   * Obtiene el estado de inscripción del usuario en un curso
   */
  async obtenerEstadoInscripcion(
    cursoId: string,
    usuarioId: string
  ): Promise<InscripcionConCurso | null> {
    const inscripcion = await this.prisma.inscripcion.findUnique({
      where: {
        usuarioId_cursoId: {
          usuarioId,
          cursoId,
        },
      },
      include: this.getInscripcionInclude(),
    });

    return inscripcion;
  }

  /**
   * Lista las inscripciones del usuario (mis cursos)
   */
  async listarMisInscripciones(
    usuarioId: string,
    query: QueryInscripcionesDto
  ): Promise<ListaInscripcionesResult> {
    // Validar query params
    const result = queryInscripcionesSchema.safeParse(query);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Parámetros inválidos';
      throw new BadRequestException(message);
    }

    const { page, limit, estado, ordenarPor, orden } = result.data;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: {
      usuarioId: string;
      estado?: EstadoInscripcion;
    } = {
      usuarioId,
    };

    if (estado) {
      where.estado = estado as EstadoInscripcion;
    }

    // Ejecutar queries en paralelo
    const [inscripciones, total] = await Promise.all([
      this.prisma.inscripcion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [ordenarPor]: orden },
        include: this.getInscripcionInclude(),
      }),
      this.prisma.inscripcion.count({ where }),
    ]);

    return {
      inscripciones,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Include común para queries de inscripción
   */
  private getInscripcionInclude() {
    return {
      curso: {
        select: {
          id: true,
          titulo: true,
          slug: true,
          imagen: true,
          nivel: true,
          educador: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
          _count: {
            select: {
              lecciones: true,
            },
          },
        },
      },
    };
  }
}
