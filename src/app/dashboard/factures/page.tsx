"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FileText,
  Loader2,
  Anchor,
  User,
  Download,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ListPageHeader } from "@/components/list-page-header";
import { normalizeForSearch } from "@/lib/data/marques";
import { api, type OrdreReparation } from "@/lib/api";
import { formatEuro, formatDate } from "@/lib/format";

async function downloadFacture(or: OrdreReparation) {
  if (!or.numeroFacture) return;
  const t = toast.loading("Génération du PDF…");
  try {
    const blob = await api.or.downloadFacturePdf(or.id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${or.numeroFacture}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("PDF téléchargé", { id: t });
  } catch (err) {
    toast.error("Téléchargement impossible", {
      id: t,
      description: (err as Error).message,
    });
  }
}

export default function FacturesListPage() {
  const [query, setQuery] = useState("");
  // Une facture = un OR au statut FACTURE (numeroFacture généré auto).
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["factures"],
    queryFn: api.factures.list,
  });

  // Filtrage côté client : n° facture, n° devis, client, bateau (accents ignorés)
  const filtered = (data?.data ?? []).filter((f) => {
    if (!query.trim()) return true;
    const q = normalizeForSearch(query);
    const bateauStr = f.devis?.bateau
      ? normalizeForSearch(`${f.devis.bateau.marque} ${f.devis.bateau.modele}`)
      : "";
    const clientStr = f.devis?.bateau?.client
      ? normalizeForSearch(
          `${f.devis.bateau.client.nom} ${f.devis.bateau.client.prenom}`,
        )
      : "";
    return (
      (f.numeroFacture ? normalizeForSearch(f.numeroFacture).includes(q) : false) ||
      (f.devis ? normalizeForSearch(f.devis.numeroDevis).includes(q) : false) ||
      (f.description ? normalizeForSearch(f.description).includes(q) : false) ||
      bateauStr.includes(q) ||
      clientStr.includes(q)
    );
  });

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <ListPageHeader
        title="Factures"
        subtitle={
          isLoading
            ? "Chargement…"
            : data
              ? `${data.total} facture${data.total > 1 ? "s" : ""} émise${
                  data.total > 1 ? "s" : ""
                }`
              : undefined
        }
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-5">
        <Input
          type="search"
          placeholder="Rechercher par numéro, client, bateau, devis…"
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
            <span>Chargement des factures…</span>
          </div>
        )}

        {isError && (
          <div className="p-4 rounded-xl border border-destructive bg-destructive/10 text-destructive">
            <p className="font-semibold">Impossible de charger les factures</p>
            <p className="text-sm mt-1">{(error as Error).message}</p>
          </div>
        )}

        {data && data.data.length === 0 && (
          <div className="p-8 text-center rounded-xl border border-dashed bg-muted/30">
            <p className="font-semibold">Aucune facture pour le moment</p>
            <p className="text-sm text-muted-foreground mt-1">
              Les factures sont générées automatiquement lorsqu&apos;un OR passe
              au statut « facturé ».
            </p>
          </div>
        )}

        {data && data.data.length > 0 && filtered.length === 0 && (
          <div className="p-8 text-center rounded-xl border border-dashed bg-muted/30">
            <p className="font-semibold">Aucune facture ne correspond à « {query} »</p>
            <p className="text-sm text-muted-foreground mt-1">
              Essaie un autre terme.
            </p>
          </div>
        )}

        {data && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((f: OrdreReparation) => (
              <div
                key={f.id}
                className="flex items-start gap-3 p-4 rounded-xl bg-card border"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-chart-4 text-white">
                  <FileText className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-start gap-2 justify-between flex-wrap">
                    <h3 className="text-lg font-bold leading-tight font-mono">
                      {f.numeroFacture ?? "—"}
                    </h3>
                    <span className="text-lg font-bold tabular-nums">
                      {f.devis ? formatEuro(f.devis.totalTTC) : "—"}{" "}
                      <span className="text-xs text-muted-foreground">TTC</span>
                    </span>
                  </div>

                  {f.devis?.bateau && (
                    <p className="text-sm font-medium flex items-center gap-1.5 flex-wrap">
                      <Anchor className="h-3.5 w-3.5" />
                      {f.devis.bateau.marque} {f.devis.bateau.modele}
                      {f.devis.bateau.client && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            <span className="font-bold uppercase">
                              {f.devis.bateau.client.nom}
                            </span>{" "}
                            {f.devis.bateau.client.prenom}
                          </span>
                        </>
                      )}
                    </p>
                  )}

                  {f.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {f.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs pt-1 flex-wrap text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(f.updatedAt)}
                    </span>
                    {f.devis && (
                      <span className="font-mono">{f.devis.numeroDevis}</span>
                    )}
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => downloadFacture(f)}
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Télécharger le PDF
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
