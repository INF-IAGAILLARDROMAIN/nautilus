# 5. Éléments de sécurité de l'application

> Section dédiée à la sécurité, **très valorisée par le jury**. Présenter les mesures mises en place + leur raison + leur efficacité.

> 🎯 La sécurité de Nautilus a été pensée **« by design »** dès la conception : auth obligatoire, validation systématique, LLM cloisonné, traçabilité MongoDB, infrastructure 100 % UE. Le code en production reflète chacune de ces décisions.

## 5.1 Authentification et autorisation

### 5.1.1 Mécanisme — Supabase Auth + JWT ES256 asymétrique

**Côté front (Next.js)** :
- Connexion par email / mot de passe (Supabase gère le hash des mots de passe en bcrypt + rate limiting natif contre le brute force).
- Stockage du token : **cookies httpOnly** posés par `@supabase/ssr` — aucun token sensible en `localStorage` (anti-XSS).
- Refresh automatique du token géré par Supabase côté client.
- **Middleware Next.js** (`src/middleware.ts`) qui protège les routes `/dashboard/*` au niveau du routing.
- **Vérification côté Server Component** dans `dashboard/layout.tsx` : redirection vers `/auth/login` si `user` est null **avant** que le HTML protégé ne soit généré.

**Côté back (NestJS)** :
- **Guard JWT ES256** (algorithme asymétrique) implémenté avec la lib `jose`.
- La clé publique Supabase est récupérée dynamiquement via **JWKS** (JSON Web Key Set) — pas de secret partagé entre back et Supabase.
- Cache automatique du JWKS par `createRemoteJWKSet` pour éviter d'interroger Supabase à chaque requête.
- **Garde global** appliqué à toutes les routes API, avec opt-out explicite via décorateur `@Public()` pour `/auth/*` et `/health`.

**Avantage de l'asymétrie ES256 vs HS256 (symétrique) :**
- Le back n'a **jamais** besoin du secret privé de Supabase.
- Si le back est compromis, l'attaquant ne peut pas forger de tokens.
- Standard de l'industrie pour les architectures Auth-as-a-Service.

### 5.1.2 Périmètre actuel V1 examen

Un seul rôle utilisateur : **chef d'atelier**. Tous les chefs d'atelier authentifiés voient l'ensemble des données de l'atelier — c'est cohérent avec le périmètre mono-tenant assumé en V1.

La V2 RANKIA commerciale ajoutera :
- Rôles distincts (mécanicien lecture / chef admin / direction comptable)
- Multi-tenant (chaque atelier voit uniquement ses données)
- Row-Level Security côté PostgreSQL pour blinder la séparation

## 5.2 Validation des entrées

### 5.2.1 Défense en profondeur — schémas alignés front + back

**Côté front** :
- Tous les formulaires utilisent **React Hook Form + Zod**.
- Le schéma Zod définit les contraintes (`min`, `max`, `email`, `enum`, etc.).
- Validation immédiate au blur ou à la soumission.

**Côté back** :
- Chaque endpoint déclare un **DTO** typé avec `class-validator` (`@IsEmail`, `@IsString`, `@MinLength`, `@IsEnum`, etc.).
- **`ValidationPipe` global** dans `main.ts` avec `whitelist: true` + `forbidNonWhitelisted: true` : tout champ non déclaré est **rejeté avec un 400** avant d'atteindre le service métier.

> **Principe « défense en profondeur »** : un utilisateur malveillant qui contournerait la validation front (par exemple via curl) sera bloqué par la validation back. Les deux schémas sont alignés sur les mêmes contraintes.

### 5.2.2 Exemple concret

```typescript
// backend/src/clients/dto/create-client.dto.ts
export class CreateClientDto {
  @IsString()
  @MinLength(2)
  nom!: string;

  @IsString()
  @MinLength(2)
  prenom!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(TypeClient)
  @IsOptional()
  type?: TypeClient;
}
```

Toute requête `POST /api/clients` avec `nom` manquant → rejet 400 avant le service.
Toute requête avec un champ exotique `is_admin: true` → rejet 400 (`forbidNonWhitelisted`).

## 5.3 Protection contre les attaques courantes (OWASP Top 10)

