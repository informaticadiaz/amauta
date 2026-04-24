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
  createForoPostSchema,
  type CreateForoPostDto,
} from './dto/create-foro-post.dto';
import {
  createForoRespuestaSchema,
  type CreateForoRespuestaDto,
} from './dto/create-foro-respuesta.dto';
import { queryForosSchema, type QueryForosDto } from './dto/query-foros.dto';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { NotificacionesService } from '../notificaciones/notificaciones.service';

const CONTENIDO_ELIMINADO = '[contenido eliminado]';

interface UsuarioAcceso {
  id: string;
  rol: 'ESTUDIANTE' | 'EDUCADOR' | 'ADMIN_ESCUELA' | 'SUPER_ADMIN';
  perfil: {
    institucion: string | null;
  } | null;
}

interface CursoAcceso {
  id: string;
  educadorId: string;
  educador: {
    perfil: {
      institucion: string | null;
    } | null;
  };
}

interface AutorResumen {
  id: string;
  nombre: string;
  apellido: string;
}

export interface ForoPostListItem {
  id: string;
  tipo: 'PREGUNTA' | 'DISCUSION' | 'ANUNCIO';
  titulo: string;
  contenido: string;
  etiquetas: string[];
  estado: 'PUBLICADO' | 'CERRADO' | 'ELIMINADO';
  eliminado: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
  autor: AutorResumen;
  responseCount: number;
}

