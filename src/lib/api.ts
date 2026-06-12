import { createClient } from "@/lib/supabase/client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001/api";

/**
 * Récupère le JWT Supabase de la session active (côté navigateur).
 * Retourne null si l'utilisateur n'est pas connecté.
 */
async function getAccessToken(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export type Client = {
  id: string;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
  ville: string | null;
  codePostal: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  // Présents uniquement sur GET /clients/:id (page détail)
  bateaux?: Bateau[];
  devis?: Devis[];
};

export type TypeCoque =
  | "STRATIFIE"
  | "ALUMINIUM"
  | "POLYETHYLENE"
  | "SEMI_RIGIDE"
  | "PNEUMATIQUE"
  | "BOIS"
  | "ACIER"
  | "AUTRE";

export type Bateau = {
  id: string;
  nom: string | null;
  marque: string;
  modele: string;
  typeCoque: TypeCoque;
  immatriculation: string | null;
  annee: number | null;
  notes: string | null;
  // Motorisation (V1 : 1 moteur par bateau, V2 = entité Moteur séparée)
  marqueMoteur: string | null;
  modeleMoteur: string | null;
  plaqueMoteur: string | null;
  puissanceCV: number | null;
  helice: string | null;
  clientId: string;
  createdAt: string;
  updatedAt: string;
  client?: Pick<Client, "id" | "nom" | "prenom">;
  _count?: { devis: number };
  // Présent uniquement sur GET /bateaux/:id (page détail)
  devis?: Devis[];
};

export type StatutDevis = "BROUILLON" | "ENVOYE" | "VALIDE" | "REFUSE";

export type Devis = {
  id: string;
  numeroDevis: string;
  description: string | null;
  statut: StatutDevis;
  totalHT: string;
  tauxTVA: string;
  totalTTC: string;
  dateValidite: string | null;
  modalitesPaiement: string | null;
  /** Client destinataire — toujours présent. */
  clientId: string;
  /** Bateau concerné — null si devis pré-vente / sans bateau. */
  bateauId: string | null;
  createdAt: string;
  updatedAt: string;
  client?: Pick<Client, "id" | "nom" | "prenom">;
  bateau?: {
    id: string;
    nom: string | null;
    marque: string;
    modele: string;
    client?: Pick<Client, "id" | "nom" | "prenom">;
  } | null;
  /** OR créé automatiquement à la validation du devis. */
  ordreReparation?: {
    id: string;
    statut: StatutOR;
    numeroFacture?: string | null;
    createdAt?: string;
    mecano?: string | null;
  } | null;
  _count?: { lignes: number };
};

export type DevisLigne = {
  id: string;
  description: string;
  quantite: string;
  prixUnitaireHT: string;
  totalLigneHT: string;
  ordre: number;
};

export type CreateDevisLigneInput = {
  description: string;
  quantite: number;
  prixUnitaireHT: number;
};

export type CreateDevisInput = {
  clientId: string;
  bateauId?: string | null;
  description?: string | null;
  tauxTVA?: number;
  dateValidite?: string | null;
  modalitesPaiement?: string | null;
  lignes: CreateDevisLigneInput[];
};

export type StatutOR = "CREE" | "EN_COURS" | "TERMINE" | "FACTURE";
export type TypeOR =
  | "ENTRETIEN"
  | "REPARATION"
  | "HIVERNAGE"
  | "DESHIVERNAGE"
  | "DEPANNAGE";
export type UrgenceOR = "NORMAL" | "URGENT";

export type OrdreReparation = {
  id: string;
  description: string | null;
  type: TypeOR;
  urgence: UrgenceOR;
  mecano: string | null;
  statut: StatutOR;
  numeroFacture: string | null;
  devisId: string;
  dateDebut: string | null;
  dateFin: string | null;
  createdAt: string;
  updatedAt: string;
  devis?: {
    id: string;
    numeroDevis: string;
    totalTTC: string;
    bateau?: {
      marque: string;
      modele: string;
      client?: { nom: string; prenom: string };
    };
  };
};

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `[API ${res.status}] ${res.statusText} — ${path}${body ? ` :: ${body}` : ""}`,
    );
  }
  return res.json() as Promise<T>;
}

export type CreateBateauInput = {
  nom?: string | null;
  marque: string;
  modele: string;
  typeCoque?: TypeCoque;
  immatriculation?: string | null;
  annee?: number | null;
  notes?: string | null;
  marqueMoteur?: string | null;
  modeleMoteur?: string | null;
  plaqueMoteur?: string | null;
  puissanceCV?: number | null;
  helice?: string | null;
  clientId: string;
};

