import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

/** Une ligne du devis : libellé + quantité + prix unitaire HT. */
export class CreateLigneDevisDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  quantite!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  prixUnitaireHT!: number;
}

export class CreateDevisDto {
  /** Client destinataire du devis — obligatoire. */
  @IsString()
  @IsNotEmpty()
  clientId!: string;

  /**
   * Bateau concerné par le devis — facultatif.
   * Null = devis pré-vente / accessoires / sans bateau encore enregistré.
   */
  @IsOptional()
  @IsString()
  bateauId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  /** Taux de TVA appliqué (défaut 20%). */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  tauxTVA?: number;

  /** Date de validité du devis (mention légale FR — au-delà devient caduc). */
  @IsOptional()
  @IsDateString()
  dateValidite?: string;

  /** Modalités de paiement (texte libre). */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  modalitesPaiement?: string;

  /** Liste des lignes du devis (au moins une ligne requise). */
  @IsArray()
  @ArrayMinSize(1, { message: 'Un devis doit contenir au moins 1 ligne.' })
  @ValidateNested({ each: true })
  @Type(() => CreateLigneDevisDto)
  lignes!: CreateLigneDevisDto[];
}
