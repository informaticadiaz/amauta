import { Module } from '@nestjs/common';
import { CierreAcademicoController } from './cierre-academico.controller';
import { CierreAcademicoService } from './cierre-academico.service';

@Module({
  controllers: [CierreAcademicoController],
  providers: [CierreAcademicoService],
})
export class CierreAcademicoModule {}
