import { Module } from '@nestjs/common';
import { BateauxController } from './bateaux.controller';
import { BateauxService } from './bateaux.service';

@Module({
  controllers: [BateauxController],
  providers: [BateauxService],
  exports: [BateauxService],
})
export class BateauxModule {}
