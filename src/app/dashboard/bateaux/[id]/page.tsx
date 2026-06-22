"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  User,
  Anchor,
  Cog,
  Hash,
  Receipt,
  Wrench,
  FileText,
  Plus,
  ChevronRight,
  Calendar,
  StickyNote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListPageHeader } from "@/components/list-page-header";
import { formatEuro, formatDateShort } from "@/lib/format";
import {
  api,
  type Devis,
  type StatutDevis,
  type StatutOR,
  type TypeCoque,
} from "@/lib/api";

const TYPE_COQUE_LABEL: Record<TypeCoque, string> = {
  STRATIFIE: "Stratifié",
  ALUMINIUM: "Aluminium",
  POLYETHYLENE: "Polyéthylène",
  SEMI_RIGIDE: "Semi-rigide",
  PNEUMATIQUE: "Pneumatique",
  BOIS: "Bois",
  ACIER: "Acier",
  AUTRE: "Autre",
};

const STATUT_DEVIS_BADGE: Record<StatutDevis, { label: string; cls: string }> = {
  BROUILLON: {
    label: "Brouillon",
    cls: "bg-muted text-muted-foreground border-transparent",
  },
  ENVOYE: { label: "Transmis", cls: "bg-chart-4 text-white border-transparent" },
  VALIDE: { label: "Validé", cls: "bg-chart-3 text-white border-transparent" },
  REFUSE: {
    label: "Refusé",
    cls: "bg-destructive text-white border-transparent",
  },
};

const STATUT_OR_BADGE: Record<StatutOR, { label: string; cls: string }> = {
  CREE: { label: "Créé", cls: "bg-muted text-muted-foreground border-transparent" },
  EN_COURS: {
    label: "En cours",
    cls: "bg-primary text-primary-foreground border-transparent",
  },
  TERMINE: { label: "Terminé", cls: "bg-chart-3 text-white border-transparent" },
  FACTURE: { label: "Facturé", cls: "bg-chart-4 text-white border-transparent" },
};

