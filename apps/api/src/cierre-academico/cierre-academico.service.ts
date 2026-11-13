import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { PrismaService } from '../prisma/prisma.service';
import {
  queryPreviewCierreSchema,
  type QueryPreviewCierreDto,
} from './dto/query-preview-cierre.dto';
import {
  confirmarCierreSchema,
  type ConfirmarCierreDto,
} from './dto/confirmar-cierre.dto';

type PreviewEstado = 'PROMOVIDO' | 'REPITENTE' | 'EN_RIESGO';
type PrismaLike = PrismaService | Prisma.TransactionClient;

interface PreviewEstudiante {
  estudianteId: string;
  nombre: string;
  apellido: string;
  estado: PreviewEstado;
  notaAprobacion: number;
  porcentajeAsistencia: number;
  porcentajeAsistenciaMinimo: number;
  materiasTotales: number;
  materiasAprobadas: number;
  materiasSinCalificacion: number;
  razones: string[];
}

interface PreviewGrupo {
  grupoId: string;
  nombre: string;
  estudiantes: PreviewEstudiante[];
}

export interface PreviewCierreResponse {
  institucion: { id: string; nombre: string };
  periodo: {
    id: string;
    nombre: string;
    fechaInicio: Date;
    fechaFin: Date;
    estadoCierre: 'ABIERTO' | 'CERRADO';
    porcentajeAsistenciaMinimo: number;
  };
  notaAprobacion: number;
  grupos: PreviewGrupo[];
}

export interface ConfirmarCierreResponse extends PreviewCierreResponse {
  cerradoEn: Date;
  cerradoPorId: string;
  registrosPersistidos: number;
}

export interface ActaCierreResponse {
  filename: string;
  content: Buffer;
}

function pdfText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\\()]/g, (character) => `\\${character}`)
    .replace(/[^\x20-\x7e]/g, '?');
}

