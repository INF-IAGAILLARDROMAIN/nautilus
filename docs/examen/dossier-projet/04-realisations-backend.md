# 4. Réalisations back-end

> Cette section présente les éléments les plus significatifs du back-end Nautilus + les arguments des choix techniques, **y compris pour la sécurité**.

## 4.1 Présentation de la base de données

### 4.1.1 Schéma conceptuel (MCD) avec données et relations

Le modèle conceptuel de données de Nautilus repose sur **4 entités liées** qui suivent le flux métier réel d'un atelier nautique :

```
┌──────────┐ 1   N ┌─────────┐ 1   N ┌────────┐ 1   1 ┌─────────┐
│  Client  │───────│ Bateau  │───────│ Devis  │───────│   OR    │
└──────────┘       └─────────┘       └────────┘       └─────────┘
                                                            │
                                                            └─→ [PDF Facture généré au statut FACTURE]
```

**Flux métier** : un **Client** possède un ou plusieurs **Bateaux** ; pour chaque intervention, on chiffre un **Devis** ; si le devis est validé, un **Ordre de Réparation (OR)** est créé automatiquement ; lorsque l'OR passe au statut FACTURE, un numéro de facture séquentiel (`FAC-AAAA-XXXX`) est généré et le **PDF de facture** est produit à la volée à partir de l'OR et de son Devis.

**Entités et attributs principaux :**

| Entité | Attributs principaux | Statuts |
|---|---|---|
| **Client** | id, nom, prénom, email, téléphone, adresse, code postal, ville, type (PARTICULIER / PROFESSIONNEL), notes, createdAt | — |
| **Bateau** | id, nom (surnom), marque, modèle, typeCoque (8 valeurs), immatriculation, année, marqueMoteur, modeleMoteur, plaqueMoteur (unique), puissanceCV, hélice, clientId (FK), createdAt | — |
| **Devis** | id, numéroDevis (`DEV-AAAA-XXXX`), description, totalHT, tauxTVA, totalTTC, statut, clientId (FK), bateauId (FK), createdAt | BROUILLON → ENVOYÉ → VALIDÉ → REFUSÉ |
| **LigneDevis** | id, description, quantité, prixUnitaireHT, totalLigneHT, ordre, devisId (FK) | — |
| **OrdreReparation** | id, description, type (5 valeurs), urgence (NORMAL / URGENT), mécano, statut, numéroFacture (`FAC-AAAA-XXXX`, unique, généré au statut FACTURE), devisId (FK unique), dateDebut, dateFin | CREE → EN_COURS → TERMINE → FACTURE |

> **Choix d'architecture important** : la **Facture n'est PAS une entité séparée**. C'est un **PDF généré à la volée** à partir de l'OR + son Devis quand l'OR passe au statut FACTURE. Économie d'une table (et de la complexité associée), sans perte fonctionnelle.

Un **MCD complet** (généré avec Mermaid) est fourni en annexe.

### 4.1.2 Schéma physique (MLD/MPD)

Le schéma physique est généré automatiquement par **Prisma** à partir du fichier `schema.prisma`, qui sert de source unique de vérité. Les migrations SQL sont versionnées dans le dossier `backend/prisma/migrations/` et appliquées en base via `prisma migrate deploy`.

**Tables physiques PostgreSQL :**
- `Client`
- `Bateau` (FK `clientId` → `Client.id`, contrainte `ON DELETE CASCADE`)
- `Devis` (FK `clientId` → `Client.id`, FK `bateauId` → `Bateau.id` nullable, contrainte `ON DELETE RESTRICT`)
- `LigneDevis` (FK `devisId` → `Devis.id`, contrainte `ON DELETE CASCADE`)
- `ordre_reparation` (FK `devisId` → `Devis.id` unique, contrainte `ON DELETE RESTRICT`)

**Index présents pour la performance des requêtes :**
- `Client (nom, prenom)` — recherches par nom
- `Bateau (clientId)` et `Bateau (marqueMoteur)` — accès par client et par marque
- `OrdreReparation (statut)` et `(mecano)` — filtrage par statut et par mécano

**Contraintes d'unicité :**
- `Client.email` (unique mais nullable)
- `Bateau.plaqueMoteur` (unique mais nullable — PostgreSQL autorise plusieurs NULL)
- `Devis.numeroDevis` (unique)
- `OrdreReparation.devisId` (unique — relation 1:1 stricte Devis ↔ OR)
- `OrdreReparation.numeroFacture` (unique mais nullable)

