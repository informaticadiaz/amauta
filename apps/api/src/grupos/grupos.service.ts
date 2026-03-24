/**
 * Servicio de gestión de grupos/clases
 */

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { PrismaService } from '../prisma/prisma.service';
import { createGrupoSchema, type CreateGrupoDto } from './dto/create-grupo.dto';
import { updateGrupoSchema, type UpdateGrupoDto } from './dto/update-grupo.dto';
import { queryGruposSchema, type QueryGruposDto } from './dto/query-grupos.dto';
import type { Grupo } from '@prisma/client';

export type GrupoResponse = Grupo;

export interface ListaGruposResponse {
  grupos: Grupo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class GruposService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolverInstitucionId(
    institucionId: string | undefined,
    usuarioId: string
  ): Promise<string> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        rol: true,
        perfil: { select: { institucion: true } },
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuario.rol === 'SUPER_ADMIN') {
      if (!institucionId) {
        throw new BadRequestException('Institución requerida');
      }

      const existe = await this.prisma.institucion.findUnique({
        where: { id: institucionId },
        select: { id: true },
      });

      if (!existe) {
        throw new NotFoundException('Institución no encontrada');
      }

      return institucionId;
    }

    if (usuario.rol !== 'ADMIN_ESCUELA') {
      throw new ForbiddenException('No tienes permiso para gestionar grupos');
    }

    const institucionNombre = usuario.perfil?.institucion;
    if (!institucionNombre) {
      throw new BadRequestException('Usuario sin institución asociada');
    }

    const institucion = await this.prisma.institucion.findFirst({
      where: { nombre: institucionNombre },
      select: { id: true },
    });

    if (!institucion) {
      throw new NotFoundException('Institución no encontrada para el usuario');
    }

    if (institucionId && institucionId !== institucion.id) {
      throw new ForbiddenException(
        'No tienes permiso para operar sobre otra institución'
      );
    }

    return institucion.id;
  }

  private async validarPeriodoAcademico(
    periodoAcademicoId: string,
    institucionId: string
  ): Promise<void> {
    const periodo = await this.prisma.periodoAcademico.findUnique({
      where: { id: periodoAcademicoId },
      select: { institucionId: true },
    });

    if (!periodo) {
      throw new NotFoundException('Periodo académico no encontrado');
    }

    if (periodo.institucionId !== institucionId) {
      throw new BadRequestException(
        'El periodo académico no pertenece a la institución'
      );
    }
  }

  private async validarEducador(
    educadorId: string,
    institucionId: string
  ): Promise<void> {
    const [educador, institucion] = await Promise.all([
      this.prisma.usuario.findUnique({
        where: { id: educadorId },
        select: { rol: true, perfil: { select: { institucion: true } } },
      }),
      this.prisma.institucion.findUnique({
        where: { id: institucionId },
        select: { nombre: true },
      }),
    ]);

    if (!institucion) {
      throw new NotFoundException('Institución no encontrada');
    }

    if (!educador) {
      throw new NotFoundException('Educador no encontrado');
    }

    if (educador.rol !== 'EDUCADOR') {
      throw new BadRequestException('El usuario no es un educador válido');
    }

    const institucionNombre = educador.perfil?.institucion;
    if (!institucionNombre) {
      throw new BadRequestException('Educador sin institución asociada');
    }

    if (institucionNombre !== institucion.nombre) {
      throw new BadRequestException(
        'El educador no pertenece a la institución'
      );
    }
  }

  /**
   * Crea un grupo en una institución
   */
  async crear(
    institucionId: string,
    dto: CreateGrupoDto,
    usuarioId: string
  ): Promise<GrupoResponse> {
    const result = createGrupoSchema.safeParse(dto);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Datos inválidos';
      throw new BadRequestException(message);
    }

    const institucionFinal = await this.resolverInstitucionId(
      institucionId,
      usuarioId
    );

    const { nombre, grado, seccion, educadorId, periodoAcademicoId } =
      result.data;

    await this.validarPeriodoAcademico(periodoAcademicoId, institucionFinal);
    await this.validarEducador(educadorId, institucionFinal);

    return this.prisma.grupo.create({
      data: {
        nombre,
        grado,
        seccion,
        educadorId,
        institucionId: institucionFinal,
        periodoAcademicoId,
      },
    });
  }

  /**
   * Lista grupos de una institución con filtros
   */
  async listar(
    institucionId: string,
    query: QueryGruposDto,
    usuarioId: string
  ): Promise<ListaGruposResponse> {
    const result = queryGruposSchema.safeParse(query);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Parámetros inválidos';
      throw new BadRequestException(message);
    }

    const institucionFinal = await this.resolverInstitucionId(
      institucionId,
      usuarioId
    );

    const { page, limit, activo, periodoAcademicoId } = result.data;
    const skip = (page - 1) * limit;

    const where = {
      institucionId: institucionFinal,
      ...(activo !== undefined ? { activo } : {}),
      ...(periodoAcademicoId ? { periodoAcademicoId } : {}),
    };

    const [grupos, total] = await Promise.all([
      this.prisma.grupo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.grupo.count({ where }),
    ]);

    return {
      grupos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtiene un grupo por ID
   */
  async obtenerPorId(id: string, usuarioId: string): Promise<GrupoResponse> {
    const grupo = await this.prisma.grupo.findUnique({ where: { id } });

    if (!grupo) {
      throw new NotFoundException('Grupo no encontrado');
    }

    await this.resolverInstitucionId(grupo.institucionId, usuarioId);

    return grupo;
  }

  /**
   * Actualiza un grupo
   */
  async actualizar(
    id: string,
    dto: UpdateGrupoDto,
    usuarioId: string
  ): Promise<GrupoResponse> {
    const result = updateGrupoSchema.safeParse(dto);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Datos inválidos';
      throw new BadRequestException(message);
    }

    if (Object.keys(result.data).length === 0) {
      throw new BadRequestException('No hay datos para actualizar');
    }

    const grupo = await this.prisma.grupo.findUnique({ where: { id } });

    if (!grupo) {
      throw new NotFoundException('Grupo no encontrado');
    }

    const institucionFinal = await this.resolverInstitucionId(
      grupo.institucionId,
      usuarioId
    );

    if (result.data.periodoAcademicoId) {
      await this.validarPeriodoAcademico(
        result.data.periodoAcademicoId,
        institucionFinal
      );
    }

    if (result.data.educadorId) {
      await this.validarEducador(result.data.educadorId, institucionFinal);
    }

    return this.prisma.grupo.update({
      where: { id },
      data: result.data,
    });
  }

  /**
   * Desactiva un grupo (soft delete)
   */
  async eliminar(id: string, usuarioId: string): Promise<void> {
    const grupo = await this.prisma.grupo.findUnique({ where: { id } });

    if (!grupo) {
      throw new NotFoundException('Grupo no encontrado');
    }

    await this.resolverInstitucionId(grupo.institucionId, usuarioId);

    await this.prisma.grupo.update({
      where: { id },
      data: { activo: false },
    });
  }
}