function crearPdf(lines: string[]): Buffer {
  const content = `BT\n/F1 10 Tf\n40 800 Td\n${lines
    .map((line) => `(${pdfText(line)}) Tj 0 -14 Td`)
    .join('\n')}\nET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(content, 'ascii')} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(Buffer.byteLength(pdf, 'ascii'));
    pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, 'ascii');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, 'ascii');
}

@Injectable()
export class CierreAcademicoService {
  constructor(private readonly prisma: PrismaService) {}

  async preview(
    usuarioId: string,
    dto: QueryPreviewCierreDto
  ): Promise<PreviewCierreResponse> {
    const parsed = queryPreviewCierreSchema.safeParse(dto);
    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues[0]?.message ?? 'Parámetros inválidos'
      );
    }
    await this.validarAccesoInstitucion(
      parsed.data.institucionId,
      usuarioId,
      'previsualizar'
    );
    return this.calcularPreview(this.prisma, parsed.data);
  }

  async descargarActa(
    usuarioId: string,
    dto: QueryPreviewCierreDto
  ): Promise<ActaCierreResponse> {
    const params = queryPreviewCierreSchema.safeParse(dto);
    if (!params.success) {
      throw new BadRequestException(
        params.error.issues[0]?.message ?? 'Parámetros inválidos'
      );
    }
    await this.validarAccesoInstitucion(
      params.data.institucionId,
      usuarioId,
      'descargar'
    );

    const periodo = await this.prisma.periodoAcademico.findUnique({
      where: { id: params.data.periodoId },
      select: {
        id: true,
        nombre: true,
        fechaInicio: true,
        fechaFin: true,
        estadoCierre: true,
        cerradoEn: true,
        institucion: { select: { id: true, nombre: true } },
        estadosPromocion: {
          orderBy: [
            { grupo: { nombre: 'asc' } },
            { estudiante: { apellido: 'asc' } },
          ],
          select: {
            estado: true,
            estadoCalculado: true,
            notaAprobacion: true,
            porcentajeAsistencia: true,
            porcentajeAsistenciaMinimo: true,
            materiasTotales: true,
            materiasAprobadas: true,
            materiasSinCalificacion: true,
            justificacionSobrescritura: true,
            grupo: { select: { nombre: true } },
            estudiante: { select: { nombre: true, apellido: true } },
          },
        },
      },
    });
    if (!periodo)
      throw new NotFoundException('Período académico no encontrado');
    if (periodo.institucion.id !== params.data.institucionId) {
      throw new ForbiddenException(
        'El período académico no pertenece a la institución'
      );
    }
    if (periodo.estadoCierre !== 'CERRADO') {
      throw new ConflictException('El período académico todavía está abierto');
    }

    const lines = [
      'ACTA DE CIERRE ACADEMICO',
      `Institucion: ${periodo.institucion.nombre}`,
      `Periodo: ${periodo.nombre}`,
      `Vigencia: ${periodo.fechaInicio.toISOString().slice(0, 10)} a ${periodo.fechaFin.toISOString().slice(0, 10)}`,
      `Fecha de cierre: ${(periodo.cerradoEn ?? new Date()).toISOString()}`,
      '',
      'GRUPO | ESTUDIANTE | FINAL | CALCULADO | ASISTENCIA | MATERIAS | JUSTIFICACION',
      ...periodo.estadosPromocion.map((registro) =>
        [
          registro.grupo.nombre,
          `${registro.estudiante.apellido}, ${registro.estudiante.nombre}`,
          registro.estado,
          registro.estadoCalculado ?? '-',
          `${registro.porcentajeAsistencia ?? 0}%/${registro.porcentajeAsistenciaMinimo ?? 0}%`,
          `${registro.materiasAprobadas ?? 0}/${registro.materiasTotales ?? 0} aprobadas (${registro.materiasSinCalificacion ?? 0} sin nota)`,
          registro.justificacionSobrescritura ?? '-',
        ].join(' | ')
      ),
    ];
    return {
      filename: `acta-cierre-${periodo.institucion.id}-${periodo.id}.pdf`,
      content: crearPdf(lines),
    };
  }

  async confirmar(
    usuarioId: string,
    dto: QueryPreviewCierreDto,
    body: ConfirmarCierreDto
  ): Promise<ConfirmarCierreResponse> {
    const params = queryPreviewCierreSchema.safeParse(dto);
    if (!params.success) {
      throw new BadRequestException(
        params.error.issues[0]?.message ?? 'Parámetros inválidos'
      );
    }
    const parsedBody = confirmarCierreSchema.safeParse(body);
    if (!parsedBody.success) {
      throw new BadRequestException(
        parsedBody.error.issues[0]?.message ?? 'Datos inválidos'
      );
    }
    await this.validarAccesoInstitucion(
      params.data.institucionId,
      usuarioId,
      'confirmar'
    );

    return this.prisma.$transaction(async (tx) => {
      const periodo = await tx.periodoAcademico.findUnique({
        where: { id: params.data.periodoId },
        select: { estadoCierre: true, institucionId: true },
      });
      if (!periodo) {
        throw new NotFoundException('Período académico no encontrado');
      }
      if (periodo.institucionId !== params.data.institucionId) {
        throw new ForbiddenException(
          'El período académico no pertenece a la institución'
        );
      }
      if (periodo.estadoCierre === 'CERRADO') {
        throw new ConflictException('El período académico ya está cerrado');
      }

      const preview = await this.calcularPreview(tx, params.data);
      const estudiantes = new Map(
        preview.grupos.flatMap((grupo) =>
          grupo.estudiantes.map((estudiante) => [
            `${grupo.grupoId}:${estudiante.estudianteId}`,
            estudiante,
          ])
        )
      );
      const sobrescrituras = new Map<
        string,
        ConfirmarCierreDto['sobrescrituras'][number]
      >();
      for (const override of parsedBody.data.sobrescrituras) {
        const key = `${override.grupoId}:${override.estudianteId}`;
        if (sobrescrituras.has(key)) {
          throw new BadRequestException(
            'No se puede repetir una sobrescritura'
          );
        }
        const estudiante = estudiantes.get(key);
        if (!estudiante) {
          throw new BadRequestException(
            'La sobrescritura debe corresponder a un estudiante activo del período'
          );
        }
        if (
          override.estado !== estudiante.estado &&
          !override.justificacion?.trim()
        ) {
          throw new BadRequestException(
            'La justificación es obligatoria cuando la sobrescritura cambia el estado calculado'
          );
        }
        sobrescrituras.set(key, override);
      }

      const ahora = new Date();
      let registrosPersistidos = 0;
      for (const grupo of preview.grupos) {
        for (const estudiante of grupo.estudiantes) {
          const override = sobrescrituras.get(
            `${grupo.grupoId}:${estudiante.estudianteId}`
          );
          const cambio = override && override.estado !== estudiante.estado;
          await tx.estadoPromocion.upsert({
            where: {
              estudianteId_grupoId_periodoAcademicoId: {
                estudianteId: estudiante.estudianteId,
                grupoId: grupo.grupoId,
                periodoAcademicoId: params.data.periodoId,
              },
            },
            create: {
              estudianteId: estudiante.estudianteId,
              grupoId: grupo.grupoId,
              periodoAcademicoId: params.data.periodoId,
              estado: (override?.estado ?? estudiante.estado) as
                | 'PROMOVIDO'
                | 'REPITENTE',
              estadoCalculado: estudiante.estado as 'PROMOVIDO' | 'REPITENTE',
              notaAprobacion: estudiante.notaAprobacion,
              porcentajeAsistencia: estudiante.porcentajeAsistencia,
              porcentajeAsistenciaMinimo: estudiante.porcentajeAsistenciaMinimo,
              materiasTotales: estudiante.materiasTotales,
              materiasAprobadas: estudiante.materiasAprobadas,
              materiasSinCalificacion: estudiante.materiasSinCalificacion,
              sobrescritoPorId: cambio ? usuarioId : null,
              sobrescritoEn: cambio ? ahora : null,
              justificacionSobrescritura: cambio
                ? override?.justificacion?.trim()
                : null,
            },
            update: {
              estado: (override?.estado ?? estudiante.estado) as
                | 'PROMOVIDO'
                | 'REPITENTE',
              estadoCalculado: estudiante.estado as 'PROMOVIDO' | 'REPITENTE',
              notaAprobacion: estudiante.notaAprobacion,
              porcentajeAsistencia: estudiante.porcentajeAsistencia,
              porcentajeAsistenciaMinimo: estudiante.porcentajeAsistenciaMinimo,
              materiasTotales: estudiante.materiasTotales,
              materiasAprobadas: estudiante.materiasAprobadas,
              materiasSinCalificacion: estudiante.materiasSinCalificacion,
              sobrescritoPorId: cambio ? usuarioId : null,
              sobrescritoEn: cambio ? ahora : null,
              justificacionSobrescritura: cambio
                ? override?.justificacion?.trim()
                : null,
            },
          });
          registrosPersistidos += 1;
        }
      }

      const cerrado = await tx.periodoAcademico.update({
        where: { id: params.data.periodoId },
        data: {
          estadoCierre: 'CERRADO',
          cerradoEn: ahora,
          cerradoPorId: usuarioId,
        },
        select: { cerradoEn: true },
      });
      return {
        ...preview,
        periodo: { ...preview.periodo, estadoCierre: 'CERRADO' },
        cerradoEn: cerrado.cerradoEn ?? ahora,
        cerradoPorId: usuarioId,
        registrosPersistidos,
      };
    });
  }

  private async calcularPreview(
    prisma: PrismaLike,
    params: QueryPreviewCierreDto
  ): Promise<PreviewCierreResponse> {
    const periodo = await prisma.periodoAcademico.findUnique({
      where: { id: params.periodoId },
      select: {
        id: true,
        nombre: true,
        fechaInicio: true,
        fechaFin: true,
        estadoCierre: true,
        porcentajeAsistenciaMinimo: true,
        institucion: { select: { id: true, nombre: true } },
      },
    });
    if (!periodo)
      throw new NotFoundException('Período académico no encontrado');
    if (periodo.institucion.id !== params.institucionId) {
      throw new ForbiddenException(
        'El período académico no pertenece a la institución'
      );
    }
    const escala = await prisma.escalaCalificacion.findUnique({
      where: { institucionId: params.institucionId },
      select: { notaAprobacion: true },
    });
    const notaAprobacion = escala?.notaAprobacion ?? 6;
    const grupos = await prisma.grupo.findMany({
      where: {
        institucionId: params.institucionId,
        periodoAcademicoId: params.periodoId,
        activo: true,
      },
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        nombre: true,
        materias: {
          where: { activo: true, materia: { activo: true } },
          select: { materiaId: true, materia: { select: { nombre: true } } },
          orderBy: { materia: { nombre: 'asc' } },
        },
        estudiantes: {
          where: { activo: true, estudiante: { activo: true } },
          orderBy: { estudiante: { apellido: 'asc' } },
          select: {
            estudianteId: true,
            estudiante: { select: { nombre: true, apellido: true } },
          },
        },
      },
    });
    const grupoIds = grupos.map((grupo) => grupo.id);
    const [calificaciones, asistencias] = await Promise.all([
      prisma.calificacion.findMany({
        where: {
          periodoAcademicoId: params.periodoId,
          grupoId: { in: grupoIds },
        },
        select: {
          grupoId: true,
          estudianteId: true,
          materiaId: true,
          nota: true,
        },
      }),
      prisma.asistencia.findMany({
        where: {
          grupoId: { in: grupoIds },
          fecha: { gte: periodo.fechaInicio, lte: periodo.fechaFin },
        },
        select: { grupoId: true, estudianteId: true, estado: true },
      }),
    ]);
    const notas = new Map(
      calificaciones.map((item) => [
        `${item.grupoId}:${item.estudianteId}:${item.materiaId}`,
        item.nota,
      ])
    );
    const asistenciasMap = new Map<
      string,
      { total: number; computables: number }
    >();
    for (const item of asistencias) {
      const key = `${item.grupoId}:${item.estudianteId}`;
      const actual = asistenciasMap.get(key) ?? { total: 0, computables: 0 };
      actual.total += 1;
      if (item.estado === 'PRESENTE' || item.estado === 'JUSTIFICADO')
        actual.computables += 1;
      asistenciasMap.set(key, actual);
    }
    return {
      institucion: periodo.institucion,
      periodo: {
        id: periodo.id,
        nombre: periodo.nombre,
        fechaInicio: periodo.fechaInicio,
        fechaFin: periodo.fechaFin,
        estadoCierre: periodo.estadoCierre,
        porcentajeAsistenciaMinimo: periodo.porcentajeAsistenciaMinimo,
      },
      notaAprobacion,
      grupos: grupos.map((grupo) => ({
        grupoId: grupo.id,
        nombre: grupo.nombre,
        estudiantes: grupo.estudiantes.map(({ estudianteId, estudiante }) => {
          const razones: string[] = [];
          let materiasAprobadas = 0;
          let materiasSinCalificacion = 0;
          for (const materia of grupo.materias) {
            const nota = notas.get(
              `${grupo.id}:${estudianteId}:${materia.materiaId}`
            );
            if (nota === undefined) {
              materiasSinCalificacion += 1;
              razones.push(`Falta calificación en ${materia.materia.nombre}`);
            } else if (nota >= notaAprobacion) materiasAprobadas += 1;
            else
              razones.push(
                `${materia.materia.nombre} no alcanza la nota mínima (${nota} < ${notaAprobacion})`
              );
          }
          const asistencia = asistenciasMap.get(`${grupo.id}:${estudianteId}`);
          const porcentajeAsistencia = asistencia
            ? Math.round((asistencia.computables / asistencia.total) * 100)
            : 0;
          if (porcentajeAsistencia < periodo.porcentajeAsistenciaMinimo)
            razones.push(
              `Asistencia insuficiente (${porcentajeAsistencia}% < ${periodo.porcentajeAsistenciaMinimo}%)`
            );
          return {
            estudianteId,
            nombre: estudiante.nombre,
            apellido: estudiante.apellido,
            estado: razones.length === 0 ? 'PROMOVIDO' : 'REPITENTE',
            notaAprobacion,
            porcentajeAsistencia,
            porcentajeAsistenciaMinimo: periodo.porcentajeAsistenciaMinimo,
            materiasTotales: grupo.materias.length,
            materiasAprobadas,
            materiasSinCalificacion,
            razones,
          };
        }),
      })),
    };
  }

  private async validarAccesoInstitucion(
    institucionId: string,
    usuarioId: string,
    accion: string
  ): Promise<void> {
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
      return;
    }
    if (usuario.rol !== 'ADMIN_ESCUELA')
      throw new ForbiddenException(`No tienes permiso para ${accion} cierres`);
    if (!usuario.perfil?.institucion)
      throw new BadRequestException('Usuario sin institución asociada');
    const institucion = await this.prisma.institucion.findFirst({
      where: { nombre: usuario.perfil.institucion },
      select: { id: true },
    });
    if (!institucion || institucion.id !== institucionId)
      throw new ForbiddenException(
        'No tienes permiso para operar sobre otra institución'
      );
  }
}
