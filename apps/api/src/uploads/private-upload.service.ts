import { BadRequestException, Injectable } from '@nestjs/common';
import type { MultipartFile } from '@fastify/multipart';
import { randomUUID } from 'crypto';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { extname, join, relative, resolve, sep } from 'path';
import { env } from '../config/env';

export interface PrivateUploadResult {
  storageKey: string;
  originalName: string;
  mimeType: string;
  size: number;
}

@Injectable()
export class PrivateUploadService {
  private readonly uploadDir = resolve(env.PRIVATE_UPLOAD_DIR);
  private readonly maxFileSize = 5 * 1024 * 1024;
  private readonly allowedTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ]);

  async save(
    file: MultipartFile,
    subfolder = 'justificaciones'
  ): Promise<PrivateUploadResult> {
    if (!this.allowedTypes.has(file.mimetype)) {
      throw new BadRequestException(
        'El archivo debe ser una imagen o un documento PDF'
      );
    }

    const buffer = await file.toBuffer();
    if (buffer.length > this.maxFileSize) {
      throw new BadRequestException(
        'El archivo excede el tamaño máximo permitido de 5 MB'
      );
    }
    if (!this.matchesSignature(file.mimetype, buffer)) {
      throw new BadRequestException(
        'El contenido del archivo no coincide con su tipo declarado'
      );
    }

    const extension = this.extensionFor(file.mimetype, file.filename);
    const storageKey = `${subfolder}/${randomUUID()}${extension}`;
    const filepath = this.safePath(storageKey);

    await mkdir(join(this.uploadDir, subfolder), { recursive: true });
    await writeFile(filepath, buffer, { flag: 'wx' });

    return {
      storageKey,
      originalName: file.filename,
      mimeType: file.mimetype,
      size: buffer.length,
    };
  }

  async read(storageKey: string): Promise<Buffer> {
    return readFile(this.safePath(storageKey));
  }

  private safePath(storageKey: string): string {
    const filepath = resolve(this.uploadDir, storageKey);
    const relativePath = relative(this.uploadDir, filepath);
    if (relativePath.startsWith('..') || relativePath.includes(`..${sep}`)) {
      throw new BadRequestException('Referencia de archivo inválida');
    }
    return filepath;
  }

  private matchesSignature(mimeType: string, buffer: Buffer): boolean {
    if (mimeType === 'application/pdf') {
      return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
    }
    if (mimeType === 'image/jpeg') {
      return buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
    }
    if (mimeType === 'image/png') {
      return buffer
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    }
    if (mimeType === 'image/gif') {
      const header = buffer.subarray(0, 6).toString('ascii');
      return header === 'GIF87a' || header === 'GIF89a';
    }
    if (mimeType === 'image/webp') {
      return (
        buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buffer.subarray(8, 12).toString('ascii') === 'WEBP'
      );
    }
    return false;
  }

  private extensionFor(mimeType: string, originalName: string): string {
    if (mimeType === 'application/pdf') return '.pdf';
    const extension = extname(originalName).toLowerCase();
    return extension || '.bin';
  }
}
