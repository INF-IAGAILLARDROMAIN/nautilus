import type { Alerte } from "@/components/alerte-item";
import type { Mecano } from "@/components/equipe-section";

export interface Intervenant {
  nom: string;
  date: string;
  intervention: string;
}

// Historique des intervenants par bateau (avant le dernier)
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

export const equipe: Mecano[] = [
  {
    id: "m1",
    nom: "Romain Gaillard",
    initiales: "RG",
    niveau: "Senior",
    statut: "actif",
    tel: "+33635251030",
    orActuel: {
      id: "OR-0139",
      bateau: "Honda BF40 — Petit Bleu",
      type: "Entretien moteur",
    },
    orEnAttentePieces: 1,
    orEnAttenteAccord: 0,
    orTotalEnCours: 3,
  },
  {
    id: "m2",
    nom: "Pierre Lefèvre",
    initiales: "PL",
    niveau: "Senior",
    statut: "actif",
    tel: "+33611112233",
    orActuel: {
      id: "OR-0142",
      bateau: "Suzuki DF150 — Le Mistral",
      type: "Hivernage",
    },
    orEnAttentePieces: 1,
    orEnAttenteAccord: 2,
    orTotalEnCours: 4,
  },
  {
    id: "m3",
    nom: "Marc Bernard",
    initiales: "MB",
    niveau: "Junior",
    statut: "actif",
    tel: "+33622334455",
    orActuel: {
      id: "OR-0138",
      bateau: "Yamaha F60 — Stella",
      type: "Pose instrument",
    },
    orEnAttentePieces: 0,
    orEnAttenteAccord: 1,
    orTotalEnCours: 2,
  },
  {
    id: "m4",
    nom: "Sophie Roy",
    initiales: "SR",
    niveau: "Apprenti",
    statut: "conge",
    tel: "+33633445566",
    orEnAttentePieces: 0,
    orEnAttenteAccord: 0,
    orTotalEnCours: 0,
    congeJusquau: "26/05",
  },
];

export const alertes: Alerte[] = [
  {
    id: "a1",
    bateau: "Le Mistral",
    client: "M. Dupont",
    type: "panne",
    prio: "critique",
    message:
      "Bonjour, mon bateau ne démarre plus depuis ce matin. Je suis bloqué au ponton (Port-Haliguen, place P32). Vol pour Marseille demain à 14h, j'aurais besoin que ça soit réglé aujourd'hui si possible. Merci.",
    date: "il y a 25 min",
    arriveeIlYaMin: 25,
    contact: { tel: "+33655667788" },
    dernierIntervenant: {
      nom: "Pierre",
      date: "14/03/2026",
      intervention: "Hivernage",
    },
  },
  {
    id: "a2",
    bateau: "La Brise",
    client: "M. Martin",
    type: "panne",
    prio: "haute",
    message:
      "Salut, mon moteur a calé 3 fois ce week-end en mer. J'ai pu rentrer au moteur de secours mais il faut diagnostiquer. Je sors d'un entretien chez vous il y a 2 mois. Quand pouvez-vous le voir ?",
    date: "il y a 2 h",
    arriveeIlYaMin: 120,
    contact: { tel: "+33611223344" },
    dernierIntervenant: {
      nom: "Romain",
      date: "22/03/2026",
      intervention: "Entretien moteur",
    },
  },
  {
    id: "a3",
    bateau: "Le Phoenix",
    client: "M. Robert",
    type: "panne",
    prio: "haute",
    message:
      "Bonjour, mon démarreur électrique fait un bruit bizarre puis ne tourne plus. J'ai essayé de le démarrer 3 fois, plus rien. Le bateau est à terre dans mon jardin. Quand pouvez-vous passer ?",
    date: "il y a 1 h",
    arriveeIlYaMin: 60,
    contact: { tel: "+33677889900" },
    dernierIntervenant: {
      nom: "Sophie",
      date: "18/04/2026",
      intervention: "Diagnostic",
    },
  },
  {
    id: "a5",
    bateau: "Le Vent du Sud",
    client: "M. Dubois",
    type: "panne",
    prio: "haute",
    message:
      "Bonjour, je rentre tout juste d'une sortie en mer ce matin et au moment de remettre les gaz mon moteur fait un bruit anormal puis fume. J'ai coupé et je suis rentré à la voile. Le bateau est au ponton de Quiberon. Merci de passer rapidement.",
    date: "il y a 30 min",
    arriveeIlYaMin: 30,
    contact: { tel: "+33644556677" },
    dernierIntervenant: {
      nom: "Pierre",
      date: "05/04/2026",
      intervention: "Pose instrument",
    },
  },
  {
    id: "a6",
    bateau: "Sea Princess",
    client: "Mme Léa",
    type: "demande",
    prio: "moyenne",
    message:
      "Bonjour, je voudrais un devis pour un carénage complet de mon bateau avant la saison. Coque + antifouling + anodes. Quand pourriez-vous le sortir de l'eau ? Merci.",
    date: "il y a 1 j",
    arriveeIlYaMin: 1440,
    contact: { tel: "+33688990011" },
    dernierIntervenant: {
      nom: "Marc",
      date: "20/11/2025",
      intervention: "Hivernage",
    },
  },
  {
    id: "a4",
    bateau: "L'Échappée",
    client: "M. Bernard",
    type: "demande",
    prio: "moyenne",
    message:
      "Bonjour, je souhaite remettre mon bateau à l'eau le 1er juin pour la saison. Pouvez-vous planifier le déshivernage svp ? Pack complet. Merci. — Bernard",
    date: "il y a 4 h",
    arriveeIlYaMin: 240,
    contact: { tel: "+33699887766" },
    dernierIntervenant: {
      nom: "Pierre",
      date: "08/11/2025",
      intervention: "Hivernage",
    },
    assigneeName: "Pierre",
  },
];

