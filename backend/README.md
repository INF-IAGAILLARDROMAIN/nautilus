# Nautilus — Back NestJS

API REST du projet Nautilus (TP DWWM Studi 2026).

**Stack** : NestJS 11 + TypeScript + Prisma 6 + PostgreSQL (Neon) + MongoDB (Atlas) + Mistral AI

> Le périmètre exact et l'architecture sont décrits dans le PRD : [`../docs/examen/PRD-NAUTILUS-EXAMEN-V1.md`](../docs/examen/PRD-NAUTILUS-EXAMEN-V1.md)

---

## 🌐 URL de production

- **API live** : https://nautilus-production-970f.up.railway.app/api
- **Région** : europe-west4 (Pays-Bas)
- **Hébergeur** : Railway

---

## 🚀 Démarrage rapide (5 commandes)

```bash
# 1. Aller dans le dossier back
cd backend

# 2. Installer les dépendances (≈ 3-5 min la première fois)
npm install

# 3. Copier le .env d'exemple et y mettre les vraies valeurs
cp .env.example .env
# ↳ Modifier DATABASE_URL, MONGODB_URI, SUPABASE_*, MISTRAL_API_KEY, etc.

# 4. Générer le client Prisma + créer les tables en BDD
npx prisma generate
npx prisma migrate dev --name init

# 5. Démarrer le serveur en mode développement
npm run start:dev
```

→ API disponible sur **http://localhost:4000/api**

## 🗄️ Avoir une BDD PostgreSQL en local

Option la plus simple : **Docker**.

```bash
docker run --name nautilus-postgres \
  -e POSTGRES_USER=nautilus \
  -e POSTGRES_PASSWORD=nautilus \
  -e POSTGRES_DB=nautilus \
  -p 5432:5432 \
  -d postgres:16
```

Le `.env.example` est déjà configuré pour cette base.

## 📦 Modules disponibles (tous en production)

| Module | État | Description |
|---|---|---|
| `auth` | ✅ Prod | Guard JWT Supabase (ES256 via JWKS) |
| `clients` | ✅ Prod | CRUD complet |
| `bateaux` | ✅ Prod | CRUD complet |
| `devis` | ✅ Prod | CRUD + génération numéro `DEV-AAAA-XXXX` + lignes |
| `ordre-reparation` | ✅ Prod | CRUD + workflow statuts + génération `FAC-AAAA-XXXX` |
| `pdf` | ✅ Prod | Génération PDF devis / OR / facture (pdfkit) |
| `recherche-ia` | ✅ Prod | Moteur de recherche IA — **20 intents** + Mistral AI |
| `recherche-log` | ✅ Prod | Persistance MongoDB des recherches (audit + stats) |
| `prisma` | ✅ Prod | Service Prisma injectable |

## 📚 Endpoints REST principaux

### Clients
- `POST   /api/clients` — créer un client
- `GET    /api/clients` — lister (query : `skip`, `take`, `search`)
- `GET    /api/clients/:id` — détail (avec ses bateaux + devis)
- `PATCH  /api/clients/:id` — mettre à jour
- `DELETE /api/clients/:id` — supprimer

### Bateaux
- `POST /api/bateaux` · `GET /api/bateaux` · `GET /api/bateaux/:id`

### Devis
- `POST /api/devis` · `GET /api/devis` · `GET /api/devis/:id`
- `PATCH /api/devis/:id` — changement de statut
- `GET /api/devis/:id/pdf` — télécharge le PDF

### Ordres de réparation
- `GET /api/or` · `GET /api/or/:id`
- `PATCH /api/or/:id` — changement de statut + assignation mécano
- `GET /api/or/:id/pdf` — PDF de l'OR
- `GET /api/or/:id/facture-pdf` — PDF facture (statut FACTURE uniquement)

### Recherche IA
- `POST /api/recherche` — question en langage naturel
  - Pattern « Intent + Entities » (20 intents, aucun SQL généré par le LLM)
  - Log automatique en MongoDB

## 🧪 Tests Jest

```bash
npm test
```

**9 tests verts** répartis sur 4 suites (`clients`, `devis`, `pdf`, `recherche-log`).

## 🛠️ Commandes utiles Prisma

```bash
# Visualiser la BDD dans un studio web
npx prisma studio

# Créer une nouvelle migration après modif du schema
npx prisma migrate dev --name nom_de_la_migration

# Régénérer le client Prisma (après modif du schema)
npx prisma generate

# Appliquer les migrations en production
npx prisma migrate deploy

# Reset complet de la BDD (dev only !)
npx prisma migrate reset
```

## 📁 Structure des dossiers

```
backend/
├── prisma/
│   ├── schema.prisma          ← Schéma des 4 entités + LigneDevis
│   ├── migrations/             ← Migrations SQL versionnées
│   └── seed-data/              ← Données de seed (marques nautisme)
├── src/
│   ├── main.ts                 ← Bootstrap NestJS (CORS multi-origines, helmet, validation)
│   ├── app.module.ts           ← Module racine + Throttler global
│   ├── auth/                   ← Guard JWT Supabase (jose + JWKS)
│   ├── prisma/                 ← PrismaService injectable
│   ├── clients/                ← Module Clients (CRUD)
│   ├── bateaux/                ← Module Bateaux
│   ├── devis/                  ← Module Devis (+ lignes + génération n°)
│   ├── ordre-reparation/       ← Module OR (+ workflow + génération facture)
│   ├── pdf/                    ← Service PDF (pdfkit)
│   ├── recherche-ia/           ← Moteur IA Mistral (20 intents)
│   └── recherche-log/          ← Log MongoDB (Mongoose)
├── .env.example                ← Modèle de variables d'environnement
└── package.json
```

## 🔒 Sécurité en place

### Couche HTTP
- **Helmet** : headers HTTP sécurisés (HSTS, X-Frame-Options, etc.)
- **CORS strict multi-origines** : seule(s) la/les origine(s) front autorisée(s), splittée(s) côté code pour respecter la RFC
- **ValidationPipe global** : DTOs validés sur toutes les routes (`whitelist` + `forbidNonWhitelisted`)
- **ThrottlerGuard global** : rate limiting (configurable via `THROTTLE_TTL` / `THROTTLE_LIMIT`)
- **Préfixe `/api`** : toutes les routes sous `/api/*`

### Couche Auth
- **Guard JWT Supabase ES256** : vérification asymétrique via JWKS public Supabase (lib `jose`)
- **Aucun secret partagé** entre back et Supabase — la clé publique est récupérée dynamiquement
- **Garde global** appliqué à toutes les routes sauf opt-out explicite

### Couche IA
- **Pattern « Intent + Entities »** : le LLM Mistral ne génère JAMAIS de SQL — aucun risque d'injection
- **20 intents pré-codés** : recherche bornée au périmètre métier
- **Refus catégorisés** : credentials / RGPD / confidentiel / manipulation
- **Log MongoDB** : chaque tentative de manipulation est tracée pour audit

## 🚀 Déploiement Railway

Le back est déployé automatiquement sur Railway à chaque push sur `main`.

Variables d'environnement nécessaires (dashboard Railway) :
- `DATABASE_URL` (Neon)
- `MONGODB_URI` (Atlas)
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET`
- `CORS_ORIGIN` (multi-origines séparées par virgules)
- `MISTRAL_API_KEY`
- `THROTTLE_TTL`, `THROTTLE_LIMIT`
