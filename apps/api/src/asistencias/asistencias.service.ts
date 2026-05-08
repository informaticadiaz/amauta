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
import {
  queryResumenMensualSchema,
  type QueryResumenMensualDto,
} from './dto/query-resumen-mensual.dto';

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

interface ResumenEstudianteMensual {
  estudianteId: string;
  nombre: string;
  apellido: string;
  email: string;
  presentes: number;
  ausencias: number;
  tardanzas: number;
  justificados: number;
  totalRegistros: number;
  porcentajeAsistencia: number;
}

interface ResumenGrupoMensual {
  totalRegistros: number;
  presentes: number;
  ausencias: number;
  tardanzas: number;
  justificados: number;
}

export interface ResumenMensualAsistenciaResponse {
  grupoId: string;
  mes: number;
  anio: number;
  estudiantes: ResumenEstudianteMensual[];
  resumenGrupo: ResumenGrupoMensual;
}

interface AsistenciaEstudiante {
  fecha: Date;
  estado: 'PRESENTE' | 'AUSENTE' | 'TARDANZA' | 'JUSTIFICADO';
  observaciones: string | null;
  grupo: { nombre: string };
}

interface ResumenAsistenciaPersonal {
  total: number;
  presente: number;
  ausente: number;
  tardanza: number;
  justificado: number;
  porcentaje: number;
}

export interface MisAsistenciasResponse {
  asistencias: AsistenciaEstudiante[];
  resumen: ResumenAsistenciaPersonal;
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

  async obtenerResumenMensual(
    grupoId: string,
    query: QueryResumenMensualDto,
    usuarioId: string
  ): Promise<ResumenMensualAsistenciaResponse> {
    const result = queryResumenMensualSchema.safeParse(query);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Parámetros inválidos'
      );
    }

    const grupo = await this.validarAccesoAGrupo(grupoId, usuarioId);
    const estudiantesActivos = await this.obtenerEstudiantesActivos(grupo.id);
    const estudiantesIds = estudiantesActivos.map(
      (registro) => registro.estudiante.id
    );
    const rango = this.obtenerRangoMensual(result.data.mes, result.data.anio);

    const asistencias =
      estudiantesIds.length === 0
        ? []
        : await this.prisma.asistencia.findMany({
            where: {
              grupoId: grupo.id,
              fecha: {
                gte: rango.desde,
                lt: rango.hasta,
              },
              estudianteId: {
                in: estudiantesIds,
              },
            },
            select: {
              estudianteId: true,
              estado: true,
            },
          });

    const resumenGrupo: ResumenGrupoMensual = {
      totalRegistros: 0,
      presentes: 0,
      ausencias: 0,
      tardanzas: 0,
      justificados: 0,
    };

    const resumenPorEstudiante = new Map<
      string,
      Omit<ResumenEstudianteMensual, 'nombre' | 'apellido' | 'email'>
    >();

    for (const asistencia of asistencias) {
      const contador = this.mapearEstadoAContador(asistencia.estado);

      resumenGrupo.totalRegistros += 1;
      resumenGrupo[contador] += 1;

      const actual = resumenPorEstudiante.get(asistencia.estudianteId) ?? {
        estudianteId: asistencia.estudianteId,
        presentes: 0,
        ausencias: 0,
        tardanzas: 0,
        justificados: 0,
        totalRegistros: 0,
        porcentajeAsistencia: 0,
      };

      actual.totalRegistros += 1;
      actual[contador] += 1;

      resumenPorEstudiante.set(asistencia.estudianteId, actual);
    }

    return {
      grupoId: grupo.id,
      mes: result.data.mes,
      anio: result.data.anio,
      estudiantes: estudiantesActivos.map((registro) => {
        const resumen = resumenPorEstudiante.get(registro.estudiante.id) ?? {
          estudianteId: registro.estudiante.id,
          presentes: 0,
          ausencias: 0,
          tardanzas: 0,
          justificados: 0,
          totalRegistros: 0,
          porcentajeAsistencia: 0,
        };

        return {
          estudianteId: registro.estudiante.id,
          nombre: registro.estudiante.nombre,
          apellido: registro.estudiante.apellido,
          email: registro.estudiante.email,
          presentes: resumen.presentes,
          ausencias: resumen.ausencias,
          tardanzas: resumen.tardanzas,
          justificados: resumen.justificados,
          totalRegistros: resumen.totalRegistros,
          porcentajeAsistencia:
            resumen.totalRegistros === 0
              ? 0
              : Math.round(
                  ((resumen.presentes + resumen.justificados) /
                    resumen.totalRegistros) *
                    100
                ),
        };
      }),
      resumenGrupo,
    };
  }

  async getMisAsistencias(
    usuarioId: string,
    mes?: number,
    anio?: number
  ): Promise<MisAsistenciasResponse> {
    const where: {
      estudianteId: string;
      fecha?: { gte: Date; lt: Date };
    } = { estudianteId: usuarioId };

    if (mes !== undefined && anio !== undefined) {
      const rango = this.obtenerRangoMensual(mes, anio);
      where.fecha = { gte: rango.desde, lt: rango.hasta };
    }

    const asistencias = await this.prisma.asistencia.findMany({
      where,
      select: {
        fecha: true,
        estado: true,
        observaciones: true,
        grupo: { select: { nombre: true } },
      },
      orderBy: { fecha: 'desc' },
    });

    const total = asistencias.length;
    const presente = asistencias.filter((a) => a.estado === 'PRESENTE').length;
    const ausente = asistencias.filter((a) => a.estado === 'AUSENTE').length;
    const tardanza = asistencias.filter((a) => a.estado === 'TARDANZA').length;
    const justificado = asistencias.filter(
      (a) => a.estado === 'JUSTIFICADO'
    ).length;
    const porcentaje =
      total === 0 ? 0 : Math.round(((presente + justificado) / total) * 100);

    return {
      asistencias,
      resumen: { total, presente, ausente, tardanza, justificado, porcentaje },
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

  private obtenerRangoMensual(
    mes: number,
    anio: number
  ): { desde: Date; hasta: Date } {
    return {
      desde: new Date(Date.UTC(anio, mes - 1, 1)),
      hasta: new Date(Date.UTC(anio, mes, 1)),
    };
  }

  private mapearEstadoAContador(
    estado: 'PRESENTE' | 'AUSENTE' | 'TARDANZA' | 'JUSTIFICADO'
  ): keyof ResumenGrupoMensual {
    switch (estado) {
      case 'PRESENTE':
        return 'presentes';
      case 'AUSENTE':
        return 'ausencias';
      case 'TARDANZA':
        return 'tardanzas';
      case 'JUSTIFICADO':
        return 'justificados';
    }
  }
}
