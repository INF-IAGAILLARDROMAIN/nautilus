# Schéma Prisma complet — MLD physique de Nautilus

> **Modèle Logique de Données (MLD)** — fichier source unique de vérité versionné Git.
> Ce fichier décrit l'intégralité des tables PostgreSQL, leurs colonnes, types, contraintes et relations.
> Prisma transforme ce schéma en SQL natif via la commande `prisma migrate dev`.

📂 **Source** : `backend/prisma/schema.prisma` (223 lignes)

---

## Configuration du générateur et de la source de données

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

- **provider client** : `prisma-client-js` génère automatiquement un client TypeScript type-safe.
- **datasource** : PostgreSQL hébergé sur Neon (région Frankfurt, UE).
- **DATABASE_URL** : injectée via variable d'environnement (jamais commitée).

---

## Énumérations PostgreSQL

```prisma
enum TypeClient {
  PARTICULIER
  PROFESSIONNEL
}

enum StatutDevis {
  BROUILLON
  ENVOYE
  VALIDE   // → déclenche la création d'un OR
  REFUSE
}

enum TypeOR {
  ENTRETIEN
  REPARATION
  HIVERNAGE
  DESHIVERNAGE
  DEPANNAGE
}

enum UrgenceOR {
  NORMAL
  URGENT
}

enum TypeCoque {
  STRATIFIE      // polyester / composite / fibre de verre (majorité)
  ALUMINIUM      // coque alu rivetée ou soudée
  POLYETHYLENE   // rotomoulé
  SEMI_RIGIDE    // coque rigide + flotteurs gonflables
  PNEUMATIQUE    // 100 % gonflable
  BOIS           // construction traditionnelle (rare)
  ACIER          // très rare en plaisance hors-bord
  AUTRE          // cas non prévu — détail dans notes
}

enum StatutOR {
  CREE
  EN_COURS
  TERMINE
  FACTURE  // → génère le PDF Facture
}
```

> **6 énumérations** typées par PostgreSQL natif. Avantage : impossibilité d'insérer une valeur invalide, lisibilité des données dans la BDD, performance (stockage en `int` interne).

---

## Modèle Client

```prisma
/// Un client (particulier ou professionnel) de l'atelier nautique.
model Client {
  id         String     @id @default(cuid())
  nom        String
  prenom     String
  email      String?    @unique
  telephone  String?
  adresse    String?
  codePostal String?    @db.VarChar(10)
  ville      String?    @db.VarChar(100)
  notes      String?    @db.Text
  type       TypeClient @default(PARTICULIER)

  bateaux    Bateau[]
  /// Devis liés au client (relation directe, indépendamment du bateau).
  devis      Devis[]

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([nom, prenom])
}
```

**Points clés :**
- `id` en `cuid()` — collision-resistant, lexicalement triable, plus court qu'un UUID.
- `email` nullable mais `@unique` — un email = un client max ; nullable permet la création sans email.
- `codePostal VarChar(10)` — large pour gérer les codes étrangers.
- `ville VarChar(100)` — large pour les noms longs.
- `notes Text` — pas de limite de taille pour annotations libres.
- Index composite `(nom, prenom)` — optimise les recherches du moteur IA.

---

## Modèle Bateau

```prisma
/// Un bateau appartenant à un client. Un client peut avoir plusieurs bateaux.
model Bateau {
  id              String     @id @default(cuid())
  /// Surnom donné par le propriétaire (ex: "Le Petit Bleu"). Optionnel.
  nom             String?    @db.VarChar(60)
  /// Marque constructeur de la COQUE (Bénéteau, Quicksilver, Zodiac…).
  marque          String
  /// Modèle de la coque (Antares 7, Activ 605…).
  modele          String
  /// Matériau / type de coque (stratifiée, aluminium, semi-rigide, etc.).
  typeCoque       TypeCoque  @default(STRATIFIE)
  /// Immatriculation française (Affaires Maritimes), optionnelle (ex: AY-67890).
  immatriculation String?    @db.VarChar(20)
  annee           Int?
  notes           String?    @db.Text

  // === MOTORISATION (V1 : 1 moteur par bateau dans la même table) ===
  // V2 prévue : extraire en entité Moteur séparée avec relation 1:N.
  marqueMoteur    String?
  modeleMoteur    String?
  /// Numéro de plaque / série du moteur — identifiant terrain UNIQUE.
  plaqueMoteur    String?    @unique
  puissanceCV     Int?
  helice          String?    @db.VarChar(100)

  clientId String
  client   Client @relation(fields: [clientId], references: [id], onDelete: Cascade)

  devis Devis[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([clientId])
  @@index([marque, modele])
  @@index([marqueMoteur])
}
```

**Points clés :**
- `plaqueMoteur @unique` — un moteur = un bateau unique. PostgreSQL accepte plusieurs `NULL` avec une contrainte UNIQUE, donc beaucoup de bateaux peuvent ne pas avoir de plaque renseignée.
- `clientId` avec `onDelete: Cascade` — supprimer un client supprime ses bateaux automatiquement.
- 3 index : `clientId`, `(marque, modele)`, `marqueMoteur` — couvrent les 3 cas d'usage de recherche IA.

---

## Modèle Devis

