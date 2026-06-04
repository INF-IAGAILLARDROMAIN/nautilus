import { PartialType } from '@nestjs/mapped-types';
import { StatutDevis } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateDevisDto } from './create-devis.dto';

/**
 * DTO de mise à jour d'un Devis : tous les champs CreateDevisDto deviennent optionnels,
 * + on peut faire évoluer le statut (BROUILLON → ENVOYE → VALIDE / REFUSE).
 */
export class UpdateDevisDto extends PartialType(CreateDevisDto) {
  @IsOptional()
  @IsEnum(StatutDevis)
  statut?: StatutDevis;
}
