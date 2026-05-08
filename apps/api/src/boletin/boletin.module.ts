import { Module } from '@nestjs/common';
import { BoletinController } from './boletin.controller';
import { BoletinService } from './boletin.service';

@Module({
  controllers: [BoletinController],
  providers: [BoletinService],
})
export class BoletinModule {}