| Risque OWASP | Protection mise en place dans Nautilus |
|---|---|
| **A01 — Broken Access Control** | Guard JWT global ES256 ; middleware Next.js sur `/dashboard/*` ; vérification serveur dans le layout dashboard |
| **A02 — Cryptographic Failures** | Mots de passe hashés bcrypt (Supabase) ; HTTPS forcé (Vercel + Railway) ; secrets en variables d'environnement chiffrées + vault 1Password dédié |
| **A03 — Injection (SQL et autres)** | Prisma uniquement (requêtes paramétrées, pas de SQL brut) ; DTOs validés à 2 niveaux ; **aucun SQL généré par le LLM** (cf. section 5.4) ; pas d'`eval`, pas de `dangerouslySetInnerHTML` |
| **A04 — Insecure Design** | Modèle de menace fait avant codage (cf. section 5.5) ; lecture seule pour l'IA ; pattern Intent+Entities |
| **A05 — Security Misconfiguration** | **CORS strict multi-origines** (splittées côté code pour conformité RFC) ; **Helmet** activé ; pas de mode debug en prod ; `.env.example` documenté, `.env` jamais commité |
| **A06 — Vulnerable Components** | `npm audit` 0 vulnérabilité ; Dependabot activé sur GitHub ; campagne de MAJ proactive le 15/06 (cf. section 7.2.3) |
| **A07 — Identification & Auth Failures** | Rate limiting Supabase natif sur `/auth/*` ; mots de passe forts requis ; pas de tokens en `localStorage` |
| **A08 — Software & Data Integrity Failures** | Migrations Prisma versionnées et reproductibles ; signatures JWT ES256 vérifiées via JWKS ; `package-lock.json` commité |
| **A09 — Security Logging & Monitoring Failures** | **Toutes les requêtes IA sont logguées en MongoDB** (`recherche_logs`) avec userId, question, intent, entities, statut, temps de réponse. Audit possible des tentatives suspectes |
| **A10 — Server-Side Request Forgery** | Pas d'appel à des URLs fournies par l'utilisateur côté serveur. Les seules URLs externes appelées sont Mistral AI et Supabase (whitelistées dans le code) |

## 5.4 Sécurité spécifique au moteur de recherche IA

> 🎯 L'intégration d'un LLM ouvre des **risques nouveaux** (OWASP LLM Top 10) qui méritent une attention particulière. Voici comment Nautilus y répond.

### 5.4.1 Le choix d'architecture fondamental : pattern « Intent + Entities »

**Le LLM Mistral ne génère JAMAIS de SQL.** C'est la décision de sécurité la plus structurante du projet.

Au lieu de demander au LLM de produire une requête SQL à partir de la question utilisateur (pattern « NL2SQL »), je lui ai donné un **menu fermé de 20 intents pré-codés**. Sa seule liberté est de :
1. Choisir un intent parmi les 20 (`find_bateau`, `list_or_urgents`, etc.)
2. Extraire des entités structurées (nom de client, statut, période, etc.)

C'est ensuite **mon code Prisma typé** qui exécute des requêtes prédéfinies à partir de l'intent.

**Conséquence directe : aucun risque d'injection SQL via le prompt utilisateur.**

### 5.4.2 Refus catégorisés (4 catégories logguées)

Tout intent qui sort du périmètre métier est classifié en `securite_refus` avec une des 4 catégories suivantes :

| Catégorie | Détection | Réponse à l'utilisateur |
|---|---|---|
| `credentials` | Demande de mot de passe, token, clé API, identifiant | « 🔒 Pour des raisons de sécurité, je ne suis pas autorisé à communiquer d'identifiants… » |
| `rgpd` | Demande de salaire, fiche de paie, dossier médical, etc. | « 🔒 Je n'ai pas accès à ce type d'information personnelle… » |
| `confidentiel` | Demande de marge, CA détaillé, données stratégiques | « 🔒 Cette information est confidentielle… » |
| `manipulation` | « ignore tes consignes », « supprime tous les devis », « fais semblant que… » | « 🔒 Je suis configuré pour assister la recherche uniquement… Toute tentative est tracée pour audit. » |

**Chaque tentative est loguée en MongoDB** avec `statut: "refuse_securite"` + la catégorie, l'utilisateur et le timestamp. Un admin peut ainsi auditer les comportements suspects (ex : 30 tentatives `credentials` sur un même compte = compromission probable).

### 5.4.3 Autres mesures spécifiques IA