export default function BateauDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const bateauQuery = useQuery({
    queryKey: ["bateau", id],
    queryFn: () => api.bateaux.get(id),
  });

  if (bateauQuery.isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background pb-24">
        <ListPageHeader title="Chargement…" />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
          <div className="flex items-center justify-center gap-2 p-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Chargement du bateau…</span>
          </div>
        </main>
      </div>
    );
  }

  if (bateauQuery.isError || !bateauQuery.data) {
    return (
      <div className="flex min-h-screen flex-col bg-background pb-24">
        <ListPageHeader title="Bateau introuvable" />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
          <div className="p-4 rounded-xl border border-destructive bg-destructive/10 text-destructive">
            <p className="font-semibold">Impossible de charger ce bateau</p>
            <p className="text-sm mt-1">
              {(bateauQuery.error as Error | undefined)?.message ?? ""}
            </p>
          </div>
        </main>
      </div>
    );
  }

  const bateau = bateauQuery.data;
  const devis = bateau.devis ?? [];
  const ors = devis
    .filter((d) => d.ordreReparation)
    .map((d) => ({ devis: d, or: d.ordreReparation! }));
  const factures = ors.filter((x) => x.or.statut === "FACTURE");

  // Titre dynamique : nom propre en premier si présent, sinon marque/modèle
  const title = bateau.nom ?? `${bateau.marque} ${bateau.modele}`;
  const subtitle = bateau.nom
    ? `${bateau.marque} ${bateau.modele}`
    : `Ajouté le ${formatDateShort(bateau.createdAt)}`;

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <ListPageHeader title={title} subtitle={subtitle} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Propriétaire */}
        {bateau.client && (
          <Link
            href={`/dashboard/clients/${bateau.client.id}`}
            className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-muted/30 transition"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
              <User className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Propriétaire
              </p>
              <p className="font-semibold">
                <span className="font-bold uppercase">{bateau.client.nom}</span>{" "}
                {bateau.client.prenom}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </Link>
        )}

        {/* Caractéristiques bateau */}
        <section className="p-4 rounded-xl border bg-card space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Anchor className="h-4 w-4" />
            Bateau
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Marque · Modèle</p>
              <p className="font-semibold">
                {bateau.marque} {bateau.modele}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Type de coque</p>
              <p className="font-semibold">{TYPE_COQUE_LABEL[bateau.typeCoque]}</p>
            </div>
            {bateau.annee && (
              <div>
                <p className="text-xs text-muted-foreground">Année</p>
                <p className="font-semibold">{bateau.annee}</p>
              </div>
            )}
            {bateau.immatriculation && (
              <div>
                <p className="text-xs text-muted-foreground">Immatriculation</p>
                <p className="font-semibold font-mono">{bateau.immatriculation}</p>
              </div>
            )}
          </div>
        </section>

        {/* Motorisation */}
        {(bateau.marqueMoteur ||
          bateau.modeleMoteur ||
          bateau.puissanceCV ||
          bateau.plaqueMoteur ||
          bateau.helice) && (
          <section className="p-4 rounded-xl border bg-card space-y-3">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Cog className="h-4 w-4" />
              Motorisation
            </h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {bateau.marqueMoteur && (
                <div>
                  <p className="text-xs text-muted-foreground">Marque</p>
                  <p className="font-semibold">{bateau.marqueMoteur}</p>
                </div>
              )}
              {bateau.modeleMoteur && (
                <div>
                  <p className="text-xs text-muted-foreground">Modèle</p>
                  <p className="font-semibold">{bateau.modeleMoteur}</p>
                </div>
              )}
              {bateau.puissanceCV && (
                <div>
                  <p className="text-xs text-muted-foreground">Puissance</p>
                  <p className="font-semibold">{bateau.puissanceCV} CV</p>
                </div>
              )}
              {bateau.helice && (
                <div>
                  <p className="text-xs text-muted-foreground">Hélice</p>
                  <p className="font-semibold font-mono">{bateau.helice}</p>
                </div>
              )}
              {bateau.plaqueMoteur && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Plaque moteur
                  </p>
                  <p className="font-semibold font-mono">{bateau.plaqueMoteur}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Notes */}
        {bateau.notes && (
          <section className="p-4 rounded-xl border bg-card space-y-2">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              Notes
            </h2>
            <p className="text-sm whitespace-pre-wrap">{bateau.notes}</p>
          </section>
        )}

        {/* Devis */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Devis
            </h2>
            {bateau.client && (
              <Button asChild size="sm" variant="outline" className="h-8">
                <Link
                  href={`/dashboard/devis/nouveau?clientId=${bateau.client.id}&bateauId=${bateau.id}`}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Nouveau
                </Link>
              </Button>
            )}
          </div>
          {devis.length === 0 && (
            <div className="p-4 text-center rounded-xl border border-dashed bg-muted/30 text-sm text-muted-foreground">
              Aucun devis pour ce bateau.
            </div>
          )}
          {devis.length > 0 && (
            <div className="space-y-2">
              {devis.map((d: Devis) => {
                const badge = STATUT_DEVIS_BADGE[d.statut];
                return (
                  <Link
                    key={d.id}
                    href={`/dashboard/devis/${d.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition"
                  >
                    <Receipt className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-mono font-semibold text-sm">
                          {d.numeroDevis}
                        </p>
                        <Badge className={`${badge.cls} text-[10px]`}>
                          {badge.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDateShort(d.createdAt)}
                        {d.description && (
                          <span className="truncate"> · {d.description}</span>
                        )}
                      </p>
                    </div>
                    <span className="font-bold tabular-nums text-sm">
                      {formatEuro(d.totalTTC)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* OR */}
        <section className="space-y-3">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Ordres de réparation
          </h2>
          {ors.length === 0 && (
            <div className="p-4 text-center rounded-xl border border-dashed bg-muted/30 text-sm text-muted-foreground">
              Aucun OR.
            </div>
          )}
          {ors.length > 0 && (
            <div className="space-y-2">
              {ors.map(({ devis: d, or }) => {
                const badge = STATUT_OR_BADGE[or.statut];
                return (
                  <Link
                    key={or.id}
                    href={`/dashboard/or/${or.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition"
                  >
                    <Wrench className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-mono text-sm">{d.numeroDevis}</p>
                        <Badge className={`${badge.cls} text-[10px]`}>
                          {badge.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {or.mecano ? `👷 ${or.mecano}` : "Mécano non assigné"}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Factures */}
        {factures.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Factures
            </h2>
            <div className="space-y-2">
              {factures.map(({ devis: d, or }) => (
                <Link
                  key={or.id}
                  href={`/dashboard/or/${or.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition"
                >
                  <FileText className="h-4 w-4 text-chart-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono font-bold text-sm">
                      {or.numeroFacture ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Devis {d.numeroDevis} · {formatDateShort(or.createdAt)}
                    </p>
                  </div>
                  <span className="font-bold tabular-nums text-sm">
                    {formatEuro(d.totalTTC)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
