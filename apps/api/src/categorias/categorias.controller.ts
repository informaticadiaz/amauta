/**
 * Controlador de categorías
 *
 * Endpoints públicos de consulta y endpoints admin de gestión (CRUD)
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CategoriasService } from './categorias.service';
import type { CreateCategoriaDto } from './dto/create-categoria.dto';
import type { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Public, Roles } from '../common/decorators';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  /**
   * GET /api/v1/categorias
   *
   * Lista todas las categorías
   * Endpoint público
   */
  @Public()
  @Get()
  async listar() {
    const categorias = await this.categoriasService.listar();
    return { categorias };
  }

  /**
   * GET /api/v1/categorias/slug/:slug
   *
   * Obtiene una categoría por slug
   * Endpoint público
   */
  @Public()
  @Get('slug/:slug')
  async obtenerPorSlug(@Param('slug') slug: string) {
    const categoria = await this.categoriasService.obtenerPorSlug(slug);

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return { categoria, message: 'Categoría obtenida exitosamente' };
  }

  /**
   * GET /api/v1/categorias/:id
   *
   * Obtiene una categoría por ID
   * Endpoint público
   */
  @Public()
  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    const categoria = await this.categoriasService.obtenerPorId(id);

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return { categoria };
  }

  /**
   * POST /api/v1/categorias
   *
   * Crea una nueva categoría
   * Requiere ADMIN_ESCUELA o SUPER_ADMIN
   */
  @Post()
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async crear(@Body() dto: CreateCategoriaDto) {
    const categoria = await this.categoriasService.crear(dto);
    return { categoria, message: 'Categoría creada exitosamente' };
  }

  /**
   * PATCH /api/v1/categorias/:id
   *
   * Actualiza una categoría existente
   * Requiere ADMIN_ESCUELA o SUPER_ADMIN
   */
  @Patch(':id')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async actualizar(@Param('id') id: string, @Body() dto: UpdateCategoriaDto) {
    const categoria = await this.categoriasService.actualizar(id, dto);
    return { categoria, message: 'Categoría actualizada exitosamente' };
  }

  /**
   * DELETE /api/v1/categorias/:id
   *
   * Elimina una categoría (solo si no tiene cursos asociados)
   * Requiere SUPER_ADMIN
   */
  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(@Param('id') id: string): Promise<void> {
    await this.categoriasService.eliminar(id);
  }
}
