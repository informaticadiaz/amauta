/**
 * Módulo de Prisma
 *
 * Exporta PrismaService para usar en otros módulos
 */

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