// ============================================
// ORDRES DE RÉPARATION (OR)
// ============================================

export type OrStatus =
  | "RECU"
  | "ACCEPTE"
  | "EN_PREPARATION"
  | "EN_REPARATION"
  | "LIVRE"
  | "FACTURE"
  | "ANNULE"
  | "URGENCE";

export interface Ordre {
  id: string;
  numero: string;
  bateau: string;
  client: string;
  type: string;
  status: OrStatus;
  tech?: string;
  dateCreation: string;
  dateLivraisonPrevue?: string;
  montantHT?: number;
}

export const ordres: Ordre[] = [
  {
    id: "or-0141",
    numero: "OR-2026-0141",
    bateau: "La Brise",
    client: "M. Martin",
    type: "Dépannage urgent",
    status: "URGENCE",
    tech: "Romain",
    dateCreation: "23/05/2026",
  },
  {
    id: "or-0142",
    numero: "OR-2026-0142",
    bateau: "Le Mistral",
    client: "M. Dupont",
    type: "Hivernage",
    status: "EN_PREPARATION",
    tech: "Pierre",
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
    status: "EN_REPARATION",
    tech: "Romain",
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
    status: "LIVRE",
    tech: "Marc",
    dateCreation: "18/05/2026",
    montantHT: 780,
  },
  {
    id: "or-0138",
    numero: "OR-2026-0138",
    bateau: "Stella",
    client: "Mme Léa",
    type: "Pose instrument",
    status: "EN_REPARATION",
    tech: "Marc",
    dateCreation: "17/05/2026",
    dateLivraisonPrevue: "28/05/2026",
    montantHT: 920,
  },
  {
    id: "or-0137",
    numero: "OR-2026-0137",
    bateau: "Le Phoenix",
    client: "M. Robert",
    type: "Diagnostic",
    status: "ACCEPTE",
    tech: "Pierre",
    dateCreation: "15/05/2026",
    montantHT: 180,
  },
  {
    id: "or-0136",
    numero: "OR-2026-0136",
    bateau: "Sea Princess",
    client: "Mme Léa",
    type: "Hivernage",
    status: "FACTURE",
    tech: "Pierre",
    dateCreation: "12/11/2025",
    montantHT: 1450,
  },
];

// ============================================
// DEVIS
// ============================================

