/**
 * Controlador de uploads
 *
 * Endpoint para subir archivos
 */

import { Controller, Post, Req, BadRequestException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { UploadsService, UploadResult } from './uploads.service';
import { Roles } from '../common/decorators';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  /**
   * POST /api/v1/uploads
   *
   * Sube un archivo (imagen para cursos)
   * Requiere autenticación y rol de educador o superior
   */
  @Post()
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async upload(@Req() request: FastifyRequest): Promise<UploadResult> {
    const data = await request.file();

    if (!data) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    return this.uploadsService.saveFile(data);
  }
}
