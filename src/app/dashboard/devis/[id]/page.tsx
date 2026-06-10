"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Send,
  Check,
  X,
  RotateCcw,
  Loader2,
  Wrench,
  User,
  Anchor,
  Calendar,
  CreditCard,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListPageHeader } from "@/components/list-page-header";
import { api, type StatutDevis } from "@/lib/api";

function formatEuro(value: string | number) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return n.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const STATUT_LABELS: Record<
  StatutDevis,
  { label: string; cls: string; description: string }
> = {
  BROUILLON: {
    label: "Brouillon",
    cls: "bg-muted text-muted-foreground border-transparent",
    description: "Devis en préparation, pas encore envoyé au client.",
  },
  ENVOYE: {
    label: "Transmis",
    cls: "bg-chart-4 text-white border-transparent",
    description:
      "Devis transmis au client (par impression, email perso ou autre), en attente de retour.",
  },
  VALIDE: {
    label: "Validé",
    cls: "bg-chart-3 text-white border-transparent",
    description: "Devis accepté par le client — un OR a été créé automatiquement.",
  },
  REFUSE: {
    label: "Refusé",
    cls: "bg-destructive text-white border-transparent",
    description: "Devis refusé par le client.",
  },
};

export default function DevisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pdfLoading, setPdfLoading] = useState(false);

  const devisQuery = useQuery({
    queryKey: ["devis", id],
    queryFn: () => api.devis.get(id),
  });

  // Téléchargement du PDF du devis. On fetch en mémoire (le JWT doit passer
  // en header → impossible avec un simple <a href>), puis on déclenche un
  // download depuis un Blob URL temporaire.
  async function handleDownloadPdf() {
    if (!devisQuery.data) return;
    setPdfLoading(true);
    const t = toast.loading("Génération du PDF…");
    try {
      const blob = await api.devis.downloadPdf(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${devisQuery.data.numeroDevis}.pdf`;
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
    } finally {
      setPdfLoading(false);
    }
  }

  const updateStatut = useMutation({
    mutationFn: (statut: StatutDevis) => api.devis.updateStatut(id, statut),
    onSuccess: (devis) => {
      queryClient.invalidateQueries({ queryKey: ["devis"] });
      queryClient.invalidateQueries({ queryKey: ["devis", id] });
      queryClient.invalidateQueries({ queryKey: ["or"] });
      queryClient.invalidateQueries({ queryKey: ["factures"] });
      toast.success(`Statut mis à jour : ${STATUT_LABELS[devis.statut].label}`, {
        description:
          devis.statut === "VALIDE"
            ? "Un OR a été créé automatiquement à partir de ce devis."
            : undefined,
      });
    },
    onError: (err) => {
      toast.error("Mise à jour impossible", {
        description: (err as Error).message,
      });
    },
  });

  if (devisQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (devisQuery.isError || !devisQuery.data) {
    return (
      <div className="flex min-h-screen flex-col bg-background pb-24">
        <ListPageHeader title="Devis introuvable" />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
          <p className="text-destructive">
            {(devisQuery.error as Error)?.message ?? "Devis introuvable"}
          </p>
        </main>
      </div>
    );
  }

  const devis = devisQuery.data;
  const statutInfo = STATUT_LABELS[devis.statut];

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <ListPageHeader
        title={devis.numeroDevis}
        subtitle={
          devis.description ?? `Créé le ${formatDate(devis.createdAt)}`
        }
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Statut + actions de changement */}
        <section className="p-4 rounded-xl border bg-card space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Statut
            </span>
            <Badge className={`${statutInfo.cls} text-sm py-1 px-3`}>
              {statutInfo.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{statutInfo.description}</p>

          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {/* Actions selon le statut actuel */}
            {devis.statut === "BROUILLON" && (
              <>
                <Button
                  onClick={() => updateStatut.mutate("ENVOYE")}
                  disabled={updateStatut.isPending}
                  className="bg-chart-4 hover:bg-chart-4/90 text-white"
                  title="Marquer comme transmis au client (transmission manuelle : impression, email perso…)"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Marquer comme transmis
                </Button>
                <Button
                  onClick={() => updateStatut.mutate("VALIDE")}
                  disabled={updateStatut.isPending}
                  className="bg-chart-3 hover:bg-chart-3/90 text-white"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Valider (crée l'OR)
                </Button>
              </>
            )}

            {devis.statut === "ENVOYE" && (
              <>
                <Button
                  onClick={() => updateStatut.mutate("VALIDE")}
                  disabled={updateStatut.isPending}
                  className="bg-chart-3 hover:bg-chart-3/90 text-white"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Valider (crée l'OR)
                </Button>
                <Button
                  onClick={() => updateStatut.mutate("REFUSE")}
                  disabled={updateStatut.isPending}
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4 mr-2" />
                  Refuser
                </Button>
              </>
            )}

            {devis.statut === "VALIDE" && devis.ordreReparation && (
              <Button
                onClick={() =>
                  router.push(`/dashboard/or/${devis.ordreReparation!.id}`)
                }
                variant="outline"
              >
                <Wrench className="h-4 w-4 mr-2" />
                Voir l'OR créé
              </Button>
            )}

            {devis.statut === "REFUSE" && (
              <Button
                onClick={() => updateStatut.mutate("BROUILLON")}
                disabled={updateStatut.isPending}
                variant="outline"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Remettre en brouillon
              </Button>
            )}

            {updateStatut.isPending && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground self-center" />
            )}
          </div>
        </section>

        {/* Client */}
        {devis.client && (
          <section className="p-4 rounded-xl border bg-card space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <User className="h-3 w-3" />
              Client
            </h2>
            <p className="text-lg">
              <span className="font-bold uppercase">{devis.client.nom}</span>{" "}
              {devis.client.prenom}
            </p>
          </section>
        )}

        {/* Bateau */}
        {devis.bateau ? (
          <section className="p-4 rounded-xl border bg-card space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Anchor className="h-3 w-3" />
              Bateau
            </h2>
            <p className="text-lg">
              {devis.bateau.nom && (
                <>
                  <span className="font-semibold italic">{devis.bateau.nom}</span>
                  <span className="text-muted-foreground"> · </span>
                </>
              )}
              {devis.bateau.marque} {devis.bateau.modele}
            </p>
          </section>
        ) : (
          <section className="p-4 rounded-xl border border-dashed bg-muted/30 space-y-2">
            <p className="text-sm text-muted-foreground italic">
              Devis sans bateau associé (pré-vente / accessoires).
            </p>
          </section>
        )}

        {/* Lignes du devis */}
        <section className="p-4 rounded-xl border bg-card space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            💶 Lignes ({devis.lignes.length})
          </h2>
          <div className="space-y-2">
            {devis.lignes.map((l) => (
              <div
                key={l.id}
                className="flex items-start justify-between gap-3 pb-2 border-b last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{l.description}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {parseFloat(l.quantite)} × {formatEuro(l.prixUnitaireHT)}
                  </p>
                </div>
                <p className="text-sm font-semibold tabular-nums shrink-0">
                  {formatEuro(l.totalLigneHT)}
                </p>
              </div>
            ))}
          </div>

          {/* Totaux */}
          <div className="pt-3 border-t-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total HT</span>
              <span className="font-medium tabular-nums">
                {formatEuro(devis.totalHT)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                TVA ({parseFloat(devis.tauxTVA ?? "20")}%)
              </span>
              <span className="font-medium tabular-nums">
                {formatEuro(
                  parseFloat(devis.totalTTC) - parseFloat(devis.totalHT),
                )}
              </span>
            </div>
            <div className="flex justify-between text-lg pt-1 border-t">
              <span className="font-bold">Total TTC</span>
              <span className="font-bold tabular-nums text-primary">
                {formatEuro(devis.totalTTC)}
              </span>
            </div>
          </div>
        </section>

        {/* Mentions légales */}
        <section className="p-4 rounded-xl border bg-card space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            📅 Mentions légales
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Validité du devis</p>
                <p className="text-muted-foreground">
                  {formatDate(devis.dateValidite)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Modalités de paiement</p>
                <p className="text-muted-foreground">
                  {devis.modalitesPaiement ?? "—"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Téléchargement du PDF du devis (mentions légales FR + RGPD + signature) */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleDownloadPdf}
          disabled={pdfLoading}
        >
          {pdfLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Génération…
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Télécharger le devis en PDF
            </>
          )}
        </Button>
      </main>
    </div>
  );
}
