"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Wrench, Loader2, Anchor, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ListPageHeader } from "@/components/list-page-header";
import { normalizeForSearch } from "@/lib/data/marques";
import { formatEuro } from "@/lib/format";
import {
  api,
  type OrdreReparation,
  type StatutOR,
  type TypeOR,
  type UrgenceOR,
} from "@/lib/api";

function statutBadge(statut: StatutOR) {
  switch (statut) {
    case "CREE":
      return {
        cls: "bg-muted text-muted-foreground border-transparent",
        label: "Créé",
      };
    case "EN_COURS":
      return {
        cls: "bg-primary text-primary-foreground border-transparent",
        label: "En cours",
      };
    case "TERMINE":
      return {
        cls: "bg-chart-3 text-white border-transparent",
        label: "Terminé",
      };
    case "FACTURE":
      return {
        cls: "bg-chart-4 text-white border-transparent",
        label: "Facturé",
      };
  }
}

function typeLabel(type: TypeOR) {
  switch (type) {
    case "ENTRETIEN":
      return "Entretien";
    case "REPARATION":
      return "Réparation";
    case "HIVERNAGE":
      return "Hivernage";
    case "DESHIVERNAGE":
      return "Déshivernage";
    case "DEPANNAGE":
      return "Dépannage";
  }
}

function urgenceBadge(urgence: UrgenceOR) {
  if (urgence === "URGENT") {
    return {
      cls: "bg-destructive text-white border-transparent",
      label: "🚨 Urgent",
    };
  }
  return null;
}

export default function OrListPage() {
  const [query, setQuery] = useState("");
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["or"],
    queryFn: api.or.list,
  });

  // Filtrage côté client : type, mécano, n° devis, n° facture, bateau, client (accents ignorés)
  const filtered = (data?.data ?? []).filter((or) => {
    if (!query.trim()) return true;
    const q = normalizeForSearch(query);
    const bateauStr = or.devis?.bateau
      ? normalizeForSearch(
          `${or.devis.bateau.marque} ${or.devis.bateau.modele}`,
        )
      : "";
    const clientStr = or.devis?.bateau?.client
      ? normalizeForSearch(
          `${or.devis.bateau.client.nom} ${or.devis.bateau.client.prenom}`,
        )
      : "";
    return (
      normalizeForSearch(typeLabel(or.type)).includes(q) ||
      (or.mecano ? normalizeForSearch(or.mecano).includes(q) : false) ||
      (or.description ? normalizeForSearch(or.description).includes(q) : false) ||
      (or.devis ? normalizeForSearch(or.devis.numeroDevis).includes(q) : false) ||
      (or.numeroFacture
        ? normalizeForSearch(or.numeroFacture).includes(q)
        : false) ||
      bateauStr.includes(q) ||
      clientStr.includes(q)
    );
  });

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <ListPageHeader
        title="Ordres de réparation"
        subtitle={
          isLoading
            ? "Chargement…"
            : data
              ? `${data.total} OR au total`
              : undefined
        }
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-5">
        <Input
          type="search"
          placeholder="Rechercher par bateau, client, mécano, n° devis/facture…"
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
            <span>Chargement des OR…</span>
          </div>
        )}

        {isError && (
          <div className="p-4 rounded-xl border border-destructive bg-destructive/10 text-destructive">
            <p className="font-semibold">Impossible de charger les OR</p>
            <p className="text-sm mt-1">{(error as Error).message}</p>
          </div>
        )}

        {data && data.data.length === 0 && (
          <div className="p-8 text-center rounded-xl border border-dashed bg-muted/30">
            <p className="font-semibold">Aucun OR pour le moment</p>
            <p className="text-sm text-muted-foreground mt-1">
              Les OR sont créés automatiquement lorsqu&apos;un devis est validé.
            </p>
          </div>
        )}

        {data && data.data.length > 0 && filtered.length === 0 && (
          <div className="p-8 text-center rounded-xl border border-dashed bg-muted/30">
            <p className="font-semibold">Aucun OR ne correspond à « {query} »</p>
            <p className="text-sm text-muted-foreground mt-1">
              Essaie un autre terme.
            </p>
          </div>
        )}

        {data && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((or: OrdreReparation) => {
              const s = statutBadge(or.statut);
              const u = urgenceBadge(or.urgence);
              return (
                <Link
                  key={or.id}
                  href={`/dashboard/or/${or.id}`}
                  className="w-full flex items-start gap-3 p-4 rounded-xl bg-card border text-left active:scale-[0.99] transition-transform hover:bg-muted/30"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                    <Wrench className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start gap-2 justify-between flex-wrap">
                      <h3 className="text-lg font-bold leading-tight">
                        {typeLabel(or.type)}
                      </h3>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {u && (
                          <Badge className={`${u.cls} text-[10px]`}>
                            {u.label}
                          </Badge>
                        )}
                        <Badge className={`${s.cls} text-[10px]`}>
                          {s.label}
                        </Badge>
                      </div>
                    </div>

                    {or.devis?.bateau && (
                      <p className="text-sm font-medium flex items-center gap-1.5 flex-wrap">
                        <Anchor className="h-3.5 w-3.5" />
                        {or.devis.bateau.marque} {or.devis.bateau.modele}
                        {or.devis.bateau.client && (
                          <>
                            <span className="text-muted-foreground">·</span>
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              <span className="font-bold uppercase">
                                {or.devis.bateau.client.nom}
                              </span>{" "}
                              {or.devis.bateau.client.prenom}
                            </span>
                          </>
                        )}
                      </p>
                    )}

                    {or.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {or.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs pt-1 flex-wrap">
                      {or.mecano && (
                        <span className="text-muted-foreground">
                          👷 {or.mecano}
                        </span>
                      )}
                      {or.devis && (
                        <span className="font-mono text-muted-foreground">
                          {or.devis.numeroDevis}
                        </span>
                      )}
                      {or.devis && (
                        <span className="ml-auto font-bold text-foreground tabular-nums">
                          {formatEuro(or.devis.totalTTC)} TTC
                        </span>
                      )}
                    </div>

                    {or.numeroFacture && (
                      <p className="text-xs font-mono text-chart-4 font-bold pt-1">
                        🧾 {or.numeroFacture}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
