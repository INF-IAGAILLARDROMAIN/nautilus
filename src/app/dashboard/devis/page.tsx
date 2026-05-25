import { ChevronRight, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ListPageHeader } from "@/components/list-page-header";
import { devis, type DevisStatus } from "@/lib/mocks";

function statusBadge(status: DevisStatus) {
  switch (status) {
    case "BROUILLON":
      return { cls: "bg-muted text-foreground border-transparent", label: "Brouillon" };
    case "ENVOYE":
      return { cls: "bg-chart-4 text-white border-transparent", label: "Envoyé" };
    case "ACCEPTE":
      return { cls: "bg-chart-3 text-white border-transparent", label: "Accepté" };
    case "REFUSE":
      return { cls: "bg-destructive text-white border-transparent", label: "Refusé" };
    case "EXPIRE":
      return { cls: "bg-accent text-white border-transparent", label: "Expiré" };
  }
}

const filters: { label: string }[] = [
  { label: "Tous" },
  { label: "En attente réponse" },
  { label: "Acceptés" },
  { label: "Brouillons" },
  { label: "Expirés" },
];

export default function DevisListPage() {
  const enAttente = devis.filter((d) => d.status === "ENVOYE").length;
  const totalHT = devis
    .filter((d) => d.status === "ENVOYE")
    .reduce((sum, d) => sum + d.montantHT, 0);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <ListPageHeader
        title="Devis"
        subtitle={`${devis.length} devis · ${enAttente} en attente de réponse`}
        action={{ label: "Nouveau devis", href: "/dashboard/devis/nouveau" }}
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-5">
        {/* KPIs en haut */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-chart-4/10 border-2 border-chart-4/30 p-4">
            <div className="text-3xl font-bold tabular-nums text-chart-4">
              {enAttente}
            </div>
            <p className="text-xs uppercase tracking-wide font-bold text-chart-4 mt-1">
              En attente réponse
            </p>
          </div>
          <div className="rounded-xl bg-primary/10 border-2 border-primary/30 p-4">
            <div className="text-3xl font-bold tabular-nums text-primary">
              {totalHT.toLocaleString("fr-FR")} €
            </div>
            <p className="text-xs uppercase tracking-wide font-bold text-primary mt-1">
              Montant HT attente
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
          {devis.map((d) => {
            const b = statusBadge(d.status);
            return (
              <button
                key={d.id}
                type="button"
                className="w-full flex items-start gap-3 p-4 rounded-xl bg-card border text-left active:scale-[0.99] transition-transform hover:bg-muted/30"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-white">
                  <Receipt className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start gap-2 justify-between">
                    <h3 className="text-lg font-bold leading-tight">{d.bateau}</h3>
                    <Badge className={`${b.cls} text-[10px]`}>{b.label}</Badge>
                  </div>
                  <p className="text-sm font-medium">{d.client}</p>
                  <p className="text-sm text-muted-foreground">{d.objet}</p>
                  <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground pt-1">
                    <span>{d.numero}</span>
                    {d.dateEnvoi && (
                      <>
                        <span>·</span>
                        <span>envoyé {d.dateEnvoi}</span>
                      </>
                    )}
                    <span className="ml-auto font-bold text-foreground tabular-nums text-sm">
                      {d.montantHT.toLocaleString("fr-FR")} € HT
                    </span>
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
