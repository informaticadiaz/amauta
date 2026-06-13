/**
 * Servicio de uploads
 *
 * Maneja la subida y validacion de archivos
 * Las imagenes son procesadas automaticamente para optimizacion
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import type { MultipartFile } from '@fastify/multipart';
import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { env } from '../config/env';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ImageProcessorService } from './image-processor.service';

export interface UploadResult {
  url: string;
  filename: string;
  width?: number;
  height?: number;
}

@Injectable()
export class UploadsService {
  private readonly uploadDir: string;
  private readonly maxFileSize: number;
  private readonly allowedTypes: string[];

  constructor(private readonly imageProcessor: ImageProcessorService) {
    this.uploadDir = env.UPLOAD_DIR;
    this.maxFileSize = env.MAX_FILE_SIZE;
    this.allowedTypes = env.ALLOWED_FILE_TYPES;
  }

  /**
   * Guarda un archivo subido
   * Las imagenes son procesadas automaticamente (redimensionadas y optimizadas)
   */
  async saveFile(
    file: MultipartFile,
    subfolder = 'cursos'
  ): Promise<UploadResult> {
    // Validar tipo MIME
    if (!this.allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Permitidos: ${this.allowedTypes.join(', ')}`
      );
    }

    // Leer archivo completo a buffer
    const buffer = await file.toBuffer();

    // Verificar tamanio
    if (buffer.length > this.maxFileSize) {
      throw new BadRequestException(
        `El archivo excede el tamanio maximo permitido (${this.maxFileSize / 1024 / 1024}MB)`
      );
    }

    // Asegurar que el directorio existe
    const folderPath = join(this.uploadDir, subfolder);
    await mkdir(folderPath, { recursive: true });

    // Procesar si es imagen
    if (this.imageProcessor.isProcessableImage(file.mimetype)) {
      return this.saveProcessedImage(buffer, folderPath, subfolder);
    }

    // Para otros archivos (PDF), guardar sin procesar
    return this.saveRawFile(buffer, file.filename, folderPath, subfolder);
  }

  /**
   * Procesa y guarda una imagen optimizada
   */
  private async saveProcessedImage(
    buffer: Buffer,
    folderPath: string,
    subfolder: string
  ): Promise<UploadResult> {
    const processed = await this.imageProcessor.processImage(buffer);

    const filename = `${randomUUID()}.webp`;
    const filepath = join(folderPath, filename);

    await writeFile(filepath, processed.buffer);

    return {
      url: `/uploads/${subfolder}/${filename}`,
      filename,
      width: processed.width,
      height: processed.height,
    };
  }

  /**
   * Guarda un archivo sin procesar (ej: PDF)
   */
  private async saveRawFile(
    buffer: Buffer,
    originalFilename: string,
    folderPath: string,
    subfolder: string
  ): Promise<UploadResult> {
    const ext = this.getExtension(originalFilename);
    const filename = `${randomUUID()}.${ext}`;
    const filepath = join(folderPath, filename);

    await writeFile(filepath, buffer);

    return {
      url: `/uploads/${subfolder}/${filename}`,
      filename,
    };
  }

  /**
   * Obtiene la extension del archivo
   */
  private getExtension(filename: string): string {
    const parts = filename.split('.');
    if (parts.length < 2) {
      return 'bin';
    }
    const ext = parts[parts.length - 1];
    return ext ? ext.toLowerCase() : 'bin';
  }
}
