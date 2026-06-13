/**
 * Modulo de uploads
 *
 * Maneja la subida y procesamiento de archivos
 */

import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { ImageProcessorService } from './image-processor.service';
import { MediaUploadsService } from './media-uploads.service';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService, ImageProcessorService, MediaUploadsService],
  exports: [UploadsService, ImageProcessorService, MediaUploadsService],
})
export class UploadsModule {}
