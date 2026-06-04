import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBateauDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  marque!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  modele!: string;

  /** Numéro de plaque du moteur hors-bord — identifiant terrain unique. */
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  plaqueMoteur!: string;

  @IsOptional()
  @IsInt()
  @Min(1950)
  @Max(2100)
  annee?: number;

  /** ID du client propriétaire du bateau. */
  @IsString()
  @IsNotEmpty()
  clientId!: string;
}