export interface ListaForoPostsResponse {
  posts: ForoPostListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ForoRespuestaItem {
  id: string;
  contenido: string;
  eliminado: boolean;
  esSolucion: boolean;
  esUtil: number;
  marcoUtil: boolean;
  respuestaParentId: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
  autor: AutorResumen;
}

export interface ForoPostDetalleResponse extends ForoPostListItem {
  respuestas: ForoRespuestaItem[];
}

@Injectable()
export class ForosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacionesService: NotificacionesService
  ) {}

  async listarPosts(
    cursoId: string,
    query: QueryForosDto,
    usuarioId: string
  ): Promise<ListaForoPostsResponse> {
    const result = queryForosSchema.safeParse(query);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Parámetros inválidos'
      );
    }

    await this.validarParticipacionEnCurso(cursoId, usuarioId);

    const { page, limit, tipo, etiqueta, sinResponder } = result.data;
    const skip = (page - 1) * limit;
    const where = {
      cursoId,
      ...(tipo ? { tipo } : {}),
      ...(etiqueta ? { etiquetas: { has: etiqueta } } : {}),
      ...(sinResponder ? { respuestas: { none: { eliminado: false } } } : {}),
    };

    const [posts, total] = await Promise.all([
      this.prisma.foroPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { creadoEn: 'desc' },
        include: {
          autor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
          respuestas: {
            where: { eliminado: false },
            select: { id: true },
          },
        },
      }),
      this.prisma.foroPost.count({ where }),
    ]);

    return {
      posts: posts.map((post) => this.mapPost(post)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async crearPost(
    cursoId: string,
    dto: CreateForoPostDto,
    usuarioId: string
  ): Promise<ForoPostListItem> {
    const result = createForoPostSchema.safeParse(dto);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Datos inválidos'
      );
    }

    const acceso = await this.validarParticipacionEnCurso(cursoId, usuarioId, {
      requireEnrollmentForNonModerators: true,
    });

    if (result.data.tipo === 'ANUNCIO' && !acceso.isModerator) {
      throw new ForbiddenException(
        'Solo educadores o administradores pueden crear anuncios'
      );
    }

    const post = await this.prisma.foroPost.create({
      data: {
        cursoId,
        autorId: usuarioId,
        tipo: result.data.tipo,
        titulo: result.data.titulo,
        contenido: result.data.contenido,
        etiquetas: this.normalizarEtiquetas(result.data.etiquetas),
      },
      include: {
        autor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        respuestas: {
          where: { eliminado: false },
          select: { id: true },
        },
      },
    });

    return this.mapPost(post);
  }

  async obtenerDetallePost(
    cursoId: string,
    postId: string,
    usuarioId: string
  ): Promise<ForoPostDetalleResponse> {
    await this.validarParticipacionEnCurso(cursoId, usuarioId);

    const post = await this.prisma.foroPost.findFirst({
      where: {
        id: postId,
        cursoId,
      },
      include: {
        autor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        respuestas: {
          orderBy: { creadoEn: 'asc' },
          include: {
            autor: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
              },
            },
            _count: {
              select: {
                reacciones: true,
              },
            },
            reacciones: {
              where: {
                usuarioId,
              },
              select: {
                usuarioId: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    const mapped = this.mapPost(post);

    return {
      ...mapped,
      respuestas: post.respuestas.map((respuesta) => ({
        ...this.mapRespuesta(respuesta),
      })),
    };
  }

  async responderPost(
    cursoId: string,
    postId: string,
    dto: CreateForoRespuestaDto,
    usuarioId: string
  ): Promise<ForoRespuestaItem> {
    const result = createForoRespuestaSchema.safeParse(dto);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Datos inválidos'
      );
    }

    await this.validarParticipacionEnCurso(cursoId, usuarioId, {
      requireEnrollmentForNonModerators: true,
    });

    const post = await this.prisma.foroPost.findFirst({
      where: {
        id: postId,
        cursoId,
      },
    });

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    if (post.eliminado || post.estado !== 'PUBLICADO') {
      throw new BadRequestException(
        'No se pueden crear respuestas en un thread cerrado o eliminado'
      );
    }

    if (result.data.respuestaParentId) {
      const parent = await this.prisma.foroRespuesta.findUnique({
        where: { id: result.data.respuestaParentId },
        select: {
          id: true,
          postId: true,
          respuestaParentId: true,
        },
      });

      if (!parent || parent.postId !== postId) {
        throw new BadRequestException(
          'La respuesta padre no pertenece al post'
        );
      }

      if (parent.respuestaParentId) {
        throw new BadRequestException(
          'Solo se permite un nivel de anidación en respuestas'
        );
      }
    }

    const respuesta = await this.prisma.$transaction(async (tx) => {
      const created = await tx.foroRespuesta.create({
        data: {
          postId,
          autorId: usuarioId,
          contenido: result.data.contenido,
          respuestaParentId: result.data.respuestaParentId ?? null,
        },
        include: {
          autor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
        },
      });

      await this.notificacionesService.crearNotificacionNuevaRespuesta(
        {
          actorId: usuarioId,
          destinatarioId: post.autorId,
          postId: post.id,
          respuestaId: created.id,
        },
        tx
      );

      return created;
    });

    return {
      id: respuesta.id,
      contenido: respuesta.contenido,
      eliminado: respuesta.eliminado,
      esSolucion: respuesta.esSolucion,
      esUtil: 0,
      marcoUtil: false,
      respuestaParentId: respuesta.respuestaParentId ?? null,
      creadoEn: respuesta.creadoEn,
      actualizadoEn: respuesta.actualizadoEn,
      autor: respuesta.autor,
    };
  }

  async marcarRespuestaComoSolucion(
    respuestaId: string,
    usuarioId: string
  ): Promise<ForoRespuestaItem> {
    const respuesta = await this.prisma.foroRespuesta.findUnique({
      where: { id: respuestaId },
      include: {
        post: {
          select: {
            id: true,
            autorId: true,
            cursoId: true,
            curso: {
              select: {
                id: true,
                educadorId: true,
                educador: {
                  select: {
                    perfil: {
                      select: {
                        institucion: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!respuesta || respuesta.eliminado) {
      throw new NotFoundException('Respuesta no encontrada');
    }

    const user = await this.obtenerUsuarioAcceso(usuarioId);
    const canMarkSolution =
      respuesta.post.autorId === usuarioId ||
      this.esModerador(user, respuesta.post.curso);

    if (!canMarkSolution) {
      throw new ForbiddenException(
        'No tienes permiso para marcar esta respuesta como solución'
      );
    }

    if (respuesta.esSolucion) {
      return this.obtenerRespuestaDetalle(respuestaId, usuarioId);
    }

    await this.prisma.$transaction(async (tx) => {
      const respuestaActual = await tx.foroRespuesta.findFirst({
        where: {
          postId: respuesta.postId,
          esSolucion: true,
        },
        select: {
          id: true,
        },
      });

      if (respuestaActual && respuestaActual.id !== respuestaId) {
        await tx.foroRespuesta.update({
          where: { id: respuestaActual.id },
          data: { esSolucion: false },
        });
      }

      await tx.foroRespuesta.update({
        where: { id: respuestaId },
        data: { esSolucion: true },
      });

      await this.notificacionesService.crearNotificacionSolucionMarcada(
        {
          actorId: usuarioId,
          destinatarioId: respuesta.autorId,
          postId: respuesta.post.id,
          respuestaId,
        },
        tx
      );
    });

    return this.obtenerRespuestaDetalle(respuestaId, usuarioId);
  }

  async marcarRespuestaComoUtil(
    respuestaId: string,
    usuarioId: string
  ): Promise<ForoRespuestaItem> {
    const respuesta = await this.prisma.foroRespuesta.findUnique({
      where: { id: respuestaId },
      include: {
        post: {
          select: {
            id: true,
            cursoId: true,
          },
        },
      },
    });

    if (!respuesta || respuesta.eliminado) {
      throw new NotFoundException('Respuesta no encontrada');
    }

    await this.validarParticipacionEnCurso(respuesta.post.cursoId, usuarioId, {
      requireEnrollmentForNonModerators: true,
    });

    try {
      await this.prisma.reaccionForo.create({
        data: {
          respuestaId,
          usuarioId,
        },
      });
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Ya marcaste esta respuesta como útil');
      }

      throw error;
    }

    return this.obtenerRespuestaDetalle(respuestaId, usuarioId);
  }

  async eliminarPost(
    cursoId: string,
    postId: string,
    usuarioId: string
  ): Promise<void> {
    const post = await this.prisma.foroPost.findFirst({
      where: {
        id: postId,
        cursoId,
      },
      include: {
        curso: {
          select: {
            id: true,
            educadorId: true,
            educador: {
              select: {
                perfil: {
                  select: {
                    institucion: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    const user = await this.obtenerUsuarioAcceso(usuarioId);
    if (!(post.autorId === usuarioId || this.esModerador(user, post.curso))) {
      throw new ForbiddenException('No tienes permiso para eliminar este post');
    }

    await this.prisma.foroPost.update({
      where: { id: postId },
      data: {
        eliminado: true,
        estado: 'ELIMINADO',
      },
    });
  }

  async eliminarRespuesta(
    cursoId: string,
    postId: string,
    respuestaId: string,
    usuarioId: string
  ): Promise<void> {
    const respuesta = await this.prisma.foroRespuesta.findUnique({
      where: { id: respuestaId },
      include: {
        post: {
          select: {
            id: true,
            cursoId: true,
            curso: {
              select: {
                id: true,
                educadorId: true,
                educador: {
                  select: {
                    perfil: {
                      select: {
                        institucion: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (
      !respuesta ||
      respuesta.post.id !== postId ||
      respuesta.post.cursoId !== cursoId
    ) {
      throw new NotFoundException('Respuesta no encontrada');
    }

    const user = await this.obtenerUsuarioAcceso(usuarioId);
    if (
      !(
        respuesta.autorId === usuarioId ||
        this.esModerador(user, respuesta.post.curso)
      )
    ) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta respuesta'
      );
    }

    await this.prisma.foroRespuesta.update({
      where: { id: respuestaId },
      data: {
        eliminado: true,
      },
    });
  }

  async cerrarPost(
    cursoId: string,
    postId: string,
    usuarioId: string
  ): Promise<ForoPostListItem> {
    const post = await this.prisma.foroPost.findFirst({
      where: {
        id: postId,
        cursoId,
      },
      include: {
        autor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        respuestas: {
          where: { eliminado: false },
          select: { id: true },
        },
        curso: {
          select: {
            id: true,
            educadorId: true,
            educador: {
              select: {
                perfil: {
                  select: {
                    institucion: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    const user = await this.obtenerUsuarioAcceso(usuarioId);
    if (!(post.autorId === usuarioId || this.esModerador(user, post.curso))) {
      throw new ForbiddenException('No tienes permiso para cerrar este post');
    }

    if (post.eliminado || post.estado === 'ELIMINADO') {
      throw new BadRequestException('No se puede cerrar un post eliminado');
    }

    const updated = await this.prisma.foroPost.update({
      where: { id: postId },
      data: {
        estado: 'CERRADO',
      },
      include: {
        autor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        respuestas: {
          where: { eliminado: false },
          select: { id: true },
        },
      },
    });

    return this.mapPost(updated);
  }

  private async validarParticipacionEnCurso(
    cursoId: string,
    usuarioId: string,
    options?: {
      requireEnrollmentForNonModerators?: boolean;
    }
  ): Promise<{
    user: UsuarioAcceso;
    course: CursoAcceso;
    isModerator: boolean;
  }> {
    const [user, course] = await Promise.all([
      this.obtenerUsuarioAcceso(usuarioId),
      this.obtenerCursoAcceso(cursoId),
    ]);

    const isModerator = this.esModerador(user, course);
    if (isModerator) {
      return { user, course, isModerator };
    }

    const inscripcion = await this.prisma.inscripcion.findUnique({
      where: {
        usuarioId_cursoId: {
          usuarioId,
          cursoId,
        },
      },
      select: {
        estado: true,
      },
    });

    if (!inscripcion || inscripcion.estado !== 'ACTIVO') {
      const message = options?.requireEnrollmentForNonModerators
        ? 'Debes tener una inscripción activa para participar en el foro'
        : 'No tienes permiso para acceder a este foro';
      throw new ForbiddenException(message);
    }

    return { user, course, isModerator: false };
  }

  private async obtenerUsuarioAcceso(
    usuarioId: string
  ): Promise<UsuarioAcceso> {
    const user = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        rol: true,
        perfil: {
          select: {
            institucion: true,
          },
        },
      },
    });

    if (!user) {
      throw new ForbiddenException('Usuario no autorizado');
    }

    return user;
  }

  private async obtenerCursoAcceso(cursoId: string): Promise<CursoAcceso> {
    const course = await this.prisma.curso.findUnique({
      where: { id: cursoId },
      select: {
        id: true,
        educadorId: true,
        educador: {
          select: {
            perfil: {
              select: {
                institucion: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    return course;
  }

  private esModerador(user: UsuarioAcceso, course: CursoAcceso): boolean {
    if (user.rol === 'SUPER_ADMIN') {
      return true;
    }

    if (course.educadorId === user.id) {
      return true;
    }

    return (
      user.rol === 'ADMIN_ESCUELA' &&
      Boolean(user.perfil?.institucion) &&
      user.perfil?.institucion === course.educador.perfil?.institucion
    );
  }

  private normalizarEtiquetas(etiquetas: string[]): string[] {
    return Array.from(
      new Set(etiquetas.map((etiqueta) => etiqueta.trim()).filter(Boolean))
    );
  }

  private async obtenerRespuestaDetalle(
    respuestaId: string,
    usuarioId: string
  ): Promise<ForoRespuestaItem> {
    const respuesta = await this.prisma.foroRespuesta.findUnique({
      where: { id: respuestaId },
      include: {
        autor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        _count: {
          select: {
            reacciones: true,
          },
        },
        reacciones: {
          where: {
            usuarioId,
          },
          select: {
            usuarioId: true,
          },
        },
      },
    });

    if (!respuesta) {
      throw new NotFoundException('Respuesta no encontrada');
    }

    return this.mapRespuesta(respuesta);
  }

  private mapRespuesta(respuesta: {
    id: string;
    contenido: string;
    eliminado: boolean;
    esSolucion: boolean;
    respuestaParentId: string | null;
    creadoEn: Date;
    actualizadoEn: Date;
    autor: AutorResumen;
    _count?: {
      reacciones: number;
    };
    reacciones?: Array<{
      usuarioId: string;
    }>;
  }): ForoRespuestaItem {
    return {
      id: respuesta.id,
      contenido: respuesta.eliminado
        ? CONTENIDO_ELIMINADO
        : respuesta.contenido,
      eliminado: respuesta.eliminado,
      esSolucion: respuesta.esSolucion,
      esUtil: respuesta._count?.reacciones ?? 0,
      marcoUtil: (respuesta.reacciones?.length ?? 0) > 0,
      respuestaParentId: respuesta.respuestaParentId ?? null,
      creadoEn: respuesta.creadoEn,
      actualizadoEn: respuesta.actualizadoEn,
      autor: respuesta.autor,
    };
  }

  private mapPost(post: {
    id: string;
    tipo: 'PREGUNTA' | 'DISCUSION' | 'ANUNCIO';
    titulo: string;
    contenido: string;
    etiquetas: string[];
    estado: 'PUBLICADO' | 'CERRADO' | 'ELIMINADO';
    eliminado: boolean;
    creadoEn: Date;
    actualizadoEn: Date;
    autor: AutorResumen;
    respuestas: { id: string }[];
  }): ForoPostListItem {
    return {
      id: post.id,
      tipo: post.tipo,
      titulo: post.titulo,
      contenido:
        post.eliminado || post.estado === 'ELIMINADO'
          ? CONTENIDO_ELIMINADO
          : post.contenido,
      etiquetas: post.etiquetas,
      estado: post.estado,
      eliminado: post.eliminado,
      creadoEn: post.creadoEn,
      actualizadoEn: post.actualizadoEn,
      autor: post.autor,
      responseCount: post.respuestas.length,
    };
  }
}
