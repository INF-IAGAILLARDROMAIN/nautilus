# Script SQL de création de la base de données — MPD natif PostgreSQL

> **Modèle Physique de Données (MPD)** — SQL natif PostgreSQL généré automatiquement par Prisma.
> Ce script est versionné dans Git et appliqué en production via `npx prisma migrate deploy`.

📂 **Source** : `backend/prisma/migrations/` (7 migrations versionnées)

---

## Historique des migrations

| Migration | Date | Description |
|---|---|---|
| `20260603141628_init` | 03/06/2026 | Création initiale (5 tables + 6 enums) |
| `20260603141932_init` | 03/06/2026 | Ajustements relations |
| `20260608090554_add_client_address_notes` | 08/06/2026 | Ajout adresse + notes Client |
| `20260608134211_enrich_bateau_v1` | 08/06/2026 | Enrichissement Bateau (moteur, hélice…) |
| `20260608143241_plaque_moteur_optional` | 08/06/2026 | plaqueMoteur rendue nullable |
| `20260608145752_devis_validite_paiement` | 08/06/2026 | Ajout dateValidite + modalitesPaiement |
| `20260608152240_devis_client_direct` | 08/06/2026 | Devis lié directement au client |

---

## Migration initiale — création des 5 tables + 6 enums

Extrait du fichier `20260603141628_init/migration.sql` :

```sql
-- CreateEnum
CREATE TYPE "TypeClient" AS ENUM ('PARTICULIER', 'PROFESSIONNEL');

-- CreateEnum
CREATE TYPE "StatutDevis" AS ENUM ('BROUILLON', 'ENVOYE', 'VALIDE', 'REFUSE');

-- CreateEnum
CREATE TYPE "TypeOR" AS ENUM ('ENTRETIEN', 'REPARATION', 'HIVERNAGE', 'DESHIVERNAGE', 'DEPANNAGE');

-- CreateEnum
CREATE TYPE "UrgenceOR" AS ENUM ('NORMAL', 'URGENT');

-- CreateEnum
CREATE TYPE "StatutOR" AS ENUM ('CREE', 'EN_COURS', 'TERMINE', 'FACTURE');

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT,
    "adresse" TEXT,
    "type" "TypeClient" NOT NULL DEFAULT 'PARTICULIER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bateau" (
    "id" TEXT NOT NULL,
    "marque" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "plaqueMoteur" TEXT NOT NULL,
    "annee" INTEGER,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bateau_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Devis" (
    "id" TEXT NOT NULL,
    "numeroDevis" TEXT NOT NULL,
    "description" TEXT,
    "totalHT" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tauxTVA" DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    "totalTTC" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "statut" "StatutDevis" NOT NULL DEFAULT 'BROUILLON',
    "bateauId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Devis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LigneDevis" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantite" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "prixUnitaireHT" DECIMAL(10,2) NOT NULL,
    "totalLigneHT" DECIMAL(10,2) NOT NULL,
    "devisId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LigneDevis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OR" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "type" "TypeOR" NOT NULL DEFAULT 'REPARATION',
    "urgence" "UrgenceOR" NOT NULL DEFAULT 'NORMAL',
    "mecano" TEXT,
    "statut" "StatutOR" NOT NULL DEFAULT 'CREE',
    "numeroFacture" TEXT,
    "devisId" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OR_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE INDEX "Client_nom_prenom_idx" ON "Client"("nom", "prenom");

-- CreateIndex
CREATE UNIQUE INDEX "Bateau_plaqueMoteur_key" ON "Bateau"("plaqueMoteur");

-- CreateIndex
CREATE INDEX "Bateau_clientId_idx" ON "Bateau"("clientId");

-- CreateIndex
CREATE INDEX "Bateau_marque_modele_idx" ON "Bateau"("marque", "modele");

-- CreateIndex
CREATE UNIQUE INDEX "Devis_numeroDevis_key" ON "Devis"("numeroDevis");

-- CreateIndex
CREATE INDEX "Devis_bateauId_idx" ON "Devis"("bateauId");

-- CreateIndex
CREATE INDEX "Devis_statut_idx" ON "Devis"("statut");

-- CreateIndex
CREATE INDEX "LigneDevis_devisId_idx" ON "LigneDevis"("devisId");

-- CreateIndex
CREATE UNIQUE INDEX "OR_numeroFacture_key" ON "OR"("numeroFacture");

-- CreateIndex
CREATE UNIQUE INDEX "OR_devisId_key" ON "OR"("devisId");

-- CreateIndex
CREATE INDEX "OR_statut_idx" ON "OR"("statut");

-- CreateIndex
CREATE INDEX "OR_mecano_idx" ON "OR"("mecano");

-- AddForeignKey
ALTER TABLE "Bateau" ADD CONSTRAINT "Bateau_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Devis" ADD CONSTRAINT "Devis_bateauId_fkey" FOREIGN KEY ("bateauId") REFERENCES "Bateau"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneDevis" ADD CONSTRAINT "LigneDevis_devisId_fkey" FOREIGN KEY ("devisId") REFERENCES "Devis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OR" ADD CONSTRAINT "OR_devisId_fkey" FOREIGN KEY ("devisId") REFERENCES "Devis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

---

## Migrations d'évolution (sprint S1)

### Ajout adresse et notes Client (08/06/2026)
```sql
-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "codePostal" VARCHAR(10),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "ville" VARCHAR(100);
```

### Enrichissement Bateau (08/06/2026)
```sql
-- CreateEnum
CREATE TYPE "TypeCoque" AS ENUM ('STRATIFIE', 'ALUMINIUM', 'POLYETHYLENE', 'SEMI_RIGIDE', 'PNEUMATIQUE', 'BOIS', 'ACIER', 'AUTRE');

