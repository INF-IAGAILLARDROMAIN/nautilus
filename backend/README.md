# Nautilus — Back NestJS

API REST du projet Nautilus (TP DWWM Studi). Stack : **NestJS 11 + TypeScript + Prisma + PostgreSQL**.

> Le périmètre exact et l'architecture sont décrits dans le PRD : [`../docs/examen/PRD-NAUTILUS-EXAMEN-V1.md`](../docs/examen/PRD-NAUTILUS-EXAMEN-V1.md)

---

## 🚀 Démarrage rapide (5 commandes)

```bash
# 1. Aller dans le dossier back
cd backend

# 2. Installer les dépendances (≈ 3-5 min la première fois)
npm install

# 3. Copier le .env d'exemple et y mettre les vraies valeurs
cp .env.example .env
# ↳ Modifier DATABASE_URL pour pointer vers ta PostgreSQL locale ou Neon

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

## 📦 Endpoints disponibles

### Clients ✅ (implémenté)
- `POST   /api/clients` — créer un client
- `GET    /api/clients` — lister les clients (query : `skip`, `take`, `search`)
- `GET    /api/clients/:id` — détail d'un client (avec ses bateaux)
- `PATCH  /api/clients/:id` — mettre à jour un client
- `DELETE /api/clients/:id` — supprimer un client

### À implémenter (modules à venir)
- `bateaux` — CRUD bateaux liés à un client
- `devis` — CRUD devis liés à un bateau, génération du n° devis
- `or` — CRUD ordres de réparation (créés à la validation d'un devis)
- `recherche-ia` — moteur de recherche en langage naturel
- `pdf` — génération PDF devis/facture
- `auth` — vérification JWT Supabase

## 🧪 Tester rapidement avec curl

```bash
# Créer un client
curl -X POST http://localhost:4000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"nom":"Dupont","prenom":"Jean","email":"jean@dupont.fr","type":"PARTICULIER"}'

# Lister les clients
curl http://localhost:4000/api/clients

# Voir un client (remplacer ID)
curl http://localhost:4000/api/clients/ID_RECUPERE
```

## 🛠️ Commandes utiles Prisma

```bash
# Visualiser la BDD dans un studio web
npx prisma studio

# Créer une nouvelle migration après modif du schema
npx prisma migrate dev --name nom_de_la_migration

# Régénérer le client Prisma (après modif du schema)
npx prisma generate

# Reset complet de la BDD (dev only !)
npx prisma migrate reset
```

## 📁 Structure des dossiers

```
backend/
├── prisma/
│   ├── schema.prisma          ← Schéma des 4 entités (Client, Bateau, Devis, OR)
│   └── migrations/             ← Migrations SQL versionnées (générées)
├── src/
│   ├── main.ts                 ← Bootstrap NestJS (CORS, helmet, validation)
│   ├── app.module.ts           ← Module racine
│   ├── prisma/                 ← PrismaService injectable
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── clients/                ← Module Clients (CRUD complet — exemple type)
│   │   ├── clients.controller.ts
│   │   ├── clients.module.ts
│   │   ├── clients.service.ts
│   │   └── dto/
│   │       ├── create-client.dto.ts
│   │       └── update-client.dto.ts
│   └── (bateaux, devis, or, recherche-ia, pdf, auth — à créer)
├── .env.example                ← Modèle de variables d'environnement
└── package.json
```

## 🔒 Sécurité (déjà en place dans le scaffold)

- **Helmet** : headers HTTP sécurisés (HSTS, X-Frame-Options, CSP, etc.)
- **CORS strict** : seule l'origine front autorisée
- **ValidationPipe global** : DTOs validés sur toutes les routes (whitelist + forbidNonWhitelisted)
- **ThrottlerGuard global** : rate limiting (configurable via `.env`)
- **Préfixe `/api`** : toutes les routes sous `/api/*`

À ajouter (modules suivants) :
- Guard JWT Supabase (vérification du token sur les routes protégées)
- Sanitisation prompt IA + restriction du contexte LLM au schéma seul
