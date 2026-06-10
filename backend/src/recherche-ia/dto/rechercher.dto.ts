import { IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Question posée à l'agent IA en langage naturel.
 * Borné à 500 caractères : un atelier ne tape pas une dissertation.
 */
export class RechercherDto {
  @IsString({ message: 'La question doit être une chaîne de caractères' })
  @MinLength(2, { message: 'La question est trop courte' })
  @MaxLength(500, { message: 'La question est trop longue (max 500 caractères)' })
  question!: string;
}
