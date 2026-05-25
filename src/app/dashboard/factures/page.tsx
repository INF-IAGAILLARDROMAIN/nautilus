import { ChevronRight, FileText, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ListPageHeader } from "@/components/list-page-header";
import { factures, type FactureStatus } from "@/lib/mocks";

function statusBadge(status: FactureStatus) {
  switch (status) {
    case "BROUILLON":
      return { cls: "bg-muted text-foreground border-transparent", label: "Brouillon" };
    case "EMISE":
      return { cls: "bg-chart-4 text-white border-transparent", label: "Émise" };
    case "PARTIELLE":
      return { cls: "bg-accent text-white border-transparent", label: "Partielle" };
    case "PAYEE":
      return { cls: "bg-chart-3 text-white border-transparent", label: "Payée" };
    case "RETARD":
      return {
        cls: "bg-destructive text-white border-transparent",
        label: "🚨 En retard",
      };
    case "ANNULEE":
      return { cls: "bg-muted text-muted-foreground border-transparent", label: "Annulée" };
  }
}

const filters: { label: string }[] = [
  { label: "Toutes" },
  { label: "En retard" },
  { label: "À encaisser" },
  { label: "Payées" },
  { label: "Brouillons" },
];

export default function FacturesListPage() {
  const enRetard = factures.filter((f) => f.status === "RETARD");
  const aEncaisser = factures
    .filter((f) => f.status === "EMISE" || f.status === "RETARD" || f.status === "PARTIELLE")
    .reduce((sum, f) => sum + (f.montantTTC - f.montantPaye), 0);
  const totalEncaisse = factures
    .filter((f) => f.status === "PAYEE")
    .reduce((sum, f) => sum + f.montantPaye, 0);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <ListPageHeader
        title="Factures"
        subtitle={`${factures.length} factures · ${enRetard.length} en retard`}
        action={{ label: "Nouvelle facture", href: "/dashboard/factures/nouveau" }}
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Bandeau alerte si retards */}
        {enRetard.length > 0 && (
          <div className="rounded-xl bg-card border border-l-4 border-l-destructive p-4 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-destructive">
                {enRetard.length} facture{enRetard.length > 1 ? "s" : ""} en retard
              </p>
              <p className="text-xs text-muted-foreground">
                Relance recommandée
              </p>
            </div>
          </div>
        )}

        {/* KPIs en haut */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-accent/10 border-2 border-accent/30 p-4">
            <div className="text-3xl font-bold tabular-nums text-accent">
              {aEncaisser.toLocaleString("fr-FR")} €
            </div>
            <p className="text-xs uppercase tracking-wide font-bold text-accent mt-1">
              À encaisser TTC
            </p>
          </div>
          <div className="rounded-xl bg-chart-3/10 border-2 border-chart-3/30 p-4">
            <div className="text-3xl font-bold tabular-nums text-chart-3">
              {totalEncaisse.toLocaleString("fr-FR")} €
            </div>
            <p className="text-xs uppercase tracking-wide font-bold text-chart-3 mt-1">
              Encaissé ce mois
            </p>
          </div>
        </div>

        {/* Search */}
        <Input
          type="search"
          placeholder="Rechercher par bateau, client, numéro…"
          className="h-12 text-base"
        />

        {/* Filtres */}
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map((f) => (
            <Badge
              key={f.label}
              variant="outline"
              className="shrink-0 h-9 px-3 text-sm cursor-pointer hover:bg-muted"
            >
              {f.label}
            </Badge>
          ))}
        </div>

        {/* Liste */}
        <div className="space-y-3">
          {factures.map((f) => {
            const b = statusBadge(f.status);
            const reste = f.montantTTC - f.montantPaye;
            return (
              <button
                key={f.id}
                type="button"
                className={`w-full flex items-start gap-3 p-4 rounded-xl bg-card border text-left active:scale-[0.99] transition-transform hover:bg-muted/30 ${
                  f.status === "RETARD" ? "border-l-4 border-l-destructive" : ""
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                  <FileText className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start gap-2 justify-between">
                    <h3 className="text-lg font-bold leading-tight">{f.bateau}</h3>
                    <Badge className={`${b.cls} text-[10px]`}>{b.label}</Badge>
                  </div>
                  <p className="text-sm font-medium">{f.client}</p>
                  <p className="text-sm text-muted-foreground">{f.objet}</p>
                  <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground pt-1">
                    <span>{f.numero}</span>
                    <span>·</span>
                    <span>{f.dateEmission}</span>
                    <span className="ml-auto font-bold text-foreground tabular-nums text-sm">
                      {f.montantTTC.toLocaleString("fr-FR")} € TTC
                    </span>
                  </div>
                  {f.status === "PARTIELLE" && (
                    <p className="text-xs text-accent font-semibold">
                      Reste {reste.toLocaleString("fr-FR")} € à encaisser
                    </p>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
