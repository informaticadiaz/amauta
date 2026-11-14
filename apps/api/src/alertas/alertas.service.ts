import { Injectable } from '@nestjs/common';
import { EstadoAlertaAcademica, TipoAlertaAcademica } from '@prisma/client';
import type { Prisma } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { PrismaService } from '../prisma/prisma.service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { NotificacionesService } from '../notificaciones/notificaciones.service';

type GrupoVisible = Prisma.GrupoGetPayload<{
  include: {
    periodoAcademico: true;
    institucion: { include: { escalaCalificacion: true } };
    estudiantes: { where: { activo: true }; include: { estudiante: true } };
    educadores: { where: { activo: true }; include: { educador: true } };
    educador: true;
  };
}>;

export interface AlertaItem {
  id: string;
  tipo: TipoAlertaAcademica;
  estado: EstadoAlertaAcademica;
  valorActual: number;
  umbral: number;
  detalle: string | null;
  creadaEn: Date;
  actualizadaEn: Date;
  resueltaEn: Date | null;
  estudiante: { id: string; nombre: string; apellido: string };
  grupo: { id: string; nombre: string };
  periodo: { id: string; nombre: string };
}

export interface ListaAlertasResponse {
  alertas: AlertaItem[];
  total: number;
}

export interface DeteccionAlertasResponse {
  creadas: number;
  reactivadas: number;
  actualizadas: number;
  resueltas: number;
}

