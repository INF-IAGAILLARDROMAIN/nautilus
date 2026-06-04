const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001/api";

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

export type Bateau = {
  id: string;
  marque: string;
  modele: string;
  plaqueMoteur: string;
  annee: number | null;
  type: string | null;
  notes: string | null;
  clientId: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
};

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `[API ${res.status}] ${res.statusText} — ${path}${body ? ` :: ${body}` : ""}`,
    );
  }
  return res.json() as Promise<T>;
}

export const api = {
  clients: {
    list: () => request<Paginated<Client>>("/clients"),
    get: (id: string) => request<Client>(`/clients/${id}`),
  },
  bateaux: {
    list: () => request<Paginated<Bateau>>("/bateaux"),
  },
};
