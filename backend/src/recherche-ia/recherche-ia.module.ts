import { Module } from '@nestjs/common';
import { RechercheIaController } from './recherche-ia.controller';
import { RechercheIaService } from './recherche-ia.service';
import { RechercheLogModule } from '../recherche-log/recherche-log.module';

@Module({
  imports: [RechercheLogModule],
  controllers: [RechercheIaController],
  providers: [RechercheIaService],
  exports: [RechercheIaService],
})
export class RechercheIaModule {}