@Injectable()
export class AlertasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacionesService: NotificacionesService
  ) {}

  async listar(usuarioId: string): Promise<ListaAlertasResponse> {
    const grupos = await this.obtenerGruposVisibles(usuarioId);
    const grupoIds = grupos.map((grupo) => grupo.id);
    if (grupoIds.length === 0) {
      return { alertas: [], total: 0 };
    }

    const alertas = await this.prisma.alertaAcademica.findMany({
      where: {
        grupoId: { in: grupoIds },
        estado: EstadoAlertaAcademica.ACTIVA,
      },
      include: {
        estudiante: { select: { id: true, nombre: true, apellido: true } },
        grupo: { select: { id: true, nombre: true } },
        periodoAcademico: { select: { id: true, nombre: true } },
      },
      orderBy: { actualizadaEn: 'desc' },
    });

    return {
      alertas: alertas.map((alerta) => ({
        id: alerta.id,
        tipo: alerta.tipo,
        estado: alerta.estado,
        valorActual: alerta.valorActual,
        umbral: alerta.umbral,
        detalle: alerta.detalle,
        creadaEn: alerta.creadaEn,
        actualizadaEn: alerta.actualizadaEn,
        resueltaEn: alerta.resueltaEn,
        estudiante: alerta.estudiante,
        grupo: alerta.grupo,
        periodo: alerta.periodoAcademico,
      })),
      total: alertas.length,
    };
  }

  async detectar(usuarioId: string): Promise<DeteccionAlertasResponse> {
    const grupos = await this.obtenerGruposVisibles(usuarioId);
    const resultado: DeteccionAlertasResponse = {
      creadas: 0,
      reactivadas: 0,
      actualizadas: 0,
      resueltas: 0,
    };
    const clavesEnRiesgo = new Set<string>();

    for (const grupo of grupos) {
      if (!grupo.periodoAcademico) continue;
      for (const asignacion of grupo.estudiantes) {
        const estudianteId = asignacion.estudianteId;
        const asistencia = await this.calcularAsistencia(
          grupo.id,
          estudianteId,
          grupo.periodoAcademico.fechaInicio,
          grupo.periodoAcademico.fechaFin
        );
        const nota = await this.calcularNota(
          grupo.id,
          estudianteId,
          grupo.periodoAcademico.id
        );

        if (
          asistencia &&
          asistencia.porcentaje <
            grupo.periodoAcademico.porcentajeAsistenciaMinimo
        ) {
          const alerta = await this.guardarAlerta({
            tipo: TipoAlertaAcademica.ASISTENCIA_BAJA,
            grupo,
            estudianteId,
            periodoAcademicoId: grupo.periodoAcademico.id,
            valorActual: asistencia.porcentaje,
            umbral: grupo.periodoAcademico.porcentajeAsistenciaMinimo,
            detalle: `${asistencia.asistenciasValidas} de ${asistencia.total} registros cuentan como asistencia`,
          });
          clavesEnRiesgo.add(
            this.clave(
              alerta.tipo,
              grupo.id,
              estudianteId,
              grupo.periodoAcademico.id
            )
          );
          this.contarResultado(alerta, resultado);
          if (alerta.debeNotificar)
            await this.notificar(alerta.id, alerta.tipo, grupo);
        }

        const notaMinima =
          grupo.institucion.escalaCalificacion?.notaAlertaMinima ?? 4;
        if (nota !== null && nota < notaMinima) {
          const alerta = await this.guardarAlerta({
            tipo: TipoAlertaAcademica.NOTA_EN_RIESGO,
            grupo,
            estudianteId,
            periodoAcademicoId: grupo.periodoAcademico.id,
            valorActual: nota,
            umbral: notaMinima,
            detalle: 'Promedio de calificaciones cargadas del período',
          });
          clavesEnRiesgo.add(
            this.clave(
              alerta.tipo,
              grupo.id,
              estudianteId,
              grupo.periodoAcademico.id
            )
          );
          this.contarResultado(alerta, resultado);
          if (alerta.debeNotificar)
            await this.notificar(alerta.id, alerta.tipo, grupo);
        }
      }
    }

    const grupoIds = grupos.map((grupo) => grupo.id);
    if (grupoIds.length > 0) {
      const activas = await this.prisma.alertaAcademica.findMany({
        where: {
          grupoId: { in: grupoIds },
          estado: EstadoAlertaAcademica.ACTIVA,
        },
      });
      for (const alerta of activas) {
        const clave = this.clave(
          alerta.tipo,
          alerta.grupoId,
          alerta.estudianteId,
          alerta.periodoAcademicoId
        );
        if (!clavesEnRiesgo.has(clave)) {
          await this.prisma.alertaAcademica.update({
            where: { id: alerta.id },
            data: {
              estado: EstadoAlertaAcademica.RESUELTA,
              resueltaEn: new Date(),
            },
          });
          resultado.resueltas += 1;
        }
      }
    }

    return resultado;
  }

  private async guardarAlerta(params: {
    tipo: TipoAlertaAcademica;
    grupo: GrupoVisible;
    estudianteId: string;
    periodoAcademicoId: string;
    valorActual: number;
    umbral: number;
    detalle: string;
  }) {
    const existente = await this.prisma.alertaAcademica.findUnique({
      where: {
        tipo_grupoId_estudianteId_periodoAcademicoId: {
          tipo: params.tipo,
          grupoId: params.grupo.id,
          estudianteId: params.estudianteId,
          periodoAcademicoId: params.periodoAcademicoId,
        },
      },
    });
    const alerta = await this.prisma.alertaAcademica.upsert({
      where: {
        tipo_grupoId_estudianteId_periodoAcademicoId: {
          tipo: params.tipo,
          grupoId: params.grupo.id,
          estudianteId: params.estudianteId,
          periodoAcademicoId: params.periodoAcademicoId,
        },
      },
      create: {
        tipo: params.tipo,
        estado: EstadoAlertaAcademica.ACTIVA,
        institucionId: params.grupo.institucionId,
        grupoId: params.grupo.id,
        estudianteId: params.estudianteId,
        periodoAcademicoId: params.periodoAcademicoId,
        valorActual: params.valorActual,
        umbral: params.umbral,
        detalle: params.detalle,
      },
      update: {
        estado: EstadoAlertaAcademica.ACTIVA,
        valorActual: params.valorActual,
        umbral: params.umbral,
        detalle: params.detalle,
        resueltaEn: null,
      },
    });
    return {
      ...alerta,
      debeNotificar:
        !existente || existente.estado === EstadoAlertaAcademica.RESUELTA,
      eraNueva: !existente,
      eraResuelta: existente?.estado === EstadoAlertaAcademica.RESUELTA,
    };
  }

  private contarResultado(
    alerta: { eraNueva: boolean; eraResuelta: boolean },
    resultado: DeteccionAlertasResponse
  ) {
    if (alerta.eraNueva) resultado.creadas += 1;
    else if (alerta.eraResuelta) resultado.reactivadas += 1;
    else resultado.actualizadas += 1;
  }

  private async notificar(
    alertaId: string,
    tipo: TipoAlertaAcademica,
    grupo: GrupoVisible
  ) {
    const destinatarios = new Set<string>();
    if (grupo.educador.activo) destinatarios.add(grupo.educadorId);
    for (const asignacion of grupo.educadores) {
      if (asignacion.educador.activo) destinatarios.add(asignacion.educadorId);
    }
    const admins = await this.prisma.usuario.findMany({
      where: {
        rol: 'ADMIN_ESCUELA',
        activo: true,
        perfil: { institucion: grupo.institucion.nombre },
      },
      select: { id: true },
    });
    for (const admin of admins) destinatarios.add(admin.id);

    const tipoNotificacion =
      tipo === TipoAlertaAcademica.ASISTENCIA_BAJA
        ? 'ALERTA_ASISTENCIA_BAJA'
        : 'ALERTA_NOTA_EN_RIESGO';
    for (const destinatarioId of destinatarios) {
      await this.notificacionesService.crearNotificacionAlerta({
        destinatarioId,
        alertaId,
        tipo: tipoNotificacion,
      });
    }
  }

  private async obtenerGruposVisibles(
    usuarioId: string
  ): Promise<GrupoVisible[]> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { rol: true, perfil: { select: { institucion: true } } },
    });
    if (!usuario) return [];

    const where: Prisma.GrupoWhereInput = { activo: true };
    if (usuario.rol === 'SUPER_ADMIN') {
      // Sin filtro institucional.
    } else if (usuario.rol === 'ADMIN_ESCUELA') {
      if (!usuario.perfil?.institucion) return [];
      where.institucion = { nombre: usuario.perfil.institucion };
    } else {
      where.OR = [
        { educadorId: usuarioId },
        { educadores: { some: { educadorId: usuarioId, activo: true } } },
      ];
    }

    return this.prisma.grupo.findMany({
      where,
      include: {
        periodoAcademico: true,
        institucion: { include: { escalaCalificacion: true } },
        estudiantes: { where: { activo: true }, include: { estudiante: true } },
        educadores: { where: { activo: true }, include: { educador: true } },
        educador: true,
      },
    });
  }

  private async calcularAsistencia(
    grupoId: string,
    estudianteId: string,
    fechaInicio: Date,
    fechaFin: Date
  ) {
    const registros = await this.prisma.asistencia.findMany({
      where: {
        grupoId,
        estudianteId,
        fecha: { gte: fechaInicio, lte: fechaFin },
      },
      select: { estado: true },
    });
    if (registros.length === 0) return null;
    const asistenciasValidas = registros.filter((registro) =>
      ['PRESENTE', 'JUSTIFICADO'].includes(registro.estado)
    ).length;
    return {
      total: registros.length,
      asistenciasValidas,
      porcentaje: Math.round((asistenciasValidas / registros.length) * 100),
    };
  }

  private async calcularNota(
    grupoId: string,
    estudianteId: string,
    periodoAcademicoId: string
  ): Promise<number | null> {
    const calificaciones = await this.prisma.calificacion.findMany({
      where: { grupoId, estudianteId, periodoAcademicoId },
      select: { nota: true },
    });
    if (calificaciones.length === 0) return null;
    return (
      calificaciones.reduce((total, item) => total + item.nota, 0) /
      calificaciones.length
    );
  }

  private clave(
    tipo: TipoAlertaAcademica,
    grupoId: string,
    estudianteId: string,
    periodoAcademicoId: string
  ) {
    return `${tipo}:${grupoId}:${estudianteId}:${periodoAcademicoId}`;
  }
}
