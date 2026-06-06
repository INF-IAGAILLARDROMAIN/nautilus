import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { IS_PUBLIC_KEY } from './public.decorator';
import { SupabaseUser } from './current-user.decorator';

/**
 * Guard NestJS qui valide les JWT émis par Supabase Auth (ES256).
 *
 * Principe :
 *   1. Récupère le header `Authorization: Bearer <token>`
 *   2. Vérifie la signature via la clé publique récupérée depuis le JWKS Supabase
 *      (asymétrique ES256 — pas de secret partagé)
 *   3. Vérifie l'issuer (anti-spoofing inter-projets Supabase)
 *   4. Injecte le payload dans `request.user` pour les controllers
 *
 * Sécurité (alignée avec la stack Auth0/Okta) :
 *   - Pas de secret JWT à stocker côté serveur (la clé privée reste chez Supabase)
 *   - Rotation automatique des clés gérée par Supabase
 *   - Le JWKS est mis en cache automatiquement par `createRemoteJWKSet`
 *     (refresh régulier sans appel réseau à chaque requête)
 */
@Injectable()
export class SupabaseJwtGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseJwtGuard.name);
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;
  private readonly issuer: string;

  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
  ) {
    const jwksUrl = this.config.getOrThrow<string>('SUPABASE_JWKS_URL');
    this.issuer = this.config.getOrThrow<string>('SUPABASE_ISSUER');
    this.jwks = createRemoteJWKSet(new URL(jwksUrl));
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Bypass pour les routes marquées @Public() (ex: healthcheck)
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing Bearer token');
    }

    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
        algorithms: ['ES256'],
      });
      request.user = payload as JWTPayload & SupabaseUser;
      return true;
    } catch (err) {
      this.logger.warn(
        `JWT verification failed: ${err instanceof Error ? err.message : 'unknown'}`,
      );
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractBearerToken(request: {
    headers: Record<string, string | string[] | undefined>;
  }): string | null {
    const header = request.headers['authorization'];
    if (!header || typeof header !== 'string') return null;
    const [scheme, token] = header.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
    return token.trim();
  }
}
