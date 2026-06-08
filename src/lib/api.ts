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
};

export type StatutDevis = "BROUILLON" | "ENVOYE" | "VALIDE" | "REFUSE";

export type Devis = {
  id: string;
  numeroDevis: string;
  description: string | null;
  statut: StatutDevis;
  totalHT: string;
  totalTVA: string;
  totalTTC: string;
  bateauId: string;
  createdAt: string;
  updatedAt: string;
  bateau?: {
    id: string;
    marque: string;
    modele: string;
    client?: Pick<Client, "id" | "nom" | "prenom">;
  };
  _count?: { lignes: number };
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
    create: (input: CreateBateauInput) =>
      request<Bateau>("/bateaux", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  },
  devis: {
    list: () => request<Paginated<Devis>>("/devis"),
  },
  or: {
    list: () => request<Paginated<OrdreReparation>>("/or"),
  },
  factures: {
    // Une facture = un OR au statut FACTURE.
    list: () => request<Paginated<OrdreReparation>>("/or?statut=FACTURE"),
  },
};
