/**
 * Tests para UploadsController
 *
 * Verifica los endpoints de subida y eliminación de media (video/audio)
 */

jest.mock('../config/env', () => ({
  env: {
    UPLOAD_DIR: './uploads',
    MAX_FILE_SIZE: 10485760,
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png'],
    MINIO_ENDPOINT: 'http://minio:9000',
    MINIO_ACCESS_KEY: 'test-access-key',
    MINIO_SECRET_KEY: 'test-secret-key',
    MINIO_BUCKET: 'amauta-media',
    MINIO_PUBLIC_URL: 'https://media.amauta.test',
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { MediaUploadsService } from './media-uploads.service';

describe('UploadsController', () => {
  let controller: UploadsController;
  let mediaUploadsService: { uploadMedia: jest.Mock; deleteMedia: jest.Mock };

  beforeEach(async () => {
    mediaUploadsService = {
      uploadMedia: jest.fn(),
      deleteMedia: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
      providers: [
        { provide: UploadsService, useValue: { saveFile: jest.fn() } },
        { provide: MediaUploadsService, useValue: mediaUploadsService },
      ],
    }).compile();

    controller = module.get<UploadsController>(UploadsController);
  });

  describe('uploadMedia', () => {
    it('debería subir el archivo recibido y retornar el resultado', async () => {
      const mockFile = { mimetype: 'video/mp4' };
      const request = {
        file: jest.fn().mockResolvedValue(mockFile),
      } as unknown as FastifyRequest;

      mediaUploadsService.uploadMedia.mockResolvedValue({
        url: 'https://media.amauta.test/amauta-media/lecciones/abc.mp4',
        storageKey: 'lecciones/abc.mp4',
        mimeType: 'video/mp4',
        size: 1024,
      });

      const result = await controller.uploadMedia(request);

      expect(mediaUploadsService.uploadMedia).toHaveBeenCalledWith(mockFile);
      expect(result.storageKey).toBe('lecciones/abc.mp4');
    });

    it('debería lanzar BadRequestException si no se recibe archivo', async () => {
      const request = {
        file: jest.fn().mockResolvedValue(undefined),
      } as unknown as FastifyRequest;

      await expect(controller.uploadMedia(request)).rejects.toThrow(
        BadRequestException
      );
      expect(mediaUploadsService.uploadMedia).not.toHaveBeenCalled();
    });
  });

  describe('deleteMedia', () => {
    it('debería eliminar el archivo por storageKey', async () => {
      mediaUploadsService.deleteMedia.mockResolvedValue(undefined);

      await controller.deleteMedia({ storageKey: 'lecciones/abc.mp4' });

      expect(mediaUploadsService.deleteMedia).toHaveBeenCalledWith(
        'lecciones/abc.mp4'
      );
    });

    it('debería lanzar BadRequestException si no se envía storageKey', async () => {
      await expect(controller.deleteMedia({ storageKey: '' })).rejects.toThrow(
        BadRequestException
      );
      expect(mediaUploadsService.deleteMedia).not.toHaveBeenCalled();
    });
  });
});
