import { Module } from '@nestjs/common';
import { OrdreReparationController } from './ordre-reparation.controller';
import { OrdreReparationService } from './ordre-reparation.service';

@Module({
  controllers: [OrdreReparationController],
  providers: [OrdreReparationService],
  exports: [OrdreReparationService], // exporté pour que DevisService puisse l'utiliser
})
export class OrdreReparationModule {}