### 4.1.3 Script de création de la base de données

Extrait représentatif du fichier `backend/prisma/schema.prisma` (le fichier complet est fourni en annexe) :

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum TypeClient {
  PARTICULIER
  PROFESSIONNEL
}

enum StatutOR {
  CREE
  EN_COURS
  TERMINE
  FACTURE
}

model Client {
  id         String     @id @default(cuid())
  nom        String
  prenom     String
  email      String?    @unique
  telephone  String?
  type       TypeClient @default(PARTICULIER)
  bateaux    Bateau[]
  devis      Devis[]
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  @@index([nom, prenom])
}

model Bateau {
  id              String   @id @default(cuid())
  nom             String?  @db.VarChar(60)
  marque          String
  modele          String
  immatriculation String?  @db.VarChar(20)
  annee           Int?
  marqueMoteur    String?
  modeleMoteur    String?
  plaqueMoteur    String?  @unique
  puissanceCV     Int?
  clientId        String
  client          Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  devis           Devis[]
  @@index([clientId])
  @@index([marqueMoteur])
}

model OrdreReparation {
  id            String    @id @default(cuid())
  statut        StatutOR  @default(CREE)
  numeroFacture String?   @unique
  devisId       String    @unique
  devis         Devis     @relation(fields: [devisId], references: [id], onDelete: Restrict)
  @@map("ordre_reparation")
  @@index([statut])
}
```

**Commande de génération de la migration SQL** :
```bash
npx prisma migrate dev --name init
```

**Application en production** :
```bash
npx prisma migrate deploy
```

## 4.2 Extraits de code — composants métier

### 4.2.1 Service Recherche IA (fonctionnalité signature)

Le service `RechercheIaService` est le **cœur fonctionnel** de Nautilus. Il transforme une question en langage naturel en intent + entités, puis dispatche vers des requêtes Prisma typées. **Aucun SQL n'est généré par le LLM** — c'est le principe de sécurité fondamental du pattern « Intent + Entities » que j'ai choisi.

Extrait (méthode principale) :

```typescript
@Injectable()
export class RechercheIaService {
  private readonly client: Mistral | null;
  private readonly modele = 'mistral-small-latest';

