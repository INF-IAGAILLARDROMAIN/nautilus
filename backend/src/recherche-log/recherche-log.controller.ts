import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { SupabaseUser } from '../auth/current-user.decorator';
import { RechercheLogService } from './recherche-log.service';

/**
 * Endpoints de lecture de l'historique IA (V1 minimal).
 * - GET /api/recherche-log : recherches récentes de l'utilisateur connecté
 * - GET /api/recherche-log/stats : stats agrégées (démo orale)
 *
 * L'écriture se fait depuis le module RechercheIA (à venir),
 * pas exposée en POST direct au client.
 */
@Controller('recherche-log')
export class RechercheLogController {
  constructor(private readonly service: RechercheLogService) {}

  @Get()
  async listMine(
    @CurrentUser() user: SupabaseUser,
    @Query('limit') limit?: string,
  ) {
    const n = limit ? parseInt(limit, 10) : 20;
    const data = await this.service.findRecentByUser(user.sub, n);
    return { data, total: data.length };
  }

  @Get('stats')
  async stats() {
    return this.service.stats();
  }
}
