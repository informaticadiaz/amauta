/**
 * Unit Tests - ImageProcessorService
 *
 * Criterios de aceptacion testeados:
 * - [x] Detecta tipos de imagen procesables
 * - [x] Redimensiona imagenes grandes
 * - [x] Mantiene aspect ratio
 * - [x] Convierte a WebP
 * - [x] No agranda imagenes pequenias
 */

import { ImageProcessorService } from './image-processor.service';
import sharp from 'sharp';

describe('ImageProcessorService', () => {
  let service: ImageProcessorService;

  beforeEach(() => {
    service = new ImageProcessorService();
  });

  describe('isProcessableImage', () => {
    it('deberia retornar true para image/jpeg', () => {
      expect(service.isProcessableImage('image/jpeg')).toBe(true);
    });

    it('deberia retornar true para image/png', () => {
      expect(service.isProcessableImage('image/png')).toBe(true);
    });

    it('deberia retornar true para image/webp', () => {
      expect(service.isProcessableImage('image/webp')).toBe(true);
    });

    it('deberia retornar true para image/gif', () => {
      expect(service.isProcessableImage('image/gif')).toBe(true);
    });

    it('deberia retornar false para application/pdf', () => {
      expect(service.isProcessableImage('application/pdf')).toBe(false);
    });

    it('deberia retornar false para text/plain', () => {
      expect(service.isProcessableImage('text/plain')).toBe(false);
    });
  });

  describe('processImage', () => {
    const createTestImage = async (
      width: number,
      height: number
    ): Promise<Buffer> => {
      return sharp({
        create: {
          width,
          height,
          channels: 3,
          background: { r: 255, g: 0, b: 0 },
        },
      })
        .jpeg()
        .toBuffer();
    };

    it('deberia redimensionar imagen grande a max 1920px de ancho', async () => {
      const largeImage = await createTestImage(3000, 2000);
      const result = await service.processImage(largeImage);

      expect(result.width).toBeLessThanOrEqual(1920);
      expect(result.format).toBe('webp');
    });

    it('deberia mantener aspect ratio al redimensionar', async () => {
      const largeImage = await createTestImage(4000, 2000);
      const result = await service.processImage(largeImage);

      // Aspect ratio original: 2:1
      const aspectRatio = result.width / result.height;
      expect(aspectRatio).toBeCloseTo(2, 1);
    });

    it('no deberia agrandar imagenes pequenias', async () => {
      const smallImage = await createTestImage(800, 600);
      const result = await service.processImage(smallImage);

      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
    });

    it('deberia convertir a webp por defecto', async () => {
      const image = await createTestImage(100, 100);
      const result = await service.processImage(image);

      expect(result.format).toBe('webp');
    });

    it('deberia respetar dimensiones custom', async () => {
      const image = await createTestImage(2000, 1500);
      const result = await service.processImage(image, {
        maxWidth: 1280,
        maxHeight: 720,
      });

      expect(result.width).toBeLessThanOrEqual(1280);
      expect(result.height).toBeLessThanOrEqual(720);
    });

    it('deberia comprimir la imagen (output menor que input)', async () => {
      const largeImage = await createTestImage(2000, 1500);
      const result = await service.processImage(largeImage);

      // El buffer procesado deberia ser mas pequenio que el original
      // (debido a webp + compresion)
      expect(result.buffer.length).toBeLessThan(largeImage.length);
    });

    it('deberia retornar metadata correcta', async () => {
      const image = await createTestImage(500, 400);
      const result = await service.processImage(image);

      expect(result).toHaveProperty('buffer');
      expect(result).toHaveProperty('width');
      expect(result).toHaveProperty('height');
      expect(result).toHaveProperty('format');
      expect(result.width).toBe(500);
      expect(result.height).toBe(400);
    });
  });
});
