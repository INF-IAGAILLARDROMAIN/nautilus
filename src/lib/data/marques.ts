// Listes de suggestions pour les champs Marque (formulaire Bateau).
// Source : recherche web exhaustive du 2026-06-08 (32 bateaux + 18 moteurs filtrés marché français).
// Le fichier source brut avec métadonnées (pays, période, statut) est dans
// backend/prisma/seed-data/marques-nautisme.json — utilisé pour l'agent IA en S2.
//
// Convention métier `feedback_nautilus_preselect_plus_libre` : liste de suggestions + saisie libre.

export const MARQUES_BATEAUX = [
  // Français généralistes
  "Bénéteau",
  "Jeanneau",
  "B2 Marine",
  "Ocqueteau",
  "Rhéa Marine",
  "Beacher",
  "White Shark",
  "Pacific Craft",
  "Quicksilver",
  // Voiliers
  "Tofinou",
  "RM Yachts",
  "Pogo Structures",
  "Edel",
  // Américains
  "Wellcraft",
  "Bayliner",
  "Boston Whaler",
  "Sea Ray",
  // Nordiques / polonais
  "Axopar",
  "Saxdor",
  "Nimbus",
  "Ryck",
  "Parker (Poland)",
  "Nuva Yachts",
  // Semi-rigides
  "Zodiac Nautic",
  "Bombard",
  "3D Tender",
  "Highfield",
  "Capelli",
  "Brig",
  "Joker Boat",
  "Nuova Jolly",
  "Valiant",
  "BWA",
] as const;

/**
 * Modèles phares par marque de bateau.
 * Si la marque sélectionnée est dans la liste, on propose ses modèles.
 * Sinon (saisie libre), on propose tous les modèles confondus.
 */
export const MODELES_BATEAUX_PAR_MARQUE: Record<string, readonly string[]> = {
  "Bénéteau": ["Antares 7", "Flyer 6 SUNdeck", "Barracuda 7", "First 24"],
  Jeanneau: ["Merry Fisher 695", "Cap Camarat 7.5", "Sun 2000"],
  Quicksilver: ["Activ 605 Open", "Captur 555 Pilothouse", "Activ 755 Cruiser"],
  "B2 Marine": ["Cap Ferret 552 Sun Deck", "Cap Ferret 752", "Djinn 6.7"],
  Ocqueteau: ["Ostrea 700", "Abaco 24", "Timonier 615"],
  "Rhéa Marine": ["Rhéa 23 Open", "Rhéa 27 Escapade", "Rhéa 32"],
  Beacher: ["V10.2", "V12.2 Sundeck"],
  "White Shark": ["WS 285", "WS 326", "WS 226"],
  "Pacific Craft": ["Pacific Craft 625 Open", "750 Sun Cruiser", "27 RX"],
  Tofinou: ["Tofinou 8", "Tofinou 9.7", "Tofinou 12"],
  "RM Yachts": ["RM 890", "RM 1070", "RM 1180"],
  "Pogo Structures": ["Pogo 30", "Pogo 36", "Mini 6.50"],
  Edel: ["Edel II", "Edel 4", "Edel Cat 35"],
  Wellcraft: ["Wellcraft 355", "Wellcraft 435", "Scarab"],
  Bayliner: ["Bayliner VR5", "Element E18", "M19"],
  "Boston Whaler": ["Montauk 170", "Outrage 250", "Dauntless 220"],
  "Sea Ray": ["SPX 190 OB", "SDX 250 OB", "Sundancer 320"],
  "Parker (Poland)": ["Parker 750 Cabin", "Parker 660 Pilothouse", "Parker 850 Voyager"],
  Axopar: ["Axopar 28", "Axopar 37", "Axopar 22 Spyder"],
  Saxdor: ["Saxdor 200 Sport", "Saxdor 270 GTO", "Saxdor 320 GTO"],
  Nimbus: ["Nimbus T8", "Nimbus T11", "Nimbus W9"],
  Ryck: ["Ryck 280", "Ryck 330"],
  "Nuva Yachts": ["Nuva M6 Open", "Nuva M8 Cabin", "Nuva MX9"],
  "Zodiac Nautic": ["Medline 7.5", "Open 5.5", "Pro 650"],
  Bombard: ["Explorer 600", "Commando C5", "AX3"],
  "3D Tender": ["Lux 535", "Stealth 540", "Dream 240"],
  Highfield: ["Highfield Sport 660", "Patrol 660", "Classic 340"],
  Capelli: ["Tempest 700", "Tempest 900", "Easy Line 505"],
  Brig: ["Eagle 6.7", "Navigator 730", "Falcon 450"],
  "Joker Boat": ["Clubman 24", "Coaster 600", "Wide 750"],
  "Nuova Jolly": ["Prince 25 Sport Cabin", "King 880", "Black Fin Elegance 8"],
  Valiant: ["Valiant 750 Sport", "DR 620", "Vanguard V550"],
  BWA: ["BWA Sport 22 GT", "BWA Premium 28", "BWA Nautica 19 GT"],
};

/**
 * Retourne les suggestions de modèle adaptées à la marque saisie.
 * - Marque vide ou inconnue (saisie libre) → aucune suggestion
 * - Marque connue → ses modèles phares uniquement
 *
 * La recherche est insensible aux accents grâce à normalizeForSearch.
 */
export function getModelesForMarque(marque: string): readonly string[] {
  const normalized = normalizeForSearch(marque.trim());
  if (!normalized) return [];
  const matchKey = Object.keys(MODELES_BATEAUX_PAR_MARQUE).find(
    (k) => normalizeForSearch(k) === normalized,
  );
  return matchKey ? MODELES_BATEAUX_PAR_MARQUE[matchKey] : [];
}

export const MARQUES_MOTEURS = [
  // Actuelles
  "Yamaha",
  "Mercury",
  "Suzuki",
  "Honda",
  "Tohatsu",
  "Selva",
  "Parsun",
  "Torqeedo",
  // Historiques / disparues (encore croisées en atelier)
  "Mariner",
  "Evinrude",
  "Johnson",
  "OMC",
  "Force",
  "Chrysler",
  "Nissan",
  "ELTO",
  "Crescent",
  "Archimedes",
] as const;

/**
 * Normalise une chaîne pour la recherche : minuscules + retrait des accents.
 * "Bénéteau" → "beneteau", "ÉLAN" → "elan".
 *
 * Utilise Unicode NFD : décompose les caractères accentués en caractère de base
 * + diacritique, puis supprime les marques combinatoires (catégorie Mn).
 */
export function normalizeForSearch(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/**
 * Filtre une liste de suggestions selon une requête, en ignorant les accents.
 * "bene" trouve "Bénéteau". "yamh" ne trouve rien. "Y" trouve "Yamaha".
 */
export function filterSuggestions(
  suggestions: readonly string[],
  query: string,
): string[] {
  if (!query.trim()) return [...suggestions];
  const q = normalizeForSearch(query);
  return suggestions.filter((s) => normalizeForSearch(s).includes(q));
}
