import { Module } from '@nestjs/common';
import { OrdreReparationController } from './ordre-reparation.controller';
import { OrdreReparationService } from './ordre-reparation.service';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [PdfModule], // pour la génération du PDF de facture
  controllers: [OrdreReparationController],
  providers: [OrdreReparationService],
  exports: [OrdreReparationService], // exporté pour que DevisService puisse l'utiliser
})
export class OrdreReparationModule {}
