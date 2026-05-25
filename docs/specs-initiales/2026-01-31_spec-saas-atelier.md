# 🔧 PROJET : SaaS Gestion Atelier + Bloc Technique IA

## 📋 RÉSUMÉ DU PROJET

Application SaaS complète pour la gestion d'ateliers techniques (mécanique) avec un bloc technique IA différenciant. Le système est conçu pour être **multi-sectoriel** : marine, automobile, moto, aviation, agricole, etc.

### Vision produit
- **Socle Atelier** : Gestion universelle (clients, stock, devis, factures, planning, équipe)
- **Bloc Technique IA** : Scan identification, historique machine, prédiction d'usure, alertes maintenance
- **Adaptateurs Sectoriels** : Configuration légère par métier (marine = heures, auto = km, etc.)

### Stack Technique
- **Framework** : Next.js 14+ (App Router)
- **Language** : TypeScript
- **Base de données** : PostgreSQL + Prisma ORM
- **Auth** : NextAuth.js (multi-tenant)
- **UI** : Tailwind CSS + shadcn/ui
- **PWA** : next-pwa (mode offline terrain)
- **IA/OCR** : Tesseract.js ou Google Vision API + Claude/OpenAI API

---

## 🏗️ ARCHITECTURE GLOBALE

```
┌─────────────────────────────────────────────────────────────┐
│                    🏢 SOCLE ATELIER                         │
│                   (Commun tous secteurs)                    │
├─────────────────────────────────────────────────────────────┤
│  👥 Clients  │  📦 Stock  │  📝 Devis  │  💰 Factures      │
│  📅 Planning │  👷 Équipe │  📊 Stats  │  ⚙️ Paramètres    │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                 🔧 BLOC TECHNIQUE (IA)                      │
│   Scanner │ Historique │ Prédiction │ Alertes │ Pièces     │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌────────┬────────┼────────┬────────┐
        ▼        ▼        ▼        ▼        ▼
   🚤 Marine  🚗 Auto  🏍️ Moto  ✈️ Avion  🚜 Agri
```

---

## 📊 SCHÉMA BASE DE DONNÉES (Prisma)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ========================================
// MULTI-TENANT : ORGANISATION
// ========================================

