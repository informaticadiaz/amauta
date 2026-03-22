import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { createPeriodoSchema } from './dto/create-periodo.dto';
import { updatePeriodoSchema } from './dto/update-periodo.dto';
import { upsertEscalaSchema } from './dto/upsert-escala.dto';

@Injectable()
export class InstitucionesService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // PERÍODOS ACADÉMICOS
  // ============================================================

  async crearPeriodo(institucionId: string, dto: unknown) {
    const result = createPeriodoSchema.safeParse(dto);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Datos inválidos'
      );
    }

    await this.verificarInstitucion(institucionId);

    const { nombre, fechaInicio, fechaFin } = result.data;

    return this.prisma.periodoAcademico.create({
      data: {
        nombre,
        fechaInicio,
        fechaFin,
        institucionId,
      },
    });
  }

  async listarPeriodos(institucionId: string) {
    await this.verificarInstitucion(institucionId);

    return this.prisma.periodoAcademico.findMany({
      where: { institucionId },
      orderBy: { fechaInicio: 'desc' },
    });
  }

  async actualizarPeriodo(id: string, dto: unknown) {
    const result = updatePeriodoSchema.safeParse(dto);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Datos inválidos'
      );
    }

    const periodo = await this.prisma.periodoAcademico.findUnique({
      where: { id },
    });
    if (!periodo) {
      throw new NotFoundException('Período académico no encontrado');
    }

    return this.prisma.periodoAcademico.update({
      where: { id },
      data: result.data,
    });
  }

  async eliminarPeriodo(id: string): Promise<void> {
    const periodo = await this.prisma.periodoAcademico.findUnique({
      where: { id },
    });
    if (!periodo) {
      throw new NotFoundException('Período académico no encontrado');
    }

    await this.prisma.periodoAcademico.update({
      where: { id },
      data: { activo: false },
    });
  }

  // ============================================================
  // ESCALA DE CALIFICACIÓN
  // ============================================================

  async obtenerEscala(institucionId: string) {
    await this.verificarInstitucion(institucionId);

    return this.prisma.escalaCalificacion.findUnique({
      where: { institucionId },
    });
  }

  async upsertEscala(institucionId: string, dto: unknown) {
    const result = upsertEscalaSchema.safeParse(dto);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Datos inválidos'
      );
    }

    await this.verificarInstitucion(institucionId);

    const { notaMinima, notaMaxima, notaAprobacion, descripcion } = result.data;

    return this.prisma.escalaCalificacion.upsert({
      where: { institucionId },
      create: {
        institucionId,
        notaMinima,
        notaMaxima,
        notaAprobacion,
        descripcion: descripcion ?? null,
      },
      update: {
        notaMinima,
        notaMaxima,
        notaAprobacion,
        descripcion: descripcion ?? null,
      },
    });
  }

  // ============================================================
  // HELPERS
  // ============================================================

  private async verificarInstitucion(institucionId: string) {
    const institucion = await this.prisma.institucion.findUnique({
      where: { id: institucionId },
    });
    if (!institucion) {
      throw new NotFoundException('Institución no encontrada');
    }
    return institucion;
  }
}
