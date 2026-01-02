/**
 * Servicio de uploads
 *
 * Maneja la subida y validación de archivos
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import type { MultipartFile } from '@fastify/multipart';
import { v4 as uuidv4 } from 'uuid';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { pipeline } from 'stream/promises';
import { env } from '../config/env';

export interface UploadResult {
  url: string;
  filename: string;
}

@Injectable()
export class UploadsService {
  private readonly uploadDir: string;
  private readonly maxFileSize: number;
  private readonly allowedTypes: string[];

  constructor() {
    this.uploadDir = env.UPLOAD_DIR;
    this.maxFileSize = env.MAX_FILE_SIZE;
    this.allowedTypes = env.ALLOWED_FILE_TYPES;
  }

  /**
   * Guarda un archivo subido
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

    // Generar nombre único
    const ext = this.getExtension(file.filename);
    const filename = `${uuidv4()}.${ext}`;
    const folderPath = join(this.uploadDir, subfolder);
    const filepath = join(folderPath, filename);

    // Asegurar que el directorio existe
    await mkdir(folderPath, { recursive: true });

    // Guardar archivo usando streams
    await pipeline(file.file, createWriteStream(filepath));

    // Verificar tamaño después de guardar
    if (file.file.bytesRead > this.maxFileSize) {
      // Si excede el tamaño, el archivo ya fue rechazado por el límite de multipart
      throw new BadRequestException(
        `El archivo excede el tamaño máximo permitido (${this.maxFileSize / 1024 / 1024}MB)`
      );
    }

    return {
      url: `/uploads/${subfolder}/${filename}`,
      filename,
    };
  }

  /**
   * Obtiene la extensión del archivo
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
