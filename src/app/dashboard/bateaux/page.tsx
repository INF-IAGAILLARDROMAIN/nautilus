"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Anchor, FileText, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ListPageHeader } from "@/components/list-page-header";
import { normalizeForSearch } from "@/lib/data/marques";
import { api, type Bateau } from "@/lib/api";

export default function BateauxListPage() {
  const [query, setQuery] = useState("");
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["bateaux"],
    queryFn: api.bateaux.list,
  });

  // Filtrage côté client sur marque/modèle/nom/plaque/moteur/client (accents ignorés)
  const filtered = (data?.data ?? []).filter((b) => {
    if (!query.trim()) return true;
    const q = normalizeForSearch(query);
    return (
      normalizeForSearch(b.marque).includes(q) ||
      normalizeForSearch(b.modele).includes(q) ||
      (b.nom ? normalizeForSearch(b.nom).includes(q) : false) ||
      (b.plaqueMoteur
        ? normalizeForSearch(b.plaqueMoteur).includes(q)
        : false) ||
      (b.marqueMoteur ? normalizeForSearch(b.marqueMoteur).includes(q) : false) ||
      (b.modeleMoteur ? normalizeForSearch(b.modeleMoteur).includes(q) : false) ||
      (b.client
        ? normalizeForSearch(`${b.client.nom} ${b.client.prenom}`).includes(q)
        : false)
    );
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
          placeholder="Rechercher par marque, modèle, plaque, moteur, client…"
          className="h-12 text-base"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {query && data && (
          <p className="text-xs text-muted-foreground">
            {filtered.length} résultat{filtered.length > 1 ? "s" : ""} sur{" "}
            {data.total}
          </p>
        )}

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

        {data && data.data.length > 0 && filtered.length === 0 && (
          <div className="p-8 text-center rounded-xl border border-dashed bg-muted/30">
            <p className="font-semibold">Aucun bateau ne correspond à « {query} »</p>
            <p className="text-sm text-muted-foreground mt-1">
              Essaie un autre terme ou crée un nouveau bateau.
            </p>
          </div>
        )}

        {data && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((b: Bateau) => (
              <Link
                key={b.id}
                href={`/dashboard/bateaux/${b.id}`}
                className="w-full flex items-start gap-3 p-4 rounded-xl bg-card border text-left active:scale-[0.99] transition-transform hover:bg-muted/30"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                  <Anchor className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start gap-2 justify-between">
                    <h3 className="text-lg font-bold leading-tight">
                      {b.nom ? (
                        <>
                          <span>{b.nom}</span>
                          <span className="text-sm font-normal text-muted-foreground ml-1">
                            · {b.marque} {b.modele}
                          </span>
                        </>
                      ) : (
                        <>
                          {b.marque} {b.modele}
                        </>
                      )}
                    </h3>
                    {b.annee && (
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {b.annee}
                      </Badge>
                    )}
                  </div>
                  {b.client && (
                    <p className="text-sm font-medium">
                      👤 <span className="font-bold uppercase">{b.client.nom}</span>{" "}
                      {b.client.prenom}
                    </p>
                  )}
                  {(b.marqueMoteur || b.modeleMoteur || b.puissanceCV) && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">Moteur :</span>{" "}
                      {b.marqueMoteur ?? "?"} {b.modeleMoteur ?? ""}
                      {b.puissanceCV ? ` · ${b.puissanceCV} CV` : ""}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 flex-wrap">
                    {b.plaqueMoteur && (
                      <span>
                        <span className="font-semibold">Plaque :</span>{" "}
                        <span className="font-mono">{b.plaqueMoteur}</span>
                      </span>
                    )}
                    {b._count && b._count.devis > 0 && (
                      <span className="flex items-center gap-1 text-foreground">
                        <FileText className="h-3 w-3" />
                        {b._count.devis} devis
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
