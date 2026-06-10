import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RechercheLogController } from './recherche-log.controller';
import { RechercheLogService } from './recherche-log.service';
import { RechercheLog, RechercheLogSchema } from './recherche-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RechercheLog.name, schema: RechercheLogSchema },
    ]),
  ],
  controllers: [RechercheLogController],
  providers: [RechercheLogService],
  // Exporté pour que le futur module RechercheIA puisse logger les recherches
  exports: [RechercheLogService],
})
export class RechercheLogModule {}
