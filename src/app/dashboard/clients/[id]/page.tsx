"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  Mail,
  Phone,
  MapPin,
  StickyNote,
  Anchor,
  Receipt,
  Wrench,
  FileText,
  Plus,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListPageHeader } from "@/components/list-page-header";
import {
  api,
  type Bateau,
  type Devis,
  type StatutDevis,
  type StatutOR,
} from "@/lib/api";

function formatEuro(value: string | number) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return n.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

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

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const clientQuery = useQuery({
    queryKey: ["client", id],
    queryFn: () => api.clients.get(id),
  });

  if (clientQuery.isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background pb-24">
        <ListPageHeader title="Chargement…" />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
          <div className="flex items-center justify-center gap-2 p-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Chargement du client…</span>
          </div>
        </main>
      </div>
    );
  }

  if (clientQuery.isError || !clientQuery.data) {
    return (
      <div className="flex min-h-screen flex-col bg-background pb-24">
        <ListPageHeader title="Client introuvable" />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
          <div className="p-4 rounded-xl border border-destructive bg-destructive/10 text-destructive">
            <p className="font-semibold">Impossible de charger ce client</p>
            <p className="text-sm mt-1">
              {(clientQuery.error as Error | undefined)?.message ?? ""}
            </p>
          </div>
        </main>
      </div>
    );
  }

  const client = clientQuery.data;
  const bateaux = client.bateaux ?? [];
  const devis = client.devis ?? [];
  // Dérive les OR à partir des devis qui en ont un (statut VALIDE)
  const ors = devis
    .filter((d) => d.ordreReparation)
    .map((d) => ({ devis: d, or: d.ordreReparation! }));
  // Factures = OR au statut FACTURE
  const factures = ors.filter((x) => x.or.statut === "FACTURE");

  const totalCA = factures.reduce(
    (acc, x) => acc + parseFloat(x.devis.totalTTC),
    0,
  );

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <ListPageHeader
        title={`${client.nom.toUpperCase()} ${client.prenom}`}
        subtitle={`Client depuis le ${formatDate(client.createdAt)}`}
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Coordonnées */}
        <section className="p-4 rounded-xl border bg-card space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
            Coordonnées
          </h2>
          {!client.email &&
            !client.telephone &&
            !client.adresse &&
            !client.ville && (
              <p className="text-sm text-muted-foreground italic">
                Aucune coordonnée enregistrée.
              </p>
            )}
          {client.email && (
            <p className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <a
                href={`mailto:${client.email}`}
                className="text-primary hover:underline break-all"
              >
                {client.email}
              </a>
            </p>
          )}
          {client.telephone && (
            <p className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <a
                href={`tel:${client.telephone.replace(/\s/g, "")}`}
                className="text-primary hover:underline"
              >
                {client.telephone}
              </a>
            </p>
          )}
          {(client.adresse || client.ville || client.codePostal) && (
            <p className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <span>
                {client.adresse && <>{client.adresse}<br /></>}
                {client.codePostal} {client.ville}
              </span>
            </p>
          )}
          {client.notes && (
            <p className="flex items-start gap-2 text-sm text-muted-foreground border-t pt-3 mt-3">
              <StickyNote className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="whitespace-pre-wrap">{client.notes}</span>
            </p>
          )}
        </section>

        {/* KPIs rapides */}
        <section className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl border bg-card text-center">
            <p className="text-2xl font-bold tabular-nums">{bateaux.length}</p>
            <p className="text-xs text-muted-foreground">
              Bateau{bateaux.length > 1 ? "x" : ""}
            </p>
          </div>
          <div className="p-3 rounded-xl border bg-card text-center">
            <p className="text-2xl font-bold tabular-nums">{devis.length}</p>
            <p className="text-xs text-muted-foreground">
              Devis
            </p>
          </div>
          <div className="p-3 rounded-xl border bg-card text-center">
            <p className="text-lg font-bold tabular-nums leading-tight">
              {formatEuro(totalCA)}
            </p>
            <p className="text-xs text-muted-foreground">CA facturé</p>
          </div>
        </section>

        {/* Bateaux */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Anchor className="h-4 w-4" />
              Bateaux
            </h2>
            <Button asChild size="sm" variant="outline" className="h-8">
              <Link href={`/dashboard/bateaux/nouveau?clientId=${client.id}`}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Ajouter
              </Link>
            </Button>
          </div>
          {bateaux.length === 0 && (
            <div className="p-4 text-center rounded-xl border border-dashed bg-muted/30 text-sm text-muted-foreground">
              Aucun bateau enregistré.
            </div>
          )}
          {bateaux.length > 0 && (
            <div className="space-y-2">
              {bateaux.map((b: Bateau) => (
                <Link
                  key={b.id}
                  href={`/dashboard/bateaux/${b.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition"
                >
                  <Anchor className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm leading-tight">
                      {b.nom ? (
                        <>
                          <span className="italic">{b.nom}</span>
                          <span className="text-muted-foreground font-normal">
                            {" "}· {b.marque} {b.modele}
                          </span>
                        </>
                      ) : (
                        <>
                          {b.marque} {b.modele}
                        </>
                      )}
                    </p>
                    {(b.marqueMoteur || b.puissanceCV) && (
                      <p className="text-xs text-muted-foreground">
                        Moteur {b.marqueMoteur ?? "?"} {b.modeleMoteur ?? ""}
                        {b.puissanceCV ? ` · ${b.puissanceCV} CV` : ""}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Devis */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Devis
            </h2>
            <Button asChild size="sm" variant="outline" className="h-8">
              <Link href={`/dashboard/devis/nouveau?clientId=${client.id}`}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Nouveau
              </Link>
            </Button>
          </div>
          {devis.length === 0 && (
            <div className="p-4 text-center rounded-xl border border-dashed bg-muted/30 text-sm text-muted-foreground">
              Aucun devis.
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
                      <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(d.createdAt)}
                        </span>
                        {d.bateau && (
                          <span>
                            · {d.bateau.marque} {d.bateau.modele}
                          </span>
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

        {/* Ordres de réparation */}
        <section className="space-y-3">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Ordres de réparation
          </h2>
          {ors.length === 0 && (
            <div className="p-4 text-center rounded-xl border border-dashed bg-muted/30 text-sm text-muted-foreground">
              Aucun OR. Un OR est créé automatiquement quand un devis est validé.
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
                        {d.bateau && (
                          <> · {d.bateau.marque} {d.bateau.modele}</>
                        )}
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
        <section className="space-y-3">
          <h2 className="text-base font-bold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Factures
          </h2>
          {factures.length === 0 && (
            <div className="p-4 text-center rounded-xl border border-dashed bg-muted/30 text-sm text-muted-foreground">
              Aucune facture émise.
            </div>
          )}
          {factures.length > 0 && (
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
                      Devis {d.numeroDevis} · {formatDate(or.createdAt)}
                    </p>
                  </div>
                  <span className="font-bold tabular-nums text-sm">
                    {formatEuro(d.totalTTC)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