export type DevisStatus = "BROUILLON" | "ENVOYE" | "ACCEPTE" | "REFUSE" | "EXPIRE";

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
    orLie: "OR-2026-0137",
  },
  {
    id: "d-0082",
    numero: "DEV-2026-0082",
    bateau: "Petit Bleu",
    client: "M. Petit",
    objet: "Entretien moteur Honda BF40",
    status: "ACCEPTE",
    dateEnvoi: "18/05/2026",
    montantHT: 540,
    montantTTC: 648,
    orLie: "OR-2026-0139",
  },
  {
    id: "d-0081",
    numero: "DEV-2026-0081",
    bateau: "Stella",
    client: "Mme Léa",
    objet: "Pose sondeur + GPS",
    status: "ACCEPTE",
    dateEnvoi: "15/05/2026",
    montantHT: 920,
    montantTTC: 1104,
    orLie: "OR-2026-0138",
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
  {
    id: "d-0078",
    numero: "DEV-2026-0078",
    bateau: "L'Espadon",
    client: "M. Lefort",
    objet: "Pack hivernage + remise en route",
    status: "EXPIRE",
    dateEnvoi: "15/04/2026",
    dateValiditeFin: "15/05/2026",
    montantHT: 1620,
    montantTTC: 1944,
  },
  {
    id: "d-0077",
    numero: "DEV-2026-0077",
    bateau: "Phoenix II",
    client: "M. Rivière",
    objet: "Remplacement turbine pompe à eau",
    status: "ENVOYE",
    dateEnvoi: "22/05/2026",
    dateValiditeFin: "21/06/2026",
    montantHT: 320,
    montantTTC: 384,
  },
];

// ============================================
// FACTURES
// ============================================

export type FactureStatus = "BROUILLON" | "EMISE" | "PARTIELLE" | "PAYEE" | "RETARD" | "ANNULEE";

export interface Facture {
  id: string;
  numero: string;
  bateau: string;
  client: string;
  objet: string;
  status: FactureStatus;
  dateEmission: string;
  dateEcheance?: string;
  montantHT: number;
  montantTTC: number;
  montantPaye: number;
  orLie?: string;
}

export const factures: Facture[] = [
  {
    id: "f-0156",
    numero: "FAC-2026-0156",
    bateau: "L'Échappée",
    client: "M. Bernard",
    objet: "Entretien moteur",
    status: "EMISE",
    dateEmission: "21/05/2026",
    dateEcheance: "20/06/2026",
    montantHT: 780,
    montantTTC: 936,
    montantPaye: 0,
    orLie: "OR-2026-0140",
  },
  {
    id: "f-0155",
    numero: "FAC-2026-0155",
    bateau: "Sea Princess",
    client: "Mme Léa",
    objet: "Hivernage 2025",
    status: "PAYEE",
    dateEmission: "15/11/2025",
    montantHT: 1450,
    montantTTC: 1740,
    montantPaye: 1740,
    orLie: "OR-2026-0136",
  },
  {
    id: "f-0154",
    numero: "FAC-2026-0154",
    bateau: "Le Galion",
    client: "M. Carron",
    objet: "Réparation moteur + remplacement anodes",
    status: "RETARD",
    dateEmission: "10/04/2026",
    dateEcheance: "10/05/2026",
    montantHT: 2150,
    montantTTC: 2580,
    montantPaye: 0,
  },
  {
    id: "f-0153",
    numero: "FAC-2026-0153",
    bateau: "Mistral II",
    client: "M. Ducros",
    objet: "Pose pilote automatique",
    status: "PARTIELLE",
    dateEmission: "02/05/2026",
    dateEcheance: "02/06/2026",
    montantHT: 1820,
    montantTTC: 2184,
    montantPaye: 1000,
  },
  {
    id: "f-0152",
    numero: "FAC-2026-0152",
    bateau: "L'Étoile de Mer",
    client: "M. Pellier",
    objet: "Diagnostic + remplacement filtre carburant",
    status: "PAYEE",
    dateEmission: "28/04/2026",
    montantHT: 290,
    montantTTC: 348,
    montantPaye: 348,
  },
  {
    id: "f-0151",
    numero: "FAC-2026-0151",
    bateau: "Vagabond",
    client: "M. Suzano",
    objet: "Carénage + antifouling",
    status: "BROUILLON",
    dateEmission: "23/05/2026",
    montantHT: 2200,
    montantTTC: 2640,
    montantPaye: 0,
  },
];
