import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { SupabaseJwtGuard } from './supabase-jwt.guard';

/**
 * Module Auth — installe le SupabaseJwtGuard GLOBALEMENT.
 *
 * Toutes les routes de l'application sont désormais protégées par défaut.
 * Pour exempter une route (healthcheck, etc.), utiliser le décorateur `@Public()`.
 */
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: SupabaseJwtGuard,
    },
  ],
})
export class AuthModule {}
