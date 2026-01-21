/**
 * Servicio de Lecciones
 *
 * Maneja la lógica de negocio para gestión de lecciones
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { PrismaService } from '../prisma/prisma.service';
import {
  createLeccionSchema,
  type CreateLeccionDto,
} from './dto/create-leccion.dto';
import {
  updateLeccionSchema,
  reordenarLeccionesSchema,
  type UpdateLeccionDto,
  type ReordenarLeccionesDto,
} from './dto/update-leccion.dto';
import type { TipoLeccion, Prisma } from '@prisma/client';

export interface LeccionResponse {
  id: string;
  titulo: string;
  descripcion: string | null;
  orden: number;
  tipo: TipoLeccion;
  duracion: number | null;
  contenido: Prisma.JsonValue;
  publicada: boolean;
  createdAt: Date;
  updatedAt: Date;
  cursoId: string;
}

@Injectable()
export class LeccionesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verifica que el usuario sea propietario del curso
   */
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
        'No tienes permiso para modificar este curso'
      );
    }
  }

  /**
   * Verifica que la lección existe y el usuario es propietario del curso
   */
  private async verificarPropietarioLeccion(
    leccionId: string,
    usuarioId: string
  ): Promise<LeccionResponse> {
    const leccion = await this.prisma.leccion.findUnique({
      where: { id: leccionId },
      include: {
        curso: {
          select: { educadorId: true },
        },
      },
    });

    if (!leccion) {
      throw new NotFoundException('Lección no encontrada');
    }

    if (leccion.curso.educadorId !== usuarioId) {
      throw new ForbiddenException(
        'No tienes permiso para modificar esta lección'
      );
    }

    const { curso: _curso, ...leccionSinCurso } = leccion;
    return leccionSinCurso;
  }

  /**
   * Obtiene el siguiente orden para una nueva lección
   */
  private async obtenerSiguienteOrden(cursoId: string): Promise<number> {
    const ultimaLeccion = await this.prisma.leccion.findFirst({
      where: { cursoId },
      orderBy: { orden: 'desc' },
      select: { orden: true },
    });

    return ultimaLeccion ? ultimaLeccion.orden + 1 : 0;
  }

  /**
   * Crea una nueva lección
   */
  async crear(
    cursoId: string,
    dto: CreateLeccionDto,
    usuarioId: string
  ): Promise<LeccionResponse> {
    // Validar datos de entrada
    const result = createLeccionSchema.safeParse(dto);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Datos inválidos';
      throw new BadRequestException(message);
    }

    // Verificar propiedad del curso
    await this.verificarPropietarioCurso(cursoId, usuarioId);

    const { titulo, descripcion, tipo, duracion, contenido, publicada } =
      result.data;

    // Obtener siguiente orden
    const orden = await this.obtenerSiguienteOrden(cursoId);

    // Crear lección
    const leccion = await this.prisma.leccion.create({
      data: {
        titulo,
        descripcion,
        tipo: tipo as TipoLeccion,
        duracion,
        contenido: contenido as Prisma.JsonObject,
        publicada,
        orden,
        cursoId,
      },
    });

    return leccion;
  }

  /**
   * Lista las lecciones de un curso
   */
  async listarPorCurso(
    cursoId: string,
    soloPublicadas: boolean = false
  ): Promise<LeccionResponse[]> {
    // Verificar que el curso existe
    const curso = await this.prisma.curso.findUnique({
      where: { id: cursoId },
      select: { id: true },
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    const where: { cursoId: string; publicada?: boolean } = { cursoId };
    if (soloPublicadas) {
      where.publicada = true;
    }

    const lecciones = await this.prisma.leccion.findMany({
      where,
      orderBy: { orden: 'asc' },
    });

    return lecciones;
  }

  /**
   * Obtiene una lección por ID
   */
  async obtenerPorId(id: string): Promise<LeccionResponse> {
    const leccion = await this.prisma.leccion.findUnique({
      where: { id },
    });

    if (!leccion) {
      throw new NotFoundException('Lección no encontrada');
    }

    return leccion;
  }

  /**
   * Actualiza una lección
   */
  async actualizar(
    id: string,
    dto: UpdateLeccionDto,
    usuarioId: string
  ): Promise<LeccionResponse> {
    // Validar datos de entrada
    const result = updateLeccionSchema.safeParse(dto);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Datos inválidos';
      throw new BadRequestException(message);
    }

    // Verificar propiedad
    await this.verificarPropietarioLeccion(id, usuarioId);

    const { titulo, descripcion, tipo, duracion, contenido, publicada } =
      result.data;

    // Actualizar lección
    const leccion = await this.prisma.leccion.update({
      where: { id },
      data: {
        ...(titulo && { titulo }),
        ...(descripcion !== undefined && { descripcion }),
        ...(tipo && { tipo: tipo as TipoLeccion }),
        ...(duracion !== undefined && { duracion }),
        ...(contenido && { contenido: contenido as Prisma.JsonObject }),
        ...(publicada !== undefined && { publicada }),
      },
    });

    return leccion;
  }

  /**
   * Elimina una lección
   */
  async eliminar(id: string, usuarioId: string): Promise<void> {
    // Verificar propiedad
    const leccion = await this.verificarPropietarioLeccion(id, usuarioId);

    // Eliminar lección
    await this.prisma.leccion.delete({
      where: { id },
    });

    // Reordenar lecciones restantes
    await this.prisma.leccion.updateMany({
      where: {
        cursoId: leccion.cursoId,
        orden: { gt: leccion.orden },
      },
      data: {
        orden: { decrement: 1 },
      },
    });
  }

  /**
   * Reordena las lecciones de un curso
   */
  async reordenar(
    cursoId: string,
    dto: ReordenarLeccionesDto,
    usuarioId: string
  ): Promise<LeccionResponse[]> {
    // Validar datos de entrada
    const result = reordenarLeccionesSchema.safeParse(dto);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Datos inválidos';
      throw new BadRequestException(message);
    }

    // Verificar propiedad del curso
    await this.verificarPropietarioCurso(cursoId, usuarioId);

    const { lecciones } = result.data;

    // Verificar que todas las lecciones pertenecen al curso
    const leccionesDb = await this.prisma.leccion.findMany({
      where: { cursoId },
      select: { id: true },
    });

    const idsDb = new Set(leccionesDb.map((l) => l.id));
    const idsDto = new Set(lecciones.map((l) => l.id));

    for (const id of idsDto) {
      if (!idsDb.has(id)) {
        throw new BadRequestException(
          `La lección ${id} no pertenece a este curso`
        );
      }
    }

    // Actualizar orden de cada lección
    await this.prisma.$transaction(
      lecciones.map((l) =>
        this.prisma.leccion.update({
          where: { id: l.id },
          data: { orden: l.orden },
        })
      )
    );

    // Retornar lecciones ordenadas
    return this.listarPorCurso(cursoId);
  }
}
