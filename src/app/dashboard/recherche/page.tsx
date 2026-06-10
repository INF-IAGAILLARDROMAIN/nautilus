"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Search,
  Loader2,
  Anchor,
  Receipt,
  Wrench,
  User,
  FileText,
  Users,
  Sparkles,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

function formatEuro(value: string | number) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

// -----------------------------------------------------------------------------
// Composants de rendu par intent
// -----------------------------------------------------------------------------

type ResultatBateau = {
  id: string;
  marque: string;
  modele: string;
  nom: string | null;
  marqueMoteur: string | null;
  modeleMoteur: string | null;
  puissanceCV: number | null;
  client?: { id: string; nom: string; prenom: string };
};

type ResultatDevis = {
  id: string;
  numeroDevis: string;
  description: string | null;
  statut: string;
  totalTTC: string;
  createdAt: string;
  client?: { id: string; nom: string; prenom: string };
  bateau?: { id: string; marque: string; modele: string; nom: string | null } | null;
};

type ResultatOr = {
  id: string;
  type: string;
  urgence: string;
  statut: string;
  mecano: string | null;
  numeroFacture: string | null;
  devis?: {
    numeroDevis: string;
    totalTTC: string;
    client?: { id: string; nom: string; prenom: string };
    bateau?: { id: string; marque: string; modele: string } | null;
  };
};

type StatsGlobal = {
  clients: number;
  bateaux: number;
  devis: number;
  ors: number;
  factures: number;
};

