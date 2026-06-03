# 5. Éléments de sécurité de l'application

> Section dédiée à la sécurité, **très valorisée par le jury**. Présenter les mesures mises en place + leur raison + leur efficacité.

## 5.1 Authentification et autorisation

**Mécanisme** : Supabase Auth + JSON Web Token (JWT).
- Connexion par email / mot de passe (avec rate limiting Supabase natif contre le brute force).
- Token JWT signé envoyé en cookie httpOnly (non lisible par JavaScript = protection XSS sur le token).
- Refresh token automatique géré par Supabase côté client.

**Côté back-end NestJS** :
- **Guard JWT** sur toutes les routes protégées : intercepte chaque requête, vérifie la signature du token, refuse si expiré ou invalide.
- Décorateur `@Public()` explicite pour les routes ouvertes (login, healthcheck) — par défaut, tout est protégé.

## 5.2 Validation des entrées

**Mécanisme** : DTOs typés + `class-validator` côté NestJS.
- Chaque endpoint déclare un DTO d'entrée avec ses contraintes (`@IsEmail`, `@IsString`, `@MinLength`, …).
- Toute requête malformée est rejetée avec un 400 **avant** d'atteindre le service métier.
- Côté front : validation Zod avec les mêmes schémas que les DTOs (défense en profondeur).

## 5.3 Protection contre les attaques courantes (OWASP top 10)

| Risque OWASP | Protection mise en place dans Nautilus |
|---|---|
| **A01 — Broken Access Control** | Guard JWT sur toutes les routes ; filtrage des données par utilisateur dans les services |
| **A02 — Cryptographic Failures** | Mots de passe gérés par Supabase (hash bcrypt) ; HTTPS partout ; secrets en variables d'environnement |
| **A03 — Injection** | Prisma utilise des requêtes paramétrées (pas de SQL brut) ; DTOs validés ; pas d'`eval` |
| **A04 — Insecure Design** | Modèle de menace fait avant codage : seul un utilisateur authentifié voit ses données |
| **A05 — Security Misconfiguration** | CORS strict (uniquement l'origine front Vercel) ; headers de sécurité (Helmet) ; pas de mode debug en prod |
| **A06 — Vulnerable Components** | Audit régulier `pnpm audit` ; mises à jour Dependabot activées sur GitHub |
| **A07 — Auth Failures** | Rate limiting sur `/auth/*` ; verrouillage temporaire après échecs répétés |
| **A08 — Data Integrity Failures** | Migrations Prisma versionnées et reproductibles ; signatures JWT vérifiées |
| **A09 — Logging Failures** | Logs structurés des requêtes IA en MongoDB ; logs d'erreurs centralisés (à brancher : Sentry / Better Stack en option) |
| **A10 — SSRF** | Pas d'appel à des URLs fournies par l'utilisateur côté serveur ; whitelist des URLs externes (LLM, etc.) |

## 5.4 Sécurité spécifique au moteur de recherche IA

> 🎯 Point d'attention particulier — l'IA introduit des risques nouveaux à anticiper.

| Risque IA | Mitigation |
|---|---|
| **Prompt injection** | L'utilisateur ne peut pas exécuter de code arbitraire ; les résultats de l'IA sont strictement filtrés à la lecture de la BDD (l'IA ne peut pas modifier les données) |
| **Fuite de données vers le LLM** | Seuls les **noms de tables/colonnes** sont envoyés au LLM (le schéma), pas les données brutes des autres utilisateurs |
| **Coût LLM abusif** | Rate limiting strict sur l'endpoint `/recherche-ia` (X requêtes / minute / utilisateur) |
| **Hallucination IA** | L'IA ne diagnostique JAMAIS — elle restitue des données existantes. Les résultats affichés sont issus directement de la BDD, pas de la sortie LLM brute |

## 5.5 Sécurité du déploiement

- **Secrets** : jamais commités, gérés par Vercel / Railway (variables d'environnement chiffrées).
- **HTTPS** : forcé sur Vercel (TLS automatique) et Railway.
- **CORS** : domaine front explicitement autorisé, pas de wildcard.
- **Headers de sécurité** : `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy` (configurés via Helmet côté NestJS et `next.config.js` côté Next).
