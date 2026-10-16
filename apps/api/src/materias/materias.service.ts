import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { PrismaService } from '../prisma/prisma.service';
import {
  createMateriaSchema,
  updateMateriaSchema,
  type CreateMateriaDto,
  type UpdateMateriaDto,
} from './dto/materia.dto';

@Injectable()
export class MateriasService {
  constructor(private readonly prisma: PrismaService) {}

  private async validarAdmin(institucionId: string, usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { rol: true, perfil: { select: { institucion: true } } },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (usuario.rol === 'SUPER_ADMIN') return;
    if (usuario.rol !== 'ADMIN_ESCUELA')
      throw new ForbiddenException('No tienes permiso para gestionar materias');
    const nombre = usuario.perfil?.institucion;
    if (!nombre)
      throw new BadRequestException('Usuario sin institución asociada');
    const institucion = await this.prisma.institucion.findFirst({
      where: { nombre },
      select: { id: true },
    });
    if (!institucion || institucion.id !== institucionId)
      throw new ForbiddenException(
        'No tienes permiso para operar sobre otra institución'
      );
  }

  async crear(institucionId: string, dto: CreateMateriaDto, usuarioId: string) {
    const data = createMateriaSchema.parse(dto);
    await this.validarAdmin(institucionId, usuarioId);
    return this.prisma.materia.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
        institucionId,
      },
    });
  }

  async listar(
    institucionId: string,
    usuarioId: string,
    incluirInactivas = false
  ) {
    await this.validarAdmin(institucionId, usuarioId);
    return this.prisma.materia.findMany({
      where: { institucionId, ...(incluirInactivas ? {} : { activo: true }) },
      orderBy: { nombre: 'asc' },
    });
  }

  async actualizar(id: string, dto: UpdateMateriaDto, usuarioId: string) {
    const data = updateMateriaSchema.parse(dto);
    if (Object.keys(data).length === 0)
      throw new BadRequestException('No hay datos para actualizar');
    const materia = await this.prisma.materia.findUnique({
      where: { id },
      select: { institucionId: true },
    });
    if (!materia) throw new NotFoundException('Materia no encontrada');
    await this.validarAdmin(materia.institucionId, usuarioId);
    return this.prisma.materia.update({ where: { id }, data });
  }

  async desactivar(id: string, usuarioId: string) {
    return this.actualizar(id, { activo: false }, usuarioId);
  }

  async listarPorGrupo(grupoId: string, usuarioId: string) {
    const grupo = await this.prisma.grupo.findUnique({
      where: { id: grupoId },
      select: { institucionId: true },
    });
    if (!grupo) throw new NotFoundException('Grupo no encontrado');
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { rol: true },
    });
    if (usuario?.rol === 'EDUCADOR') {
      const asignacion = await this.prisma.grupoEducador.findUnique({
        where: { grupoId_educadorId: { grupoId, educadorId: usuarioId } },
        select: { activo: true },
      });
      if (!asignacion?.activo)
        throw new ForbiddenException(
          'No tienes permiso para consultar las materias del grupo'
        );
    } else await this.validarAdmin(grupo.institucionId, usuarioId);
    return this.prisma.grupoMateria
      .findMany({
        where: { grupoId, activo: true, materia: { activo: true } },
        select: { materia: true },
        orderBy: { materia: { nombre: 'asc' } },
      })
      .then((items) => items.map((item) => item.materia));
  }

  async asignarAGrupo(grupoId: string, materiaId: string, usuarioId: string) {
    const grupo = await this.prisma.grupo.findUnique({
      where: { id: grupoId },
      select: { id: true, institucionId: true },
    });
    if (!grupo) throw new NotFoundException('Grupo no encontrado');
    await this.validarAdmin(grupo.institucionId, usuarioId);
    const materia = await this.prisma.materia.findUnique({
      where: { id: materiaId },
      select: { id: true, institucionId: true, activo: true },
    });
    if (!materia || !materia.activo)
      throw new NotFoundException('Materia no encontrada o inactiva');
    if (materia.institucionId !== grupo.institucionId)
      throw new BadRequestException(
        'La materia no pertenece a la institución del grupo'
      );
    return this.prisma.grupoMateria.upsert({
      where: { grupoId_materiaId: { grupoId, materiaId } },
      create: { grupoId, materiaId },
      update: { activo: true },
    });
  }

  async removerDeGrupo(grupoId: string, materiaId: string, usuarioId: string) {
    const grupo = await this.prisma.grupo.findUnique({
      where: { id: grupoId },
      select: { institucionId: true },
    });
    if (!grupo) throw new NotFoundException('Grupo no encontrado');
    await this.validarAdmin(grupo.institucionId, usuarioId);
    const asignacion = await this.prisma.grupoMateria.findUnique({
      where: { grupoId_materiaId: { grupoId, materiaId } },
    });
    if (!asignacion)
      throw new NotFoundException('Materia no asignada al grupo');
    return this.prisma.grupoMateria.update({
      where: { grupoId_materiaId: { grupoId, materiaId } },
      data: { activo: false },
    });
  }
}
