/**
 * Servicio de gestión de grupos/clases
 */

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { PrismaService } from '../prisma/prisma.service';
import { createGrupoSchema, type CreateGrupoDto } from './dto/create-grupo.dto';
import { updateGrupoSchema, type UpdateGrupoDto } from './dto/update-grupo.dto';
import { queryGruposSchema, type QueryGruposDto } from './dto/query-grupos.dto';
import {
  asignarEstudiantesGrupoSchema,
  type AsignarEstudiantesGrupoDto,
} from './dto/asignar-estudiantes.dto';
import {
  queryGrupoEstudiantesSchema,
  type QueryGrupoEstudiantesDto,
} from './dto/query-grupo-estudiantes.dto';
import {
  asignarEducadorGrupoSchema,
  type AsignarEducadorGrupoDto,
} from './dto/asignar-educador.dto';
import {
  queryGrupoEducadoresSchema,
  type QueryGrupoEducadoresDto,
} from './dto/query-grupo-educadores.dto';
import {
  queryReporteAsistenciaSchema,
  type QueryReporteAsistenciaDto,
} from './dto/query-reporte-asistencia.dto';
import {
  queryReporteRendimientoSchema,
  type QueryReporteRendimientoDto,
} from './dto/query-reporte-rendimiento.dto';
import type { Grupo } from '@prisma/client';

export type GrupoResponse = Grupo;

