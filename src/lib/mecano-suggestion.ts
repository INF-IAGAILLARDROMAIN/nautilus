import type { Alerte } from "@/components/alerte-item";
import type { Mecano } from "@/components/equipe-section";
import { historiqueParBateau } from "@/lib/mocks";

export type SuggestionType = "dernier_actif" | "historique" | "disponible" | "none";

/**
 * Trie les alertes par ordre d'arrivée (FIFO).
 * La plus ancienne (= celle qui attend le plus) en haut.
 * Objectif : aucun client ne doit subir un délai de prise en charge.
 * → L'urgence principale = la plus ancienne dans la file.
 */
export function trierAlertes(alertes: Alerte[]): Alerte[] {
  return [...alertes].sort((a, b) => b.arriveeIlYaMin - a.arriveeIlYaMin);
}

export interface Suggestion {
  mecanoId: string;
  mecanoNom: string;
  raison: string;
  type: SuggestionType;
  /** Si le dernier intervenant existe mais est indisponible (congé) */
  blocage?: { mecanoNom: string; motif: string };
}

/** Retourne le 1er mot du nom (utilisé pour matcher "Pierre" dans "Pierre Lefèvre") */
function prenomDe(nomComplet: string): string {
  return nomComplet.split(" ")[0];
}

function trouverMecano(equipe: Mecano[], prenom: string): Mecano | undefined {
  return equipe.find((m) => prenomDe(m.nom).toLowerCase() === prenom.toLowerCase());
}

/**
 * Algo de suggestion :
 *  1. Dernier intervenant sur ce bateau (si actif)
 *  2. Sinon, parcourir l'historique du bateau → 1er mécano actif
 *  3. Sinon, mécano actif avec le moins d'OR en cours
 */
export function suggererMecano(alerte: Alerte, equipe: Mecano[]): Suggestion {
  // 1. Dernier intervenant ?
  if (alerte.dernierIntervenant) {
    const dernier = trouverMecano(equipe, alerte.dernierIntervenant.nom);
    if (dernier && dernier.statut === "actif") {
      return {
        mecanoId: dernier.id,
        mecanoNom: dernier.nom,
        raison: `Dernier intervenant le ${alerte.dernierIntervenant.date} · ${alerte.dernierIntervenant.intervention}`,
        type: "dernier_actif",
      };
    }
  }

  // Blocage : dernier intervenant en congé
  let blocage: Suggestion["blocage"] | undefined;
  if (alerte.dernierIntervenant) {
    const dernier = trouverMecano(equipe, alerte.dernierIntervenant.nom);
    if (dernier && dernier.statut === "conge") {
      blocage = {
        mecanoNom: dernier.nom,
        motif: dernier.congeJusquau
          ? `en congé jusqu'au ${dernier.congeJusquau}`
          : "en congé",
      };
    }
  }

  // 2. Historique du bateau (hors dernier)
  const histo = historiqueParBateau[alerte.bateau] || [];
  for (const inter of histo) {
    const mecano = trouverMecano(equipe, inter.nom);
    if (mecano && mecano.statut === "actif") {
      return {
        mecanoId: mecano.id,
        mecanoNom: mecano.nom,
        raison: `A déjà travaillé sur ce bateau le ${inter.date} · ${inter.intervention}`,
        type: "historique",
        blocage,
      };
    }
  }

  // 3. Mécano actif avec le moins d'OR
  const dispos = equipe
    .filter((m) => m.statut === "actif")
    .sort((a, b) => a.orTotalEnCours - b.orTotalEnCours);
  if (dispos.length > 0) {
    const choisi = dispos[0];
    return {
      mecanoId: choisi.id,
      mecanoNom: choisi.nom,
      raison: `Aucun historique sur ce bateau · ${choisi.orTotalEnCours} OR en cours (charge la plus légère)`,
      type: "disponible",
      blocage,
    };
  }

  return {
    mecanoId: "",
    mecanoNom: "—",
    raison: "Aucun mécano disponible",
    type: "none",
    blocage,
  };
}