function RenduBateaux({ items }: { items: ResultatBateau[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      {items.map((b) => (
        <Link
          key={b.id}
          href={`/dashboard/bateaux/${b.id}`}
          className="flex items-center gap-3 p-4 rounded-xl bg-card border hover:bg-muted/30 transition"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
            <Anchor className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold leading-tight">
              {b.nom ? (
                <>
                  <span className="italic">{b.nom}</span>
                  <span className="text-muted-foreground font-normal">
                    {" "}· {b.marque} {b.modele}
                  </span>
                </>
              ) : (
                <>{b.marque} {b.modele}</>
              )}
            </p>
            {b.client && (
              <p className="text-sm text-muted-foreground">
                <span className="font-bold uppercase">{b.client.nom}</span>{" "}
                {b.client.prenom}
              </p>
            )}
            {(b.marqueMoteur || b.puissanceCV) && (
              <p className="text-xs text-muted-foreground">
                Moteur {b.marqueMoteur ?? "?"} {b.modeleMoteur ?? ""}
                {b.puissanceCV ? ` · ${b.puissanceCV} CV` : ""}
              </p>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
        </Link>
      ))}
    </div>
  );
}

function RenduDevis({ items }: { items: ResultatDevis[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      {items.map((d) => (
        <Link
          key={d.id}
          href={`/dashboard/devis/${d.id}`}
          className="flex items-center gap-3 p-4 rounded-xl bg-card border hover:bg-muted/30 transition"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-white">
            <Receipt className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-mono font-bold">{d.numeroDevis}</p>
              <Badge className="text-[10px]">{d.statut}</Badge>
            </div>
            {d.client && (
              <p className="text-sm">
                <span className="font-bold uppercase">{d.client.nom}</span>{" "}
                {d.client.prenom}
                {d.bateau && (
                  <span className="text-muted-foreground">
                    {" "}· {d.bateau.marque} {d.bateau.modele}
                  </span>
                )}
              </p>
            )}
            {d.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {d.description}
              </p>
            )}
          </div>
          <span className="font-bold tabular-nums shrink-0">
            {formatEuro(d.totalTTC)}
          </span>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
        </Link>
      ))}
    </div>
  );
}

function RenduOrs({ items }: { items: ResultatOr[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      {items.map((or) => (
        <Link
          key={or.id}
          href={`/dashboard/or/${or.id}`}
          className="flex items-center gap-3 p-4 rounded-xl bg-card border hover:bg-muted/30 transition"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
            <Wrench className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold">{or.type}</p>
              <Badge className="text-[10px]">{or.statut}</Badge>
              {or.urgence === "URGENT" && (
                <Badge className="bg-destructive text-white text-[10px]">
                  🚨 URGENT
                </Badge>
              )}
            </div>
            {or.devis?.client && (
              <p className="text-sm">
                <span className="font-bold uppercase">{or.devis.client.nom}</span>{" "}
                {or.devis.client.prenom}
                {or.devis.bateau && (
                  <span className="text-muted-foreground">
                    {" "}· {or.devis.bateau.marque} {or.devis.bateau.modele}
                  </span>
                )}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {or.mecano ? `👷 ${or.mecano}` : "Mécano non assigné"}
              {or.devis && (
                <span className="font-mono ml-2">{or.devis.numeroDevis}</span>
              )}
              {or.numeroFacture && (
                <span className="text-chart-4 font-bold ml-2">
                  🧾 {or.numeroFacture}
                </span>
              )}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
        </Link>
      ))}
    </div>
  );
}

function RenduStats({ stats }: { stats: StatsGlobal }) {
  const items = [
    { label: "Clients", value: stats.clients, icon: Users, color: "bg-primary" },
    { label: "Bateaux", value: stats.bateaux, icon: Anchor, color: "bg-chart-2" },
    { label: "Devis", value: stats.devis, icon: Receipt, color: "bg-accent" },
    { label: "OR", value: stats.ors, icon: Wrench, color: "bg-chart-3" },
    { label: "Factures", value: stats.factures, icon: FileText, color: "bg-chart-4" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="p-4 rounded-xl border bg-card text-center space-y-2"
        >
          <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-lg ${color} text-white`}>
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-3xl font-bold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Page principale
// -----------------------------------------------------------------------------

function RecherchePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [question, setQuestion] = useState(initialQ);

  // Question effectivement envoyée à l'API (déclenchée par submit ou ?q=)
  const [submitted, setSubmitted] = useState(initialQ);

  useEffect(() => {
    setQuestion(initialQ);
    setSubmitted(initialQ);
  }, [initialQ]);

  const query = useQuery({
    queryKey: ["recherche", submitted],
    queryFn: () => api.recherche.ask(submitted),
    enabled: submitted.trim().length >= 2,
    retry: false,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (q.length < 2) return;
    setSubmitted(q);
    router.replace(`/dashboard/recherche?q=${encodeURIComponent(q)}`);
  }

  const data = query.data;

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground shadow-md">
        <div className="flex items-center gap-3 px-4 py-3 max-w-3xl mx-auto">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            aria-label="Retour au dashboard"
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold leading-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Recherche IA
            </h1>
            <p className="text-xs text-primary-foreground/80">
              Mistral · IA souveraine FR · data Paris
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Barre de recherche persistante */}
        <form onSubmit={handleSubmit} className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Reformule ou pose une autre question…"
            className="pl-11 pr-24 h-12 text-base"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            minLength={2}
            maxLength={500}
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9"
            disabled={question.trim().length < 2 || query.isFetching}
          >
            {query.isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Demander"
            )}
          </Button>
        </form>

        {/* État vide (rien tapé encore) */}
        {!submitted && (
          <div className="p-8 text-center rounded-xl border border-dashed bg-muted/30">
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="font-semibold">Pose une question en français</p>
            <p className="text-sm text-muted-foreground mt-1">
              Exemples : «&nbsp;bateau de Martin&nbsp;», «&nbsp;OR en cours&nbsp;»,
              «&nbsp;combien de clients&nbsp;»
            </p>
          </div>
        )}

        {/* Chargement */}
        {query.isFetching && (
          <div className="flex items-center justify-center gap-2 p-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Mistral analyse ta question…</span>
          </div>
        )}

        {/* Erreur */}
        {query.isError && (
          <div className="p-4 rounded-xl border border-destructive bg-destructive/10 text-destructive">
            <p className="font-semibold">Le moteur IA a rencontré un souci</p>
            <p className="text-sm mt-1">
              {(query.error as Error | undefined)?.message ?? ""}
            </p>
          </div>
        )}

        {/* Résultat */}
        {data && !query.isFetching && (
          <>
            {/* Bandeau "ce que j'ai compris" */}
            <div className="p-3 rounded-xl border bg-card space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  Compris par l&apos;IA
                </span>
                <Badge className="text-[10px] font-mono">{data.intent}</Badge>
                <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {data.tempsMs} ms
                </span>
              </div>
              {data.explanation && (
                <p className="text-sm italic">«&nbsp;{data.explanation}&nbsp;»</p>
              )}
              {Object.keys(data.entities).length > 0 && (
                <p className="text-xs text-muted-foreground font-mono">
                  {JSON.stringify(data.entities)}
                </p>
              )}
            </div>

            {/* Bandeau "j'ai élargi la recherche pour toi" */}
            {data.messageInfo && (
              <div className="p-3 rounded-xl border border-chart-4/40 bg-chart-4/10 text-sm">
                <span className="font-bold">💡 </span>
                {data.messageInfo}
              </div>
            )}

            {/* Résultats selon intent */}
            {data.resultatsCount === 0 && data.intent !== "fallback" && (
              <div className="p-8 text-center rounded-xl border border-dashed bg-muted/30">
                <p className="font-semibold">Aucun résultat trouvé</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Essaie de reformuler ou élargir la question.
                </p>
              </div>
            )}

            {data.intent === "fallback" && (
              <div className="p-8 text-center rounded-xl border border-dashed bg-muted/30">
                <p className="font-semibold">
                  Je n&apos;ai pas compris la question
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Essaie : «&nbsp;bateau de [client]&nbsp;», «&nbsp;OR en
                  cours&nbsp;», «&nbsp;combien de clients&nbsp;»
                </p>
              </div>
            )}

            {data.intent === "find_bateau_by_client" && (
              <RenduBateaux items={data.resultats as ResultatBateau[]} />
            )}

            {(data.intent === "find_devis_by_client" ||
              data.intent === "list_recent_devis") && (
              <RenduDevis items={data.resultats as ResultatDevis[]} />
            )}

            {(data.intent === "list_or_by_statut" ||
              data.intent === "list_or_urgents" ||
              data.intent === "find_or_by_client" ||
              data.intent === "find_facture_by_client" ||
              data.intent === "find_facture_by_numero") && (
              <RenduOrs items={data.resultats as ResultatOr[]} />
            )}

            {data.intent === "stats_global" && (
              <RenduStats stats={data.resultats as StatsGlobal} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function RecherchePage() {
  // useSearchParams() doit être dans une <Suspense> côté Next.js App Router
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <RecherchePageInner />
    </Suspense>
  );
}
