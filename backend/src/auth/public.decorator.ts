import { SetMetadata } from '@nestjs/common';

/**
 * Décorateur pour marquer une route comme PUBLIQUE (pas besoin de JWT).
 * Utile pour : healthcheck (`/api`), endpoints d'auth eux-mêmes, webhooks signés...
 *
 * Usage :
 *   @Public()
 *   @Get('healthz')
 *   healthcheck() { return { ok: true }; }
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
