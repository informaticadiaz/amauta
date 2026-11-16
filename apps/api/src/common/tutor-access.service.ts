import { ForbiddenException, Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { PrismaService } from '../prisma/prisma.service';

export interface TutorAcademicAccess {
  estudianteId: string;
  institucionId: string;
  periodo: {
    id: string;
    nombre: string;
    fechaInicio: Date;
    fechaFin: Date;
  };
}

@Injectable()
export class TutorAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async listarEstudiantes(tutorId: string) {
    const vinculos = await this.prisma.tutorEstudiante.findMany({
      where: {
        tutorId,
        activo: true,
        estudiante: {
          activo: true,
          matriculas: {
            some: {
              estado: 'ACTIVA',
              periodoAcademico: { activo: true },
            },
          },
        },
      },
      select: {
        id: true,
        relacion: true,
        estudiante: {
          select: {
            id: true,
            email: true,
            nombre: true,
            apellido: true,
            matriculas: {
              where: {
                estado: 'ACTIVA',
                periodoAcademico: { activo: true },
              },
              orderBy: { periodoAcademico: { fechaInicio: 'desc' } },
              take: 1,
              select: {
                institucionId: true,
                periodoAcademico: {
                  select: { id: true, nombre: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      estudiantes: vinculos.map(({ estudiante, ...vinculo }) => ({
        ...vinculo,
        estudiante: {
          ...estudiante,
          matricula: estudiante.matriculas[0] ?? null,
        },
      })),
    };
  }

  async verificarAcceso(
    tutorId: string,
    estudianteId: string
  ): Promise<TutorAcademicAccess> {
    const vinculo = await this.prisma.tutorEstudiante.findUnique({
      where: { tutorId_estudianteId: { tutorId, estudianteId } },
      select: { activo: true },
    });

    if (!vinculo?.activo) {
      throw new ForbiddenException(
        'No tienes un vínculo activo con este estudiante'
      );
    }

    const matricula = await this.prisma.matricula.findFirst({
      where: {
        estudianteId,
        estado: 'ACTIVA',
        periodoAcademico: { activo: true },
      },
      orderBy: { periodoAcademico: { fechaInicio: 'desc' } },
      select: {
        institucionId: true,
        periodoAcademico: {
          select: {
            id: true,
            nombre: true,
            fechaInicio: true,
            fechaFin: true,
          },
        },
      },
    });

    if (!matricula) {
      throw new ForbiddenException(
        'El estudiante no tiene una matrícula activa en un período vigente'
      );
    }

    return {
      estudianteId,
      institucionId: matricula.institucionId,
      periodo: matricula.periodoAcademico,
    };
  }
}
