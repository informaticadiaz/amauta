/**
 * Controlador de uploads
 *
 * Endpoint para subir archivos
 */

import {
  Controller,
  Post,
  Delete,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { UploadsService, UploadResult } from './uploads.service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  MediaUploadsService,
  MediaUploadResult,
} from './media-uploads.service';
import { Roles } from '../common/decorators';

interface DeleteMediaDto {
  storageKey: string;
}

@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly mediaUploadsService: MediaUploadsService
  ) {}

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

  /**
   * POST /api/v1/uploads/media
   *
   * Sube un archivo de video o audio para lecciones (MinIO)
   * Requiere autenticación y rol de educador o superior
   */
  @Post('media')
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  async uploadMedia(
    @Req() request: FastifyRequest
  ): Promise<MediaUploadResult> {
    const data = await request.file();

    if (!data) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    return this.mediaUploadsService.uploadMedia(data);
  }

  /**
   * DELETE /api/v1/uploads/media
   *
   * Elimina un archivo de video o audio por su storageKey
   * Requiere autenticación y rol de educador o superior
   */
  @Delete('media')
  @Roles('EDUCADOR', 'ADMIN_ESCUELA', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMedia(@Body() body: DeleteMediaDto): Promise<void> {
    if (!body.storageKey) {
      throw new BadRequestException('storageKey es requerido');
    }

    await this.mediaUploadsService.deleteMedia(body.storageKey);
  }
}
