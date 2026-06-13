/**
 * Servicio de uploads de media (video/audio)
 *
 * Sube y elimina archivos de video/audio en MinIO (S3-compatible),
 * usado por lecciones de tipo VIDEO (incluye audio, diferenciado por mimeType)
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import type { MultipartFile } from '@fastify/multipart';
import { randomUUID } from 'crypto';
import { env } from '../config/env';

export interface MediaUploadResult {
  url: string;
  storageKey: string;
  mimeType: string;
  size: number;
}

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/ogg', 'audio/wav'];

const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100MB

@Injectable()
export class MediaUploadsService {
  private readonly s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      endpoint: env.MINIO_ENDPOINT,
      region: 'us-east-1',
      forcePathStyle: true,
      credentials: {
        accessKeyId: env.MINIO_ACCESS_KEY,
        secretAccessKey: env.MINIO_SECRET_KEY,
      },
    });
  }

  /**
   * Sube un archivo de video o audio a MinIO
   */
  async uploadMedia(file: MultipartFile): Promise<MediaUploadResult> {
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimetype);
    const isAudio = ALLOWED_AUDIO_TYPES.includes(file.mimetype);

    if (!isVideo && !isAudio) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Permitidos: ${[
          ...ALLOWED_VIDEO_TYPES,
          ...ALLOWED_AUDIO_TYPES,
        ].join(', ')}`
      );
    }

    const buffer = await file.toBuffer();
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_AUDIO_SIZE;

    if (buffer.length > maxSize) {
      throw new BadRequestException(
        `El archivo excede el tamaño máximo permitido (${maxSize / 1024 / 1024}MB)`
      );
    }

    const ext = this.getExtension(file.filename);
    const storageKey = `lecciones/${randomUUID()}.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: env.MINIO_BUCKET,
        Key: storageKey,
        Body: buffer,
        ContentType: file.mimetype,
      })
    );

    return {
      url: `${env.MINIO_PUBLIC_URL}/${env.MINIO_BUCKET}/${storageKey}`,
      storageKey,
      mimeType: file.mimetype,
      size: buffer.length,
    };
  }

  /**
   * Elimina un archivo de media por su storageKey
   */
  async deleteMedia(storageKey: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: env.MINIO_BUCKET,
        Key: storageKey,
      })
    );
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
