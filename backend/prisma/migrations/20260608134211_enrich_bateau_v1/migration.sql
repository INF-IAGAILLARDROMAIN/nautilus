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