```prisma
/// Devis = chiffrage proposé au client AVANT le travail.
model Devis {
  id          String      @id @default(cuid())
  /// Numéro de devis lisible : DEV-AAAA-XXXX (généré à la création).
  numeroDevis String      @unique
  description String?
  totalHT     Decimal     @db.Decimal(10, 2) @default(0)
  tauxTVA     Decimal     @db.Decimal(5, 2)  @default(20.00)
  totalTTC    Decimal     @db.Decimal(10, 2) @default(0)
  statut      StatutDevis @default(BROUILLON)

  dateValidite      DateTime?
  modalitesPaiement String? @db.Text

  /// Client destinataire — OBLIGATOIRE.
  clientId String
  client   Client @relation(fields: [clientId], references: [id], onDelete: Restrict)

  /// Bateau concerné — facultatif (devis pré-vente / pièces génériques).
  bateauId String?
  bateau   Bateau? @relation(fields: [bateauId], references: [id], onDelete: SetNull)

  lignes            LigneDevis[]
  ordreReparation   OrdreReparation?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([clientId])
  @@index([bateauId])
  @@index([statut])
}
```

**Points clés :**
- `Decimal(10,2)` pour les montants — précision financière (pas de Float qui causerait des arrondis).
- `tauxTVA Decimal(5,2)` — permet 99.99% max, avec 2 décimales (valeurs comme 5.50%, 10.00%, 20.00%).
- `clientId` avec `onDelete: Restrict` — impossible de supprimer un client ayant des devis (intégrité historique).
- `bateauId` avec `onDelete: SetNull` — supprimer un bateau ne casse pas le devis (orphelin OK pour l'historique).

---

## Modèle LigneDevis

```prisma
/// Une ligne de devis (pièce ou main-d'œuvre).
model LigneDevis {
  id          String  @id @default(cuid())
  description String
  quantite    Decimal @db.Decimal(10, 2) @default(1)
  prixUnitaireHT Decimal @db.Decimal(10, 2)
  totalLigneHT   Decimal @db.Decimal(10, 2)

  devisId String
  devis   Devis  @relation(fields: [devisId], references: [id], onDelete: Cascade)

  ordre Int @default(0) // pour conserver l'ordre d'affichage

  @@index([devisId])
}
```

**Points clés :**
- `quantite Decimal(10,2)` — permet des quantités fractionnaires (ex: 1.5h de main-d'œuvre).
- `onDelete: Cascade` — supprimer un devis supprime automatiquement toutes ses lignes.
- `ordre` — préserve l'ordre d'affichage défini par le chef d'atelier.

---

## Modèle OrdreReparation

```prisma
/// Ordre de Réparation = le travail effectivement à faire, créé après validation du devis.
model OrdreReparation {
  id            String       @id @default(cuid())
  description   String?
  type          TypeOR       @default(REPARATION)
  urgence       UrgenceOR    @default(NORMAL)
  mecano        String?      // nom du mécano (champ libre — pas de table Mécano en MVP)
  statut        StatutOR     @default(CREE)
  /// Numéro de facture lisible : FAC-AAAA-XXXX (généré quand statut = FACTURE).
  numeroFacture String?      @unique

  devisId String @unique
  devis   Devis  @relation(fields: [devisId], references: [id], onDelete: Restrict)

  dateDebut DateTime?
  dateFin   DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("ordre_reparation")
  @@index([statut])
  @@index([mecano])
}
```

**Points clés :**
- `devisId @unique` — force une relation 1:1 stricte entre un Devis et son OR.
- `numeroFacture @unique` — pas de doublon, nullable car généré uniquement au passage en FACTURE.
- `@@map("ordre_reparation")` — la table SQL s'appelle `ordre_reparation` (snake_case) bien que le modèle Prisma soit `OrdreReparation` (PascalCase). Évite le conflit avec le mot-clé Prisma `OR` (opérateur logique).
- `mecano String?` — champ libre car la V1 examen n'a pas de table Mécano séparée (un seul rôle utilisateur).

---

## Récap — choix de conception assumés

| Décision | Motivation |
|---|---|
| **`cuid()` partout** au lieu d'UUID | Plus court, lexicalement triable, collision-resistant |
| **Pas de table Facture** | C'est un PDF généré à la volée — économie d'une table sans perte fonctionnelle |
| **`mecano` en champ libre** | V1 mono-utilisateur, pas de table Mécano (V2 prévue) |
| **Énumérations natives** | Performance + lisibilité + intégrité forte |
| **`Decimal(10,2)` pour les prix** | Précision financière (évite les arrondis de `Float`) |
| **Cascade DELETE sur Bateau→Client** | Supprimer un client nettoie ses bateaux (orphelins = bugs) |
| **Restrict DELETE sur Devis→Client** | Préserve l'historique de facturation |
| **SetNull DELETE sur Devis→Bateau** | Le devis pré-vente reste, même si le bateau est supprimé |
| **Index `(marqueMoteur)` sur Bateau** | Performance des recherches IA `list_bateaux_by_moteur` |

---

## Workflow Prisma

```bash
# 1. Modifier ce fichier (schema.prisma)

# 2. Créer une migration (dev)
npx prisma migrate dev --name nom_de_la_migration

# 3. Régénérer le client TypeScript
npx prisma generate

# 4. Appliquer en production
npx prisma migrate deploy

# 5. Visualiser via studio web
npx prisma studio
```

> Le fichier `prisma/migrations/<timestamp>_<name>/migration.sql` contient le SQL natif PostgreSQL généré automatiquement. C'est ce qui est appliqué en production sur Neon.
