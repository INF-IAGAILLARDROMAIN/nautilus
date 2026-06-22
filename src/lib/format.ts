/**
 * Utilitaires de formatage métier — centralisés ici pour garantir
 * une cohérence d'affichage dans toute l'application Nautilus.
 *
 * Convention :
 *   - formatEuro : montant TTC / HT en € au format français "1 234,56 €"
 *   - formatDate : date au format long FR "22 juin 2026"
 *   - formatDateShort : date au format court FR "22 juin 2026" (mois abrégé)
 */

export function formatEuro(value: string | number): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return n.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
