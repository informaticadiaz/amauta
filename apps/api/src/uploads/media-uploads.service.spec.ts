/**
 * Tests para MediaUploadsService
 *
 * Verifica la subida y eliminación de archivos de video/audio en MinIO (S3-compatible)
 */

const sendMock = jest.fn();

jest.mock('../config/env', () => ({
  env: {
    MINIO_ENDPOINT: 'http://minio:9000',
    MINIO_ACCESS_KEY: 'test-access-key',
    MINIO_SECRET_KEY: 'test-secret-key',
    MINIO_BUCKET: 'amauta-media',
    MINIO_PUBLIC_URL: 'https://media.amauta.test',
  },
}));

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: sendMock,
  })),
  PutObjectCommand: jest.fn().mockImplementation((input) => ({
    __type: 'PutObjectCommand',
    input,
  })),
  DeleteObjectCommand: jest.fn().mockImplementation((input) => ({
    __type: 'DeleteObjectCommand',
    input,
  })),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import type { MultipartFile } from '@fastify/multipart';
import { MediaUploadsService } from './media-uploads.service';

function createMockFile(
  overrides: Partial<{
    mimetype: string;
    filename: string;
    size: number;
  }> = {}
): MultipartFile {
  const size = overrides.size ?? 1024;
  const buffer = Buffer.alloc(size);

  return {
    mimetype: overrides.mimetype ?? 'video/mp4',
    filename: overrides.filename ?? 'leccion.mp4',
    toBuffer: jest.fn().mockResolvedValue(buffer),
  } as unknown as MultipartFile;
}

describe('MediaUploadsService', () => {
  let service: MediaUploadsService;

  beforeEach(async () => {
    sendMock.mockReset();
    sendMock.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [MediaUploadsService],
    }).compile();

    service = module.get<MediaUploadsService>(MediaUploadsService);
  });

  describe('uploadMedia', () => {
    it('debería subir un video válido y retornar la URL pública', async () => {
      const file = createMockFile({ mimetype: 'video/mp4' });

      const result = await service.uploadMedia(file);

      expect(result.mimeType).toBe('video/mp4');
      expect(result.size).toBe(1024);
      expect(result.storageKey).toMatch(/^lecciones\/.+\.mp4$/);
      expect(result.url).toContain(result.storageKey);
      expect(sendMock).toHaveBeenCalledTimes(1);
    });

    it('debería subir un audio válido', async () => {
      const file = createMockFile({
        mimetype: 'audio/mpeg',
        filename: 'narracion.mp3',
      });

      const result = await service.uploadMedia(file);

      expect(result.mimeType).toBe('audio/mpeg');
      expect(result.storageKey).toMatch(/\.mp3$/);
    });

    it('debería lanzar BadRequestException con un tipo MIME no permitido', async () => {
      const file = createMockFile({ mimetype: 'application/pdf' });

      await expect(service.uploadMedia(file)).rejects.toThrow(
        BadRequestException
      );
      expect(sendMock).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si el video excede el tamaño máximo', async () => {
      const file = createMockFile({
        mimetype: 'video/mp4',
        size: 500 * 1024 * 1024 + 1,
      });

      await expect(service.uploadMedia(file)).rejects.toThrow(
        BadRequestException
      );
      expect(sendMock).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si el audio excede el tamaño máximo', async () => {
      const file = createMockFile({
        mimetype: 'audio/mpeg',
        size: 100 * 1024 * 1024 + 1,
      });

      await expect(service.uploadMedia(file)).rejects.toThrow(
        BadRequestException
      );
      expect(sendMock).not.toHaveBeenCalled();
    });
  });

  describe('deleteMedia', () => {
    it('debería eliminar un archivo por su storageKey', async () => {
      await service.deleteMedia('lecciones/abc123.mp4');

      expect(sendMock).toHaveBeenCalledTimes(1);
      const command = sendMock.mock.calls[0][0];
      expect(command.__type).toBe('DeleteObjectCommand');
      expect(command.input.Key).toBe('lecciones/abc123.mp4');
    });
  });
});
