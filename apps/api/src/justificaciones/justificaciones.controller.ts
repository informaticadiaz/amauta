import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  StreamableFile,
  Body,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/guards';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import {
  JustificacionesService,
  type ResolucionJustificacionDto,
} from './justificaciones.service';

@Controller('justificaciones')
export class JustificacionesController {
  constructor(private readonly service: JustificacionesService) {}

  @Post()
  @Roles('ESTUDIANTE', 'TUTOR')
  async crear(
    @Req() request: FastifyRequest,
    @CurrentUser() user: RequestUser
  ) {
    const parts = request.parts();
    let file;
    let asistenciaId: string | undefined;
    let motivo: string | undefined;
    let fileCount = 0;

    for await (const part of parts) {
      if (part.type === 'file') {
        fileCount += 1;
        if (fileCount > 1) {
          throw new BadRequestException(
            'Solo se permite un archivo adjunto por solicitud'
          );
        }
        file = part;
      } else if (part.fieldname === 'asistenciaId') {
        asistenciaId = String(part.value);
      } else if (part.fieldname === 'motivo') {
        motivo = String(part.value);
      }
    }

    if (!asistenciaId) {
      throw new BadRequestException('asistenciaId es obligatorio');
    }
    if (!file) {
      throw new BadRequestException('Se requiere un archivo adjunto');
    }

    const justificacion = await this.service.crear(
      asistenciaId,
      motivo ?? '',
      file,
      { id: user.id, rol: user.rol }
    );
    return {
      justificacion,
      message: 'Solicitud de justificación creada exitosamente',
    };
  }

  @Get('pendientes')
  @Roles('EDUCADOR', 'ADMIN_ESCUELA')
  listarPendientes(@CurrentUser() user: RequestUser) {
    return this.service.listarPendientes({ id: user.id, rol: user.rol });
  }

  @Patch(':id/resolver')
  @Roles('EDUCADOR', 'ADMIN_ESCUELA')
  async resolver(
    @Param('id') id: string,
    @Body() dto: ResolucionJustificacionDto,
    @CurrentUser() user: RequestUser
  ) {
    const justificacion = await this.service.resolver(id, dto, {
      id: user.id,
      rol: user.rol,
    });
    return { justificacion, message: 'Justificación resuelta exitosamente' };
  }

  @Get(':id/archivo')
  async descargar(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser
  ): Promise<StreamableFile> {
    const file = await this.service.obtenerArchivo(id, {
      id: user.id,
      rol: user.rol,
    });
    const filename = file.filename.replace(/["\\\r\n]/g, '_');
    return new StreamableFile(file.buffer, {
      type: file.mimeType,
      disposition: `attachment; filename="${filename}"`,
    });
  }
}