model Organization {
  id          String   @id @default(cuid())
  name        String
  sector      String   // "marine" | "auto" | "moto" | "aviation" | "agri"
  logo        String?
  email       String?
  phone       String?
  address     String?
  siret       String?
  vatNumber   String?
  
  // Configuration sectorielle (JSON flexible)
  sectorConfig Json?   // Stocke l'adaptateur sectoriel
  
  // Relations
  users       User[]
  clients     Client[]
  machines    Machine[]
  parts       Part[]
  suppliers   Supplier[]
  documents   Document[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ========================================
// UTILISATEURS & AUTHENTIFICATION
// ========================================

model User {
  id             String        @id @default(cuid())
  orgId          String
  org            Organization  @relation(fields: [orgId], references: [id], onDelete: Cascade)
  
  email          String        @unique
  name           String
  password       String        // Hash bcrypt
  role           Role          @default(TECH)
  avatar         String?
  active         Boolean       @default(true)
  
  // Relations
  interventions  Intervention[] @relation("TechnicianInterventions")
  createdInterventions Intervention[] @relation("CreatorInterventions")
  
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  
  @@index([orgId])
}

enum Role {
  ADMIN      // Accès total
  MANAGER    // Gestion sans paramètres critiques
  TECH       // Interventions uniquement
  RECEPTION  // Clients, devis, planning (lecture)
}

// ========================================
// CLIENTS
// ========================================

model Client {
  id          String    @id @default(cuid())
  orgId       String
  org         Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  
  // Infos de base
  type        ClientType @default(INDIVIDUAL)
  name        String
  company     String?    // Si professionnel
  email       String?
  phone       String?
  mobile      String?
  address     String?
  city        String?
  postalCode  String?
  country     String     @default("France")
  
  // Infos complémentaires
  siret       String?
  vatNumber   String?
  notes       String?
  tags        String[]   // Tags libres pour catégoriser
  
  // Relations
  machines    Machine[]
  documents   Document[]
  appointments Appointment[]
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([orgId])
  @@index([name])
}

enum ClientType {
  INDIVIDUAL    // Particulier
  PROFESSIONAL  // Professionnel
}

// ========================================
// MACHINES (Moteurs, Véhicules, etc.)
// ========================================

model Machine {
  id            String    @id @default(cuid())
  orgId         String
  org           Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  clientId      String
  client        Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)
  
  // Identification universelle
  identifier    String    // Plaque moteur, VIN, N° série, IMO...
  identifierType String   // "plate" | "vin" | "serial" | "imo"
  
  // Infos générales
  brand         String
  model         String
  year          Int?
  serialNumber  String?
  photo         String?
  
  // Données d'usage (bloc technique)
  currentUsage  Int       @default(0)  // Heures ou km selon secteur
  usageUnit     String    @default("hours") // "hours" | "km" | "cycles"
  lastUsageUpdate DateTime?
  
  // Données spécifiques secteur (JSON flexible)
  sectorData    Json?     
  // Exemple marine: { corrosionLevel: "low", propellerType: "3-blade", winterized: false }
  // Exemple auto: { tireSize: "205/55R16", fuelType: "diesel", transmission: "manual" }
  
  // Statut
  status        MachineStatus @default(ACTIVE)
  notes         String?
  
  // Relations
  interventions Intervention[]
  alerts        Alert[]
  maintenancePlans MachineMaintenance[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@unique([orgId, identifier])
  @@index([orgId])
  @@index([clientId])
}

enum MachineStatus {
  ACTIVE
  IN_REPAIR
  INACTIVE
  SOLD
}

// ========================================
// INTERVENTIONS
// ========================================

model Intervention {
  id             String   @id @default(cuid())
  orgId          String
  
  // Relations principales
  machineId      String
  machine        Machine  @relation(fields: [machineId], references: [id], onDelete: Cascade)
  techId         String?
  tech           User?    @relation("TechnicianInterventions", fields: [techId], references: [id])
  createdById    String
  createdBy      User     @relation("CreatorInterventions", fields: [createdById], references: [id])
  
  // Données intervention
  type           InterventionType @default(REPAIR)
  title          String
  description    String?
  
  // Usage machine au moment de l'intervention
  usageAtStart   Int?      // Heures/km au début
  usageAtEnd     Int?      // Heures/km à la fin (si connu)
  
  // Timing
  status         InterventionStatus @default(PLANNED)
  scheduledAt    DateTime?
  startedAt      DateTime?
  completedAt    DateTime?
  estimatedDuration Int?   // Minutes estimées
  actualDuration Int?      // Minutes réelles
  
  // Contenu
  notes          String?
  internalNotes  String?   // Notes internes (non visibles client)
  photos         String[]  // URLs des photos
  
  // Relations
  tasks          Task[]
  partsUsed      PartUsage[]
  document       Document?
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@index([orgId])
  @@index([machineId])
  @@index([status])
}

enum InterventionType {
  MAINTENANCE    // Entretien préventif
  REPAIR         // Réparation
  DIAGNOSTIC     // Diagnostic seul
  INSPECTION     // Contrôle / inspection
  INSTALLATION   // Installation équipement
  WINTERIZATION  // Hivernage (marine)
  COMMISSIONING  // Mise en service
}

enum InterventionStatus {
  PLANNED        // Planifiée
  WAITING_PARTS  // En attente de pièces
  IN_PROGRESS    // En cours
  ON_HOLD        // En pause
  COMPLETED      // Terminée
  INVOICED       // Facturée
  CANCELLED      // Annulée
}

model Task {
  id             String       @id @default(cuid())
  interventionId String
  intervention   Intervention @relation(fields: [interventionId], references: [id], onDelete: Cascade)
  
  description    String
  estimatedTime  Int?         // Minutes
  actualTime     Int?         // Minutes
  completed      Boolean      @default(false)
  completedAt    DateTime?
  order          Int          @default(0)
  
  createdAt      DateTime     @default(now())
}

// ========================================
// STOCK & PIÈCES
// ========================================

model Part {
  id              String      @id @default(cuid())
  orgId           String
  org             Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  
  // Identification
  reference       String      // Référence fabricant
  internalRef     String?     // Référence interne
  barcode         String?     // Code-barres EAN
  name            String
  description     String?
  category        String?     // Catégorie libre
  
  // Prix
  buyPrice        Float       @default(0)
  sellPrice       Float       @default(0)
  vatRate         Float       @default(20)
  
  // Stock
  stockQuantity   Int         @default(0)
  stockMin        Int         @default(0)  // Seuil alerte
  stockLocation   String?     // Emplacement physique
  
  // Fournisseur
  supplierId      String?
  supplier        Supplier?   @relation(fields: [supplierId], references: [id])
  supplierRef     String?     // Référence chez le fournisseur
  
  // Compatibilité (bloc technique)
  compatibleWith  Json?       // { brands: ["Suzuki"], models: ["DF115", "DF140"], years: [2015, 2020] }
  
  // Relations
  usages          PartUsage[]
  movements       StockMovement[]
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@unique([orgId, reference])
  @@index([orgId])
  @@index([category])
}

model PartUsage {
  id             String       @id @default(cuid())
  partId         String
  part           Part         @relation(fields: [partId], references: [id])
  interventionId String
  intervention   Intervention @relation(fields: [interventionId], references: [id], onDelete: Cascade)
  
  quantity       Float
  unitPrice      Float        // Prix au moment de l'utilisation
  discount       Float        @default(0) // Remise en %
  
  createdAt      DateTime     @default(now())
}

model StockMovement {
  id          String        @id @default(cuid())
  partId      String
  part        Part          @relation(fields: [partId], references: [id], onDelete: Cascade)
  
  type        MovementType
  quantity    Int           // Positif = entrée, négatif = sortie
  reason      String?
  reference   String?       // N° commande, n° intervention, etc.
  
  createdAt   DateTime      @default(now())
}

enum MovementType {
  PURCHASE      // Achat fournisseur
  SALE          // Vente / utilisation intervention
  ADJUSTMENT    // Ajustement inventaire
  RETURN        // Retour
  TRANSFER      // Transfert (si multi-sites)
}

model Supplier {
  id           String   @id @default(cuid())
  orgId        String
  org          Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  
  name         String
  contact      String?
  email        String?
  phone        String?
  address      String?
  website      String?
  notes        String?
  
  // Conditions
  paymentTerms String?  // "30 jours", "comptant", etc.
  deliveryTime Int?     // Jours de livraison moyen
  
  parts        Part[]
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@index([orgId])
}

// ========================================
// DOCUMENTS (Devis & Factures)
// ========================================

model Document {
  id             String       @id @default(cuid())
  orgId          String
  org            Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  
  // Type et numérotation
  type           DocumentType
  number         String       // DEVIS-2024-001, FAC-2024-001
  
  // Relations
  clientId       String
  client         Client       @relation(fields: [clientId], references: [id])
  interventionId String?      @unique
  intervention   Intervention? @relation(fields: [interventionId], references: [id])
  
  // Statut
  status         DocumentStatus @default(DRAFT)
  
  // Dates
  date           DateTime     @default(now())
  validUntil     DateTime?    // Pour devis
  dueDate        DateTime?    // Pour factures
  
  // Montants (calculés)
  totalHT        Float        @default(0)
  totalVAT       Float        @default(0)
  totalTTC       Float        @default(0)
  discount       Float        @default(0) // Remise globale
  
  // Infos complémentaires
  notes          String?      // Notes visibles client
  internalNotes  String?
  terms          String?      // Conditions générales
  
  // PDF généré
  pdfUrl         String?
  
  // Relations
  lines          DocumentLine[]
  payments       Payment[]
  
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  sentAt         DateTime?
  
  @@unique([orgId, type, number])
  @@index([orgId])
  @@index([clientId])
  @@index([status])
}

enum DocumentType {
  QUOTE          // Devis
  INVOICE        // Facture
  CREDIT_NOTE    // Avoir
}

enum DocumentStatus {
  DRAFT          // Brouillon
  SENT           // Envoyé
  ACCEPTED       // Accepté (devis)
  REJECTED       // Refusé (devis)
  PAID           // Payé (facture)
  PARTIAL        // Partiellement payé
  OVERDUE        // En retard
  CANCELLED      // Annulé
}

model DocumentLine {
  id          String   @id @default(cuid())
  documentId  String
  document    Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  
  type        LineType @default(SERVICE)
  description String
  quantity    Float    @default(1)
  unit        String   @default("u") // "u", "h", "km", "L", etc.
  unitPrice   Float
  vatRate     Float    @default(20)
  discount    Float    @default(0)
  
  // Référence pièce (optionnel)
  partRef     String?
  
  order       Int      @default(0)
  
  createdAt   DateTime @default(now())
}

enum LineType {
  SERVICE      // Main d'œuvre
  PART         // Pièce
  OTHER        // Autre
}

model Payment {
  id         String        @id @default(cuid())
  documentId String
  document   Document      @relation(fields: [documentId], references: [id], onDelete: Cascade)
  
  amount     Float
  method     PaymentMethod
  reference  String?       // N° chèque, ref virement, etc.
  notes      String?
  
  paidAt     DateTime      @default(now())
}

enum PaymentMethod {
  CASH
  CHECK
  CARD
  TRANSFER
  OTHER
}

// ========================================
// PLANNING & RDV
// ========================================

model Appointment {
  id          String   @id @default(cuid())
  orgId       String
  
  clientId    String?
  client      Client?  @relation(fields: [clientId], references: [id])
  
  title       String
  description String?
  date        DateTime
  duration    Int      @default(60) // Minutes
  
  status      AppointmentStatus @default(SCHEDULED)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([orgId])
  @@index([date])
}

enum AppointmentStatus {
  SCHEDULED
  CONFIRMED
  COMPLETED
  CANCELLED
  NO_SHOW
}

// ========================================
// BLOC TECHNIQUE : ALERTES & MAINTENANCE
// ========================================

model Alert {
  id         String      @id @default(cuid())
  machineId  String
  machine    Machine     @relation(fields: [machineId], references: [id], onDelete: Cascade)
  
  type       String      // "oil_change", "inspection", "belt", etc.
  title      String
  message    String
  priority   AlertPriority @default(MEDIUM)
  
  // Seuil de déclenchement
  triggerUsage Int?      // Se déclenche à X heures/km
  triggerDate  DateTime? // Ou à cette date
  
  // Statut
  status     AlertStatus @default(PENDING)
  dismissedAt DateTime?
  resolvedAt DateTime?
  resolvedBy String?     // Intervention ID qui a résolu
  
  createdAt  DateTime    @default(now())
  
  @@index([machineId])
  @@index([status])
}

enum AlertPriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum AlertStatus {
  PENDING     // En attente
  NOTIFIED    // Client notifié
  SCHEDULED   // RDV pris
  RESOLVED    // Résolu
  DISMISSED   // Ignoré
}

// Plan de maintenance par machine (bloc technique)
model MachineMaintenance {
  id          String   @id @default(cuid())
  machineId   String
  machine     Machine  @relation(fields: [machineId], references: [id], onDelete: Cascade)
  
  taskType    String   // "oil_change", "filter", "impeller", etc.
  name        String
  
  // Intervalle
  intervalUsage Int?   // Tous les X heures/km
  intervalDays  Int?   // Ou tous les X jours
  
  // Dernière réalisation
  lastDoneAt    DateTime?
  lastDoneUsage Int?
  
  // Prochaine échéance (calculée)
  nextDueAt     DateTime?
  nextDueUsage  Int?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([machineId])
}
```

---

## 🔌 ADAPTATEURS SECTORIELS

Les adaptateurs configurent le comportement du système selon le secteur d'activité.

### Structure d'un adaptateur

```typescript
// /lib/adapters/types.ts

export interface SectorAdapter {
  // Identité
  sector: string;
  name: string;
  icon: string;
  
  // Unité d'usage
  usageUnit: "hours" | "km" | "cycles" | "miles";
  usageLabel: string;
  
  // Type d'identifiant principal
  identifierType: "plate" | "vin" | "serial" | "imo" | "registration";
  identifierLabel: string;
  identifierPattern?: RegExp;
  
  // Champs spécifiques au secteur
  specificFields: SectorField[];
  
  // Cycles de maintenance par défaut
  maintenanceCycles: MaintenanceCycle[];
  
  // Types d'intervention spécifiques
  interventionTypes?: string[];
  
  // Catégories de pièces
  partCategories?: string[];
}

export interface SectorField {
  key: string;
  label: string;
  type: "string" | "number" | "boolean" | "select" | "date";
  options?: string[]; // Pour type "select"
  required?: boolean;
  defaultValue?: any;
}

export interface MaintenanceCycle {
  key: string;
  name: string;
  interval: number;
  unit: "hours" | "km" | "days" | "months" | "years";
  priority: "low" | "medium" | "high" | "critical";
  parts?: string[]; // Références pièces associées
}
```

### Adaptateur Marine

```typescript
// /lib/adapters/marine.ts

import { SectorAdapter } from "./types";

export const marineAdapter: SectorAdapter = {
  sector: "marine",
  name: "Nautique",
  icon: "⚓",
  
  usageUnit: "hours",
  usageLabel: "Heures moteur",
  
  identifierType: "plate",
  identifierLabel: "Plaque moteur",
  identifierPattern: /^[A-Z0-9]{6,12}$/,
  
  specificFields: [
    {
      key: "engineType",
      label: "Type moteur",
      type: "select",
      options: ["Hors-bord", "In-bord", "Semi-hors-bord", "Pod"],
      required: true
    },
    {
      key: "fuelType",
      label: "Carburant",
      type: "select",
      options: ["Essence", "Diesel", "Électrique", "Hybride"],
      required: true
    },
    {
      key: "power",
      label: "Puissance (CV)",
      type: "number"
    },
    {
      key: "propellerType",
      label: "Type d'hélice",
      type: "string"
    },
    {
      key: "corrosionLevel",
      label: "Niveau corrosion",
      type: "select",
      options: ["Aucune", "Légère", "Moyenne", "Importante"]
    },
    {
      key: "waterType",
      label: "Type d'eau",
      type: "select",
      options: ["Eau de mer", "Eau douce", "Mixte"]
    },
    {
      key: "winterized",
      label: "Hiverné",
      type: "boolean",
      defaultValue: false
    },
    {
      key: "lastWinterization",
      label: "Dernier hivernage",
      type: "date"
    }
  ],
  
  maintenanceCycles: [
    {
      key: "oil_change",
      name: "Vidange huile moteur",
      interval: 100,
      unit: "hours",
      priority: "high",
      parts: ["huile_moteur", "filtre_huile"]
    },
    {
      key: "gear_oil",
      name: "Huile d'embase",
      interval: 100,
      unit: "hours",
      priority: "high",
      parts: ["huile_embase"]
    },
    {
      key: "impeller",
      name: "Turbine pompe à eau",
      interval: 300,
      unit: "hours",
      priority: "critical",
      parts: ["turbine", "joint_turbine"]
    },
    {
      key: "spark_plugs",
      name: "Bougies d'allumage",
      interval: 300,
      unit: "hours",
      priority: "medium",
      parts: ["bougie"]
    },
    {
      key: "fuel_filter",
      name: "Filtre à carburant",
      interval: 200,
      unit: "hours",
      priority: "medium",
      parts: ["filtre_carburant"]
    },
    {
      key: "anodes",
      name: "Anodes anticorrosion",
      interval: 1,
      unit: "years",
      priority: "high",
      parts: ["anode_zinc", "anode_trim"]
    },
    {
      key: "belt",
      name: "Courroie distribution",
      interval: 1000,
      unit: "hours",
      priority: "critical",
      parts: ["courroie"]
    },
    {
      key: "thermostat",
      name: "Thermostat",
      interval: 500,
      unit: "hours",
      priority: "medium",
      parts: ["thermostat", "joint_thermostat"]
    },
    {
      key: "winterization",
      name: "Hivernage complet",
      interval: 1,
      unit: "years",
      priority: "high"
    }
  ],
  
  interventionTypes: [
    "Entretien périodique",
    "Réparation",
    "Hivernage",
    "Remise en service",
    "Diagnostic",
    "Garantie"
  ],
  
  partCategories: [
    "Filtration",
    "Lubrification",
    "Allumage",
    "Refroidissement",
    "Transmission",
    "Électricité",
    "Carrosserie",
    "Hélices"
  ]
};
```

### Adaptateur Auto

```typescript
// /lib/adapters/auto.ts

import { SectorAdapter } from "./types";

export const autoAdapter: SectorAdapter = {
  sector: "auto",
  name: "Automobile",
  icon: "🚗",
  
  usageUnit: "km",
  usageLabel: "Kilométrage",
  
  identifierType: "vin",
  identifierLabel: "Numéro VIN",
  identifierPattern: /^[A-HJ-NPR-Z0-9]{17}$/,
  
  specificFields: [
    {
      key: "fuelType",
      label: "Carburant",
      type: "select",
      options: ["Essence", "Diesel", "Électrique", "Hybride", "GPL", "E85"],
      required: true
    },
    {
      key: "transmission",
      label: "Transmission",
      type: "select",
      options: ["Manuelle", "Automatique", "Robotisée"]
    },
    {
      key: "power",
      label: "Puissance (CV)",
      type: "number"
    },
    {
      key: "engineSize",
      label: "Cylindrée (L)",
      type: "number"
    },
    {
      key: "tireSize",
      label: "Dimension pneus",
      type: "string"
    },
    {
      key: "color",
      label: "Couleur",
      type: "string"
    },
    {
      key: "registration",
      label: "Immatriculation",
      type: "string"
    },
    {
      key: "firstRegistration",
      label: "Date 1ère immat.",
      type: "date"
    },
    {
      key: "nextInspection",
      label: "Prochain CT",
      type: "date"
    }
  ],
  
  maintenanceCycles: [
    {
      key: "oil_change",
      name: "Vidange huile moteur",
      interval: 15000,
      unit: "km",
      priority: "high",
      parts: ["huile_moteur", "filtre_huile"]
    },
    {
      key: "air_filter",
      name: "Filtre à air",
      interval: 30000,
      unit: "km",
      priority: "medium",
      parts: ["filtre_air"]
    },
    {
      key: "cabin_filter",
      name: "Filtre habitacle",
      interval: 20000,
      unit: "km",
      priority: "low",
      parts: ["filtre_habitacle"]
    },
    {
      key: "brake_pads_front",
      name: "Plaquettes frein avant",
      interval: 30000,
      unit: "km",
      priority: "critical",
      parts: ["plaquettes_avant"]
    },
    {
      key: "brake_pads_rear",
      name: "Plaquettes frein arrière",
      interval: 50000,
      unit: "km",
      priority: "critical",
      parts: ["plaquettes_arriere"]
    },
    {
      key: "timing_belt",
      name: "Kit distribution",
      interval: 100000,
      unit: "km",
      priority: "critical",
      parts: ["kit_distribution"]
    },
    {
      key: "spark_plugs",
      name: "Bougies d'allumage",
      interval: 60000,
      unit: "km",
      priority: "medium",
      parts: ["bougie"]
    },
    {
      key: "coolant",
      name: "Liquide de refroidissement",
      interval: 2,
      unit: "years",
      priority: "medium",
      parts: ["liquide_refroidissement"]
    },
    {
      key: "brake_fluid",
      name: "Liquide de frein",
      interval: 2,
      unit: "years",
      priority: "high",
      parts: ["liquide_frein"]
    },
    {
      key: "technical_inspection",
      name: "Contrôle technique",
      interval: 2,
      unit: "years",
      priority: "critical"
    }
  ],
  
  interventionTypes: [
    "Entretien périodique",
    "Réparation mécanique",
    "Réparation carrosserie",
    "Diagnostic électronique",
    "Pneumatiques",
    "Climatisation",
    "Pré-contrôle technique",
    "Garantie"
  ],
  
  partCategories: [
    "Filtration",
    "Lubrification",
    "Freinage",
    "Distribution",
    "Allumage",
    "Refroidissement",
    "Électricité",
    "Échappement",
    "Suspension",
    "Direction",
    "Pneumatiques"
  ]
};
```

### Adaptateur Moto

```typescript
// /lib/adapters/moto.ts

import { SectorAdapter } from "./types";

export const motoAdapter: SectorAdapter = {
  sector: "moto",
  name: "Moto",
  icon: "🏍️",
  
  usageUnit: "km",
  usageLabel: "Kilométrage",
  
  identifierType: "vin",
  identifierLabel: "Numéro VIN",
  identifierPattern: /^[A-HJ-NPR-Z0-9]{17}$/,
  
  specificFields: [
    {
      key: "category",
      label: "Catégorie",
      type: "select",
      options: ["Roadster", "Sportive", "Trail", "Custom", "Routière", "Scooter", "Cross", "Trial"],
      required: true
    },
    {
      key: "engineSize",
      label: "Cylindrée (cm³)",
      type: "number",
      required: true
    },
    {
      key: "power",
      label: "Puissance (CV)",
      type: "number"
    },
    {
      key: "registration",
      label: "Immatriculation",
      type: "string"
    },
    {
      key: "tireFront",
      label: "Pneu avant",
      type: "string"
    },
    {
      key: "tireRear",
      label: "Pneu arrière",
      type: "string"
    },
    {
      key: "chainSize",
      label: "Dimension chaîne",
      type: "string"
    }
  ],
  
  maintenanceCycles: [
    {
      key: "oil_change",
      name: "Vidange huile moteur",
      interval: 6000,
      unit: "km",
      priority: "high",
      parts: ["huile_moteur", "filtre_huile"]
    },
    {
      key: "chain_kit",
      name: "Kit chaîne",
      interval: 20000,
      unit: "km",
      priority: "high",
      parts: ["kit_chaine"]
    },
    {
      key: "chain_tension",
      name: "Tension / graissage chaîne",
      interval: 1000,
      unit: "km",
      priority: "medium"
    },
    {
      key: "brake_pads_front",
      name: "Plaquettes frein avant",
      interval: 15000,
      unit: "km",
      priority: "critical",
      parts: ["plaquettes_avant"]
    },
    {
      key: "brake_pads_rear",
      name: "Plaquettes frein arrière",
      interval: 20000,
      unit: "km",
      priority: "critical",
      parts: ["plaquettes_arriere"]
    },
    {
      key: "spark_plugs",
      name: "Bougies",
      interval: 12000,
      unit: "km",
      priority: "medium",
      parts: ["bougie"]
    },
    {
      key: "air_filter",
      name: "Filtre à air",
      interval: 15000,
      unit: "km",
      priority: "medium",
      parts: ["filtre_air"]
    },
    {
      key: "coolant",
      name: "Liquide de refroidissement",
      interval: 2,
      unit: "years",
      priority: "medium",
      parts: ["liquide_refroidissement"]
    },
    {
      key: "fork_oil",
      name: "Huile de fourche",
      interval: 20000,
      unit: "km",
      priority: "medium",
      parts: ["huile_fourche"]
    },
    {
      key: "tires",
      name: "Pneumatiques",
      interval: 10000,
      unit: "km",
      priority: "critical",
      parts: ["pneu_avant", "pneu_arriere"]
    }
  ],
  
  interventionTypes: [
    "Entretien périodique",
    "Réparation mécanique",
    "Pneumatiques",
    "Kit chaîne",
    "Diagnostic",
    "Préparation hivernale",
    "Garantie"
  ],
  
  partCategories: [
    "Filtration",
    "Lubrification",
    "Freinage",
    "Transmission",
    "Allumage",
    "Pneumatiques",
    "Suspension",
    "Électricité"
  ]
};
```

### Index des adaptateurs

```typescript
// /lib/adapters/index.ts

import { SectorAdapter } from "./types";
import { marineAdapter } from "./marine";
import { autoAdapter } from "./auto";
import { motoAdapter } from "./moto";

export const adapters: Record<string, SectorAdapter> = {
  marine: marineAdapter,
  auto: autoAdapter,
  moto: motoAdapter,
  // Ajouter aviation, agri, etc.
};

export function getAdapter(sector: string): SectorAdapter {
  const adapter = adapters[sector];
  if (!adapter) {
    throw new Error(`Unknown sector: ${sector}`);
  }
  return adapter;
}

export function getAllAdapters(): SectorAdapter[] {
  return Object.values(adapters);
}

export * from "./types";
```

---

## 📁 STRUCTURE PROJET NEXT.JS

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Sidebar + Header
│   │   ├── page.tsx                # Dashboard home
│   │   │
│   │   ├── clients/
│   │   │   ├── page.tsx            # Liste clients
│   │   │   ├── new/page.tsx        # Nouveau client
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Fiche client
│   │   │       └── edit/page.tsx
│   │   │
│   │   ├── machines/
│   │   │   ├── page.tsx            # Parc machines
│   │   │   ├── new/page.tsx
│   │   │   ├── scan/page.tsx       # Scanner identification
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Fiche machine + historique
│   │   │       ├── edit/page.tsx
│   │   │       └── maintenance/page.tsx  # Plan maintenance
│   │   │
│   │   ├── interventions/
│   │   │   ├── page.tsx            # Liste / Kanban
│   │   │   ├── planning/page.tsx   # Vue calendrier
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Détail intervention
│   │   │       └── edit/page.tsx
│   │   │
│   │   ├── stock/
│   │   │   ├── page.tsx            # Inventaire
│   │   │   ├── new/page.tsx        # Nouvelle pièce
│   │   │   ├── movements/page.tsx  # Mouvements
│   │   │   ├── alerts/page.tsx     # Alertes stock bas
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── suppliers/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   │
│   │   ├── documents/
│   │   │   ├── quotes/
│   │   │   │   ├── page.tsx        # Liste devis
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── invoices/
│   │   │   │   ├── page.tsx        # Liste factures
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── templates/page.tsx
│   │   │
│   │   ├── team/
│   │   │   ├── page.tsx            # Gestion équipe
│   │   │   └── [id]/page.tsx
│   │   │
│   │   ├── alerts/
│   │   │   └── page.tsx            # Toutes les alertes
│   │   │
│   │   ├── stats/
│   │   │   └── page.tsx            # Statistiques
│   │   │
│   │   └── settings/
│   │       ├── page.tsx            # Paramètres généraux
│   │       ├── organization/page.tsx
│   │       ├── sector/page.tsx     # Config sectorielle
│   │       └── billing/page.tsx
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts
│   │   ├── clients/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── machines/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── [id]/alerts/route.ts
│   │   ├── interventions/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── parts/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── documents/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── [id]/pdf/route.ts
│   │   ├── scan/
│   │   │   └── route.ts            # OCR identification
│   │   ├── predict/
│   │   │   └── route.ts            # IA prédiction usure
│   │   └── webhooks/
│   │       └── stripe/route.ts
│   │
│   ├── layout.tsx
│   ├── page.tsx                    # Landing page
│   └── globals.css
│
├── components/
│   ├── ui/                         # shadcn/ui
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── mobile-nav.tsx
│   │   └── user-menu.tsx
│   │
│   ├── forms/
│   │   ├── client-form.tsx
│   │   ├── machine-form.tsx
│   │   ├── intervention-form.tsx
│   │   ├── part-form.tsx
│   │   └── document-form.tsx
│   │
│   ├── tables/
│   │   ├── clients-table.tsx
│   │   ├── machines-table.tsx
│   │   ├── interventions-table.tsx
│   │   └── parts-table.tsx
│   │
│   ├── cards/
│   │   ├── client-card.tsx
│   │   ├── machine-card.tsx
│   │   ├── intervention-card.tsx
│   │   └── alert-card.tsx
│   │
│   ├── dashboard/
│   │   ├── stats-cards.tsx
│   │   ├── recent-interventions.tsx
│   │   ├── alerts-widget.tsx
│   │   └── revenue-chart.tsx
│   │
│   ├── scanner/
│   │   ├── camera-scanner.tsx
│   │   ├── ocr-result.tsx
│   │   └── machine-lookup.tsx
│   │
│   ├── maintenance/
│   │   ├── maintenance-plan.tsx
│   │   ├── wear-indicator.tsx
│   │   └── prediction-card.tsx
│   │
│   └── documents/
│       ├── document-preview.tsx
│       ├── line-editor.tsx
│       └── pdf-viewer.tsx
│
├── lib/
│   ├── db.ts                       # Client Prisma
│   ├── auth.ts                     # Config NextAuth
│   ├── utils.ts                    # Helpers généraux
│   │
│   ├── adapters/
│   │   ├── types.ts
│   │   ├── marine.ts
│   │   ├── auto.ts
│   │   ├── moto.ts
│   │   └── index.ts
│   │
│   ├── services/
│   │   ├── client.service.ts
│   │   ├── machine.service.ts
│   │   ├── intervention.service.ts
│   │   ├── part.service.ts
│   │   ├── document.service.ts
│   │   ├── alert.service.ts
│   │   ├── prediction.service.ts   # IA usure
│   │   └── scanner.service.ts      # OCR
│   │
│   ├── hooks/
│   │   ├── use-organization.ts
│   │   ├── use-adapter.ts
│   │   ├── use-machines.ts
│   │   └── use-interventions.ts
│   │
│   └── validations/
│       ├── client.schema.ts
│       ├── machine.schema.ts
│       ├── intervention.schema.ts
│       └── document.schema.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── public/
│   ├── logo.svg
│   ├── icons/
│   └── images/
│
├── types/
│   ├── index.ts
│   └── next-auth.d.ts
│
├── .env.example
├── .env.local
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🚀 FONCTIONNALITÉS PAR PHASE

### Phase 1 : MVP (8-10 semaines)
- [ ] Auth multi-tenant (NextAuth)
- [ ] CRUD Clients
- [ ] CRUD Machines + champs sectoriels
- [ ] CRUD Interventions basique
- [ ] Dashboard simple
- [ ] 1 adaptateur (Marine)

### Phase 2 : Bloc Technique (6-8 semaines)
- [ ] Scanner OCR (plaque/VIN)
- [ ] Historique machine complet
- [ ] Plan de maintenance par machine
- [ ] Système d'alertes
- [ ] Prédiction usure (IA basique)

### Phase 3 : Gestion complète (6-8 semaines)
- [ ] Stock & inventaire
- [ ] Devis & Factures
- [ ] Génération PDF
- [ ] Emails automatiques
- [ ] Planning / calendrier

### Phase 4 : Multi-secteur (4-6 semaines)
- [ ] Adaptateur Auto
- [ ] Adaptateur Moto
- [ ] Sélection secteur à l'inscription
- [ ] Onboarding personnalisé

### Phase 5 : Avancé (ongoing)
- [ ] Mode offline (PWA)
- [ ] App mobile
- [ ] API publique
- [ ] Intégrations (comptabilité, etc.)
- [ ] Nouveaux secteurs

---

## 💡 NOTES TECHNIQUES

### Multi-tenant
- Chaque `Organization` est isolée
- Toutes les requêtes filtrent par `orgId`
- Middleware vérifie l'appartenance

### Adaptateurs
- Stockés en `sectorConfig` JSON dans Organization
- Permet personnalisation par entreprise
- Nouveaux secteurs = nouveau fichier adaptateur

### Bloc Technique IA
- OCR : Tesseract.js (gratuit) ou Google Vision (précis)
- Prédiction : Calcul basé sur usage réel vs cycles théoriques
- Alertes : Cron job quotidien ou calcul à la volée

### Performance
- Server Components par défaut
- Client Components uniquement si interactivité
- Pagination côté serveur
- Cache avec React Query ou SWR

---

## 📞 CONTACT

Projet initié par : Romain (InfIA)
Secteur initial : Marine (Nautic Sport / Suzuki)
Objectif : SaaS multi-sectoriel scalable

---

*Document généré le 31/01/2026 - Version 1.0*
