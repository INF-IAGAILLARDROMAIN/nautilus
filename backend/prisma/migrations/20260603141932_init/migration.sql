/*
  Warnings:

  - You are about to drop the `OR` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OR" DROP CONSTRAINT "OR_devisId_fkey";

-- DropTable
DROP TABLE "OR";

-- CreateTable
CREATE TABLE "ordre_reparation" (
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

    CONSTRAINT "ordre_reparation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ordre_reparation_numeroFacture_key" ON "ordre_reparation"("numeroFacture");

-- CreateIndex
CREATE UNIQUE INDEX "ordre_reparation_devisId_key" ON "ordre_reparation"("devisId");

-- CreateIndex
CREATE INDEX "ordre_reparation_statut_idx" ON "ordre_reparation"("statut");

-- CreateIndex
CREATE INDEX "ordre_reparation_mecano_idx" ON "ordre_reparation"("mecano");

-- AddForeignKey
ALTER TABLE "ordre_reparation" ADD CONSTRAINT "ordre_reparation_devisId_fkey" FOREIGN KEY ("devisId") REFERENCES "Devis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
