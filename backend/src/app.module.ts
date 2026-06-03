import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ClientsModule } from './clients/clients.module';
// Modules à brancher au fur et à mesure :
// import { AuthModule } from './auth/auth.module';
// import { BateauxModule } from './bateaux/bateaux.module';
// import { DevisModule } from './devis/devis.module';
// import { OrModule } from './or/or.module';
// import { RechercheIaModule } from './recherche-ia/recherche-ia.module';
// import { PdfModule } from './pdf/pdf.module';

@Module({
  imports: [
    // Charge les variables d'environnement (.env)
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate limiting global (anti brute force / anti abus IA)
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL ?? '60000', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
      },
    ]),

    // Modules métier
    PrismaModule,
    ClientsModule,
    // AuthModule,
    // BateauxModule,
    // DevisModule,
    // OrModule,
    // RechercheIaModule,
    // PdfModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
