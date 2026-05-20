/**
 * Servicio de categorías
 *
 * Maneja las operaciones de categorías
 */

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../prisma/prisma.service';
import {
  createCategoriaSchema,
  type CreateCategoriaDto,
} from './dto/create-categoria.dto';
import {
  updateCategoriaSchema,
  type UpdateCategoriaDto,
} from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista todas las categorías ordenadas por nombre
   */
  async listar() {
    return this.prisma.categoria.findMany({
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        nombre: true,
        slug: true,
        descripcion: true,
        icono: true,
        _count: {
          select: { cursos: true },
        },
      },
    });
  }

  /**
   * Obtiene una categoría por ID
   */
  async obtenerPorId(id: string) {
    return this.prisma.categoria.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        slug: true,
        descripcion: true,
        icono: true,
      },
    });
  }

  /**
   * Obtiene una categoría por slug
   */
  async obtenerPorSlug(slug: string) {
    return this.prisma.categoria.findUnique({
      where: { slug },
      select: {
        id: true,
        nombre: true,
        slug: true,
        descripcion: true,
        icono: true,
      },
    });
  }

  /**
   * Crea una categoría nueva
   */
  async crear(dto: CreateCategoriaDto) {
    const result = createCategoriaSchema.safeParse(dto);
    if (!result.success) {
      throw new BadRequestException(result.error.issues[0]?.message);
    }

    const { nombre, descripcion, icono } = result.data;

    const existente = await this.prisma.categoria.findUnique({
      where: { nombre },
    });
    if (existente) {
      throw new BadRequestException('Ya existe una categoría con ese nombre');
    }

    const slug = await this.generarSlug(nombre);

    return this.prisma.categoria.create({
      data: {
        nombre,
        slug,
        descripcion: descripcion ?? null,
        icono: icono ?? null,
      },
      select: {
        id: true,
        nombre: true,
        slug: true,
        descripcion: true,
        icono: true,
      },
    });
  }

  /**
   * Actualiza una categoría existente
   */
  async actualizar(id: string, dto: UpdateCategoriaDto) {
    const result = updateCategoriaSchema.safeParse(dto);
    if (!result.success) {
      throw new BadRequestException(result.error.issues[0]?.message);
    }

    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
    });
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    const { nombre, descripcion, icono } = result.data;

    // Si cambia el nombre, validar unicidad y regenerar slug
    let nuevoSlug: string | undefined;
    if (nombre && nombre !== categoria.nombre) {
      const existente = await this.prisma.categoria.findUnique({
        where: { nombre },
      });
      if (existente && existente.id !== id) {
        throw new BadRequestException('Ya existe una categoría con ese nombre');
      }
      nuevoSlug = await this.generarSlug(nombre);
    }

    return this.prisma.categoria.update({
      where: { id },
      data: {
        ...(nombre !== undefined && { nombre }),
        ...(nuevoSlug !== undefined && { slug: nuevoSlug }),
        ...(descripcion !== undefined && { descripcion }),
        ...(icono !== undefined && { icono }),
      },
      select: {
        id: true,
        nombre: true,
        slug: true,
        descripcion: true,
        icono: true,
      },
    });
  }

  /**
   * Elimina una categoría (solo si no tiene cursos asociados)
   */
  async eliminar(id: string): Promise<void> {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
      include: { _count: { select: { cursos: true } } },
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    if (categoria._count.cursos > 0) {
      throw new BadRequestException(
        'No se puede eliminar una categoría con cursos asociados'
      );
    }

    await this.prisma.categoria.delete({ where: { id } });
  }

  /**
   * Genera un slug único a partir del nombre
   */
  private async generarSlug(nombre: string): Promise<string> {
    const baseSlug = nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    let slug = baseSlug;
    let counter = 1;

    while (await this.prisma.categoria.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}
