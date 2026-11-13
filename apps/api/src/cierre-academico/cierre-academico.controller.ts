import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/guards';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- NestJS requires runtime import for DI
import { CierreAcademicoService } from './cierre-academico.service';
import type { PreviewCierreResponse } from './cierre-academico.service';
import type { QueryPreviewCierreDto } from './dto/query-preview-cierre.dto';
import type { ConfirmarCierreDto } from './dto/confirmar-cierre.dto';
import type { ConfirmarCierreResponse } from './cierre-academico.service';

@Controller()
export class CierreAcademicoController {
  constructor(
    private readonly cierreAcademicoService: CierreAcademicoService
  ) {}

  @Get(
    'instituciones/:institucionId/periodos/:periodoId/cierre-academico/preview'
  )
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  preview(
    @Param('institucionId') institucionId: string,
    @Param('periodoId') periodoId: string,
    @CurrentUser() user: RequestUser
  ): Promise<PreviewCierreResponse> {
    const params: QueryPreviewCierreDto = { institucionId, periodoId };
    return this.cierreAcademicoService.preview(user.id, params);
  }

  @Get('instituciones/:institucionId/periodos/:periodoId/cierre-academico/acta')
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  async acta(
    @Param('institucionId') institucionId: string,
    @Param('periodoId') periodoId: string,
    @CurrentUser() user: RequestUser,
    @Res() response: FastifyReply
  ): Promise<void> {
    const acta = await this.cierreAcademicoService.descargarActa(user.id, {
      institucionId,
      periodoId,
    });
    void response
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `attachment; filename="${acta.filename}"`)
      .send(acta.content);
  }

  @Post(
    'instituciones/:institucionId/periodos/:periodoId/cierre-academico/confirmar'
  )
  @Roles('ADMIN_ESCUELA', 'SUPER_ADMIN')
  confirmar(
    @Param('institucionId') institucionId: string,
    @Param('periodoId') periodoId: string,
    @Body() body: ConfirmarCierreDto,
    @CurrentUser() user: RequestUser
  ): Promise<ConfirmarCierreResponse> {
    const params: QueryPreviewCierreDto = { institucionId, periodoId };
    return this.cierreAcademicoService.confirmar(user.id, params, body);
  }
}