export interface ListaGruposResponse {
  grupos: Grupo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AsignacionEstudiantesError {
  estudianteId: string;
  razon: string;
}

export interface AsignacionEstudiantesResponse {
  agregados: string[];
  duplicados: string[];
  errores: AsignacionEstudiantesError[];
}

export interface GrupoEstudianteResponse {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  inscritoEn: Date;
}

export interface ListaGrupoEstudiantesResponse {
  estudiantes: GrupoEstudianteResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GrupoEducadorResponse {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'TITULAR' | 'SUPLENTE';
  asignadoEn: Date;
}

export interface ListaGrupoEducadoresResponse {
  educadores: GrupoEducadorResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GrupoEducadorAsignacionResponse {
  grupoId: string;
  educadorId: string;
  rol: 'TITULAR' | 'SUPLENTE';
  activo: boolean;
  asignadoEn: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MiGrupoEducadorResponse extends Grupo {
  rol: 'TITULAR' | 'SUPLENTE';
  asignadoEn: Date;
}

export interface ListaMisGruposEducadorResponse {
  grupos: MiGrupoEducadorResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ResumenAsistenciaEstudiante {
  estudiante: { nombre: string; apellido: string };
  presente: number;
  ausente: number;
  tardanza: number;
  justificado: number;
  porcentajeAsistencia: number;
}

export interface ReporteAsistenciaResponse {
  grupo: { nombre: string };
  periodo: { nombre: string } | null;
  totalClases: number;
  resumenPorEstudiante: ResumenAsistenciaEstudiante[];
  promedioGrupo: number;
}

export interface ResumenRendimientoEstudiante {
  estudiante: { nombre: string; apellido: string };
  promedioCalificaciones: number;
  calificaciones: { materia: string; nota: number }[];
}

export interface ReporteRendimientoResponse {
  grupo: { nombre: string };
  periodo: { nombre: string } | null;
  resumenPorEstudiante: ResumenRendimientoEstudiante[];
  promedioGrupo: number;
}

@Injectable()
export class GruposService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolverInstitucionId(
    institucionId: string | undefined,
    usuarioId: string
  ): Promise<string> {
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

    if (usuario.rol === 'SUPER_ADMIN') {
      if (!institucionId) {
        throw new BadRequestException('Institución requerida');
      }

      const existe = await this.prisma.institucion.findUnique({
        where: { id: institucionId },
        select: { id: true },
      });

      if (!existe) {
        throw new NotFoundException('Institución no encontrada');
      }

      return institucionId;
    }

    if (usuario.rol !== 'ADMIN_ESCUELA') {
      throw new ForbiddenException('No tienes permiso para gestionar grupos');
    }

    const institucionNombre = usuario.perfil?.institucion;
    if (!institucionNombre) {
      throw new BadRequestException('Usuario sin institución asociada');
    }

    const institucion = await this.prisma.institucion.findFirst({
      where: { nombre: institucionNombre },
      select: { id: true },
    });

    if (!institucion) {
      throw new NotFoundException('Institución no encontrada para el usuario');
    }

    if (institucionId && institucionId !== institucion.id) {
      throw new ForbiddenException(
        'No tienes permiso para operar sobre otra institución'
      );
    }

    return institucion.id;
  }

  private async validarPeriodoAcademico(
    periodoAcademicoId: string,
    institucionId: string
  ): Promise<void> {
    const periodo = await this.prisma.periodoAcademico.findUnique({
      where: { id: periodoAcademicoId },
      select: { institucionId: true },
    });

    if (!periodo) {
      throw new NotFoundException('Periodo académico no encontrado');
    }

    if (periodo.institucionId !== institucionId) {
      throw new BadRequestException(
        'El periodo académico no pertenece a la institución'
      );
    }
  }

  private async validarEducador(
    educadorId: string,
    institucionId: string
  ): Promise<void> {
    const [educador, institucion] = await Promise.all([
      this.prisma.usuario.findUnique({
        where: { id: educadorId },
        select: { rol: true, perfil: { select: { institucion: true } } },
      }),
      this.prisma.institucion.findUnique({
        where: { id: institucionId },
        select: { nombre: true },
      }),
    ]);

    if (!institucion) {
      throw new NotFoundException('Institución no encontrada');
    }

    if (!educador) {
      throw new NotFoundException('Educador no encontrado');
    }

    if (educador.rol !== 'EDUCADOR') {
      throw new BadRequestException('El usuario no es un educador válido');
    }

    const institucionNombre = educador.perfil?.institucion;
    if (!institucionNombre) {
      throw new BadRequestException('Educador sin institución asociada');
    }

    if (institucionNombre !== institucion.nombre) {
      throw new BadRequestException(
        'El educador no pertenece a la institución'
      );
    }
  }

  private async obtenerGrupoYValidarAcceso(
    grupoId: string,
    usuarioId: string
  ): Promise<{ id: string; institucionId: string; activo: boolean }> {
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

    await this.resolverInstitucionId(grupo.institucionId, usuarioId);

    return grupo;
  }

  /**
   * Crea un grupo en una institución
   */
  async crear(
    institucionId: string,
    dto: CreateGrupoDto,
    usuarioId: string
  ): Promise<GrupoResponse> {
    const result = createGrupoSchema.safeParse(dto);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Datos inválidos';
      throw new BadRequestException(message);
    }

    const institucionFinal = await this.resolverInstitucionId(
      institucionId,
      usuarioId
    );

    const { nombre, grado, seccion, educadorId, periodoAcademicoId } =
      result.data;

    await this.validarPeriodoAcademico(periodoAcademicoId, institucionFinal);
    await this.validarEducador(educadorId, institucionFinal);

    return this.prisma.grupo.create({
      data: {
        nombre,
        grado,
        seccion,
        educadorId,
        institucionId: institucionFinal,
        periodoAcademicoId,
      },
    });
  }

  /**
   * Lista grupos de una institución con filtros
   */
  async listar(
    institucionId: string,
    query: QueryGruposDto,
    usuarioId: string
  ): Promise<ListaGruposResponse> {
    const result = queryGruposSchema.safeParse(query);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Parámetros inválidos';
      throw new BadRequestException(message);
    }

    const institucionFinal = await this.resolverInstitucionId(
      institucionId,
      usuarioId
    );

    const { page, limit, activo, periodoAcademicoId } = result.data;
    const skip = (page - 1) * limit;

    const where = {
      institucionId: institucionFinal,
      ...(activo !== undefined ? { activo } : {}),
      ...(periodoAcademicoId ? { periodoAcademicoId } : {}),
    };

    const [grupos, total] = await Promise.all([
      this.prisma.grupo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.grupo.count({ where }),
    ]);

    return {
      grupos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtiene un grupo por ID
   */
  async obtenerPorId(id: string, usuarioId: string): Promise<GrupoResponse> {
    const grupo = await this.prisma.grupo.findUnique({ where: { id } });

    if (!grupo) {
      throw new NotFoundException('Grupo no encontrado');
    }

    await this.resolverInstitucionId(grupo.institucionId, usuarioId);

    return grupo;
  }

  /**
   * Actualiza un grupo
   */
  async actualizar(
    id: string,
    dto: UpdateGrupoDto,
    usuarioId: string
  ): Promise<GrupoResponse> {
    const result = updateGrupoSchema.safeParse(dto);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Datos inválidos';
      throw new BadRequestException(message);
    }

    if (Object.keys(result.data).length === 0) {
      throw new BadRequestException('No hay datos para actualizar');
    }

    const grupo = await this.prisma.grupo.findUnique({ where: { id } });

    if (!grupo) {
      throw new NotFoundException('Grupo no encontrado');
    }

    const institucionFinal = await this.resolverInstitucionId(
      grupo.institucionId,
      usuarioId
    );

    if (result.data.periodoAcademicoId) {
      await this.validarPeriodoAcademico(
        result.data.periodoAcademicoId,
        institucionFinal
      );
    }

    if (result.data.educadorId) {
      await this.validarEducador(result.data.educadorId, institucionFinal);
    }

    return this.prisma.grupo.update({
      where: { id },
      data: result.data,
    });
  }

  /**
   * Desactiva un grupo (soft delete)
   */
  async eliminar(id: string, usuarioId: string): Promise<void> {
    const grupo = await this.prisma.grupo.findUnique({ where: { id } });

    if (!grupo) {
      throw new NotFoundException('Grupo no encontrado');
    }

    await this.resolverInstitucionId(grupo.institucionId, usuarioId);

    await this.prisma.grupo.update({
      where: { id },
      data: { activo: false },
    });
  }

  async asignarEstudiantes(
    grupoId: string,
    dto: AsignarEstudiantesGrupoDto,
    usuarioId: string
  ): Promise<AsignacionEstudiantesResponse> {
    const result = asignarEstudiantesGrupoSchema.safeParse(dto);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Datos inválidos';
      throw new BadRequestException(message);
    }

    const grupo = await this.obtenerGrupoYValidarAcceso(grupoId, usuarioId);
    if (!grupo.activo) {
      throw new BadRequestException(
        'No se pueden asignar estudiantes a un grupo inactivo'
      );
    }

    const estudiantesIds = [...new Set(result.data.estudiantesIds)];

    const [institucion, estudiantes, asignacionesExistentes] =
      await Promise.all([
        this.prisma.institucion.findUnique({
          where: { id: grupo.institucionId },
          select: { nombre: true },
        }),
        this.prisma.usuario.findMany({
          where: { id: { in: estudiantesIds } },
          select: {
            id: true,
            email: true,
            nombre: true,
            apellido: true,
            rol: true,
            perfil: { select: { institucion: true } },
          },
        }),
        this.prisma.grupoEstudiante.findMany({
          where: {
            grupoId,
            estudianteId: { in: estudiantesIds },
          },
          select: {
            estudianteId: true,
            activo: true,
          },
        }),
      ]);

    if (!institucion) {
      throw new NotFoundException('Institución no encontrada');
    }

    const estudiantesMap = new Map(
      estudiantes.map((estudiante) => [estudiante.id, estudiante])
    );
    const asignacionesMap = new Map(
      asignacionesExistentes.map((asignacion) => [
        asignacion.estudianteId,
        asignacion,
      ])
    );

    const agregados: string[] = [];
    const duplicados: string[] = [];
    const errores: AsignacionEstudiantesError[] = [];
    const nuevosIds: string[] = [];
    const reactivarIds: string[] = [];

    for (const estudianteId of estudiantesIds) {
      const estudiante = estudiantesMap.get(estudianteId);
      if (!estudiante) {
        errores.push({
          estudianteId,
          razon: 'Estudiante no encontrado',
        });
        continue;
      }

      if (estudiante.rol !== 'ESTUDIANTE') {
        errores.push({
          estudianteId,
          razon: 'El usuario no tiene rol ESTUDIANTE',
        });
        continue;
      }

      if (estudiante.perfil?.institucion !== institucion.nombre) {
        errores.push({
          estudianteId,
          razon: 'El estudiante no pertenece a la institución',
        });
        continue;
      }

      const asignacion = asignacionesMap.get(estudianteId);
      if (asignacion?.activo) {
        duplicados.push(estudianteId);
        continue;
      }

      if (asignacion && !asignacion.activo) {
        reactivarIds.push(estudianteId);
        agregados.push(estudianteId);
        continue;
      }

      nuevosIds.push(estudianteId);
      agregados.push(estudianteId);
    }

    const ahora = new Date();
    const operations = [];

    if (nuevosIds.length > 0) {
      operations.push(
        this.prisma.grupoEstudiante.createMany({
          data: nuevosIds.map((estudianteId) => ({
            grupoId,
            estudianteId,
            asignadoPorId: usuarioId,
            inscritoEn: ahora,
            activo: true,
          })),
        })
      );
    }

    for (const estudianteId of reactivarIds) {
      operations.push(
        this.prisma.grupoEstudiante.update({
          where: {
            grupoId_estudianteId: {
              grupoId,
              estudianteId,
            },
          },
          data: {
            activo: true,
            inscritoEn: ahora,
            asignadoPorId: usuarioId,
            removidoEn: null,
            removidoPorId: null,
          },
        })
      );
    }

    if (operations.length > 0) {
      await this.prisma.$transaction(operations);
    }

    return {
      agregados,
      duplicados,
      errores,
    };
  }

