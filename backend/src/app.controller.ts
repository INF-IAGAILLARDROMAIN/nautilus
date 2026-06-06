import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Route racine publique (healthcheck) — pas de JWT requis.
   * Permet à un load balancer ou à un monitoring externe de vérifier que
   * le backend tourne sans avoir besoin d'être authentifié.
   */
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
