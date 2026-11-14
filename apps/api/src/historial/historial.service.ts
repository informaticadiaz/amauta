import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { PrismaService } from '../prisma/prisma.service';

type EstadoPromocion = 'PROMOVIDO' | 'REPITENTE' | 'EGRESADO';

interface HistorialCalificacion {
  nota: number;
  observaciones: string | null;
  materia: { id: string; nombre: string };
  periodoAcademico: { id: string; nombre: string; orden: number };
  grupo: { id: string; nombre: string };
}

interface HistorialNota {
  materia: { id: string; nombre: string };
  nota: number;
  observaciones: string | null;
  grupo: { nombre: string };
}

interface HistorialEstadoPromocion {
  periodoId: string;
  periodo: string;
  grupoId: string;
  grupo: string;
  estado: EstadoPromocion | null;
}

export interface HistorialPeriodo {
  id: string;
  nombre: string;
  orden: number;
  promedio: number | null;
  calificaciones: HistorialNota[];
}

export interface HistorialResponse {
  estudianteId: string;
  periodos: HistorialPeriodo[];
  promedioAcumulado: number | null;
  evolucionPorMateria: Array<{
    materia: { id: string; nombre: string };
    periodos: Array<{
      periodoId: string;
      periodo: string;
      promedio: number;
    }>;
  }>;
  /** Estado final persistido por estudiante, grupo y período; null significa sin evaluar. */
  estadoPromocion: HistorialEstadoPromocion[];
}

@Injectable()
export class HistorialService {
  constructor(private readonly prisma: PrismaService) {}

  async getHistorial(estudianteId: string): Promise<HistorialResponse> {
    return this.construirHistorial(estudianteId);
  }

  async getHistorialAdministrativo(
    institucionId: string,
    estudianteId: string,
    usuarioId: string
  ): Promise<HistorialResponse> {
    await this.validarAccesoInstitucion(institucionId, estudianteId, usuarioId);
    return this.construirHistorial(estudianteId, institucionId);
  }

