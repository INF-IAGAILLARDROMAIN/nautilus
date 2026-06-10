"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Play,
  CheckCircle2,
  Receipt,
  Loader2,
  User,
  Anchor,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListPageHeader } from "@/components/list-page-header";
import { api, type StatutOR } from "@/lib/api";

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
  StatutOR,
  { label: string; cls: string; description: string }
> = {
  CREE: {
    label: "Créé",
    cls: "bg-muted text-muted-foreground border-transparent",
    description: "OR créé suite à la validation du devis. À assigner.",
  },
  EN_COURS: {
    label: "En cours",
    cls: "bg-primary text-primary-foreground border-transparent",
    description: "Intervention en cours dans l'atelier.",
  },
  TERMINE: {
    label: "Terminé",
    cls: "bg-chart-3 text-white border-transparent",
    description: "Intervention terminée, prêt à être facturé.",
  },
  FACTURE: {
    label: "Facturé",
    cls: "bg-chart-4 text-white border-transparent",
    description: "OR clos, facture générée.",
  },
};

const TYPES_OR_LABELS: Record<string, string> = {
  ENTRETIEN: "Entretien",
  REPARATION: "Réparation",
  HIVERNAGE: "Hivernage",
  DESHIVERNAGE: "Déshivernage",
  DEPANNAGE: "Dépannage",
};

