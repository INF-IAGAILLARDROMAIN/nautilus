import { TypeCoque } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBateauDto {
  /** Surnom donné par le propriétaire (ex: "Le Petit Bleu"). Optionnel. */
  @IsOptional()
  @IsString()
  @MaxLength(60)
  nom?: string;

  /** Marque constructeur de la COQUE (Bénéteau, Quicksilver…). */
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  marque!: string;

  /** Modèle de la coque (Antares 7, Activ 605…). */
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  modele!: string;

  /** Type de coque (matériau / structure). */
  @IsOptional()
  @IsEnum(TypeCoque)
  typeCoque?: TypeCoque;

  /** Immatriculation française (Affaires Maritimes), optionnelle. */
  @IsOptional()
  @IsString()
  @MaxLength(20)
  immatriculation?: string;

  @IsOptional()
  @IsInt()
  @Min(1950)
  @Max(2100)
  annee?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  // === Motorisation ===

  /** Marque du moteur (Yamaha, Suzuki…). */
  @IsOptional()
  @IsString()
  @MaxLength(60)
  marqueMoteur?: string;

  /** Modèle du moteur (F250, DF150…). */
  @IsOptional()
  @IsString()
  @MaxLength(60)
  modeleMoteur?: string;

  /**
   * Numéro de plaque / série du moteur — identifiant terrain unique.
   * Optionnel : la plaque peut être tombée, effacée ou retirée.
   */
  @IsOptional()
  @IsString()
  @MaxLength(40)
  plaqueMoteur?: string;

  /** Puissance moteur en CV. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  puissanceCV?: number;

  /** Hélice : description libre (ex: "3 pales inox 14\""). */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  helice?: string;

  /** ID du client propriétaire du bateau. */
  @IsString()
  @IsNotEmpty()
  clientId!: string;
}
