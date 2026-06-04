import { PartialType } from '@nestjs/mapped-types';
import { CreateBateauDto } from './create-bateau.dto';

/**
 * DTO de mise à jour partielle d'un Bateau.
 * Tous les champs du CreateBateauDto deviennent optionnels.
 */
export class UpdateBateauDto extends PartialType(CreateBateauDto) {}