export default function OrDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [mecanoDraft, setMecanoDraft] = useState<string | null>(null);

  const orQuery = useQuery({
    queryKey: ["or", id],
    queryFn: () => api.or.get(id),
  });

  const updateStatut = useMutation({
    mutationFn: (statut: StatutOR) => api.or.updateStatut(id, statut),
    onSuccess: (or) => {
      queryClient.invalidateQueries({ queryKey: ["or"] });
      queryClient.invalidateQueries({ queryKey: ["or", id] });
      queryClient.invalidateQueries({ queryKey: ["devis"] });
      queryClient.invalidateQueries({ queryKey: ["factures"] });
      toast.success(`Statut mis à jour : ${STATUT_LABELS[or.statut].label}`, {
        description:
          or.statut === "FACTURE"
            ? `Facture ${or.numeroFacture ?? ""} générée automatiquement.`
            : undefined,
      });
    },
    onError: (err) => {
      toast.error("Mise à jour impossible", {
        description: (err as Error).message,
      });
    },
  });

  const updateMecano = useMutation({
    mutationFn: (mecano: string | null) => api.or.assignMecano(id, mecano),
    onSuccess: (or) => {
      queryClient.invalidateQueries({ queryKey: ["or"] });
      queryClient.invalidateQueries({ queryKey: ["or", id] });
      toast.success(
        or.mecano
          ? `Mécano assigné : ${or.mecano}`
          : "Mécano retiré de l'OR",
      );
      setMecanoDraft(null);
    },
    onError: (err) => {
      toast.error("Affectation impossible", {
        description: (err as Error).message,
      });
    },
  });

  if (orQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (orQuery.isError || !orQuery.data) {
    return (
      <div className="flex min-h-screen flex-col bg-background pb-24">
        <ListPageHeader title="OR introuvable" />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
          <p className="text-destructive">
            {(orQuery.error as Error)?.message ?? "OR introuvable"}
          </p>
        </main>
      </div>
    );
  }

  const or = orQuery.data;
  const statutInfo = STATUT_LABELS[or.statut];

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <ListPageHeader
        title={TYPES_OR_LABELS[or.type] ?? or.type}
        subtitle={
          or.description ??
          `OR créé le ${formatDate(or.createdAt)}`
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
            {or.urgence === "URGENT" && (
              <Badge className="bg-destructive text-white border-transparent text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Urgent
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{statutInfo.description}</p>

          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {or.statut === "CREE" && (
              <Button
                onClick={() => updateStatut.mutate("EN_COURS")}
                disabled={updateStatut.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Play className="h-4 w-4 mr-2" />
                Démarrer l'intervention
              </Button>
            )}

            {or.statut === "EN_COURS" && (
              <Button
                onClick={() => updateStatut.mutate("TERMINE")}
                disabled={updateStatut.isPending}
                className="bg-chart-3 hover:bg-chart-3/90 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marquer comme terminé
              </Button>
            )}

            {or.statut === "TERMINE" && (
              <Button
                onClick={() => updateStatut.mutate("FACTURE")}
                disabled={updateStatut.isPending}
                className="bg-chart-4 hover:bg-chart-4/90 text-white"
              >
                <Receipt className="h-4 w-4 mr-2" />
                Facturer (génère la facture)
              </Button>
            )}

            {or.statut === "FACTURE" && or.numeroFacture && (
              <div className="px-3 py-2 rounded-md bg-chart-4/10 border border-chart-4/40 text-sm">
                ✅ Facture <span className="font-mono font-bold">{or.numeroFacture}</span> générée
              </div>
            )}

            {updateStatut.isPending && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground self-center" />
            )}
          </div>
        </section>

        {/* Mécano assigné */}
        <section className="p-4 rounded-xl border bg-card space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            👷 Mécano assigné
          </h2>
          {mecanoDraft === null ? (
            <div className="flex items-center gap-3">
              <p className="text-lg flex-1">
                {or.mecano ?? <span className="text-muted-foreground italic">Pas encore assigné</span>}
              </p>
              <Button
                onClick={() => setMecanoDraft(or.mecano ?? "")}
                variant="outline"
                size="sm"
                disabled={updateMecano.isPending}
              >
                {or.mecano ? "Changer" : "Assigner"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                value={mecanoDraft}
                onChange={(e) => setMecanoDraft(e.target.value)}
                placeholder="Nom du mécano"
                className="flex-1"
              />
              <Button
                onClick={() =>
                  updateMecano.mutate(mecanoDraft.trim() || null)
                }
                disabled={updateMecano.isPending}
                size="sm"
                className="bg-primary text-primary-foreground"
              >
                Valider
              </Button>
              <Button
                onClick={() => setMecanoDraft(null)}
                variant="ghost"
                size="sm"
                disabled={updateMecano.isPending}
              >
                Annuler
              </Button>
            </div>
          )}
        </section>

        {/* Type + urgence */}
        <section className="p-4 rounded-xl border bg-card grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Type
            </p>
            <p>{TYPES_OR_LABELS[or.type] ?? or.type}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Urgence
            </p>
            <p>{or.urgence === "URGENT" ? "🚨 Urgent" : "Normal"}</p>
          </div>
        </section>

        {/* Devis lié */}
        {or.devis && (
          <section className="p-4 rounded-xl border bg-card space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <FileText className="h-3 w-3" />
              Devis d'origine
            </h2>
            <Link
              href={`/dashboard/devis/${or.devis.id}`}
              className="block p-3 rounded-md border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold">{or.devis.numeroDevis}</span>
                <span className="text-sm font-semibold tabular-nums">
                  {formatEuro(or.devis.totalTTC)} TTC
                </span>
              </div>
            </Link>
          </section>
        )}

        {/* Bateau */}
        {or.devis?.bateau && (
          <section className="p-4 rounded-xl border bg-card space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Anchor className="h-3 w-3" />
              Bateau
            </h2>
            <p className="text-lg">
              {or.devis.bateau.marque} {or.devis.bateau.modele}
            </p>
            {or.devis.bateau.client && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span className="font-bold uppercase">
                  {or.devis.bateau.client.nom}
                </span>{" "}
                {or.devis.bateau.client.prenom}
              </p>
            )}
          </section>
        )}

        {/* Dates */}
        <section className="p-4 rounded-xl border bg-card grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Date début
            </p>
            <p>{formatDate(or.dateDebut)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Date fin
            </p>
            <p>{formatDate(or.dateFin)}</p>
          </div>
        </section>

        {or.statut === "FACTURE" && (
          <Button asChild variant="outline" className="w-full" disabled>
            <span>📄 Télécharger la facture PDF (bientôt)</span>
          </Button>
        )}
      </main>
    </div>
  );
}
