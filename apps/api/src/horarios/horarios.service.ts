import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { PrismaService } from '../prisma/prisma.service';
import {
  createHorarioSchema,
  queryHorarioSchema,
  updateHorarioSchema,
  type CreateHorarioDto,
  type QueryHorarioDto,
  type UpdateHorarioDto,
} from './dto/horario.dto';

@Injectable()
export class HorariosService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(grupoId: string, dto: CreateHorarioDto, usuarioId: string) {
    const data = this.parse(createHorarioSchema, dto);
    const grupo = await this.obtenerGrupo(grupoId);
    await this.validarAdmin(grupo.institucionId, usuarioId);
    await this.validarRelaciones(grupoId, data.materiaId, data.educadorId);
    await this.validarSolapamiento(grupoId, data, undefined);
    return this.prisma.franjaHoraria.create({
      data: { grupoId, ...data },
      include: this.incluir,
    });
  }

  async listarPorGrupo(
    grupoId: string,
    query: QueryHorarioDto,
    usuarioId: string
  ) {
    const parsed = this.parse(queryHorarioSchema, query);
    const grupo = await this.obtenerGrupo(grupoId);
    await this.validarAccesoLectura(grupoId, grupo.institucionId, usuarioId);
    return {
      horarios: await this.prisma.franjaHoraria.findMany({
        where: {
          grupoId,
          activo: true,
          ...(parsed.diaSemana ? { diaSemana: parsed.diaSemana } : {}),
        },
        include: this.incluir,
        orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
      }),
    };
  }

  async actualizar(id: string, dto: UpdateHorarioDto, usuarioId: string) {
    const data = this.parse(updateHorarioSchema, dto);
    if (Object.keys(data).length === 0)
      throw new BadRequestException('No hay datos para actualizar');
    const actual = await this.obtenerHorario(id);
    const grupo = await this.obtenerGrupo(actual.grupoId);
    await this.validarAdmin(grupo.institucionId, usuarioId);
    const finalData = { ...actual, ...data };
    if (data.materiaId || data.educadorId)
      await this.validarRelaciones(
        actual.grupoId,
        finalData.materiaId,
        finalData.educadorId
      );
    await this.validarSolapamiento(actual.grupoId, finalData, id);
    return this.prisma.franjaHoraria.update({
      where: { id },
      data,
      include: this.incluir,
    });
  }

  async eliminar(id: string, usuarioId: string): Promise<void> {
    const actual = await this.obtenerHorario(id);
    const grupo = await this.obtenerGrupo(actual.grupoId);
    await this.validarAdmin(grupo.institucionId, usuarioId);
    await this.prisma.franjaHoraria.update({
      where: { id },
      data: { activo: false },
    });
  }

  async listarMisHorariosEducador(usuarioId: string, query: QueryHorarioDto) {
    const parsed = this.parse(queryHorarioSchema, query);
    const horarios = await this.prisma.franjaHoraria.findMany({
      where: {
        educadorId: usuarioId,
        activo: true,
        grupo: {
          activo: true,
          educadores: { some: { educadorId: usuarioId, activo: true } },
        },
        ...(parsed.diaSemana ? { diaSemana: parsed.diaSemana } : {}),
      },
      include: this.incluir,
      orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
    });
    return { horarios };
  }

  async listarMisHorariosEstudiante(usuarioId: string, query: QueryHorarioDto) {
    const parsed = this.parse(queryHorarioSchema, query);
    const horarios = await this.prisma.franjaHoraria.findMany({
      where: {
        activo: true,
        grupo: {
          activo: true,
          estudiantes: { some: { estudianteId: usuarioId, activo: true } },
        },
        ...(parsed.diaSemana ? { diaSemana: parsed.diaSemana } : {}),
      },
      include: this.incluir,
      orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
    });
    return { horarios };
  }

  private readonly incluir = {
    materia: { select: { id: true, nombre: true } },
    educador: { select: { id: true, nombre: true, apellido: true } },
    grupo: { select: { id: true, nombre: true } },
  } as const;

  private parse<T>(
    schema: {
      safeParse: (
        value: unknown
      ) =>
        | { success: true; data: T }
        | { success: false; error: { issues: { message?: string }[] } };
    },
    value: unknown
  ): T {
    const result = schema.safeParse(value);
    if (!result.success)
      throw new BadRequestException(
        result.error.issues[0]?.message ?? 'Datos inválidos'
      );
    return result.data;
  }

  private async obtenerGrupo(id: string) {
    const grupo = await this.prisma.grupo.findUnique({
      where: { id },
      select: { id: true, institucionId: true, activo: true },
    });
    if (!grupo) throw new NotFoundException('Grupo no encontrado');
    return grupo;
  }

  private async obtenerHorario(id: string) {
    const horario = await this.prisma.franjaHoraria.findUnique({
      where: { id },
    });
    if (!horario) throw new NotFoundException('Franja horaria no encontrada');
    return horario;
  }

  private async validarAdmin(institucionId: string, usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { rol: true, perfil: { select: { institucion: true } } },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (usuario.rol === 'SUPER_ADMIN') return;
    if (usuario.rol !== 'ADMIN_ESCUELA')
      throw new ForbiddenException('No tienes permiso para gestionar horarios');
    const institucion =
      usuario.perfil?.institucion &&
      (await this.prisma.institucion.findFirst({
        where: { nombre: usuario.perfil.institucion },
        select: { id: true },
      }));
    if (!institucion || institucion.id !== institucionId)
      throw new ForbiddenException(
        'No tienes permiso para operar sobre este grupo'
      );
  }

  private async validarAccesoLectura(
    grupoId: string,
    institucionId: string,
    usuarioId: string
  ) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { rol: true, perfil: { select: { institucion: true } } },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (usuario.rol === 'SUPER_ADMIN') return;
    if (usuario.rol === 'ADMIN_ESCUELA')
      return this.validarAdmin(institucionId, usuarioId);
    if (usuario.rol === 'EDUCADOR') {
      const assignment = await this.prisma.grupoEducador.findUnique({
        where: { grupoId_educadorId: { grupoId, educadorId: usuarioId } },
        select: { activo: true },
      });
      if (!assignment?.activo)
        throw new ForbiddenException(
          'No tienes permiso para consultar el horario del grupo'
        );
      return;
    }
    const assignment = await this.prisma.grupoEstudiante.findUnique({
      where: { grupoId_estudianteId: { grupoId, estudianteId: usuarioId } },
      select: { activo: true },
    });
    if (!assignment?.activo)
      throw new ForbiddenException(
        'No tienes permiso para consultar el horario del grupo'
      );
  }

  private async validarRelaciones(
    grupoId: string,
    materiaId: string,
    educadorId: string
  ) {
    const [materia, educador] = await Promise.all([
      this.prisma.grupoMateria.findUnique({
        where: { grupoId_materiaId: { grupoId, materiaId } },
        select: { activo: true, materia: { select: { activo: true } } },
      }),
      this.prisma.grupoEducador.findUnique({
        where: { grupoId_educadorId: { grupoId, educadorId } },
        select: {
          activo: true,
          educador: { select: { rol: true, activo: true } },
        },
      }),
    ]);
    if (!materia?.activo || !materia.materia.activo)
      throw new BadRequestException(
        'La materia no está asignada y activa en el grupo'
      );
    if (
      !educador?.activo ||
      !educador.educador.activo ||
      educador.educador.rol !== 'EDUCADOR'
    )
      throw new BadRequestException(
        'El educador no tiene una asignación activa en el grupo'
      );
  }

  private async validarSolapamiento(
    grupoId: string,
    data: {
      diaSemana: 'LUN' | 'MAR' | 'MIE' | 'JUE' | 'VIE';
      horaInicio: string;
      horaFin: string;
      educadorId: string;
    },
    excluirId: string | undefined
  ) {
    const conflict = await this.prisma.franjaHoraria.findFirst({
      where: {
        activo: true,
        diaSemana: data.diaSemana,
        ...(excluirId ? { id: { not: excluirId } } : {}),
        OR: [{ grupoId }, { educadorId: data.educadorId }],
        horaInicio: { lt: data.horaFin },
        horaFin: { gt: data.horaInicio },
      },
      select: { grupoId: true, educadorId: true },
    });
    if (conflict)
      throw new ConflictException(
        conflict.grupoId === grupoId
          ? 'La franja se solapa con otra del grupo'
          : 'La franja se solapa con otra del educador'
      );
  }
}
