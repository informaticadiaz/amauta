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
        estudiante: { activo: true },
      },
      select: {
        id: true,
        relacion: true,
        institucionId: true,
        createdAt: true,
        estudiante: {
          select: {
            id: true,
            email: true,
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const estudiantes = await Promise.all(
      vinculos.map(async ({ estudiante, ...vinculo }) => {
        const matricula = await this.prisma.matricula.findFirst({
          where: {
            estudianteId: estudiante.id,
            institucionId: vinculo.institucionId,
            estado: 'ACTIVA',
            periodoAcademico: { activo: true },
          },
          orderBy: { periodoAcademico: { fechaInicio: 'desc' } },
          select: {
            institucionId: true,
            periodoAcademico: {
              select: { id: true, nombre: true },
            },
          },
        });

        return matricula
          ? { ...vinculo, estudiante: { ...estudiante, matricula } }
          : null;
      })
    );

    return { estudiantes: estudiantes.filter(Boolean) };
  }

  async verificarAcceso(
    tutorId: string,
    estudianteId: string
  ): Promise<TutorAcademicAccess> {
    const vinculos = await this.prisma.tutorEstudiante.findMany({
      where: { tutorId, estudianteId, activo: true },
      select: { institucionId: true },
    });

    if (vinculos.length === 0) {
      throw new ForbiddenException(
        'No tienes un vínculo activo con este estudiante'
      );
    }

    for (const vinculo of vinculos) {
      const matricula = await this.prisma.matricula.findFirst({
        where: {
          estudianteId,
          institucionId: vinculo.institucionId,
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

      if (matricula) {
        return {
          estudianteId,
          institucionId: matricula.institucionId,
          periodo: matricula.periodoAcademico,
        };
      }
    }

    throw new ForbiddenException(
      'El estudiante no tiene una matrícula activa en un período vigente'
    );
  }
}