  async listarEstudiantes(
    grupoId: string,
    query: QueryGrupoEstudiantesDto,
    usuarioId: string
  ): Promise<ListaGrupoEstudiantesResponse> {
    const result = queryGrupoEstudiantesSchema.safeParse(query);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Parámetros inválidos';
      throw new BadRequestException(message);
    }

    await this.obtenerGrupoYValidarAcceso(grupoId, usuarioId);

    const { page, limit } = result.data;
    const skip = (page - 1) * limit;
    const where = {
      grupoId,
      activo: true,
    };

    const [asignaciones, total] = await Promise.all([
      this.prisma.grupoEstudiante.findMany({
        where,
        skip,
        take: limit,
        orderBy: { inscritoEn: 'desc' },
        select: {
          inscritoEn: true,
          estudiante: {
            select: {
              id: true,
              email: true,
              nombre: true,
              apellido: true,
            },
          },
        },
      }),
      this.prisma.grupoEstudiante.count({ where }),
    ]);

    return {
      estudiantes: asignaciones.map((asignacion) => ({
        ...asignacion.estudiante,
        inscritoEn: asignacion.inscritoEn,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async removerEstudiante(
    grupoId: string,
    estudianteId: string,
    usuarioId: string
  ): Promise<void> {
    await this.obtenerGrupoYValidarAcceso(grupoId, usuarioId);

    const asignacion = await this.prisma.grupoEstudiante.findUnique({
      where: {
        grupoId_estudianteId: {
          grupoId,
          estudianteId,
        },
      },
      select: {
        grupoId: true,
        estudianteId: true,
        activo: true,
      },
    });

    if (!asignacion?.activo) {
      throw new NotFoundException('La asignación del estudiante no existe');
    }

    await this.prisma.grupoEstudiante.update({
      where: {
        grupoId_estudianteId: {
          grupoId,
          estudianteId,
        },
      },
      data: {
        activo: false,
        removidoEn: new Date(),
        removidoPorId: usuarioId,
      },
    });
  }

  async asignarEducador(
    grupoId: string,
    dto: AsignarEducadorGrupoDto,
    usuarioId: string
  ): Promise<GrupoEducadorAsignacionResponse> {
    const result = asignarEducadorGrupoSchema.safeParse(dto);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Datos inválidos';
      throw new BadRequestException(message);
    }

    const grupo = await this.obtenerGrupoYValidarAcceso(grupoId, usuarioId);
    if (!grupo.activo) {
      throw new BadRequestException(
        'No se pueden asignar educadores a un grupo inactivo'
      );
    }

    const { educadorId, rol } = result.data;

    await this.validarEducador(educadorId, grupo.institucionId);

    const asignacionExistente = await this.prisma.grupoEducador.findUnique({
      where: {
        grupoId_educadorId: {
          grupoId,
          educadorId,
        },
      },
    });

    if (asignacionExistente?.activo) {
      throw new BadRequestException(
        'El educador ya está asignado a este grupo'
      );
    }

    if (asignacionExistente && !asignacionExistente.activo) {
      return this.prisma.grupoEducador.update({
        where: {
          grupoId_educadorId: {
            grupoId,
            educadorId,
          },
        },
        data: {
          rol,
          activo: true,
          asignadoEn: new Date(),
          asignadoPorId: usuarioId,
          removidoEn: null,
          removidoPorId: null,
        },
      });
    }

    return this.prisma.grupoEducador.create({
      data: {
        grupoId,
        educadorId,
        rol,
        asignadoEn: new Date(),
        asignadoPorId: usuarioId,
        activo: true,
      },
    });
  }

  async listarEducadores(
    grupoId: string,
    query: QueryGrupoEducadoresDto,
    usuarioId: string
  ): Promise<ListaGrupoEducadoresResponse> {
    const result = queryGrupoEducadoresSchema.safeParse(query);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Parámetros inválidos';
      throw new BadRequestException(message);
    }

    await this.obtenerGrupoYValidarAcceso(grupoId, usuarioId);

    const { page, limit } = result.data;
    const skip = (page - 1) * limit;
    const where = {
      grupoId,
      activo: true,
    };

    const [asignaciones, total] = await Promise.all([
      this.prisma.grupoEducador.findMany({
        where,
        skip,
        take: limit,
        orderBy: { asignadoEn: 'desc' },
        select: {
          rol: true,
          asignadoEn: true,
          educador: {
            select: {
              id: true,
              email: true,
              nombre: true,
              apellido: true,
            },
          },
        },
      }),
      this.prisma.grupoEducador.count({ where }),
    ]);

    return {
      educadores: asignaciones.map((asignacion) => ({
        ...asignacion.educador,
        rol: asignacion.rol,
        asignadoEn: asignacion.asignadoEn,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async removerEducador(
    grupoId: string,
    educadorId: string,
    usuarioId: string
  ): Promise<void> {
    await this.obtenerGrupoYValidarAcceso(grupoId, usuarioId);

    const asignacion = await this.prisma.grupoEducador.findUnique({
      where: {
        grupoId_educadorId: {
          grupoId,
          educadorId,
        },
      },
      select: {
        grupoId: true,
        educadorId: true,
        activo: true,
      },
    });

    if (!asignacion?.activo) {
      throw new NotFoundException('La asignación del educador no existe');
    }

    await this.prisma.grupoEducador.update({
      where: {
        grupoId_educadorId: {
          grupoId,
          educadorId,
        },
      },
      data: {
        activo: false,
        removidoEn: new Date(),
        removidoPorId: usuarioId,
      },
    });
  }

  async listarMisGruposComoEducador(
    query: QueryGrupoEducadoresDto,
    usuarioId: string
  ): Promise<ListaMisGruposEducadorResponse> {
    const result = queryGrupoEducadoresSchema.safeParse(query);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Parámetros inválidos';
      throw new BadRequestException(message);
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        rol: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuario.rol !== 'EDUCADOR') {
      throw new BadRequestException(
        'Solo los educadores pueden consultar sus grupos asignados'
      );
    }

    const { page, limit } = result.data;
    const skip = (page - 1) * limit;
    const where = {
      educadorId: usuarioId,
      activo: true,
    };

    const [asignaciones, total] = await Promise.all([
      this.prisma.grupoEducador.findMany({
        where,
        skip,
        take: limit,
        orderBy: { asignadoEn: 'desc' },
        select: {
          rol: true,
          asignadoEn: true,
          grupo: true,
        },
      }),
      this.prisma.grupoEducador.count({ where }),
    ]);

    return {
      grupos: asignaciones.map((asignacion) => ({
        ...asignacion.grupo,
        rol: asignacion.rol,
        asignadoEn: asignacion.asignadoEn,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async validarAccesoReporte(
    grupoId: string,
    usuarioId: string
  ): Promise<{
    id: string;
    nombre: string;
    institucionId: string;
    periodoAcademico: { id: string; nombre: string } | null;
  }> {
    const grupo = await this.prisma.grupo.findUnique({
      where: { id: grupoId },
      select: {
        id: true,
        nombre: true,
        institucionId: true,
        activo: true,
        periodoAcademico: { select: { id: true, nombre: true } },
      },
    });

    if (!grupo) {
      throw new NotFoundException('Grupo no encontrado');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { rol: true, perfil: { select: { institucion: true } } },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuario.rol === 'SUPER_ADMIN') {
      return grupo;
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

      if (!institucion) {
        throw new NotFoundException('Institución no encontrada');
      }

      if (institucion.id !== grupo.institucionId) {
        throw new ForbiddenException('No tienes acceso a este grupo');
      }

      return grupo;
    }

    if (usuario.rol === 'EDUCADOR') {
      const asignacion = await this.prisma.grupoEducador.findUnique({
        where: { grupoId_educadorId: { grupoId, educadorId: usuarioId } },
        select: { activo: true },
      });

      if (!asignacion?.activo) {
        throw new ForbiddenException('No tienes acceso a este grupo');
      }

      return grupo;
    }

    throw new ForbiddenException('No tienes permiso para ver reportes');
  }

  async reporteAsistencia(
    grupoId: string,
    query: QueryReporteAsistenciaDto,
    usuarioId: string
  ): Promise<ReporteAsistenciaResponse> {
    const result = queryReporteAsistenciaSchema.safeParse(query);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Parámetros inválidos'
      );
    }

    const grupo = await this.validarAccesoReporte(grupoId, usuarioId);
    const { periodoId, desde, hasta } = result.data;

    let periodoNombre: string | null = grupo.periodoAcademico?.nombre ?? null;
    let fechaDesde: Date | undefined;
    let fechaHasta: Date | undefined;

    if (periodoId) {
      const periodo = await this.prisma.periodoAcademico.findUnique({
        where: { id: periodoId },
        select: { nombre: true, fechaInicio: true, fechaFin: true },
      });
      if (!periodo) {
        throw new NotFoundException('Periodo académico no encontrado');
      }
      periodoNombre = periodo.nombre;
      fechaDesde = periodo.fechaInicio;
      fechaHasta = periodo.fechaFin;
    }

    if (desde) fechaDesde = new Date(desde);
    if (hasta) fechaHasta = new Date(hasta);

    const [grupoEstudiantes, asistencias] = await Promise.all([
      this.prisma.grupoEstudiante.findMany({
        where: { grupoId, activo: true },
        select: {
          estudiante: { select: { id: true, nombre: true, apellido: true } },
        },
      }),
      this.prisma.asistencia.findMany({
        where: {
          grupoId,
          ...(fechaDesde || fechaHasta
            ? {
                fecha: {
                  ...(fechaDesde ? { gte: fechaDesde } : {}),
                  ...(fechaHasta ? { lte: fechaHasta } : {}),
                },
              }
            : {}),
        },
        select: { estudianteId: true, estado: true, fecha: true },
      }),
    ]);

    const fechasUnicas = new Set(
      asistencias.map((a) => a.fecha.toISOString().split('T')[0])
    );
    const totalClases = fechasUnicas.size;

    const resumenPorEstudiante = grupoEstudiantes.map(({ estudiante }) => {
      const asis = asistencias.filter((a) => a.estudianteId === estudiante.id);
      const presente = asis.filter((a) => a.estado === 'PRESENTE').length;
      const ausente = asis.filter((a) => a.estado === 'AUSENTE').length;
      const tardanza = asis.filter((a) => a.estado === 'TARDANZA').length;
      const justificado = asis.filter((a) => a.estado === 'JUSTIFICADO').length;
      const porcentajeAsistencia =
        totalClases > 0 ? Math.round((presente / totalClases) * 100) : 0;

      return {
        estudiante: {
          nombre: estudiante.nombre,
          apellido: estudiante.apellido,
        },
        presente,
        ausente,
        tardanza,
        justificado,
        porcentajeAsistencia,
      };
    });

    const promedioGrupo =
      resumenPorEstudiante.length > 0
        ? Math.round(
            resumenPorEstudiante.reduce(
              (acc, e) => acc + e.porcentajeAsistencia,
              0
            ) / resumenPorEstudiante.length
          )
        : 0;

    return {
      grupo: { nombre: grupo.nombre },
      periodo: periodoNombre ? { nombre: periodoNombre } : null,
      totalClases,
      resumenPorEstudiante,
      promedioGrupo,
    };
  }

  async reporteRendimiento(
    grupoId: string,
    query: QueryReporteRendimientoDto,
    usuarioId: string
  ): Promise<ReporteRendimientoResponse> {
    const result = queryReporteRendimientoSchema.safeParse(query);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Parámetros inválidos'
      );
    }

    const grupo = await this.validarAccesoReporte(grupoId, usuarioId);
    const { periodoId } = result.data;

    const [grupoEstudiantes, calificaciones, periodoInfo] = await Promise.all([
      this.prisma.grupoEstudiante.findMany({
        where: { grupoId, activo: true },
        select: {
          estudiante: { select: { id: true, nombre: true, apellido: true } },
        },
      }),
      this.prisma.calificacion.findMany({
        where: {
          grupoId,
          ...(periodoId ? { periodoAcademicoId: periodoId } : {}),
        },
        select: { estudianteId: true, materia: true, nota: true },
      }),
      periodoId
        ? this.prisma.periodoAcademico.findUnique({
            where: { id: periodoId },
            select: { nombre: true },
          })
        : Promise.resolve(null),
    ]);

    const resumenPorEstudiante = grupoEstudiantes.map(({ estudiante }) => {
      const califs = calificaciones.filter(
        (c) => c.estudianteId === estudiante.id
      );
      const promedioCalificaciones =
        califs.length > 0
          ? Math.round(
              (califs.reduce((acc, c) => acc + c.nota, 0) / califs.length) * 100
            ) / 100
          : 0;

      return {
        estudiante: {
          nombre: estudiante.nombre,
          apellido: estudiante.apellido,
        },
        promedioCalificaciones,
        calificaciones: califs.map((c) => ({
          materia: c.materia,
          nota: c.nota,
        })),
      };
    });

    const promedioGrupo =
      resumenPorEstudiante.length > 0
        ? Math.round(
            (resumenPorEstudiante.reduce(
              (acc, e) => acc + e.promedioCalificaciones,
              0
            ) /
              resumenPorEstudiante.length) *
              100
          ) / 100
        : 0;

    const periodoNombre =
      periodoInfo?.nombre ?? grupo.periodoAcademico?.nombre ?? null;

    return {
      grupo: { nombre: grupo.nombre },
      periodo: periodoNombre ? { nombre: periodoNombre } : null,
      resumenPorEstudiante,
      promedioGrupo,
    };
  }

  async reporteAsistenciaCsv(
    grupoId: string,
    query: QueryReporteAsistenciaDto,
    usuarioId: string
  ): Promise<string> {
    const reporte = await this.reporteAsistencia(grupoId, query, usuarioId);

    const header =
      'Estudiante,Presente,Ausente,Tardanza,Justificado,%Asistencia';
    const rows = reporte.resumenPorEstudiante.map(
      (e) =>
        `${e.estudiante.nombre} ${e.estudiante.apellido},${e.presente},${e.ausente},${e.tardanza},${e.justificado},${e.porcentajeAsistencia}`
    );

    return [header, ...rows].join('\n');
  }
}
