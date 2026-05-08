import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { PrismaService } from '../prisma/prisma.service';
import {
  queryBoletinSchema,
  type QueryBoletinDto,
} from './dto/query-boletin.dto';

interface CalificacionBoletin {
  materia: string;
  nota: number;
  observaciones: string | null;
}

interface AsistenciaResumen {
  total: number;
  presente: number;
  ausente: number;
  tardanza: number;
  justificado: number;
  porcentaje: number;
}

interface EscalaBoletin {
  notaMinima: number;
  notaMaxima: number;
  notaAprobacion: number;
}

export interface BoletinResponse {
  estudiante: { nombre: string; apellido: string };
  institucion: { id: string; nombre: string };
  periodo: { nombre: string; fechaInicio: Date; fechaFin: Date };
  grupo: { nombre: string };
  calificaciones: CalificacionBoletin[];
  asistencia: AsistenciaResumen;
  escala: EscalaBoletin | null;
  generadoEn: Date;
}

interface GrupoEstudianteItem {
  id: string;
  nombre: string;
  grado: string | null;
  seccion: string | null;
  institucion: { id: string; nombre: string };
  periodoAcademico: { id: string; nombre: string } | null;
}

export interface MisGruposResponse {
  grupos: GrupoEstudianteItem[];
}

@Injectable()
export class BoletinService {
  constructor(private readonly prisma: PrismaService) {}

  async getBoletinEstudiante(
    usuarioId: string,
    periodoId: string,
    grupoId: string
  ): Promise<BoletinResponse> {
    const asignacion = await this.prisma.grupoEstudiante.findUnique({
      where: {
        grupoId_estudianteId: {
          grupoId,
          estudianteId: usuarioId,
        },
      },
      select: { activo: true },
    });

    if (!asignacion?.activo) {
      throw new ForbiddenException(
        'No pertenecés a este grupo o tu asignación está inactiva'
      );
    }

    const [grupo, periodo] = await Promise.all([
      this.prisma.grupo.findUnique({
        where: { id: grupoId },
        select: {
          nombre: true,
          institucion: { select: { id: true, nombre: true } },
        },
      }),
      this.prisma.periodoAcademico.findUnique({
        where: { id: periodoId },
        select: { nombre: true, fechaInicio: true, fechaFin: true },
      }),
    ]);

    if (!grupo) {
      throw new NotFoundException('Grupo no encontrado');
    }

    if (!periodo) {
      throw new NotFoundException('Período académico no encontrado');
    }

    const [estudiante, calificaciones, asistencias, escala] = await Promise.all(
      [
        this.prisma.usuario.findUnique({
          where: { id: usuarioId },
          select: { nombre: true, apellido: true },
        }),
        this.prisma.calificacion.findMany({
          where: {
            estudianteId: usuarioId,
            grupoId,
            periodoAcademicoId: periodoId,
          },
          select: { materia: true, nota: true, observaciones: true },
          orderBy: { materia: 'asc' },
        }),
        this.prisma.asistencia.findMany({
          where: {
            estudianteId: usuarioId,
            grupoId,
            fecha: {
              gte: periodo.fechaInicio,
              lte: periodo.fechaFin,
            },
          },
          select: { estado: true },
        }),
        this.prisma.escalaCalificacion.findUnique({
          where: { institucionId: grupo.institucion.id },
          select: { notaMinima: true, notaMaxima: true, notaAprobacion: true },
        }),
      ]
    );

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

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
      estudiante,
      institucion: grupo.institucion,
      periodo,
      grupo: { nombre: grupo.nombre },
      calificaciones,
      asistencia: {
        total,
        presente,
        ausente,
        tardanza,
        justificado,
        porcentaje,
      },
      escala,
      generadoEn: new Date(),
    };
  }

  async getMisGrupos(usuarioId: string): Promise<MisGruposResponse> {
    const grupos = await this.prisma.grupo.findMany({
      where: {
        estudiantes: {
          some: {
            estudianteId: usuarioId,
            activo: true,
          },
        },
      },
      select: {
        id: true,
        nombre: true,
        grado: true,
        seccion: true,
        institucion: { select: { id: true, nombre: true } },
        periodoAcademico: { select: { id: true, nombre: true } },
      },
      orderBy: { nombre: 'asc' },
    });

    return { grupos };
  }

  validateQueryParams(query: QueryBoletinDto): {
    periodoId: string;
    grupoId: string;
  } {
    const result = queryBoletinSchema.safeParse(query);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Parámetros inválidos'
      );
    }
    return { periodoId: result.data.periodoId, grupoId: result.data.grupoId };
  }
}
