import { TypeOR, UrgenceOR } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateOrdreReparationDto {
  /** ID du devis VALIDÉ d'où l'OR est créé. Relation 1-1. */
  @IsString()
  @IsNotEmpty()
  devisId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(TypeOR)
  type?: TypeOR;

  @IsOptional()
  @IsEnum(UrgenceOR)
  urgence?: UrgenceOR;

  /** Nom du mécano assigné (champ libre — pas de table Mécano en MVP). */
  @IsOptional()
  @IsString()
  @MaxLength(60)
  mecano?: string;
}
