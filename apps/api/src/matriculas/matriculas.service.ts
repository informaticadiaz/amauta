import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { PrismaService } from '../prisma/prisma.service';
import {
  createMatriculaSchema,
  type CreateMatriculaDto,
} from './dto/create-matricula.dto';
import {
  queryMatriculasSchema,
  type QueryMatriculasDto,
} from './dto/query-matriculas.dto';
import {
  updateMatriculaSchema,
  type UpdateMatriculaDto,
} from './dto/update-matricula.dto';

const matriculaInclude = {
  estudiante: {
    select: {
      id: true,
      email: true,
      nombre: true,
      apellido: true,
      activo: true,
    },
  },
  periodoAcademico: {
    select: { id: true, nombre: true, fechaInicio: true, fechaFin: true },
  },
} as const;

export interface ListaMatriculasResponse {
  matriculas: unknown[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class MatriculasService {
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
      throw new ForbiddenException(
        'No tienes permiso para gestionar matrículas'
      );
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
    dto: CreateMatriculaDto,
    usuarioId: string
  ) {
    const result = createMatriculaSchema.safeParse(dto);
    if (!result.success)
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Datos inválidos'
      );
    const institucion = await this.resolverInstitucion(
      institucionId,
      usuarioId
    );
    const { estudianteId, periodoAcademicoId, observaciones } = result.data;

    const [estudiante, periodo, existente] = await Promise.all([
      this.prisma.usuario.findUnique({
        where: { id: estudianteId },
        select: { id: true, rol: true, activo: true },
      }),
      this.prisma.periodoAcademico.findUnique({
        where: { id: periodoAcademicoId },
        select: { id: true, institucionId: true },
      }),
      this.prisma.matricula.findUnique({
        where: {
          estudianteId_institucionId_periodoAcademicoId: {
            estudianteId,
            institucionId,
            periodoAcademicoId,
          },
        },
      }),
    ]);
    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');
    if (estudiante.rol !== 'ESTUDIANTE')
      throw new BadRequestException('El usuario no es un estudiante válido');
    if (!estudiante.activo)
      throw new BadRequestException('El estudiante está inactivo');
    if (!periodo)
      throw new NotFoundException('Período académico no encontrado');
    if (periodo.institucionId !== institucion.id)
      throw new BadRequestException(
        'El período académico no pertenece a la institución'
      );
    if (existente)
      throw new ConflictException(
        'Ya existe una matrícula para el estudiante en este período'
      );

    return this.prisma.matricula.create({
      data: {
        estudianteId,
        institucionId: institucion.id,
        periodoAcademicoId,
        observaciones: observaciones ?? null,
      },
      include: matriculaInclude,
    });
  }

  async listar(
    institucionId: string,
    query: QueryMatriculasDto,
    usuarioId: string
  ): Promise<ListaMatriculasResponse> {
    const result = queryMatriculasSchema.safeParse(query);
    if (!result.success)
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Parámetros inválidos'
      );
    const institucion = await this.resolverInstitucion(
      institucionId,
      usuarioId
    );
    const { page, limit, periodoAcademicoId, estado, buscar } = result.data;
    const skip = (page - 1) * limit;
    const where = {
      institucionId: institucion.id,
      ...(periodoAcademicoId ? { periodoAcademicoId } : {}),
      ...(estado ? { estado } : {}),
      ...(buscar
        ? {
            estudiante: {
              OR: [
                { nombre: { contains: buscar, mode: 'insensitive' as const } },
                {
                  apellido: { contains: buscar, mode: 'insensitive' as const },
                },
                { email: { contains: buscar, mode: 'insensitive' as const } },
              ],
            },
          }
        : {}),
    };
    const [matriculas, total] = await Promise.all([
      this.prisma.matricula.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fechaInscripcion: 'desc' },
        include: matriculaInclude,
      }),
      this.prisma.matricula.count({ where }),
    ]);
    return {
      matriculas,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async actualizar(id: string, dto: UpdateMatriculaDto, usuarioId: string) {
    const result = updateMatriculaSchema.safeParse(dto);
    if (!result.success)
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Datos inválidos'
      );
    const matricula = await this.prisma.matricula.findUnique({
      where: { id },
      select: { id: true, institucionId: true },
    });
    if (!matricula) throw new NotFoundException('Matrícula no encontrada');
    await this.resolverInstitucion(matricula.institucionId, usuarioId);
    return this.prisma.matricula.update({
      where: { id },
      data: result.data,
      include: matriculaInclude,
    });
  }
}
