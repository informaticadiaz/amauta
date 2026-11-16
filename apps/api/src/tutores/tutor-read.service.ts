import { Injectable, NotFoundException } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { PrismaService } from '../prisma/prisma.service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { BoletinService } from '../boletin/boletin.service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { CalificacionesService } from '../calificaciones/calificaciones.service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { ComunicadosService } from '../comunicados/comunicados.service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { TutorAccessService } from '../common/tutor-access.service';

@Injectable()
export class TutorReadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: TutorAccessService,
    private readonly boletin: BoletinService,
    private readonly calificaciones: CalificacionesService,
    private readonly comunicados: ComunicadosService
  ) {}

  listarEstudiantes(tutorId: string) {
    return this.access.listarEstudiantes(tutorId);
  }

  async obtenerBoletin(tutorId: string, estudianteId: string) {
    const acceso = await this.access.verificarAcceso(tutorId, estudianteId);
    const grupo = await this.prisma.grupo.findFirst({
      where: {
        periodoAcademicoId: acceso.periodo.id,
        estudiantes: { some: { estudianteId, activo: true } },
      },
      select: { id: true },
      orderBy: { nombre: 'asc' },
    });
    if (!grupo) {
      throw new NotFoundException(
        'El estudiante no tiene un grupo activo en el período vigente'
      );
    }
    return this.boletin.getBoletinEstudiante(
      estudianteId,
      acceso.periodo.id,
      grupo.id
    );
  }

  async obtenerAsistencias(tutorId: string, estudianteId: string) {
    const acceso = await this.access.verificarAcceso(tutorId, estudianteId);
    const asistencias = await this.prisma.asistencia.findMany({
      where: {
        estudianteId,
        fecha: {
          gte: acceso.periodo.fechaInicio,
          lte: acceso.periodo.fechaFin,
        },
      },
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
    return {
      asistencias,
      resumen: {
        total,
        presente,
        ausente,
        tardanza,
        justificado,
        porcentaje:
          total === 0
            ? 0
            : Math.round(((presente + justificado) / total) * 100),
      },
    };
  }

  async obtenerCalificaciones(tutorId: string, estudianteId: string) {
    const acceso = await this.access.verificarAcceso(tutorId, estudianteId);
    return this.calificaciones.getMisCalificaciones(
      estudianteId,
      acceso.periodo.id
    );
  }

  async obtenerComunicados(tutorId: string, estudianteId: string) {
    const acceso = await this.access.verificarAcceso(tutorId, estudianteId);
    return this.comunicados.listar(acceso.institucionId, {
      page: 1,
      limit: 10,
    });
  }
}