  private async construirHistorial(
    estudianteId: string,
    institucionId?: string
  ): Promise<HistorialResponse> {
    const [calificaciones, estadosPromocion] = (await Promise.all([
      this.prisma.calificacion.findMany({
        where: {
          estudianteId,
          ...(institucionId ? { grupo: { institucionId } } : {}),
        },
        select: {
          nota: true,
          observaciones: true,
          materia: { select: { id: true, nombre: true } },
          periodoAcademico: { select: { id: true, nombre: true, orden: true } },
          grupo: { select: { id: true, nombre: true } },
        },
        orderBy: [
          { periodoAcademico: { orden: 'asc' } },
          { materia: { nombre: 'asc' } },
        ],
      }),
      this.prisma.estadoPromocion.findMany({
        where: {
          estudianteId,
          ...(institucionId ? { grupo: { institucionId } } : {}),
        },
        select: {
          estado: true,
          periodoAcademico: { select: { id: true, nombre: true, orden: true } },
          grupo: { select: { id: true, nombre: true } },
        },
        orderBy: { periodoAcademico: { orden: 'asc' } },
      }),
    ])) as [
      HistorialCalificacion[],
      Array<{
        estado: EstadoPromocion;
        periodoAcademico: { id: string; nombre: string; orden: number };
        grupo: { id: string; nombre: string };
      }>,
    ];

    const estadosMap = new Map<string, HistorialEstadoPromocion>();
    const periodosMap = new Map<string, HistorialPeriodo>();
    const materiasMap = new Map<
      string,
      {
        materia: { id: string; nombre: string };
        periodos: Map<
          string,
          { periodoId: string; periodo: string; promedio: number }
        >;
      }
    >();

    for (const calificacion of calificaciones) {
      const periodo = calificacion.periodoAcademico;
      const periodoExistente = periodosMap.get(periodo.id) ?? {
        id: periodo.id,
        nombre: periodo.nombre,
        orden: periodo.orden,
        promedio: 0,
        calificaciones: [],
      };
      periodoExistente.calificaciones.push({
        materia: calificacion.materia,
        nota: calificacion.nota,
        observaciones: calificacion.observaciones,
        grupo: { nombre: calificacion.grupo.nombre },
      });
      periodosMap.set(periodo.id, periodoExistente);

      const estadoKey = `${periodo.id}:${calificacion.grupo.id}`;
      if (!estadosMap.has(estadoKey)) {
        estadosMap.set(estadoKey, {
          periodoId: periodo.id,
          periodo: periodo.nombre,
          grupoId: calificacion.grupo.id,
          grupo: calificacion.grupo.nombre,
          estado: null,
        });
      }

      const materiaExistente = materiasMap.get(calificacion.materia.id) ?? {
        materia: calificacion.materia,
        periodos: new Map(),
      };
      const notasDelPeriodo = calificaciones
        .filter(
          (item) =>
            item.materia.id === calificacion.materia.id &&
            item.periodoAcademico.id === periodo.id
        )
        .map((item) => item.nota);
      materiaExistente.periodos.set(periodo.id, {
        periodoId: periodo.id,
        periodo: periodo.nombre,
        promedio: this.promedio(notasDelPeriodo),
      });
      materiasMap.set(calificacion.materia.id, materiaExistente);
    }

    for (const estado of estadosPromocion) {
      const key = `${estado.periodoAcademico.id}:${estado.grupo.id}`;
      estadosMap.set(key, {
        periodoId: estado.periodoAcademico.id,
        periodo: estado.periodoAcademico.nombre,
        grupoId: estado.grupo.id,
        grupo: estado.grupo.nombre,
        estado: estado.estado,
      });
      if (!periodosMap.has(estado.periodoAcademico.id)) {
        periodosMap.set(estado.periodoAcademico.id, {
          id: estado.periodoAcademico.id,
          nombre: estado.periodoAcademico.nombre,
          orden: estado.periodoAcademico.orden,
          promedio: 0,
          calificaciones: [],
        });
      }
    }

    const periodos = [...periodosMap.values()]
      .sort((a, b) => a.orden - b.orden)
      .map((periodo) => ({
        ...periodo,
        promedio: this.promedio(
          periodo.calificaciones.map((item) => item.nota)
        ),
      }));

    return {
      estudianteId,
      periodos,
      promedioAcumulado:
        calificaciones.length > 0
          ? this.promedio(calificaciones.map((item) => item.nota))
          : null,
      evolucionPorMateria: [...materiasMap.values()]
        .sort((a, b) => a.materia.nombre.localeCompare(b.materia.nombre))
        .map((materia) => ({
          materia: materia.materia,
          periodos: [...materia.periodos.values()].sort((a, b) => {
            const periodoA = periodosMap.get(a.periodoId)?.orden ?? 0;
            const periodoB = periodosMap.get(b.periodoId)?.orden ?? 0;
            return periodoA - periodoB;
          }),
        })),
      estadoPromocion: [...estadosMap.values()].sort((a, b) => {
        const periodoA = periodosMap.get(a.periodoId)?.orden ?? 0;
        const periodoB = periodosMap.get(b.periodoId)?.orden ?? 0;
        return periodoA - periodoB || a.grupo.localeCompare(b.grupo);
      }),
    };
  }

  private async validarAccesoInstitucion(
    institucionId: string,
    estudianteId: string,
    usuarioId: string
  ) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { rol: true, perfil: { select: { institucion: true } } },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    if (usuario.rol === 'SUPER_ADMIN') {
      const institucion = await this.prisma.institucion.findUnique({
        where: { id: institucionId },
        select: { id: true },
      });
      if (!institucion)
        throw new NotFoundException('Institución no encontrada');
    } else {
      if (usuario.rol !== 'ADMIN_ESCUELA') {
        throw new ForbiddenException(
          'No tienes permiso para consultar historiales'
        );
      }
      const nombre = usuario.perfil?.institucion;
      if (!nombre)
        throw new BadRequestException('Usuario sin institución asociada');
      const institucion = await this.prisma.institucion.findFirst({
        where: { nombre },
        select: { id: true },
      });
      if (!institucion || institucion.id !== institucionId) {
        throw new ForbiddenException(
          'No tienes permiso para operar sobre otra institución'
        );
      }
    }

    const estudiante = await this.prisma.usuario.findUnique({
      where: { id: estudianteId },
      select: { id: true, rol: true },
    });
    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');
    if (estudiante.rol !== 'ESTUDIANTE') {
      throw new BadRequestException('El usuario no es un estudiante válido');
    }

    const matricula = await this.prisma.matricula.findFirst({
      where: { estudianteId, institucionId },
      select: { id: true },
    });
    if (!matricula)
      throw new NotFoundException(
        'Estudiante no matriculado en la institución'
      );
  }

  private promedio(notas: number[]): number | null {
    if (notas.length === 0) return null;
    return this.redondear(
      notas.reduce((total, nota) => total + nota, 0) / notas.length
    );
  }

  private redondear(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
