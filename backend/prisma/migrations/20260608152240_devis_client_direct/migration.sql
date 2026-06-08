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
