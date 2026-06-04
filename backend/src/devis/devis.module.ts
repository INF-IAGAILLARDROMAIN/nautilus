import { Module } from '@nestjs/common';
import { DevisController } from './devis.controller';
import { DevisService } from './devis.service';
import { OrdreReparationModule } from '../ordre-reparation/ordre-reparation.module';

@Module({
  imports: [OrdreReparationModule], // pour la création auto d'OR à la validation d'un devis
  controllers: [DevisController],
  providers: [DevisService],
  exports: [DevisService],
})
export class DevisModule {}
