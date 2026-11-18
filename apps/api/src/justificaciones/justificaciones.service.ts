import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { MultipartFile } from '@fastify/multipart';
import { Prisma } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { PrismaService } from '../prisma/prisma.service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { PrivateUploadService } from '../uploads/private-upload.service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { NotificacionesService } from '../notificaciones/notificaciones.service';

export interface JustificacionUser {
  id: string;
  rol: 'ESTUDIANTE' | 'TUTOR' | 'EDUCADOR' | 'ADMIN_ESCUELA' | 'SUPER_ADMIN';
}

export interface ResolucionJustificacionDto {
  estado: 'APROBADA' | 'RECHAZADA';
  motivoRechazo?: string;
}

const justificacionInclude = {
  asistencia: {
    include: {
      grupo: {
        include: {
          periodoAcademico: true,
          institucion: true,
        },
      },
      estudiante: { select: { id: true, nombre: true, apellido: true } },
    },
  },
  solicitante: {
    select: { id: true, nombre: true, apellido: true, rol: true },
  },
  revisadaPor: { select: { id: true, nombre: true, apellido: true } },
} as const;

@Injectable()
export class JustificacionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly privateUploadService: PrivateUploadService,
    private readonly notificacionesService: NotificacionesService
  ) {}

  async crear(
    asistenciaId: string,
    motivo: string,
    file: MultipartFile,
    user: JustificacionUser
  ) {
    const normalizedMotivo = motivo.trim();
    if (!normalizedMotivo) {
      throw new BadRequestException('El motivo es obligatorio');
    }
    if (!file) {
      throw new BadRequestException('Se requiere un archivo adjunto');
    }

    const asistencia = await this.prisma.asistencia.findUnique({
      where: { id: asistenciaId },
      include: {
        grupo: {
          include: { periodoAcademico: true, institucion: true },
        },
      },
    });
    if (!asistencia) throw new NotFoundException('Asistencia no encontrada');
    if (asistencia.estado !== 'AUSENTE') {
      throw new BadRequestException(
        'Solo se pueden justificar asistencias con estado AUSENTE'
      );
    }
    if (!asistencia.grupo.periodoAcademico) {
      throw new BadRequestException(
        'La asistencia no está asociada a un período académico'
      );
    }
    if (asistencia.grupo.periodoAcademico.estadoCierre !== 'ABIERTO') {
      throw new BadRequestException(
        'No se pueden crear justificaciones en un período académico cerrado'
      );
    }

    await this.authorizeRequester(
      user,
      asistencia.estudianteId,
      asistencia.grupo.institucionId
    );

    const existing = await this.prisma.justificacionAusencia.findFirst({
      where: { asistenciaId, estado: 'PENDIENTE' },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(
        'Ya existe una solicitud activa para esta ausencia'
      );
    }

    const upload = await this.privateUploadService.save(file);

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Serializa solicitudes para la misma asistencia; la unicidad depende del estado PENDIENTE.
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${asistenciaId}))`;

        const active = await tx.justificacionAusencia.findFirst({
          where: { asistenciaId, estado: 'PENDIENTE' },
          select: { id: true },
        });
        if (active) {
          throw new ConflictException(
            'Ya existe una solicitud activa para esta ausencia'
          );
        }

        return tx.justificacionAusencia.create({
          data: {
            asistenciaId,
            solicitanteId: user.id,
            motivo: normalizedMotivo,
            archivoStorageKey: upload.storageKey,
            archivoNombre: upload.originalName,
            archivoMimeType: upload.mimeType,
            archivoTamano: upload.size,
          },
          include: justificacionInclude,
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Ya existe una solicitud activa para esta ausencia'
        );
      }
      throw error;
    }
  }

  async listarPendientes(user: JustificacionUser) {
    if (!['EDUCADOR', 'ADMIN_ESCUELA'].includes(user.rol)) {
      throw new ForbiddenException(
        'No tienes permiso para revisar justificaciones'
      );
    }

    const where = await this.reviewerWhere(user);
    return this.prisma.justificacionAusencia.findMany({
      where: { estado: 'PENDIENTE', ...where },
      include: justificacionInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  async resolver(
    id: string,
    dto: ResolucionJustificacionDto,
    user: JustificacionUser
  ) {
    if (!['APROBADA', 'RECHAZADA'].includes(dto.estado)) {
      throw new BadRequestException('El estado de resolución no es válido');
    }
    const motivoRechazo = dto.motivoRechazo?.trim();
    if (dto.estado === 'RECHAZADA' && !motivoRechazo) {
      throw new BadRequestException('El motivo de rechazo es obligatorio');
    }

    const current = await this.prisma.justificacionAusencia.findUnique({
      where: { id },
      include: {
        asistencia: {
          include: {
            grupo: {
              include: {
                periodoAcademico: true,
                institucion: true,
                educadores: { where: { activo: true } },
              },
            },
          },
        },
      },
    });
    if (!current) throw new NotFoundException('Justificación no encontrada');
    await this.authorizeReviewer(user, current.asistencia.grupo);
    if (current.estado !== 'PENDIENTE') {
      throw new ConflictException('La justificación ya fue resuelta');
    }

    const resolved = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.justificacionAusencia.update({
        where: { id },
        data: {
          estado: dto.estado,
          motivoRechazo: dto.estado === 'RECHAZADA' ? motivoRechazo : null,
          revisadaPorId: user.id,
          fechaRevision: new Date(),
        },
        include: justificacionInclude,
      });

      if (dto.estado === 'APROBADA') {
        await tx.asistencia.updateMany({
          where: { id: current.asistenciaId, estado: 'AUSENTE' },
          data: { estado: 'JUSTIFICADO' },
        });
      }

      await this.notificacionesService.crearNotificacionResultadoJustificacion(
        {
          destinatarioId: current.solicitanteId,
          justificacionAusenciaId: id,
        },
        tx
      );
      return updated;
    });

    return resolved;
  }

  async obtenerArchivo(id: string, user: JustificacionUser) {
    const justificacion = await this.prisma.justificacionAusencia.findUnique({
      where: { id },
      include: {
        asistencia: {
          include: {
            grupo: {
              include: {
                institucion: true,
                educadores: { where: { activo: true } },
              },
            },
          },
        },
      },
    });
    if (!justificacion)
      throw new NotFoundException('Justificación no encontrada');

    const allowed = await this.canAccessFile(user, justificacion);
    if (!allowed)
      throw new ForbiddenException(
        'No tienes permiso para descargar este archivo'
      );

    const buffer = await this.privateUploadService.read(
      justificacion.archivoStorageKey
    );
    return {
      buffer,
      mimeType: justificacion.archivoMimeType,
      filename: justificacion.archivoNombre,
    };
  }

  private async authorizeRequester(
    user: JustificacionUser,
    estudianteId: string,
    institucionId: string
  ) {
    if (user.rol === 'ESTUDIANTE') {
      if (user.id !== estudianteId) {
        throw new ForbiddenException(
          'Solo puedes justificar tus propias ausencias'
        );
      }
      return;
    }
    if (user.rol !== 'TUTOR') {
      throw new ForbiddenException(
        'Solo un estudiante o tutor puede solicitar una justificación'
      );
    }
    const link = await this.prisma.tutorEstudiante.findFirst({
      where: { tutorId: user.id, estudianteId, institucionId, activo: true },
      select: { id: true },
    });
    if (!link) {
      throw new ForbiddenException(
        'No tienes un vínculo activo con este estudiante'
      );
    }
  }

  private async reviewerWhere(
    user: JustificacionUser
  ): Promise<Prisma.JustificacionAusenciaWhereInput> {
    if (user.rol === 'EDUCADOR') {
      return {
        asistencia: {
          grupo: {
            OR: [
              { educadorId: user.id },
              { educadores: { some: { educadorId: user.id, activo: true } } },
            ],
          },
        },
      };
    }
    const reviewer = await this.prisma.usuario.findUnique({
      where: { id: user.id },
      select: { perfil: { select: { institucion: true } } },
    });
    if (!reviewer?.perfil?.institucion) {
      throw new ForbiddenException('Usuario sin institución asociada');
    }
    return {
      asistencia: {
        grupo: { institucion: { nombre: reviewer.perfil.institucion } },
      },
    };
  }

  private async authorizeReviewer(
    user: JustificacionUser,
    grupo: {
      institucionId: string;
      educadorId: string;
      educadores: { educadorId: string; activo: boolean }[];
    }
  ) {
    if (user.rol === 'EDUCADOR') {
      const assigned =
        grupo.educadorId === user.id ||
        grupo.educadores.some(
          (item) => item.educadorId === user.id && item.activo
        );
      if (!assigned)
        throw new ForbiddenException(
          'No tienes permiso para revisar esta justificación'
        );
      return;
    }
    if (user.rol !== 'ADMIN_ESCUELA') {
      throw new ForbiddenException(
        'No tienes permiso para revisar justificaciones'
      );
    }
    const reviewer = await this.prisma.usuario.findUnique({
      where: { id: user.id },
      select: { perfil: { select: { institucion: true } } },
    });
    const institution = reviewer?.perfil?.institucion
      ? await this.prisma.institucion.findFirst({
          where: { nombre: reviewer.perfil.institucion },
          select: { id: true },
        })
      : null;
    if (!institution || institution.id !== grupo.institucionId) {
      throw new ForbiddenException(
        'No tienes permiso para revisar esta justificación'
      );
    }
  }

  private async canAccessFile(
    user: JustificacionUser,
    justificacion: {
      solicitanteId: string;
      asistencia: {
        estudianteId: string;
        grupo: {
          institucionId: string;
          institucion: { nombre: string };
          educadorId: string;
          educadores: { educadorId: string; activo: boolean }[];
        };
      };
    }
  ) {
    if (
      user.id === justificacion.solicitanteId ||
      user.id === justificacion.asistencia.estudianteId
    ) {
      return true;
    }
    if (user.rol === 'TUTOR') {
      const link = await this.prisma.tutorEstudiante.findFirst({
        where: {
          tutorId: user.id,
          estudianteId: justificacion.asistencia.estudianteId,
          institucionId: justificacion.asistencia.grupo.institucionId,
          activo: true,
        },
        select: { id: true },
      });
      return Boolean(link);
    }
    if (user.rol === 'EDUCADOR') {
      const grupo = justificacion.asistencia.grupo;
      return (
        grupo.educadorId === user.id ||
        grupo.educadores?.some(
          (item: { educadorId: string; activo: boolean }) =>
            item.educadorId === user.id && item.activo
        )
      );
    }
    if (user.rol === 'ADMIN_ESCUELA') {
      const reviewer = await this.prisma.usuario.findUnique({
        where: { id: user.id },
        select: { perfil: { select: { institucion: true } } },
      });
      return Boolean(
        reviewer?.perfil?.institucion ===
        justificacion.asistencia.grupo.institucion.nombre
      );
    }
    return false;
  }
}
