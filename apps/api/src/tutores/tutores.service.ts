import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { PrismaService } from '../prisma/prisma.service';
import {
  createTutorEstudianteSchema,
  type CreateTutorEstudianteDto,
} from './dto/create-tutor-estudiante.dto';
import {
  queryTutorEstudianteSchema,
  type QueryTutorEstudianteDto,
} from './dto/query-tutor-estudiante.dto';

const vinculoInclude = {
  tutor: {
    select: {
      id: true,
      email: true,
      nombre: true,
      apellido: true,
      activo: true,
    },
  },
  estudiante: {
    select: {
      id: true,
      email: true,
      nombre: true,
      apellido: true,
      activo: true,
    },
  },
} as const;

@Injectable()
export class TutoresService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolverInstitucion(institucionId: string, usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { rol: true, perfil: { select: { institucion: true } } },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    if (usuario.rol === 'SUPER_ADMIN') {
      const institucion = await this.prisma.institucion.findUnique({
        where: { id: institucionId },
        select: { id: true, nombre: true },
      });
      if (!institucion)
        throw new NotFoundException('Institución no encontrada');
      return institucion;
    }

    if (usuario.rol !== 'ADMIN_ESCUELA') {
      throw new ForbiddenException('No tienes permiso para gestionar vínculos');
    }
    const nombre = usuario.perfil?.institucion;
    if (!nombre)
      throw new BadRequestException('Usuario sin institución asociada');
    const institucion = await this.prisma.institucion.findFirst({
      where: { nombre },
      select: { id: true, nombre: true },
    });
    if (!institucion) throw new NotFoundException('Institución no encontrada');
    if (institucion.id !== institucionId) {
      throw new ForbiddenException(
        'No tienes permiso para operar sobre otra institución'
      );
    }
    return institucion;
  }

  async crear(
    institucionId: string,
    dto: CreateTutorEstudianteDto,
    usuarioId: string
  ) {
    const result = createTutorEstudianteSchema.safeParse(dto);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Datos inválidos'
      );
    }
    const institucion = await this.resolverInstitucion(
      institucionId,
      usuarioId
    );
    const { tutorId, estudianteId, relacion } = result.data;

    const [tutor, estudiante, matricula, existente] = await Promise.all([
      this.prisma.usuario.findUnique({
        where: { id: tutorId },
        select: { id: true, rol: true, activo: true },
      }),
      this.prisma.usuario.findUnique({
        where: { id: estudianteId },
        select: { id: true, rol: true, activo: true },
      }),
      this.prisma.matricula.findFirst({
        where: {
          estudianteId,
          institucionId: institucion.id,
          estado: 'ACTIVA',
        },
        select: { id: true },
      }),
      this.prisma.tutorEstudiante.findUnique({
        where: { tutorId_estudianteId: { tutorId, estudianteId } },
        select: { id: true, activo: true },
      }),
    ]);

    if (!tutor) throw new NotFoundException('Tutor no encontrado');
    if (tutor.rol !== 'TUTOR')
      throw new BadRequestException('El usuario no es un tutor válido');
    if (!tutor.activo) throw new BadRequestException('El tutor está inactivo');
    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');
    if (estudiante.rol !== 'ESTUDIANTE')
      throw new BadRequestException('El usuario no es un estudiante válido');
    if (!estudiante.activo)
      throw new BadRequestException('El estudiante está inactivo');
    if (!matricula)
      throw new BadRequestException(
        'El estudiante no tiene una matrícula activa en la institución'
      );
    if (existente?.activo)
      throw new ConflictException(
        'Ya existe un vínculo activo para el tutor y estudiante'
      );

    return existente
      ? this.prisma.tutorEstudiante.update({
          where: { id: existente.id },
          data: { relacion, activo: true },
          include: vinculoInclude,
        })
      : this.prisma.tutorEstudiante.create({
          data: { tutorId, estudianteId, relacion },
          include: vinculoInclude,
        });
  }

  async listar(
    institucionId: string,
    query: QueryTutorEstudianteDto,
    usuarioId: string
  ) {
    const result = queryTutorEstudianteSchema.safeParse(query);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Parámetros inválidos'
      );
    }
    const institucion = await this.resolverInstitucion(
      institucionId,
      usuarioId
    );
    const { page, limit, buscar } = result.data;
    const skip = (page - 1) * limit;
    const where: Prisma.TutorEstudianteWhereInput = {
      activo: true,
      estudiante: {
        matriculas: {
          some: { institucionId: institucion.id, estado: 'ACTIVA' },
        },
        ...(buscar
          ? {
              OR: [
                { nombre: { contains: buscar, mode: 'insensitive' } },
                { apellido: { contains: buscar, mode: 'insensitive' } },
                { email: { contains: buscar, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
    };
    const [vinculos, total] = await Promise.all([
      this.prisma.tutorEstudiante.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: vinculoInclude,
      }),
      this.prisma.tutorEstudiante.count({ where }),
    ]);
    return {
      vinculos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async desactivar(
    institucionId: string,
    id: string,
    usuarioId: string
  ): Promise<void> {
    const institucion = await this.resolverInstitucion(
      institucionId,
      usuarioId
    );
    const vinculo = await this.prisma.tutorEstudiante.findUnique({
      where: { id },
      select: {
        id: true,
        activo: true,
        estudiante: {
          select: {
            matriculas: {
              where: { institucionId: institucion.id },
              select: { id: true },
              take: 1,
            },
          },
        },
      },
    });
    if (!vinculo || vinculo.estudiante.matriculas.length === 0) {
      throw new NotFoundException('Vínculo no encontrado en la institución');
    }
    if (!vinculo.activo) return;
    await this.prisma.tutorEstudiante.update({
      where: { id },
      data: { activo: false },
    });
  }
}
