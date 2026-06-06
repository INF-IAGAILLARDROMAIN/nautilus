"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Receipt, Loader2, Anchor } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ListPageHeader } from "@/components/list-page-header";
import { api, type Devis, type StatutDevis } from "@/lib/api";

function statutBadge(statut: StatutDevis) {
  switch (statut) {
    case "BROUILLON":
      return {
        cls: "bg-muted text-muted-foreground border-transparent",
        label: "Brouillon",
      };
    case "ENVOYE":
      return {
        cls: "bg-chart-4 text-white border-transparent",
        label: "Envoyé",
      };
    case "VALIDE":
      return {
        cls: "bg-chart-3 text-white border-transparent",
        label: "Validé",
      };
    case "REFUSE":
      return {
        cls: "bg-destructive text-white border-transparent",
        label: "Refusé",
      };
  }
}

function formatEuro(value: string | number) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return n.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

export default function DevisListPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["devis"],
    queryFn: api.devis.list,
  });

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <ListPageHeader
        title="Devis"
        subtitle={
          isLoading
            ? "Chargement…"
            : data
              ? `${data.total} devis au total`
              : undefined
        }
        action={{ label: "Nouveau devis", href: "/dashboard/devis/nouveau" }}
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-5">
        <Input
          type="search"
          placeholder="Rechercher par numéro, client, bateau…"
          className="h-12 text-base"
        />

        {isLoading && (
          <div className="flex items-center justify-center gap-2 p-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Chargement des devis…</span>
          </div>
        )}

        {isError && (
          <div className="p-4 rounded-xl border border-destructive bg-destructive/10 text-destructive">
            <p className="font-semibold">Impossible de charger les devis</p>
            <p className="text-sm mt-1">{(error as Error).message}</p>
          </div>
        )}

        {data && data.data.length === 0 && (
          <div className="p-8 text-center rounded-xl border border-dashed bg-muted/30">
            <p className="font-semibold">Aucun devis pour le moment</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crée ton premier devis avec le bouton « Nouveau devis ».
            </p>
          </div>
        )}

        {data && data.data.length > 0 && (
          <div className="space-y-3">
            {data.data.map((d: Devis) => {
              const b = statutBadge(d.statut);
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
                      <h3 className="text-lg font-bold leading-tight font-mono">
                        {d.numeroDevis}
                      </h3>
                      <Badge className={`${b.cls} text-[10px]`}>{b.label}</Badge>
                    </div>

                    {d.bateau && (
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <Anchor className="h-3.5 w-3.5" />
                        {d.bateau.marque} {d.bateau.modele}
                        {d.bateau.client && (
                          <>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground">
                              {d.bateau.client.prenom} {d.bateau.client.nom}
                            </span>
                          </>
                        )}
                      </p>
                    )}

                    {d.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {d.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs pt-1">
                      {d._count && (
                        <span className="text-muted-foreground">
                          {d._count.lignes} ligne{d._count.lignes > 1 ? "s" : ""}
                        </span>
                      )}
                      <span className="ml-auto font-bold text-foreground tabular-nums">
                        {formatEuro(d.totalTTC)} TTC
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
