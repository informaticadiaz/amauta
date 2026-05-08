import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { PrismaService } from '../prisma/prisma.service';
import { createComunicadoSchema } from './dto/create-comunicado.dto';
import { updateComunicadoSchema } from './dto/update-comunicado.dto';
import {
  queryComunicadosSchema,
  type QueryComunicadosDto,
} from './dto/query-comunicados.dto';

interface AutorResumen {
  id: string;
  nombre: string;
  apellido: string;
}

interface ComunicadoConAutor {
  id: string;
  titulo: string;
  contenido: string;
  tipo: string;
  prioridad: string;
  archivado: boolean;
  publicadoEn: Date;
  createdAt: Date;
  updatedAt: Date;
  institucionId: string;
  autorId: string;
  autor: AutorResumen;
}

export interface ComunicadoResponse {
  comunicado: ComunicadoConAutor;
  message: string;
}

export interface ListaComunicadosResponse {
  comunicados: ComunicadoConAutor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UserAcceso {
  id: string;
  rol: string;
}

@Injectable()
export class ComunicadosService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(
    institucionId: string,
    dto: unknown,
    autorId: string
  ): Promise<ComunicadoResponse> {
    const result = createComunicadoSchema.safeParse(dto);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Datos inválidos'
      );
    }

    await this.verificarInstitucion(institucionId);

    const { titulo, contenido, tipo, prioridad } = result.data;

    const comunicado = await this.prisma.comunicado.create({
      data: {
        titulo,
        contenido,
        tipo,
        prioridad,
        institucionId,
        autorId,
      },
      include: {
        autor: { select: { id: true, nombre: true, apellido: true } },
      },
    });

    return {
      comunicado: comunicado as ComunicadoConAutor,
      message: 'Comunicado creado exitosamente',
    };
  }

  async listar(
    institucionId: string,
    query: QueryComunicadosDto
  ): Promise<ListaComunicadosResponse> {
    const result = queryComunicadosSchema.safeParse(query);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Parámetros inválidos'
      );
    }

    const { page, limit, tipo, prioridad } = result.data;
    const skip = (page - 1) * limit;

    const where = {
      institucionId,
      archivado: false,
      ...(tipo && { tipo }),
      ...(prioridad && { prioridad }),
    };

    const [comunicados, total] = await Promise.all([
      this.prisma.comunicado.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publicadoEn: 'desc' },
        include: {
          autor: { select: { id: true, nombre: true, apellido: true } },
        },
      }),
      this.prisma.comunicado.count({ where }),
    ]);

    return {
      comunicados: comunicados as ComunicadoConAutor[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async obtener(
    institucionId: string,
    comunicadoId: string
  ): Promise<ComunicadoResponse> {
    const comunicado = await this.prisma.comunicado.findUnique({
      where: { id: comunicadoId },
      include: {
        autor: { select: { id: true, nombre: true, apellido: true } },
      },
    });

    if (!comunicado || comunicado.institucionId !== institucionId) {
      throw new NotFoundException('Comunicado no encontrado');
    }

    return {
      comunicado: comunicado as ComunicadoConAutor,
      message: 'Comunicado obtenido exitosamente',
    };
  }

  async actualizar(
    institucionId: string,
    comunicadoId: string,
    dto: unknown,
    user: UserAcceso
  ): Promise<ComunicadoResponse> {
    const result = updateComunicadoSchema.safeParse(dto);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Datos inválidos'
      );
    }

    const comunicado = await this.prisma.comunicado.findUnique({
      where: { id: comunicadoId },
    });

    if (!comunicado || comunicado.institucionId !== institucionId) {
      throw new NotFoundException('Comunicado no encontrado');
    }

    const puedeEditar =
      comunicado.autorId === user.id ||
      user.rol === 'ADMIN_ESCUELA' ||
      user.rol === 'SUPER_ADMIN';

    if (!puedeEditar) {
      throw new ForbiddenException(
        'No tienes permiso para editar este comunicado'
      );
    }

    const actualizado = await this.prisma.comunicado.update({
      where: { id: comunicadoId },
      data: result.data,
      include: {
        autor: { select: { id: true, nombre: true, apellido: true } },
      },
    });

    return {
      comunicado: actualizado as ComunicadoConAutor,
      message: 'Comunicado actualizado exitosamente',
    };
  }

  async archivar(
    institucionId: string,
    comunicadoId: string,
    user: UserAcceso
  ): Promise<void> {
    const comunicado = await this.prisma.comunicado.findUnique({
      where: { id: comunicadoId },
    });

    if (!comunicado || comunicado.institucionId !== institucionId) {
      throw new NotFoundException('Comunicado no encontrado');
    }

    if (user.rol !== 'ADMIN_ESCUELA' && user.rol !== 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'Solo los administradores pueden archivar comunicados'
      );
    }

    await this.prisma.comunicado.update({
      where: { id: comunicadoId },
      data: { archivado: true },
    });
  }

  async crearParaInstitucionDelUsuario(
    dto: unknown,
    usuarioId: string,
    rol: string
  ): Promise<ComunicadoResponse> {
    if (rol === 'SUPER_ADMIN') {
      throw new BadRequestException(
        'SUPER_ADMIN debe especificar la institución explícitamente'
      );
    }
    const institucionId = await this.resolverInstitucionDelUsuario(usuarioId);
    return this.crear(institucionId, dto, usuarioId);
  }

  async getMisComunicados(
    usuarioId: string,
    query: QueryComunicadosDto
  ): Promise<ListaComunicadosResponse> {
    const institucionId = await this.resolverInstitucionDelUsuario(usuarioId);
    return this.listar(institucionId, query);
  }

  private async verificarInstitucion(institucionId: string) {
    const institucion = await this.prisma.institucion.findUnique({
      where: { id: institucionId },
    });
    if (!institucion) {
      throw new NotFoundException('Institución no encontrada');
    }
    return institucion;
  }

  private async resolverInstitucionDelUsuario(
    usuarioId: string
  ): Promise<string> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        rol: true,
        perfil: { select: { institucion: true } },
        gruposEducador: {
          where: { activo: true },
          take: 1,
          select: { grupo: { select: { institucionId: true } } },
        },
        gruposEstudiante: {
          where: { activo: true },
          take: 1,
          select: { grupo: { select: { institucionId: true } } },
        },
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuario.rol === 'ADMIN_ESCUELA') {
      const nombreInstitucion = usuario.perfil?.institucion;
      if (!nombreInstitucion) {
        throw new BadRequestException('Usuario sin institución asociada');
      }
      const institucion = await this.prisma.institucion.findFirst({
        where: { nombre: nombreInstitucion },
        select: { id: true },
      });
      if (!institucion) {
        throw new NotFoundException('Institución no encontrada');
      }
      return institucion.id;
    }

    if (usuario.rol === 'EDUCADOR') {
      const institucionId = usuario.gruposEducador[0]?.grupo?.institucionId;
      if (!institucionId) {
        throw new BadRequestException('Sin institución asociada');
      }
      return institucionId;
    }

    if (usuario.rol === 'ESTUDIANTE') {
      const institucionId = usuario.gruposEstudiante[0]?.grupo?.institucionId;
      if (!institucionId) {
        throw new BadRequestException('Sin institución asociada');
      }
      return institucionId;
    }

    throw new ForbiddenException('Rol no autorizado para comunicados');
  }
}
