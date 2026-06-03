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
