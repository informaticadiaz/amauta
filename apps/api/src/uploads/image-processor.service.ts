/**
 * Servicio de procesamiento de imagenes
 *
 * Utiliza Sharp para optimizar imagenes antes de guardarlas:
 * - Redimensiona imagenes grandes (max 1920px ancho)
 * - Convierte a WebP para mejor compresion
 * - Aplica compresion quality 80
 */

import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
}

export interface ProcessOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

const DEFAULT_OPTIONS: Required<ProcessOptions> = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 80,
  format: 'webp',
};

@Injectable()
export class ImageProcessorService {
  private readonly logger = new Logger(ImageProcessorService.name);

  /**
   * Determina si un tipo MIME es una imagen procesable
   */
  isProcessableImage(mimetype: string): boolean {
    const processableTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    return processableTypes.includes(mimetype);
  }

  /**
   * Procesa una imagen: redimensiona y optimiza
   */
  async processImage(
    inputBuffer: Buffer,
    options: ProcessOptions = {}
  ): Promise<ProcessedImage> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    try {
      const metadata = await sharp(inputBuffer).metadata();
      this.logger.debug(
        `Procesando imagen: ${metadata.width}x${metadata.height} ${metadata.format}`
      );

      let pipeline = sharp(inputBuffer);

      // Redimensionar si excede dimensiones maximas
      if (
        (metadata.width && metadata.width > opts.maxWidth) ||
        (metadata.height && metadata.height > opts.maxHeight)
      ) {
        pipeline = pipeline.resize(opts.maxWidth, opts.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Convertir a formato optimizado
      let outputBuffer: Buffer;
      if (opts.format === 'webp') {
        outputBuffer = await pipeline
          .webp({ quality: opts.quality })
          .toBuffer();
      } else if (opts.format === 'jpeg') {
        outputBuffer = await pipeline
          .jpeg({ quality: opts.quality })
          .toBuffer();
      } else {
        outputBuffer = await pipeline.png({ quality: opts.quality }).toBuffer();
      }

      const outputMetadata = await sharp(outputBuffer).metadata();

      this.logger.debug(
        `Imagen procesada: ${outputMetadata.width}x${outputMetadata.height} ` +
          `(${inputBuffer.length} bytes -> ${outputBuffer.length} bytes)`
      );

      return {
        buffer: outputBuffer,
        width: outputMetadata.width || 0,
        height: outputMetadata.height || 0,
        format: opts.format,
      };
    } catch (error) {
      this.logger.error('Error procesando imagen:', error);
      throw error;
    }
  }
}
