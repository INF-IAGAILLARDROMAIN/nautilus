import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { SupabaseUser } from '../auth/current-user.decorator';
import { RechercheIaService, RechercheResultat } from './recherche-ia.service';
import { RechercherDto } from './dto/rechercher.dto';

@Controller('recherche')
export class RechercheIaController {
  constructor(private readonly service: RechercheIaService) {}

  /**
   * Pose une question en langage naturel à l'assistant Nautilus.
   * Le LLM classifie l'intent, le back exécute la requête typée
   * via Prisma, et la recherche est loguée dans MongoDB.
   */
  @Post()
  async rechercher(
    @CurrentUser() user: SupabaseUser,
    @Body() dto: RechercherDto,
  ): Promise<RechercheResultat> {
    return this.service.rechercher(dto.question, {
      sub: user.sub,
      email: user.email,
    });
  }
}
