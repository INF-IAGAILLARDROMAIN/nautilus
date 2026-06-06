import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Payload du JWT Supabase après vérification.
 * Champs principaux qui nous intéressent côté Nautilus.
 */
export interface SupabaseUser {
  /** Subject (ID utilisateur Supabase, format UUID). */
  sub: string;
  /** Email de l'utilisateur. */
  email?: string;
  /** Rôle Supabase (typiquement "authenticated"). */
  role?: string;
  /** App metadata (rôles applicatifs, providers, ...). */
  app_metadata?: Record<string, unknown>;
  /** User metadata (préférences, ...). */
  user_metadata?: Record<string, unknown>;
  /** Issued at (timestamp unix). */
  iat?: number;
  /** Expiration (timestamp unix). */
  exp?: number;
}

/**
 * Décorateur qui injecte l'utilisateur authentifié dans le paramètre du controller.
 *
 * Usage :
 *   @Get()
 *   findAll(@CurrentUser() user: SupabaseUser) {
 *     console.log('Connecté en tant que', user.email);
 *   }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SupabaseUser | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as SupabaseUser | undefined;
  },
);
