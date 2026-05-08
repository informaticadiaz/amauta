import { Controller, Get, Inject, Query } from '@nestjs/common';
import { CurrentUser, Roles } from '../common/decorators';
import type { RequestUser } from '../common/guards';
import {
  BoletinService,
  type BoletinResponse,
  type MisGruposResponse,
} from './boletin.service';
import type { QueryBoletinDto } from './dto/query-boletin.dto';

@Controller()
export class BoletinController {
  constructor(
    @Inject(BoletinService)
    private readonly boletinService: BoletinService
  ) {}

  @Get('me/boletin')
  @Roles('ESTUDIANTE')
  async getBoletin(
    @Query() query: QueryBoletinDto,
    @CurrentUser() user: RequestUser
  ): Promise<BoletinResponse> {
    const { periodoId, grupoId } =
      this.boletinService.validateQueryParams(query);
    return this.boletinService.getBoletinEstudiante(
      user.id,
      periodoId,
      grupoId
    );
  }

  @Get('me/grupos')
  @Roles('ESTUDIANTE')
  async getMisGrupos(
    @CurrentUser() user: RequestUser
  ): Promise<MisGruposResponse> {
    return this.boletinService.getMisGrupos(user.id);
  }
}
