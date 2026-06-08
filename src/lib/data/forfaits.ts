// Catalogue de forfaits prédéfinis pour gagner du temps lors de la création
// d'un devis. Inspiré de Mercury Service Excellence + Yamaha Forfaits + analyse
// de 7 ateliers nautiques français (cf. backend/prisma/seed-data/tarifs-ateliers-nautiques.json).
//
// V1 : catalogue statique en code. V2 : table CataloguePrestation éditable
// par chaque atelier en BDD (cf. memory/project_nautilus_v2_features_post_examen.md).
//
// Prix indicatifs basés sur les fourchettes constructeurs et ateliers
// (Atelier du Bateau Annecy, Mécano-Nautique Nice). À ajuster par chaque atelier.

/**
 * Catégories de devis utilisées comme suggestions d'autocomplete sur le champ
 * "Description" du formulaire devis. L'utilisateur peut aussi saisir librement
 * une description personnalisée (règle métier `feedback_nautilus_preselect_plus_libre`).
 */
export const CATEGORIES_DEVIS = [
  "Entretien moteur",
  "Hivernage",
  "Déshivernage",
  "Réparation",
  "Dépannage",
  "Pré-vente / Achat",
  "Accessoires (pose)",
  "Carénage / Antifouling",
  "Diagnostic",
  "Expertise",
] as const;

export interface LigneForfait {
  description: string;
  quantite: number;
  prixUnitaireHT: number;
}

export interface Forfait {
  id: string;
  nom: string;
  categorie:
    | "Entretien"
    | "Hivernage"
    | "Déshivernage"
    | "Réparation"
    | "Diagnostic";
  description: string;
  hint?: string;
  lignes: LigneForfait[];
}

