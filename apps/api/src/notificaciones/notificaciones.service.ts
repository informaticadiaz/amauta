import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { PrismaService } from '../prisma/prisma.service';
import {
  queryNotificacionesSchema,
  type QueryNotificacionesDto,
} from './dto/query-notificaciones.dto';

type NotificacionesPrismaClient = Pick<
  PrismaService,
  'usuario' | 'notificacion'
>;

export interface NotificacionItem {
  id: string;
  usuarioId: string;
  tipo: 'NUEVA_RESPUESTA' | 'SOLUCION_MARCADA' | 'PREGUNTA_SIN_RESPONDER';
  leida: boolean;
  postId: string | null;
  respuestaId: string | null;
  creadoEn: Date;
}

export interface ListaNotificacionesResponse {
  notificaciones: NotificacionItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CrearNotificacionForoParams {
  actorId: string;
  destinatarioId: string;
  postId: string;
  respuestaId: string;
}

@Injectable()
export class NotificacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(
    usuarioId: string,
    query: QueryNotificacionesDto
  ): Promise<ListaNotificacionesResponse> {
    const result = queryNotificacionesSchema.safeParse(query);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Parámetros inválidos'
      );
    }

    const { page, limit, leida } = result.data;
    const skip = (page - 1) * limit;
    const where = {
      usuarioId,
      ...(leida !== undefined ? { leida } : {}),
    };

    const [notificaciones, total] = await Promise.all([
      this.prisma.notificacion.findMany({
        where,
        orderBy: {
          creadoEn: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.notificacion.count({ where }),
    ]);

    return {
      notificaciones,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async marcarComoLeida(
    notificacionId: string,
    usuarioId: string
  ): Promise<NotificacionItem> {
    const notificacion = await this.prisma.notificacion.findFirst({
      where: {
        id: notificacionId,
        usuarioId,
      },
    });

    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }

    if (notificacion.leida) {
      return notificacion;
    }

    return this.prisma.notificacion.update({
      where: {
        id: notificacionId,
      },
      data: {
        leida: true,
      },
    });
  }

  async crearNotificacionNuevaRespuesta(
    params: CrearNotificacionForoParams,
    prismaClient: NotificacionesPrismaClient = this.prisma
  ): Promise<NotificacionItem | null> {
    if (params.actorId === params.destinatarioId) {
      return null;
    }

    const destinatarioActivo = await this.obtenerDestinatarioActivo(
      params.destinatarioId,
      prismaClient
    );
    if (!destinatarioActivo) {
      return null;
    }

    const existente = await prismaClient.notificacion.findFirst({
      where: {
        usuarioId: params.destinatarioId,
        tipo: 'NUEVA_RESPUESTA',
        postId: params.postId,
        leida: false,
      },
    });

    if (existente) {
      return null;
    }

    return prismaClient.notificacion.create({
      data: {
        usuarioId: params.destinatarioId,
        tipo: 'NUEVA_RESPUESTA',
        postId: params.postId,
        respuestaId: params.respuestaId,
      },
    });
  }

  async crearNotificacionSolucionMarcada(
    params: CrearNotificacionForoParams,
    prismaClient: NotificacionesPrismaClient = this.prisma
  ): Promise<NotificacionItem | null> {
    if (params.actorId === params.destinatarioId) {
      return null;
    }

    const destinatarioActivo = await this.obtenerDestinatarioActivo(
      params.destinatarioId,
      prismaClient
    );
    if (!destinatarioActivo) {
      return null;
    }

    return prismaClient.notificacion.create({
      data: {
        usuarioId: params.destinatarioId,
        tipo: 'SOLUCION_MARCADA',
        postId: params.postId,
        respuestaId: params.respuestaId,
      },
    });
  }

  private async obtenerDestinatarioActivo(
    usuarioId: string,
    prismaClient: NotificacionesPrismaClient
  ): Promise<boolean> {
    const usuario = await prismaClient.usuario.findUnique({
      where: {
        id: usuarioId,
      },
      select: {
        id: true,
        activo: true,
      },
    });

    return Boolean(usuario?.activo);
  }
}