  async rechercher(
    question: string,
    user: { sub: string; email?: string },
  ): Promise<RechercheResultat> {
    const t0 = Date.now();

    // 1. Classification + extraction d'entités via Mistral
    const llmResp = await this.classifierAvecMistral(question);

    // 2. Dispatch sur l'intent → exécution Prisma typée
    const exec = await this.executerIntent(llmResp.intent, llmResp.entities);

    // 3. Log MongoDB (résilient — n'interrompt pas la requête métier)
    void this.logSvc.log({
      userId: user.sub,
      userEmail: user.email,
      question,
      intent: llmResp.intent,
      entities: llmResp.entities,
      statut: 'ok',
      resultatsCount: Array.isArray(exec.resultats) ? exec.resultats.length : 1,
      tempsMs: Date.now() - t0,
      llmProvider: 'mistral',
      llmModele: this.modele,
    });

    return { ...exec, intent: llmResp.intent, /* ... */ };
  }
}
```

Le service dispatche sur **20 intents** distincts (recherche par client, par moteur, par période, par téléphone, etc.) + **3 intents UX** (salutation, aide, hors-domaine) + **1 intent sécurité** (refus catégorisé : credentials, RGPD, confidentiel, manipulation).

### 4.2.2 Service Devis — génération du numéro

Le service `DevisService` génère automatiquement un numéro de devis lisible au format `DEV-AAAA-XXXX` lors de la création :

```typescript
private async genererNumeroDevis(): Promise<string> {
  const annee = new Date().getFullYear();
  const dernier = await this.prisma.devis.findFirst({
    where: { numeroDevis: { startsWith: `DEV-${annee}-` } },
    orderBy: { numeroDevis: 'desc' },
  });
  const num = dernier
    ? parseInt(dernier.numeroDevis.split('-')[2], 10) + 1
    : 1;
  return `DEV-${annee}-${num.toString().padStart(4, '0')}`;
}
```

Le même pattern est utilisé pour générer `FAC-AAAA-XXXX` quand un OR passe au statut FACTURE.

### 4.2.3 Service PDF — génération côté serveur

La génération des PDF (devis, OR, facture) se fait **entièrement côté serveur** via la librairie `pdfkit`. Aucun rendu côté client → garantie de fidélité graphique et possibilité de signer/sécuriser le document.

Le service expose 3 méthodes : `generateDevisPdf(devisId)`, `generateOrPdf(orId)`, `generateFacturePdf(orId)`. Chaque méthode produit un `Buffer` binaire renvoyé directement au client en `Content-Type: application/pdf`.

## 4.3 Extraits de code — composants d'accès aux données

### 4.3.1 Côté SQL (PostgreSQL via Prisma)

**Requête de recherche client par nom — gestion des homonymes** (extrait de `recherche-ia.service.ts`) :

```typescript
function buildClientWhere(name: string): Prisma.ClientWhereInput | null {
  // Split "Martin Pierre" → ["Martin", "Pierre"]
  // Chaque mot doit matcher dans (nom OU prénom), dans n'importe quel ordre
  const mots = name.trim().split(/\s+/).filter((w) => w.length >= 2);
  if (mots.length === 0) return null;
  return {
    AND: mots.map((mot) => ({
      OR: [
        { nom: { contains: mot, mode: 'insensitive' } },
        { prenom: { contains: mot, mode: 'insensitive' } },
      ],
    })),
  };
}
```

Cette logique fixe un bug que j'avais identifié en audit : sans split sur les espaces, la recherche `"Martin Pierre"` retournait 0 résultat (le code cherchait littéralement la chaîne `"Martin Pierre"` dans le champ `nom` ou `prenom`).

**Requête liste devis d'un client avec relations (include)** :

```typescript
return this.prisma.devis.findMany({
  where: { client: clientWhere },
  include: {
    client: { select: { id: true, nom: true, prenom: true } },
    bateau: { select: { id: true, marque: true, modele: true, nom: true } },
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
});
```

### 4.3.2 Côté NoSQL (MongoDB via Mongoose)

Toutes les recherches IA sont **logguées en MongoDB** dans la collection `recherche_logs` :

```typescript
@Injectable()
export class RechercheLogService {
  async log(data: Partial<RechercheLog>): Promise<RechercheLogDocument | null> {
    try {
      return await this.model.create(data);
    } catch (e) {
      // Résilient : si Mongo est down, on log l'erreur mais on ne casse PAS
      // la requête métier de l'utilisateur. Le log d'IA est un nice-to-have.
      this.logger.error(`Mongo log impossible : ${(e as Error).message}`);
      return null;
    }
  }
}
```

**Agrégation MongoDB pour les statistiques** (utilisée pour la démo orale) :

```typescript
const stats = await this.model.aggregate([
  { $group: { _id: '$statut', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]);
```

> 🎯 **Justification de l'usage NoSQL (exigence du référentiel TP DWWM)** : les logs de recherche IA sont **semi-structurés** (entities différentes selon l'intent : `client_name`, `quantite`, `categorie`, `sujet`…) et **volumineux** (chaque question utilisateur génère un document). MongoDB est plus adapté qu'une table PostgreSQL rigide pour ce cas d'usage, et ses agrégations natives accélèrent l'analyse statistique. C'est aussi la **traçabilité d'audit** des tentatives sensibles (mots de passe, manipulation, hors-domaine).

## 4.4 Arguments des choix techniques (y compris sécurité)

| Choix | Argument |
|---|---|
| **NestJS 11** | Architecture modulaire stricte (Module / Controller / Service / DTO), maintenable, testable. Injection de dépendances native. |
| **Prisma** | ORM type-safe, migrations versionnées, génération automatique du client TypeScript — pas de SQL écrit à la main, pas de risque d'injection. |
| **PostgreSQL (Neon)** | Base relationnelle robuste, hébergée serverless, scaling automatique. Région Frankfurt (UE — conformité RGPD). |
| **MongoDB Atlas (Paris)** | Choix justifié par le cas d'usage logs IA (cf. 4.3.2). Région Paris (UE — RGPD). |
| **Mistral AI (`mistral-small-latest`)** | LLM **souverain français** (Paris), conformité RGPD. Modèle « small » suffisant pour la classification d'intent (pas besoin d'un modèle frontière coûteux). |
| **Supabase Auth (JWT ES256)** | Standard de l'industrie. Vérification du token via **Guard NestJS** sur toutes les routes protégées. Asymétrie ES256 (clé publique côté back, clé privée côté Supabase). |
| **DTOs + class-validator** | Validation systématique des entrées **avant** d'atteindre le service métier. Défense contre l'injection et les payloads malformés. |
| **CORS strict (multi-origines RFC)** | N'accepte que les origines front explicitement listées (fix d'un bug le 11/06 : la valeur multi-origines doit être splittée côté back pour respecter la RFC CORS). Pas de wildcard `*`. |
| **helmet** | Headers HTTP de sécurité (X-Frame-Options, X-Content-Type-Options, etc.). |
| **Pattern « Intent + Entities » pour l'IA** | Le LLM ne génère **JAMAIS de SQL**. Il choisit parmi 20 intents pré-codés et extrait des entités. Aucun risque d'injection SQL via le prompt. |
| **Prompt système renforcé (4 catégories de refus)** | Refus catégorisés : `credentials`, `rgpd`, `confidentiel`, `manipulation`. Chaque tentative est tracée en MongoDB pour audit. |
| **Variables d'environnement** | Secrets jamais commités, fichier `.env.example` documenté. Vault 1Password dédié pour les secrets de prod. |
| **Tests Jest** | 9 tests sur les services critiques (clients, devis, PDF) couvrant les invariants métier et les cas limites. |

## 4.5 Documentation du déploiement

### 4.5.1 Architecture de déploiement

```
┌─────────────────────────────────────────────────────────────┐
│  Utilisateur (navigateur)                                   │
│  ↓ HTTPS                                                    │
│  Front Next.js — Vercel (CDN edge, région auto)             │
│  ↓ HTTPS Bearer JWT                                          │
│  Back NestJS — Railway (europe-west4 Pays-Bas)              │
│  ├─→ PostgreSQL — Neon (Frankfurt, UE)                      │
│  ├─→ MongoDB — Atlas (Paris, UE)                            │
│  ├─→ Auth — Supabase (Paris, UE)                            │
│  └─→ LLM — Mistral AI (France)                              │
└─────────────────────────────────────────────────────────────┘
```

**Toute l'infrastructure est en Union Européenne**, par conformité RGPD et choix de souveraineté.

### 4.5.2 Variables d'environnement

**Back (Railway) :**

```bash
NODE_ENV=production
PORT=4000

# PostgreSQL Neon
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/nautilus?sslmode=require"

# MongoDB Atlas
MONGODB_URI="mongodb+srv://USER:PASSWORD@cluster.mongodb.net/nautilus_ia_history"

# Supabase Auth
SUPABASE_URL="https://xxxx.supabase.co"
SUPABASE_ANON_KEY="ey..."
SUPABASE_JWT_SECRET="..."

# CORS — multi-origines séparées par virgule (splittées côté code)
CORS_ORIGIN="https://nautilus-silk.vercel.app,http://localhost:3000"

# Mistral AI
MISTRAL_API_KEY="..."

# Rate limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=10
```

**Front (Vercel) :**

```bash
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="ey..."
NEXT_PUBLIC_API_URL="https://nautilus-production-970f.up.railway.app/api"
```

Les secrets sont stockés dans un **vault 1Password dédié au projet**, accessible via la CLI `op` pour les opérations sensibles.

### 4.5.3 Commandes de déploiement

**Migration BDD (à exécuter UNE FOIS lors de chaque changement de schema) :**

```bash
cd backend
npx prisma migrate deploy
```

**Build & déploiement (automatique via push GitHub) :**

```bash
git push origin main
# → trigger Vercel (front) + Railway (back) simultanément
# → délai déploiement : ~2 min
```

**Smoke tests post-déploiement (manuels) :**

1. Ouvrir `https://nautilus-silk.vercel.app` → login Supabase fonctionne
2. Accéder au dashboard → données affichées
3. Poser une question IA en langage naturel → réponse en ~600 ms
4. Vérifier les logs Railway → pas d'erreur 5xx

### 4.5.4 URLs de production

- **Front** : https://nautilus-silk.vercel.app
- **Back** : https://nautilus-production-970f.up.railway.app/api
- **Repo GitHub** : https://github.com/INF-IAGAILLARDROMAIN/nautilus

Toutes les régions sont en **Union Européenne** pour conformité RGPD et latence optimale (~40 ms front ↔ back).