export const FORFAITS: readonly Forfait[] = [
  {
    id: "entretien-100h-petit",
    nom: "Entretien 100h · ≤ 60 CV",
    categorie: "Entretien",
    description: "Entretien moteur",
    hint: "Moteurs portables et 4-temps petite gamme",
    lignes: [
      { description: "Vidange moteur + filtre à huile", quantite: 1, prixUnitaireHT: 95 },
      { description: "Remplacement bougies", quantite: 4, prixUnitaireHT: 8 },
      { description: "Contrôle et nettoyage filtre à carburant", quantite: 1, prixUnitaireHT: 25 },
      { description: "Remplacement anodes (sacrificielles)", quantite: 1, prixUnitaireHT: 35 },
      { description: "Main d'œuvre", quantite: 1.5, prixUnitaireHT: 65 },
    ],
  },
  {
    id: "entretien-100h-moyen",
    nom: "Entretien 100h · 60-115 CV",
    categorie: "Entretien",
    description: "Entretien moteur",
    hint: "FourStroke et Pro XS milieu de gamme",
    lignes: [
      { description: "Vidange moteur + filtre à huile", quantite: 1, prixUnitaireHT: 125 },
      { description: "Remplacement bougies", quantite: 4, prixUnitaireHT: 12 },
      { description: "Remplacement filtre à carburant", quantite: 1, prixUnitaireHT: 35 },
      { description: "Remplacement séparateur d'eau", quantite: 1, prixUnitaireHT: 45 },
      { description: "Vidange embase", quantite: 1, prixUnitaireHT: 60 },
      { description: "Remplacement anodes", quantite: 1, prixUnitaireHT: 55 },
      { description: "Contrôle 25 points + essai", quantite: 1, prixUnitaireHT: 50 },
      { description: "Main d'œuvre", quantite: 2.5, prixUnitaireHT: 65 },
    ],
  },
  {
    id: "entretien-100h-gros",
    nom: "Entretien 100h · 150-200 CV",
    categorie: "Entretien",
    description: "Entretien moteur",
    hint: "FourStroke et Verado haut de gamme",
    lignes: [
      { description: "Vidange moteur + filtre à huile", quantite: 1, prixUnitaireHT: 165 },
      { description: "Remplacement bougies", quantite: 6, prixUnitaireHT: 14 },
      { description: "Remplacement filtre à carburant haute pression", quantite: 1, prixUnitaireHT: 75 },
      { description: "Remplacement séparateur d'eau", quantite: 1, prixUnitaireHT: 55 },
      { description: "Vidange embase", quantite: 1, prixUnitaireHT: 85 },
      { description: "Remplacement anodes (4)", quantite: 1, prixUnitaireHT: 95 },
      { description: "Diagnostic électronique constructeur", quantite: 1, prixUnitaireHT: 60 },
      { description: "Contrôle 25 points + essai mer", quantite: 1, prixUnitaireHT: 70 },
      { description: "Main d'œuvre", quantite: 3.5, prixUnitaireHT: 65 },
    ],
  },
  {
    id: "entretien-300h",
    nom: "Entretien 300h (gros entretien)",
    categorie: "Entretien",
    description: "Entretien moteur",
    hint: "Tous les 300h ou 3 ans — préventif majeur",
    lignes: [
      { description: "Vidange moteur + filtre à huile", quantite: 1, prixUnitaireHT: 145 },
      { description: "Remplacement bougies", quantite: 4, prixUnitaireHT: 12 },
      { description: "Remplacement filtres carburant + séparateur eau", quantite: 1, prixUnitaireHT: 80 },
      { description: "Remplacement turbine pompe à eau (préventif)", quantite: 1, prixUnitaireHT: 95 },
      { description: "Remplacement thermostat", quantite: 1, prixUnitaireHT: 45 },
      { description: "Remplacement courroie de distribution", quantite: 1, prixUnitaireHT: 110 },
      { description: "Vidange embase", quantite: 1, prixUnitaireHT: 75 },
      { description: "Contrôle soupapes + jeu aux soupapes", quantite: 1, prixUnitaireHT: 65 },
      { description: "Diagnostic électronique", quantite: 1, prixUnitaireHT: 60 },
      { description: "Main d'œuvre", quantite: 5, prixUnitaireHT: 65 },
    ],
  },
  {
    id: "hivernage-simple",
    nom: "Hivernage moteur seul",
    categorie: "Hivernage",
    description: "Hivernage",
    hint: "Préparation hivernale moteur uniquement",
    lignes: [
      { description: "Rinçage circuit eau douce + traitement anti-corrosion", quantite: 1, prixUnitaireHT: 35 },
      { description: "Brumisation cylindres", quantite: 1, prixUnitaireHT: 25 },
      { description: "Vidange embase préventive", quantite: 1, prixUnitaireHT: 55 },
      { description: "Stabilisateur carburant + plein", quantite: 1, prixUnitaireHT: 30 },
      { description: "Démontage et stockage batterie", quantite: 1, prixUnitaireHT: 20 },
      { description: "Main d'œuvre", quantite: 1.5, prixUnitaireHT: 65 },
    ],
  },
  {
    id: "hivernage-complet",
    nom: "Hivernage complet bateau + moteur + stockage",
    categorie: "Hivernage",
    description: "Hivernage",
    hint: "Hivernage moteur + stockage sécurisé bateau",
    lignes: [
      { description: "Rinçage circuit eau douce + traitement", quantite: 1, prixUnitaireHT: 35 },
      { description: "Brumisation cylindres", quantite: 1, prixUnitaireHT: 25 },
      { description: "Vidange embase", quantite: 1, prixUnitaireHT: 55 },
      { description: "Stabilisateur carburant + plein", quantite: 1, prixUnitaireHT: 30 },
      { description: "Stockage batterie sur chargeur intelligent", quantite: 1, prixUnitaireHT: 40 },
      { description: "Nettoyage coque + protection gel-coat", quantite: 1, prixUnitaireHT: 90 },
      { description: "Bâchage bateau (hors-saison)", quantite: 1, prixUnitaireHT: 60 },
      { description: "Forfait stockage hors-saison (5 mois)", quantite: 1, prixUnitaireHT: 280 },
      { description: "Main d'œuvre", quantite: 2.5, prixUnitaireHT: 65 },
    ],
  },
  {
    id: "deshivernage-standard",
    nom: "Déshivernage + remise en service",
    categorie: "Déshivernage",
    description: "Déshivernage",
    hint: "Mise en route printemps + essai mer",
    lignes: [
      { description: "Remise en place batterie + vérification charge", quantite: 1, prixUnitaireHT: 25 },
      { description: "Contrôle niveaux huile, embase, refroidissement", quantite: 1, prixUnitaireHT: 30 },
      { description: "Démontage protection brumisation + démarrage", quantite: 1, prixUnitaireHT: 40 },
      { description: "Contrôle circuit eau et thermostat", quantite: 1, prixUnitaireHT: 35 },
      { description: "Essai mer + vérification fonctionnement", quantite: 1, prixUnitaireHT: 90 },
      { description: "Main d'œuvre", quantite: 2, prixUnitaireHT: 65 },
    ],
  },
  {
    id: "diagnostic-electronique",
    nom: "Diagnostic électronique constructeur",
    categorie: "Diagnostic",
    description: "Diagnostic",
    hint: "Lecture défauts ECU + analyse · CDS G3 (Mercury) / YDIS (Yamaha)",
    lignes: [
      { description: "Branchement valise diagnostic constructeur", quantite: 1, prixUnitaireHT: 45 },
      { description: "Lecture codes défauts + paramètres en temps réel", quantite: 1, prixUnitaireHT: 35 },
      { description: "Analyse historique et rapport d'expertise", quantite: 1, prixUnitaireHT: 55 },
      { description: "Main d'œuvre diagnostic", quantite: 1, prixUnitaireHT: 65 },
    ],
  },
  {
    id: "carenage-antifouling",
    nom: "Carénage + antifouling annuel",
    categorie: "Réparation",
    description: "Carénage / Antifouling",
    hint: "Décapage + antifouling 2 couches",
    lignes: [
      { description: "Sortie d'eau + lavage haute pression", quantite: 1, prixUnitaireHT: 80 },
      { description: "Décapage anti-fouling ancien", quantite: 1, prixUnitaireHT: 120 },
      { description: "Préparation surface + masticage", quantite: 1, prixUnitaireHT: 60 },
      { description: "Application antifouling 1ère couche", quantite: 1, prixUnitaireHT: 95 },
      { description: "Application antifouling 2ème couche", quantite: 1, prixUnitaireHT: 75 },
      { description: "Pot d'antifouling 2,5 L", quantite: 1, prixUnitaireHT: 110 },
      { description: "Main d'œuvre", quantite: 4, prixUnitaireHT: 65 },
    ],
  },
  {
    id: "depannage-port",
    nom: "Dépannage / Intervention sur port",
    categorie: "Réparation",
    description: "Dépannage",
    hint: "Intervention rapide sur place — forfait base",
    lignes: [
      { description: "Forfait déplacement + intervention sur port", quantite: 1, prixUnitaireHT: 130 },
      { description: "Diagnostic sur site", quantite: 1, prixUnitaireHT: 75 },
      { description: "Main d'œuvre dépannage", quantite: 1, prixUnitaireHT: 65 },
    ],
  },
] as const;
