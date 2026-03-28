import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createPeriodoSchema } from './dto/create-periodo.dto';
import { updatePeriodoSchema } from './dto/update-periodo.dto';
import { upsertEscalaSchema } from './dto/upsert-escala.dto';
import {
  queryUsuariosInstitucionSchema,
  type QueryUsuariosInstitucionDto,
} from './dto/query-usuarios-institucion.dto';

export interface UsuarioInstitucionResponse {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  activo: boolean;
}

export interface ListaUsuariosInstitucionResponse {
  usuarios: UsuarioInstitucionResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class InstitucionesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  // ============================================================
  // PERÍODOS ACADÉMICOS
  // ============================================================

  async crearPeriodo(institucionId: string, dto: unknown) {
    const result = createPeriodoSchema.safeParse(dto);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Datos inválidos'
      );
    }

    await this.verificarInstitucion(institucionId);

    const { nombre, fechaInicio, fechaFin } = result.data;

    return this.prisma.periodoAcademico.create({
      data: {
        nombre,
        fechaInicio,
        fechaFin,
        institucionId,
      },
    });
  }

  async listarPeriodos(institucionId: string) {
    await this.verificarInstitucion(institucionId);

    return this.prisma.periodoAcademico.findMany({
      where: { institucionId },
      orderBy: { fechaInicio: 'desc' },
    });
  }

  async actualizarPeriodo(id: string, dto: unknown) {
    const result = updatePeriodoSchema.safeParse(dto);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Datos inválidos'
      );
    }

    const periodo = await this.prisma.periodoAcademico.findUnique({
      where: { id },
    });
    if (!periodo) {
      throw new NotFoundException('Período académico no encontrado');
    }

    return this.prisma.periodoAcademico.update({
      where: { id },
      data: result.data,
    });
  }

  async eliminarPeriodo(id: string): Promise<void> {
    const periodo = await this.prisma.periodoAcademico.findUnique({
      where: { id },
    });
    if (!periodo) {
      throw new NotFoundException('Período académico no encontrado');
    }

    await this.prisma.periodoAcademico.update({
      where: { id },
      data: { activo: false },
    });
  }

  // ============================================================
  // ESCALA DE CALIFICACIÓN
  // ============================================================

  async obtenerEscala(institucionId: string) {
    await this.verificarInstitucion(institucionId);

    return this.prisma.escalaCalificacion.findUnique({
      where: { institucionId },
    });
  }

  async upsertEscala(institucionId: string, dto: unknown) {
    const result = upsertEscalaSchema.safeParse(dto);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Datos inválidos'
      );
    }

    await this.verificarInstitucion(institucionId);

    const { notaMinima, notaMaxima, notaAprobacion, descripcion } = result.data;

    return this.prisma.escalaCalificacion.upsert({
      where: { institucionId },
      create: {
        institucionId,
        notaMinima,
        notaMaxima,
        notaAprobacion,
        descripcion: descripcion ?? null,
      },
      update: {
        notaMinima,
        notaMaxima,
        notaAprobacion,
        descripcion: descripcion ?? null,
      },
    });
  }

  // ============================================================
  // MI INSTITUCIÓN
  // ============================================================

  async obtenerMiInstitucion(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { perfil: { select: { institucion: true } } },
    });

    if (!usuario?.perfil?.institucion) {
      throw new BadRequestException('Usuario sin institución asociada');
    }

    const institucion = await this.prisma.institucion.findFirst({
      where: { nombre: usuario.perfil.institucion },
      select: { id: true, nombre: true },
    });

    if (!institucion) {
      throw new NotFoundException('Institución no encontrada');
    }

    const periodos = await this.prisma.periodoAcademico.findMany({
      where: { institucionId: institucion.id },
      orderBy: { fechaInicio: 'desc' },
      select: { id: true, nombre: true, activo: true },
    });

    return {
      institucionId: institucion.id,
      nombre: institucion.nombre,
      periodos,
    };
  }

  // ============================================================
  // USUARIOS POR INSTITUCIÓN
  // ============================================================

  async listarEstudiantes(
    institucionId: string,
    query: QueryUsuariosInstitucionDto,
    usuarioId: string
  ): Promise<ListaUsuariosInstitucionResponse> {
    return this.listarUsuariosPorInstitucion(
      institucionId,
      query,
      usuarioId,
      'ESTUDIANTE'
    );
  }

  async listarEducadores(
    institucionId: string,
    query: QueryUsuariosInstitucionDto,
    usuarioId: string
  ): Promise<ListaUsuariosInstitucionResponse> {
    return this.listarUsuariosPorInstitucion(
      institucionId,
      query,
      usuarioId,
      'EDUCADOR'
    );
  }

  // ============================================================
  // HELPERS
  // ============================================================

  private async verificarInstitucion(institucionId: string) {
    const institucion = await this.prisma.institucion.findUnique({
      where: { id: institucionId },
    });
    if (!institucion) {
      throw new NotFoundException('Institución no encontrada');
    }
    return institucion;
  }

  private async obtenerInstitucionPorId(institucionId: string) {
    const institucion = await this.prisma.institucion.findUnique({
      where: { id: institucionId },
      select: { id: true, nombre: true },
    });

    if (!institucion) {
      throw new NotFoundException('Institución no encontrada');
    }

    return institucion;
  }

  private async resolverInstitucionParaUsuario(
    institucionId: string,
    usuarioId: string
  ) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { rol: true, perfil: { select: { institucion: true } } },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuario.rol === 'SUPER_ADMIN') {
      return this.obtenerInstitucionPorId(institucionId);
    }

    if (usuario.rol !== 'ADMIN_ESCUELA') {
      throw new ForbiddenException('No tienes permiso para consultar usuarios');
    }

    const institucionNombre = usuario.perfil?.institucion;
    if (!institucionNombre) {
      throw new BadRequestException('Usuario sin institución asociada');
    }

    const institucion = await this.prisma.institucion.findFirst({
      where: { nombre: institucionNombre },
      select: { id: true, nombre: true },
    });

    if (!institucion) {
      throw new NotFoundException('Institución no encontrada');
    }

    if (institucionId && institucionId !== institucion.id) {
      throw new ForbiddenException(
        'No tienes permiso para consultar otra institución'
      );
    }

    return institucion;
  }

  private async listarUsuariosPorInstitucion(
    institucionId: string,
    query: QueryUsuariosInstitucionDto,
    usuarioId: string,
    rol: 'ESTUDIANTE' | 'EDUCADOR'
  ): Promise<ListaUsuariosInstitucionResponse> {
    const result = queryUsuariosInstitucionSchema.safeParse(query);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Parámetros inválidos'
      );
    }

    const institucion = await this.resolverInstitucionParaUsuario(
      institucionId,
      usuarioId
    );

    const { page, limit, buscar } = result.data;
    const skip = (page - 1) * limit;

    const where = {
      rol,
      activo: true,
      perfil: {
        is: {
          institucion: institucion.nombre,
        },
      },
      ...(buscar
        ? {
            OR: [
              { nombre: { contains: buscar, mode: 'insensitive' as const } },
              { apellido: { contains: buscar, mode: 'insensitive' as const } },
              { email: { contains: buscar, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [usuarios, total] = await Promise.all([
      this.prisma.usuario.findMany({
        where,
        skip,
        take: limit,
        orderBy: { apellido: 'asc' },
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          activo: true,
        },
      }),
      this.prisma.usuario.count({ where }),
    ]);

    return {
      usuarios,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
