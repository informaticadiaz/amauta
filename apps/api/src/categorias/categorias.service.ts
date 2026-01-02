/**
 * Servicio de categorías
 *
 * Maneja las operaciones de categorías
 */

import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../prisma/prisma.service';

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
}