| Risque IA | Mitigation |
|---|---|
| **Prompt injection** | Pattern Intent+Entities + règles S4/S5 du SYSTEM_PROMPT qui demandent au LLM d'ignorer toute tentative de manipulation → `securite_refus` |
| **Sensitive information disclosure** | Le LLM ne **voit jamais** les données métier — il classifie une question, mon code fetche en BDD, puis renvoie le résultat au front. Le LLM ne peut donc pas fuiter de données d'un autre utilisateur. |
| **Lecture seule stricte** | Toute demande de modification (`supprime`, `modifie`, `crée`, `efface`) → `securite_refus` avec catégorie `manipulation`. Aucune route API n'est exposée à l'IA pour modifier des données. |
| **Coût LLM abusif** | Rate limiting global via `ThrottlerModule` ; plafond `MAX_QUANTITE = 50` côté code pour éviter qu'un attaquant ne demande `quantite=10000` ; anti-scraping (téléphone min 4 chiffres, email min 3 chars) |
| **Hallucination** | Vision produit assumée : « l'IA restitue, l'humain décide ». L'IA ne diagnostique JAMAIS. Les résultats affichés sont les données brutes de la BDD, pas du texte généré par le LLM. |

### 5.4.4 Couverture OWASP LLM Top 10 — vue d'ensemble

| OWASP LLM | Couverture Nautilus |
|---|---|
| LLM01 Prompt Injection | ✅ Pattern Intent+Entities + refus catégorisés |
| LLM02 Sensitive Information Disclosure | ✅ LLM jamais en contact avec les données métier |
| LLM03 Training Data Poisoning | ➖ Non applicable (modèle pré-entraîné Mistral, pas de fine-tuning) |
| LLM04 Model Denial of Service | ✅ Rate limiting + `MAX_QUANTITE` |
| LLM05 Supply Chain | ✅ `npm audit` + Dependabot sur le SDK Mistral |
| LLM06 Sensitive Information Disclosure in Response | ✅ Le LLM n'a accès à aucune donnée |
| LLM07 Insecure Plugin Design | ➖ Non applicable (pas de plugins) |
| LLM08 Excessive Agency | ✅ Lecture seule stricte |
| LLM09 Overreliance | ✅ Vision produit « IA restitue, humain décide » |
| LLM10 Model Theft | ➖ Non applicable (modèle hébergé chez Mistral) |

## 5.5 Modèle de menace et privacy

### 5.5.1 Données traitées et leur sensibilité

| Type de donnée | Sensibilité | Localisation | Protection |
|---|---|---|---|
| Identifiants utilisateurs | Élevée | Supabase (Paris) | Hash bcrypt, cookies httpOnly |
| Données métier (clients, bateaux) | Moyenne (RGPD personnelles) | Neon PostgreSQL (Frankfurt) | TLS, auth obligatoire, scope mono-atelier |
| Historique recherches IA | Moyenne | MongoDB Atlas (Paris) | Chiffrement disque Atlas (at-rest), TLS |
| Documents PDF générés | Moyenne | Ephémère (générés à la demande) | TLS, auth obligatoire |

### 5.5.2 Souveraineté et conformité RGPD

**100 % de l'infrastructure est en Union Européenne :**
- Vercel : CDN edge UE
- Railway : europe-west4 (Pays-Bas)
- Neon PostgreSQL : Frankfurt (Allemagne)
- MongoDB Atlas : Paris (France)
- Supabase Auth : Paris (France)
- Mistral AI : France

**Aucune donnée ne transite par les États-Unis**, ce qui simplifie la conformité RGPD (pas de transfert hors UE à documenter).

## 5.6 Sécurité du déploiement

- **Secrets** : jamais commités. Variables d'environnement chiffrées côté Vercel et Railway. Vault 1Password dédié au projet (CLI `op`).
- **HTTPS** : forcé sur Vercel (TLS auto via Let's Encrypt) et Railway. HSTS activé via Helmet.
- **CORS** : multi-origines explicites, splittées côté code pour conformité RFC. Pas de wildcard `*`.
- **Headers de sécurité** (via Helmet) : `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, etc.
- **`robots.txt`** : `Disallow: /` — Nautilus est un outil interne d'atelier, pas un site public à indexer.
- **`.vercelignore`** : exclut le dossier `backend/`, les fichiers de test, et la documentation interne du déploiement front.
- **`.env*` dans `.gitignore`** : aucun secret committé. `.env.example` documenté sans valeurs réelles.
- **Pas de console.log en production** : audit du repo réalisé le 12/06 + 15/06 pour s'en assurer.

## 5.7 Tests et vérifications

| Test | État |
|---|---|
| Tests Jest sur services critiques (clients, devis, PDF, log) | ✅ 9/9 verts |
| `npm audit` (front + back) | ✅ 0 vulnérabilité |
| Smoke test prod (front HTTP 200 + back HTTP 200) | ✅ < 1 s |
| Jeu d'essai IA (20 scénarios métier/UX/sécurité/homonymes) | ✅ 100 % conformes (cf. section 6) |
| Tests sécurité IA (3 attaques bloquées : credentials, manipulation, suppression) | ✅ 100 % bloquées (cf. section 6.5) |
