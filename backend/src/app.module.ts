import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { BateauxModule } from './bateaux/bateaux.module';
import { DevisModule } from './devis/devis.module';
import { OrdreReparationModule } from './ordre-reparation/ordre-reparation.module';
import { RechercheLogModule } from './recherche-log/recherche-log.module';
// Modules à brancher au fur et à mesure :
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

    // Auth — installe SupabaseJwtGuard globalement (toutes les routes
    // sont protégées par défaut, exempter avec @Public())
    AuthModule,

    // BDD SQL (PostgreSQL Neon) — entités métier strictes
    PrismaModule,

    // BDD NoSQL (MongoDB Atlas) — historique recherches IA (data semi-structurée).
    // Démontre la maîtrise de "SQL + NoSQL" (exigence référentiel TP DWWM).
    MongooseModule.forRoot(process.env.MONGODB_URI ?? '', {
      connectionFactory: (connection) => {
        const logger = new Logger('MongoDB');
        connection.on('connected', () => logger.log('Connecté à MongoDB Atlas'));
        connection.on('error', (e: Error) =>
          logger.error(`Erreur MongoDB : ${e.message}`),
        );
        return connection;
      },
    }),

    // Modules métier
    ClientsModule,
    BateauxModule,
    OrdreReparationModule, // doit être déclaré AVANT DevisModule (DevisModule en dépend)
    DevisModule,
    RechercheLogModule,
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
