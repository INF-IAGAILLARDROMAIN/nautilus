import { PartialType } from '@nestjs/mapped-types';
import { StatutOR } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { CreateOrdreReparationDto } from './create-ordre-reparation.dto';

export class UpdateOrdreReparationDto extends PartialType(
  CreateOrdreReparationDto,
) {
  /** Statut OR : CREE → EN_COURS → TERMINE → FACTURE. */
  @IsOptional()
  @IsEnum(StatutOR)
  statut?: StatutOR;

  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @IsOptional()
  @IsDateString()
  dateFin?: string;
}
