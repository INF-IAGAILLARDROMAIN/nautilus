import { ChevronRight, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ListPageHeader } from "@/components/list-page-header";
import { ordres, type OrStatus } from "@/lib/mocks";

function statusBadge(status: OrStatus) {
  switch (status) {
    case "URGENCE":
      return {
        cls: "bg-destructive text-white border-transparent animate-pulse",
        label: "🚨 URGENCE",
      };
    case "RECU":
      return { cls: "bg-muted text-foreground border-transparent", label: "Reçu" };
    case "ACCEPTE":
      return { cls: "bg-chart-4 text-white border-transparent", label: "Accepté" };
    case "EN_PREPARATION":
      return {
        cls: "bg-chart-5 text-white border-transparent",
        label: "En préparation",
      };
    case "EN_REPARATION":
      return {
        cls: "bg-primary text-white border-transparent",
        label: "En réparation",
      };
    case "LIVRE":
      return { cls: "bg-chart-3 text-white border-transparent", label: "Livré" };
    case "FACTURE":
      return {
        cls: "bg-chart-3 text-white border-transparent",
        label: "Facturé",
      };
    case "ANNULE":
      return { cls: "bg-muted text-muted-foreground border-transparent", label: "Annulé" };
  }
}

const filters: { label: string; status?: OrStatus[] }[] = [
  { label: "Tous" },
  { label: "Urgences", status: ["URGENCE"] },
  { label: "En cours", status: ["ACCEPTE", "EN_PREPARATION", "EN_REPARATION"] },
  { label: "Livrés", status: ["LIVRE"] },
  { label: "Facturés", status: ["FACTURE"] },
];

export default function OrListPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <ListPageHeader
        title="Ordres de réparation"
        subtitle={`${ordres.length} OR au total`}
        action={{ label: "Nouvel OR", href: "/dashboard/or/nouveau" }}
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Search */}
        <Input
          type="search"
          placeholder="Rechercher par bateau, client, numéro…"
          className="h-12 text-base"
        />

        {/* Filtres rapides scrollables */}
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
          {ordres.map((or) => {
            const b = statusBadge(or.status);
            return (
              <button
                key={or.id}
                type="button"
                className="w-full flex items-start gap-3 p-4 rounded-xl bg-card border text-left active:scale-[0.99] transition-transform hover:bg-muted/30"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                  <Wrench className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start gap-2 justify-between">
                    <h3 className="text-lg font-bold leading-tight">{or.bateau}</h3>
                    <Badge className={`${b.cls} text-[10px]`}>{b.label}</Badge>
                  </div>
                  <p className="text-sm font-medium">{or.client}</p>
                  <p className="text-xs text-muted-foreground">
                    {or.type}
                    {or.tech && ` · 👷 ${or.tech}`}
                  </p>
                  <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground pt-1">
                    <span>{or.numero}</span>
                    <span>·</span>
                    <span>{or.dateCreation}</span>
                    {or.montantHT && (
                      <span className="ml-auto font-bold text-foreground tabular-nums">
                        {or.montantHT.toLocaleString("fr-FR")} € HT
                      </span>
                    )}
                  </div>
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
