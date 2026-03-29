import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { PrismaService } from '../prisma/prisma.service';
import {
  queryCalificacionesSchema,
  type QueryCalificacionesDto,
} from './dto/query-calificaciones.dto';
import {
  cargarCalificacionesSchema,
  type CargarCalificacionesDto,
} from './dto/cargar-calificaciones.dto';

interface GrupoAcceso {
  id: string;
  institucionId: string;
  activo: boolean;
}

interface EstudianteCalificacion {
  estudianteId: string;
  nombre: string;
  apellido: string;
  email: string;
  nota: number | null;
  observaciones: string | null;
  updatedAt?: Date;
}

export interface ListaCalificacionesResponse {
  grupoId: string;
  periodoAcademicoId: string;
  materia: string;
  estudiantes: EstudianteCalificacion[];
}

export interface CargaCalificacionesResponse {
  grupoId: string;
  periodoAcademicoId: string;
  materia: string;
  procesadas: number;
}

@Injectable()
export class CalificacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async listarCalificaciones(
    grupoId: string,
    query: QueryCalificacionesDto,
    usuarioId: string
  ): Promise<ListaCalificacionesResponse> {
    const result = queryCalificacionesSchema.safeParse(query);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Parámetros inválidos'
      );
    }

    const grupo = await this.validarAccesoAGrupo(grupoId, usuarioId);
    const { periodoAcademicoId, materia } = result.data;

    const [estudiantesActivos, calificaciones] = await Promise.all([
      this.obtenerEstudiantesActivos(grupo.id),
      this.prisma.calificacion.findMany({
        where: {
          grupoId: grupo.id,
          periodoAcademicoId,
          materia,
        },
        select: {
          estudianteId: true,
          nota: true,
          observaciones: true,
          updatedAt: true,
        },
      }),
    ]);

    const calificacionPorEstudiante = new Map(
      calificaciones.map((c) => [c.estudianteId, c])
    );

    return {
      grupoId: grupo.id,
      periodoAcademicoId,
      materia,
      estudiantes: estudiantesActivos.map((registro) => {
        const cal = calificacionPorEstudiante.get(registro.estudiante.id);
        return {
          estudianteId: registro.estudiante.id,
          nombre: registro.estudiante.nombre,
          apellido: registro.estudiante.apellido,
          email: registro.estudiante.email,
          nota: cal?.nota ?? null,
          observaciones: cal?.observaciones ?? null,
          updatedAt: cal?.updatedAt,
        };
      }),
    };
  }

  async cargarCalificaciones(
    grupoId: string,
    dto: CargarCalificacionesDto,
    usuarioId: string
  ): Promise<CargaCalificacionesResponse> {
    const result = cargarCalificacionesSchema.safeParse(dto);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Datos inválidos'
      );
    }

    const grupo = await this.validarAccesoAGrupo(grupoId, usuarioId);
    const { periodoAcademicoId, materia, calificaciones } = result.data;

    const [estudiantesActivos, periodo, escala] = await Promise.all([
      this.obtenerEstudiantesActivos(grupo.id),
      this.prisma.periodoAcademico.findUnique({
        where: { id: periodoAcademicoId },
        select: { id: true, institucionId: true },
      }),
      this.prisma.escalaCalificacion.findUnique({
        where: { institucionId: grupo.institucionId },
        select: { notaMinima: true, notaMaxima: true },
      }),
    ]);

    if (!periodo) {
      throw new NotFoundException('Período académico no encontrado');
    }

    if (periodo.institucionId !== grupo.institucionId) {
      throw new BadRequestException(
        'El período académico no pertenece a la institución del grupo'
      );
    }

    const estudiantesActivosIds = new Set(
      estudiantesActivos.map((registro) => registro.estudianteId)
    );

    for (const item of calificaciones) {
      if (!estudiantesActivosIds.has(item.estudianteId)) {
        throw new BadRequestException(
          'Solo se pueden cargar calificaciones de estudiantes activos del grupo'
        );
      }

      if (escala) {
        if (item.nota < escala.notaMinima || item.nota > escala.notaMaxima) {
          throw new BadRequestException(
            `La nota ${item.nota} está fuera del rango permitido (${escala.notaMinima}-${escala.notaMaxima})`
          );
        }
      }
    }

    const operations = calificaciones.map((item) => {
      const observaciones = item.observaciones?.trim() || null;
      return this.prisma.calificacion.upsert({
        where: {
          grupoId_estudianteId_periodoAcademicoId_materia: {
            grupoId: grupo.id,
            estudianteId: item.estudianteId,
            periodoAcademicoId,
            materia,
          },
        },
        create: {
          grupoId: grupo.id,
          estudianteId: item.estudianteId,
          periodoAcademicoId,
          materia,
          nota: item.nota,
          observaciones,
        },
        update: {
          nota: item.nota,
          observaciones,
        },
      });
    });

    await this.prisma.$transaction(operations);

    return {
      grupoId: grupo.id,
      periodoAcademicoId,
      materia,
      procesadas: calificaciones.length,
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
        'No tienes permiso para acceder a las calificaciones de este grupo'
      );
    }

    const asignacion = await this.prisma.grupoEducador.findUnique({
      where: {
        grupoId_educadorId: {
          grupoId,
          educadorId: usuarioId,
        },
      },
      select: { activo: true },
    });

    if (!asignacion?.activo) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a las calificaciones de este grupo'
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
}
