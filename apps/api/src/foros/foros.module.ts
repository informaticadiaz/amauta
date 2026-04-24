import { Module } from '@nestjs/common';
import { ForosController } from './foros.controller';
import { ForosService } from './foros.service';

@Module({
  controllers: [ForosController],
  providers: [ForosService],
})
export class ForosModule {}
