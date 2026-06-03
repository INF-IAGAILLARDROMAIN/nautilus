// =============================================================================
// MOCKS — données factices pour le développement du front (avant branchement API)
// Périmètre Option B : Client → Bateau → Devis → OR.
// La Facture n'est PAS une entité — c'est un PDF généré à partir d'un OR au
// statut "facturé". Les mocks "factures" ci-dessous représentent donc des OR
// dont le statut est passé à "facturé" (vue d'affichage).
// =============================================================================

export interface Intervenant {
  nom: string;
  date: string;
  intervention: string;
}

/** Historique des intervenants par bateau (avant le dernier en cours). */
export const historiqueParBateau: Record<string, Intervenant[]> = {
  "Le Mistral": [
    { nom: "Romain", date: "12/01/2026", intervention: "Réparation" },
  ],
  "La Brise": [
    { nom: "Pierre", date: "15/12/2025", intervention: "Diagnostic" },
    { nom: "Marc", date: "10/09/2025", intervention: "Pose instrument" },
  ],
  "L'Échappée": [
    { nom: "Romain", date: "20/08/2025", intervention: "Entretien moteur" },
  ],
  "Le Phoenix": [
    { nom: "Marc", date: "15/02/2026", intervention: "Réparation" },
  ],
  "Le Vent du Sud": [
    { nom: "Pierre", date: "05/04/2026", intervention: "Pose instrument" },
  ],
  "Sea Princess": [
    { nom: "Marc", date: "20/11/2025", intervention: "Hivernage" },
  ],
};

// =============================================================================
// ORDRES DE RÉPARATION (OR)
// =============================================================================

export type OrStatus =
  | "CREE"
  | "EN_COURS"
  | "TERMINE"
  | "FACTURE";

export interface Ordre {
  id: string;
  numero: string;
  bateau: string;
  client: string;
  type: string;
  status: OrStatus;
  mecano?: string;
  dateCreation: string;
  dateLivraisonPrevue?: string;
  montantHT?: number;
  numeroFacture?: string;
}

export const ordres: Ordre[] = [
  {
    id: "or-0142",
    numero: "OR-2026-0142",
    bateau: "Le Mistral",
    client: "M. Dupont",
    type: "Hivernage",
    status: "EN_COURS",
    mecano: "Pierre",
    dateCreation: "22/05/2026",
    dateLivraisonPrevue: "30/05/2026",
    montantHT: 1280,
  },
  {
    id: "or-0139",
    numero: "OR-2026-0139",
    bateau: "Petit Bleu",
    client: "M. Petit",
    type: "Entretien moteur",
    status: "EN_COURS",
    mecano: "Romain",
    dateCreation: "20/05/2026",
    dateLivraisonPrevue: "25/05/2026",
    montantHT: 540,
  },
  {
    id: "or-0140",
    numero: "OR-2026-0140",
    bateau: "L'Échappée",
    client: "M. Bernard",
    type: "Entretien moteur",
    status: "TERMINE",
    mecano: "Marc",
    dateCreation: "18/05/2026",
    montantHT: 780,
  },
  {
    id: "or-0136",
    numero: "OR-2026-0136",
    bateau: "Sea Princess",
    client: "Mme Léa",
    type: "Hivernage",
    status: "FACTURE",
    mecano: "Pierre",
    dateCreation: "12/11/2025",
    montantHT: 1450,
    numeroFacture: "FAC-2026-0156",
  },
];

// =============================================================================
// DEVIS
// =============================================================================

export type DevisStatus = "BROUILLON" | "ENVOYE" | "VALIDE" | "REFUSE";

export interface Devis {
  id: string;
  numero: string;
  bateau: string;
  client: string;
  objet: string;
  status: DevisStatus;
  dateEnvoi?: string;
  dateValiditeFin?: string;
  montantHT: number;
  montantTTC: number;
  orLie?: string;
}

export const devis: Devis[] = [
  {
    id: "d-0084",
    numero: "DEV-2026-0084",
    bateau: "Le Mistral",
    client: "M. Dupont",
    objet: "Hivernage complet",
    status: "ENVOYE",
    dateEnvoi: "22/05/2026",
    dateValiditeFin: "21/06/2026",
    montantHT: 1280,
    montantTTC: 1536,
    orLie: "OR-2026-0142",
  },
  {
    id: "d-0083",
    numero: "DEV-2026-0083",
    bateau: "Le Phoenix",
    client: "M. Robert",
    objet: "Diagnostic démarreur électrique",
    status: "ENVOYE",
    dateEnvoi: "20/05/2026",
    dateValiditeFin: "19/06/2026",
    montantHT: 180,
    montantTTC: 216,
  },
  {
    id: "d-0082",
    numero: "DEV-2026-0082",
    bateau: "Petit Bleu",
    client: "M. Petit",
    objet: "Entretien moteur Honda BF40",
    status: "VALIDE",
    dateEnvoi: "18/05/2026",
    montantHT: 540,
    montantTTC: 648,
    orLie: "OR-2026-0139",
  },
  {
    id: "d-0080",
    numero: "DEV-2026-0080",
    bateau: "Sea Princess",
    client: "Mme Léa",
    objet: "Carénage + antifouling complet",
    status: "BROUILLON",
    montantHT: 2400,
    montantTTC: 2880,
  },
  {
    id: "d-0079",
    numero: "DEV-2026-0079",
    bateau: "Le Trident",
    client: "M. Vasseur",
    objet: "Réparation safran cassé",
    status: "REFUSE",
    dateEnvoi: "10/05/2026",
    montantHT: 1850,
    montantTTC: 2220,
  },
];