-- AlterTable
ALTER TABLE "Bateau" ADD COLUMN     "helice" VARCHAR(100),
ADD COLUMN     "immatriculation" VARCHAR(20),
ADD COLUMN     "marqueMoteur" TEXT,
ADD COLUMN     "modeleMoteur" TEXT,
ADD COLUMN     "nom" VARCHAR(60),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "puissanceCV" INTEGER,
ADD COLUMN     "typeCoque" "TypeCoque" NOT NULL DEFAULT 'STRATIFIE';

-- CreateIndex
CREATE INDEX "Bateau_marqueMoteur_idx" ON "Bateau"("marqueMoteur");
```

### Devis : lien direct au Client + bateau optionnel (08/06/2026)
```sql
-- Migration : ajout d'une relation directe Devis → Client (clientId obligatoire).
-- bateauId devient nullable pour permettre les devis pré-vente / sans bateau.
--
-- Stratégie en 3 étapes pour préserver les 2 devis existants :
--   1. Ajouter clientId NULLABLE (temporairement)
--   2. Backfill : copier le clientId depuis le bateau lié pour chaque devis existant
--   3. Passer clientId en NOT NULL (la contrainte définitive)

-- DropForeignKey (on remplace la contrainte bateauId)
ALTER TABLE "Devis" DROP CONSTRAINT "Devis_bateauId_fkey";

-- 1. Ajouter clientId en nullable + relâcher contrainte bateauId
ALTER TABLE "Devis" ADD COLUMN "clientId" TEXT;
ALTER TABLE "Devis" ALTER COLUMN "bateauId" DROP NOT NULL;

-- 2. Backfill : copier le clientId depuis le bateau lié
UPDATE "Devis" d
SET "clientId" = b."clientId"
FROM "Bateau" b
WHERE d."bateauId" = b."id"
  AND d."clientId" IS NULL;

-- 3. Passer clientId en NOT NULL (la contrainte définitive)
ALTER TABLE "Devis" ALTER COLUMN "clientId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Devis_clientId_idx" ON "Devis"("clientId");

-- AddForeignKey clientId (RESTRICT : on ne peut pas supprimer un client qui a des devis)
ALTER TABLE "Devis" ADD CONSTRAINT "Devis_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey bateauId (SET NULL : si on supprime le bateau, le devis reste mais perd son rattachement)
ALTER TABLE "Devis" ADD CONSTRAINT "Devis_bateauId_fkey" FOREIGN KEY ("bateauId") REFERENCES "Bateau"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

---

## Commandes Prisma utilisées

```bash
# Génération d'une migration (dev local)
npx prisma migrate dev --name nom_de_la_migration

# Application en production (Railway)
npx prisma migrate deploy

# Régénération du client TypeScript après modif du schéma
npx prisma generate

# Visualisation de la base via interface web
npx prisma studio
# → http://localhost:5555
```

---

## Avantages du couple Prisma + migrations versionnées

- **Source unique de vérité** : `schema.prisma` décrit la structure.
- **Migrations reproductibles** : chaque modification du schéma génère un fichier `.sql` versionné.
- **Versioning Git** : on peut retracer l'évolution complète du modèle de données.
- **Type-safety** : Prisma génère un client TypeScript typé automatiquement, supprimant toute classe d'erreurs à la compilation.
- **Aucune requête SQL écrite à la main** : pas de risque d'injection SQL, requêtes paramétrées par défaut.
- **Déploiement automatisé** : la commande `prisma migrate deploy` est intégrée au pipeline Railway (CD).
