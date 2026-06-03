import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Sécurité — headers HTTP
  app.use(helmet());

  // CORS — strict, origine front uniquement
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  // Préfixe global d'API
  app.setGlobalPrefix('api');

  // Validation globale des DTOs (rejet immédiat si payload invalide)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,         // supprime les champs non déclarés dans le DTO
      forbidNonWhitelisted: true, // erreur 400 si champ non déclaré envoyé
      transform: true,         // transforme les payloads en instances de classes DTO
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = parseInt(process.env.PORT ?? '4000', 10);
  await app.listen(port);
  Logger.log(`Nautilus back démarré sur http://localhost:${port}/api`, 'Bootstrap');
}

void bootstrap();
