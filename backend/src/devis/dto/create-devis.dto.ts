import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
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
  /** ID du bateau pour lequel on chiffre le devis. */
  @IsString()
  @IsNotEmpty()
  bateauId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  /** Taux de TVA appliqué (défaut 20%). */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  tauxTVA?: number;

  /** Liste des lignes du devis (au moins une ligne requise). */
  @IsArray()
  @ArrayMinSize(1, { message: 'Un devis doit contenir au moins 1 ligne.' })
  @ValidateNested({ each: true })
  @Type(() => CreateLigneDevisDto)
  lignes!: CreateLigneDevisDto[];
}
