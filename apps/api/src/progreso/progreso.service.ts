/**
 * Servicio de Progreso
 *
 * Maneja el seguimiento del progreso de estudiantes en lecciones y cursos.
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { PrismaService } from '../prisma/prisma.service';

export interface ProgresoLeccionResponse {
  id: string;
  usuarioId: string;
  leccionId: string;
  completado: boolean;
  completadoEn: Date | null;
  ultimoAcceso: Date;
  porcentaje: number;
  intentos: number;
  mejorPuntaje: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgresoCursoResponse {
  cursoId: string;
  totalLecciones: number;
  leccionesCompletadas: number;
  leccionesCompletadasIds: string[];
  porcentaje: number;
  ultimaLeccion: {
    id: string;
    titulo: string;
    orden: number;
  } | null;
}

export interface ProgresoEstudianteItem {
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
  leccionesCompletadas: number;
  totalLecciones: number;
  porcentaje: number;
  estado: string;
  inscritoEn: Date;
}

export interface ProgresoEstudiantesResponse {
  cursoId: string;
  totalLecciones: number;
  estudiantes: ProgresoEstudianteItem[];
  total: number;
}

export interface CompletarLeccionResponse {
  progreso: ProgresoLeccionResponse;
  message: string;
}

@Injectable()
export class ProgresoService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Marca una lección como completada por el estudiante.
   * Operación idempotente: si ya estaba completada, no falla.
   * Actualiza el porcentaje de la inscripción automáticamente.
   */
  async completarLeccion(
    leccionId: string,
    usuarioId: string
  ): Promise<CompletarLeccionResponse> {
    // Verificar que la lección existe
    const leccion = await this.prisma.leccion.findUnique({
      where: { id: leccionId },
      select: { id: true, cursoId: true, publicada: true },
    });

    if (!leccion) {
      throw new NotFoundException('Lección no encontrada');
    }

    // Verificar que el usuario está inscripto en el curso
    const inscripcion = await this.prisma.inscripcion.findUnique({
      where: {
        usuarioId_cursoId: { usuarioId, cursoId: leccion.cursoId },
      },
    });

    if (!inscripcion || inscripcion.estado === 'ABANDONADO') {
      throw new ForbiddenException('No estás inscripto en este curso');
    }

    const ahora = new Date();

    // Upsert progreso (idempotente)
    const progreso = await this.prisma.progreso.upsert({
      where: {
        usuarioId_leccionId: { usuarioId, leccionId },
      },
      update: {
        completado: true,
        completadoEn: ahora,
        ultimoAcceso: ahora,
      },
      create: {
        usuarioId,
        leccionId,
        completado: true,
        completadoEn: ahora,
        ultimoAcceso: ahora,
      },
    });

    // Recalcular progreso del curso
    const [totalLecciones, leccionesCompletadas] = await Promise.all([
      this.prisma.leccion.count({
        where: { cursoId: leccion.cursoId, publicada: true },
      }),
      this.prisma.progreso.count({
        where: {
          usuarioId,
          leccion: { cursoId: leccion.cursoId },
          completado: true,
        },
      }),
    ]);

    const porcentaje =
      totalLecciones > 0
        ? Math.round((leccionesCompletadas / totalLecciones) * 100)
        : 0;

    // Actualizar inscripción con nuevo porcentaje y estado
    const nuevoEstado = porcentaje === 100 ? 'COMPLETADO' : inscripcion.estado;
    await this.prisma.inscripcion.update({
      where: { id: inscripcion.id },
      data: {
        progreso: porcentaje,
        estado: nuevoEstado,
        ...(nuevoEstado === 'COMPLETADO' && { completadoEn: ahora }),
      },
    });

    return {
      progreso,
      message: 'Lección marcada como completada',
    };
  }

  /**
   * Obtiene el progreso del estudiante en un curso específico.
   */
  async obtenerProgresoCurso(
    cursoId: string,
    usuarioId: string
  ): Promise<ProgresoCursoResponse> {
    // Verificar que el curso existe
    const curso = await this.prisma.curso.findUnique({
      where: { id: cursoId },
      select: { id: true },
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    // Verificar inscripción
    const inscripcion = await this.prisma.inscripcion.findUnique({
      where: {
        usuarioId_cursoId: { usuarioId, cursoId },
      },
    });

    if (!inscripcion || inscripcion.estado === 'ABANDONADO') {
      throw new ForbiddenException('No estás inscripto en este curso');
    }

    // Contar lecciones publicadas y obtener completadas
    const [totalLecciones, progresoCompletado] = await Promise.all([
      this.prisma.leccion.count({
        where: { cursoId, publicada: true },
      }),
      this.prisma.progreso.findMany({
        where: {
          usuarioId,
          leccion: { cursoId },
          completado: true,
        },
        select: { leccionId: true },
      }),
    ]);

    const leccionesCompletadas = progresoCompletado.length;
    const leccionesCompletadasIds = progresoCompletado.map((p) => p.leccionId);

    const porcentaje =
      totalLecciones > 0
        ? Math.round((leccionesCompletadas / totalLecciones) * 100)
        : 0;

    // Obtener última lección accedida
    const ultimoProgreso = await this.prisma.progreso.findFirst({
      where: {
        usuarioId,
        leccion: { cursoId },
      },
      orderBy: { ultimoAcceso: 'desc' },
      include: {
        leccion: { select: { id: true, titulo: true, orden: true } },
      },
    });

    return {
      cursoId,
      totalLecciones,
      leccionesCompletadas,
      leccionesCompletadasIds,
      porcentaje,
      ultimaLeccion: ultimoProgreso?.leccion ?? null,
    };
  }

  /**
   * Obtiene el progreso de todos los estudiantes en un curso.
   * Solo accesible para el educador dueño del curso.
   */
  async obtenerProgresoEstudiantes(
    cursoId: string,
    educadorId: string
  ): Promise<ProgresoEstudiantesResponse> {
    // Verificar que el curso existe y pertenece al educador
    const curso = await this.prisma.curso.findUnique({
      where: { id: cursoId },
      select: { id: true, educadorId: true },
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    if (curso.educadorId !== educadorId) {
      throw new ForbiddenException(
        'No tienes permiso para ver el progreso de este curso'
      );
    }

    // Contar total de lecciones publicadas
    const totalLecciones = await this.prisma.leccion.count({
      where: { cursoId, publicada: true },
    });

    // Obtener inscripciones activas con datos del usuario
    const inscripciones = await this.prisma.inscripcion.findMany({
      where: {
        cursoId,
        estado: { not: 'ABANDONADO' },
      },
      include: {
        usuario: {
          select: { id: true, nombre: true, apellido: true, email: true },
        },
      },
    });

    // Calcular progreso por estudiante
    const estudiantes = await Promise.all(
      inscripciones.map(async (inscripcion) => {
        const leccionesCompletadas = await this.prisma.progreso.count({
          where: {
            usuarioId: inscripcion.usuarioId,
            leccion: { cursoId },
            completado: true,
          },
        });

        return {
          usuario: inscripcion.usuario,
          leccionesCompletadas,
          totalLecciones,
          porcentaje:
            totalLecciones > 0
              ? Math.round((leccionesCompletadas / totalLecciones) * 100)
              : 0,
          estado: inscripcion.estado,
          inscritoEn: inscripcion.inscritoEn,
        };
      })
    );

    return {
      cursoId,
      totalLecciones,
      estudiantes,
      total: estudiantes.length,
    };
  }
}
