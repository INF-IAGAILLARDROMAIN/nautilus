"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Anchor, FileText, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ListPageHeader } from "@/components/list-page-header";
import { api, type Bateau } from "@/lib/api";

export default function BateauxListPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["bateaux"],
    queryFn: api.bateaux.list,
  });

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <ListPageHeader
        title="Bateaux"
        subtitle={
          isLoading
            ? "Chargement…"
            : data
              ? `${data.total} bateau${data.total > 1 ? "x" : ""} au total`
              : undefined
        }
        action={{ label: "Nouveau bateau", href: "/dashboard/bateaux/nouveau" }}
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-5">
        <Input
          type="search"
          placeholder="Rechercher par marque, modèle, plaque moteur…"
          className="h-12 text-base"
        />

        {isLoading && (
          <div className="flex items-center justify-center gap-2 p-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Chargement des bateaux…</span>
          </div>
        )}

        {isError && (
          <div className="p-4 rounded-xl border border-destructive bg-destructive/10 text-destructive">
            <p className="font-semibold">Impossible de charger les bateaux</p>
            <p className="text-sm mt-1">{(error as Error).message}</p>
            <p className="text-xs mt-2 text-muted-foreground">
              Vérifie que le backend NestJS tourne sur le port 4001.
            </p>
          </div>
        )}

        {data && data.data.length === 0 && (
          <div className="p-8 text-center rounded-xl border border-dashed bg-muted/30">
            <p className="font-semibold">Aucun bateau pour le moment</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crée ton premier bateau avec le bouton « Nouveau bateau ».
            </p>
          </div>
        )}

        {data && data.data.length > 0 && (
          <div className="space-y-3">
            {data.data.map((b: Bateau) => (
              <button
                key={b.id}
                type="button"
                className="w-full flex items-start gap-3 p-4 rounded-xl bg-card border text-left active:scale-[0.99] transition-transform hover:bg-muted/30"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                  <Anchor className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start gap-2 justify-between">
                    <h3 className="text-lg font-bold leading-tight">
                      {b.marque} {b.modele}
                    </h3>
                    {b.annee && (
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {b.annee}
                      </Badge>
                    )}
                  </div>
                  {b.client && (
                    <p className="text-sm font-medium">
                      👤 {b.client.prenom} {b.client.nom}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground pt-1 flex-wrap">
                    <span>🔧 {b.plaqueMoteur}</span>
                    {b._count && b._count.devis > 0 && (
                      <span className="flex items-center gap-1 text-foreground font-sans">
                        <FileText className="h-3 w-3" />
                        {b._count.devis} devis
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
