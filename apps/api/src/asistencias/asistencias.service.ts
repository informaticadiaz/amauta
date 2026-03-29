import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { PrismaService } from '../prisma/prisma.service';
import {
  queryAsistenciasSchema,
  type QueryAsistenciasDto,
} from './dto/query-asistencias.dto';
import {
  registrarAsistenciasSchema,
  type RegistrarAsistenciasDto,
} from './dto/registrar-asistencias.dto';

interface GrupoAcceso {
  id: string;
  institucionId: string;
  activo: boolean;
}

interface NominaEstudiante {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  asistencia: {
    estado: 'PRESENTE' | 'AUSENTE' | 'TARDANZA' | 'JUSTIFICADO';
    observaciones: string | null;
    updatedAt?: Date;
  } | null;
}

export interface NominaAsistenciaResponse {
  grupoId: string;
  fecha: string;
  estudiantes: NominaEstudiante[];
}

export interface RegistroAsistenciasResponse {
  grupoId: string;
  fecha: string;
  procesadas: number;
  creadas: number;
  actualizadas: number;
}

@Injectable()
export class AsistenciasService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerNominaDelDia(
    grupoId: string,
    query: QueryAsistenciasDto,
    usuarioId: string
  ): Promise<NominaAsistenciaResponse> {
    const result = queryAsistenciasSchema.safeParse(query);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Parámetros inválidos'
      );
    }

    const grupo = await this.validarAccesoAGrupo(grupoId, usuarioId);
    const fecha = this.normalizarFecha(result.data.fecha);

    const [estudiantesActivos, asistencias] = await Promise.all([
      this.obtenerEstudiantesActivos(grupo.id),
      this.prisma.asistencia.findMany({
        where: {
          grupoId: grupo.id,
          fecha: fecha.date,
        },
        select: {
          estudianteId: true,
          estado: true,
          observaciones: true,
          updatedAt: true,
        },
      }),
    ]);

    const asistenciaPorEstudiante = new Map(
      asistencias.map((asistencia) => [asistencia.estudianteId, asistencia])
    );

    return {
      grupoId: grupo.id,
      fecha: fecha.value,
      estudiantes: estudiantesActivos.map((registro) => {
        const asistenciaActual = asistenciaPorEstudiante.get(
          registro.estudiante.id
        );

        return {
          id: registro.estudiante.id,
          nombre: registro.estudiante.nombre,
          apellido: registro.estudiante.apellido,
          email: registro.estudiante.email,
          asistencia: asistenciaActual
            ? {
                estado: asistenciaActual.estado,
                observaciones: asistenciaActual.observaciones ?? null,
                updatedAt: asistenciaActual.updatedAt,
              }
            : null,
        };
      }),
    };
  }

  async registrarAsistenciasDelDia(
    grupoId: string,
    dto: RegistrarAsistenciasDto,
    usuarioId: string
  ): Promise<RegistroAsistenciasResponse> {
    const result = registrarAsistenciasSchema.safeParse(dto);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Datos inválidos'
      );
    }

    const grupo = await this.validarAccesoAGrupo(grupoId, usuarioId);
    if (!grupo.activo) {
      throw new BadRequestException(
        'No se pueden registrar asistencias en un grupo inactivo'
      );
    }

    const fecha = this.normalizarFecha(result.data.fecha);
    const [estudiantesActivos, asistenciasExistentes] = await Promise.all([
      this.obtenerEstudiantesActivos(grupo.id),
      this.prisma.asistencia.findMany({
        where: {
          grupoId: grupo.id,
          fecha: fecha.date,
        },
        select: {
          id: true,
          estudianteId: true,
          estado: true,
          observaciones: true,
          fecha: true,
        },
      }),
    ]);

    const estudiantesActivosIds = new Set(
      estudiantesActivos.map((registro) => registro.estudianteId)
    );

    const estudianteFueraDeNomina = result.data.asistencias.find(
      (asistencia) => !estudiantesActivosIds.has(asistencia.estudianteId)
    );

    if (estudianteFueraDeNomina) {
      throw new BadRequestException(
        'Solo se pueden registrar estudiantes activos del grupo'
      );
    }

    const hoy = this.fechaActualISO();
    const existentesPorEstudiante = new Map(
      asistenciasExistentes.map((asistencia) => [
        asistencia.estudianteId,
        asistencia,
      ])
    );

    let creadas = 0;
    let actualizadas = 0;

    const operations = result.data.asistencias.map((asistencia) => {
      const observaciones = this.normalizarObservaciones(
        asistencia.observaciones
      );
      const existente = existentesPorEstudiante.get(asistencia.estudianteId);

      if (!existente) {
        creadas += 1;
        return this.prisma.asistencia.create({
          data: {
            grupoId: grupo.id,
            estudianteId: asistencia.estudianteId,
            fecha: fecha.date,
            estado: asistencia.estado,
            observaciones,
          },
        });
      }

      if (fecha.value !== hoy) {
        throw new BadRequestException(
          'Solo se puede editar una asistencia dentro del mismo día'
        );
      }

      const huboCambio =
        existente.estado !== asistencia.estado ||
        this.normalizarObservaciones(existente.observaciones) !== observaciones;

      if (huboCambio && !observaciones) {
        throw new BadRequestException(
          'Debes indicar una observación para editar una asistencia del mismo día'
        );
      }

      actualizadas += 1;
      return this.prisma.asistencia.update({
        where: { id: existente.id },
        data: {
          estado: asistencia.estado,
          observaciones,
        },
      });
    });

    await this.prisma.$transaction(operations);

    return {
      grupoId: grupo.id,
      fecha: fecha.value,
      procesadas: result.data.asistencias.length,
      creadas,
      actualizadas,
    };
  }

  private async validarAccesoAGrupo(
    grupoId: string,
    usuarioId: string
  ): Promise<GrupoAcceso> {
    const grupo = await this.prisma.grupo.findUnique({
      where: { id: grupoId },
      select: {
        id: true,
        institucionId: true,
        activo: true,
      },
    });

    if (!grupo) {
      throw new NotFoundException('Grupo no encontrado');
    }

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

    if (usuario.rol === 'ADMIN_ESCUELA') {
      const institucionNombre = usuario.perfil?.institucion;
      if (!institucionNombre) {
        throw new BadRequestException('Usuario sin institución asociada');
      }

      const institucion = await this.prisma.institucion.findFirst({
        where: { nombre: institucionNombre },
        select: { id: true },
      });

      if (!institucion || institucion.id !== grupo.institucionId) {
        throw new ForbiddenException(
          'No tienes permiso para operar sobre este grupo'
        );
      }

      return grupo;
    }

    if (usuario.rol !== 'EDUCADOR') {
      throw new ForbiddenException(
        'No tienes permiso para registrar asistencias en este grupo'
      );
    }

    const asignacion = await this.prisma.grupoEducador.findUnique({
      where: {
        grupoId_educadorId: {
          grupoId,
          educadorId: usuarioId,
        },
      },
      select: {
        activo: true,
      },
    });

    if (!asignacion?.activo) {
      throw new ForbiddenException(
        'No tienes permiso para registrar asistencias en este grupo'
      );
    }

    return grupo;
  }

  private async obtenerEstudiantesActivos(grupoId: string) {
    return this.prisma.grupoEstudiante.findMany({
      where: {
        grupoId,
        activo: true,
      },
      select: {
        estudianteId: true,
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
      },
      orderBy: [
        { estudiante: { apellido: 'asc' } },
        { estudiante: { nombre: 'asc' } },
      ],
    });
  }

  private normalizarFecha(value: string): { value: string; date: Date } {
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Fecha inválida');
    }

    return {
      value,
      date,
    };
  }

  private fechaActualISO(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private normalizarObservaciones(
    observaciones: string | null | undefined
  ): string | null {
    const normalized = observaciones?.trim();
    return normalized ? normalized : null;
  }
}