export type CreateClientInput = {
  nom: string;
  prenom: string;
  email?: string | null;
  telephone?: string | null;
  adresse?: string | null;
  ville?: string | null;
  codePostal?: string | null;
  notes?: string | null;
};

export const api = {
  clients: {
    list: () => request<Paginated<Client>>("/clients"),
    get: (id: string) => request<Client>(`/clients/${id}`),
    create: (input: CreateClientInput) =>
      request<Client>("/clients", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  },
  bateaux: {
    list: () => request<Paginated<Bateau>>("/bateaux"),
    get: (id: string) => request<Bateau>(`/bateaux/${id}`),
    create: (input: CreateBateauInput) =>
      request<Bateau>("/bateaux", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  },
  devis: {
    list: () => request<Paginated<Devis>>("/devis"),
    get: (id: string) => request<Devis & { lignes: DevisLigne[] }>(`/devis/${id}`),
    create: (input: CreateDevisInput) =>
      request<Devis>("/devis", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    updateStatut: (id: string, statut: StatutDevis) =>
      request<Devis>(`/devis/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ statut }),
      }),
    /**
     * Télécharge le PDF du devis en passant le JWT en header.
     * Renvoie un Blob qu'on transforme côté UI en téléchargement / preview.
     */
    downloadPdf: async (id: string): Promise<Blob> => {
      const token = await getAccessToken();
      const res = await fetch(`${API_URL}/devis/${id}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        throw new Error(`[API ${res.status}] PDF devis ${id} indisponible`);
      }
      return res.blob();
    },
  },
  or: {
    list: () => request<Paginated<OrdreReparation>>("/or"),
    get: (id: string) => request<OrdreReparation>(`/or/${id}`),
    updateStatut: (id: string, statut: StatutOR) =>
      request<OrdreReparation>(`/or/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ statut }),
      }),
    assignMecano: (id: string, mecano: string | null) =>
      request<OrdreReparation>(`/or/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ mecano }),
      }),
    /**
     * Télécharge le PDF de l'OR (document interne pour le mécano).
     * Cases à cocher, zone observations, signature mécano.
     */
    downloadOrPdf: async (id: string): Promise<Blob> => {
      const token = await getAccessToken();
      const res = await fetch(`${API_URL}/or/${id}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        throw new Error(`[API ${res.status}] PDF OR ${id} indisponible`);
      }
      return res.blob();
    },
    /**
     * Télécharge le PDF de la facture (OR au statut FACTURE uniquement).
     * Erreur 400 si l'OR n'est pas encore facturé.
     */
    downloadFacturePdf: async (id: string): Promise<Blob> => {
      const token = await getAccessToken();
      const res = await fetch(`${API_URL}/or/${id}/facture-pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        throw new Error(`[API ${res.status}] PDF facture ${id} indisponible`);
      }
      return res.blob();
    },
  },
  factures: {
    // Une facture = un OR au statut FACTURE.
    list: () => request<Paginated<OrdreReparation>>("/or?statut=FACTURE"),
  },
  recherche: {
    /** Pose une question en langage naturel à l'agent IA Mistral. */
    ask: (question: string) =>
      request<RechercheResultat>("/recherche", {
        method: "POST",
        body: JSON.stringify({ question }),
      }),
  },
};

// -----------------------------------------------------------------------------
// Types du moteur de recherche IA
// -----------------------------------------------------------------------------

export type IntentRechercheIa =
  // Métier (16)
  | "find_bateau"
  | "find_client_by_name"
  | "find_devis_by_client"
  | "find_or_by_client"
  | "find_facture_by_client"
  | "list_or_by_statut"
  | "list_or_urgents"
  | "find_facture_by_numero"
  | "list_recent_devis"
  | "list_recent_factures"
  | "list_bateaux_by_moteur"
  | "list_or_by_periode"
  | "find_client_by_contact"
  | "find_bateau_by_plaque_moteur"
  | "stats_global"
  | "fallback"
  // UX (3)
  | "salutation"
  | "help"
  | "hors_domaine"
  // Sécurité (1)
  | "securite_refus";

export type RechercheResultat = {
  question: string;
  intent: IntentRechercheIa;
  entities: Record<string, string>;
  resultats: unknown; // shape variable selon intent
  resultatsCount: number;
  tempsMs: number;
  llmProvider: string;
  llmModele: string;
  explanation?: string;
  /** Message contextuel ajouté par le service quand il a fallback. */
  messageInfo?: string;
};
