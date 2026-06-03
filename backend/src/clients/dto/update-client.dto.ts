import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-client.dto';

/**
 * DTO de mise à jour partielle d'un Client.
 * Tous les champs du CreateClientDto deviennent optionnels.
 */
export class UpdateClientDto extends PartialType(CreateClientDto) {}
