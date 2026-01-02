/**
 * Controlador de categorías
 *
 * Endpoints para consultar categorías
 */

import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CategoriasService } from './categorias.service';
import { Public } from '../common/decorators';

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
}
