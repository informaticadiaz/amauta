import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createPeriodoSchema } from './dto/create-periodo.dto';
import { updatePeriodoSchema } from './dto/update-periodo.dto';
import { upsertEscalaSchema } from './dto/upsert-escala.dto';

@Injectable()
export class InstitucionesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

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
  // MI INSTITUCIÓN
  // ============================================================

  async obtenerMiInstitucion(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { perfil: { select: { institucion: true } } },
    });

    if (!usuario?.perfil?.institucion) {
      throw new BadRequestException('Usuario sin institución asociada');
    }

    const institucion = await this.prisma.institucion.findFirst({
      where: { nombre: usuario.perfil.institucion },
      select: { id: true, nombre: true },
    });

    if (!institucion) {
      throw new NotFoundException('Institución no encontrada');
    }

    const periodos = await this.prisma.periodoAcademico.findMany({
      where: { institucionId: institucion.id },
      orderBy: { fechaInicio: 'desc' },
      select: { id: true, nombre: true, activo: true },
    });

    return {
      institucionId: institucion.id,
      nombre: institucion.nombre,
      periodos,
    };
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
