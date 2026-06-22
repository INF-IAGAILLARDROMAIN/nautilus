"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Users,
  Ship,
  Receipt,
  Wrench,
  FileText,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/client";
import { api } from "@/lib/api";

// Dérive le prénom + 2 initiales (prénom + nom) depuis la session Supabase.
// Cherche dans l'ordre :
//   1. user_metadata.first_name + user_metadata.last_name (les 2 séparés → idéal)
//   2. user_metadata.full_name OU .name avec ≥ 2 mots → splitté
//   3. partie locale de l'email type "prenom.nom@" / "prenom-nom@" / "prenom_nom@"
//   4. fallback : initiale du prénom + "?" (signal visible "metadata incomplète")
function extractIdentity(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
} | null): { firstName: string; initials: string } {
  if (!user) return { firstName: "", initials: "…" };
  const meta = user.user_metadata ?? {};

  // Priorité 1 : prénom + nom séparés
  const firstName =
    (typeof meta.first_name === "string" && meta.first_name.trim()) || "";
  const lastName =
    (typeof meta.last_name === "string" && meta.last_name.trim()) || "";
  if (firstName && lastName) {
    return {
      firstName,
      initials: `${firstName[0]}${lastName[0]}`.toUpperCase(),
    };
  }

  // Priorité 2 : full_name ou name avec ≥ 2 mots
  const fullName =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    "";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return {
      firstName: firstName || parts[0],
      initials: `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase(),
    };
  }

  // Priorité 3 : email type prenom.nom@ / prenom-nom@ / prenom_nom@
  const local = (user.email ?? "").split("@")[0] ?? "";
  const localParts = local.split(/[._-]/).filter((p) => /^[a-z]+$/i.test(p));
  if (localParts.length >= 2) {
    return {
      firstName: firstName || parts[0] || localParts[0],
      initials:
        `${localParts[0][0]}${localParts[localParts.length - 1][0]}`.toUpperCase(),
    };
  }

  // Priorité 4 : on a juste un prénom (ou rien) → "R?" pour signaler le manque
  const fallbackFirst = firstName || parts[0] || local;
  return {
    firstName: fallbackFirst,
    initials: `${(fallbackFirst[0] ?? "?").toUpperCase()}?`,
  };
}

// Dashboard épuré — Option B (1 rôle, périmètre examen)
// Cœur examen = barre de recherche IA en langage naturel.
// Les KPIs et listes récentes seront ajoutés au fur et à mesure de la création
// des pages Devis / OR / Factures (toutes branchées API, plus aucun mock).

export default function DashboardPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [identity, setIdentity] = useState<{
    firstName: string;
    initials: string;
  }>({ firstName: "", initials: "…" });

  function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (q.length < 2) return;
    router.push(`/dashboard/recherche?q=${encodeURIComponent(q)}`);
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIdentity(extractIdentity(data.user));
    });
  }, []);

  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: api.clients.list,
  });
  const bateauxQuery = useQuery({
    queryKey: ["bateaux"],
    queryFn: api.bateaux.list,
  });
  const devisQuery = useQuery({
    queryKey: ["devis"],
    queryFn: api.devis.list,
  });
  const orQuery = useQuery({
    queryKey: ["or"],
    queryFn: api.or.list,
  });
  const facturesQuery = useQuery({
    queryKey: ["factures"],
    queryFn: api.factures.list,
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground shadow-md">
        <div className="flex items-center gap-3 px-4 py-3 max-w-3xl mx-auto">
          {/* En mobile, espace réservé pour le bouton hamburger flottant de <MobileNav />. */}
          <div className="lg:hidden h-9 w-9 shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold leading-tight">Tableau de bord</h1>
            <p className="text-xs text-primary-foreground/80">
              Vue d&apos;ensemble de l&apos;atelier
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <div className="text-primary-foreground [&_button]:text-primary-foreground [&_button]:hover:bg-primary-foreground/10 [&_button]:hover:text-primary-foreground">
              <ThemeToggle />
            </div>
            <LogoutButton />
            <Avatar className="h-9 w-9 ring-2 ring-primary-foreground/40">
              <AvatarFallback className="bg-accent text-accent-foreground font-bold text-sm">
                {identity.initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-8">
        {/* Cœur examen : barre de recherche IA en langage naturel */}
        <section>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            Bonjour{identity.firstName ? `, ${identity.firstName}` : ""} 👋
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            Pose ta question en français, l&apos;assistant interroge la base
            pour toi.
          </p>
          <form onSubmit={handleAsk} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="« bateau de Martin », « OR en cours », « combien de clients »…"
              className="pl-11 pr-24 h-14 text-base"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              autoFocus
              minLength={2}
              maxLength={500}
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10"
              disabled={question.trim().length < 2}
            >
              Demander
            </Button>
          </form>
          <p className="text-[11px] text-muted-foreground mt-2 italic">
            Propulsé par Mistral · IA souveraine française · {"data hébergée à Paris"}
          </p>
        </section>

        {/* Carte unique Clients — entité racine du modèle métier
            Bateau, Devis, OR, Facture sont accessibles DEPUIS le client.
            La vue "tous les bateaux" reste dispo via la sidebar. */}
        <section>
          <Link
            href="/dashboard/clients"
            className="block rounded-2xl bg-card border-2 border-primary/30 p-6 hover:bg-primary/5 active:scale-[0.99] transition-transform"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Users className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="flex items-baseline gap-3 mb-2">
              {clientsQuery.isLoading ? (
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              ) : (
                <span className="text-5xl font-bold tabular-nums leading-none text-primary">
                  {clientsQuery.data?.total ?? "—"}
                </span>
              )}
              <span className="text-xl font-semibold text-muted-foreground">
                {(clientsQuery.data?.total ?? 0) > 1 ? "clients" : "client"}
              </span>
            </div>

            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Ship className="h-4 w-4" />
              {bateauxQuery.isLoading
                ? "Chargement des bateaux…"
                : `${bateauxQuery.data?.total ?? 0} bateau${
                    (bateauxQuery.data?.total ?? 0) > 1 ? "x" : ""
                  } rattaché${(bateauxQuery.data?.total ?? 0) > 1 ? "s" : ""}`}
            </p>

            <p className="text-sm font-medium text-primary mt-4">
              Voir tous les clients →
            </p>
          </Link>
        </section>

        {/* KPIs en temps réel — chiffres venus de la BDD via TanStack Query */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            En un coup d&apos;œil
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard
              href="/dashboard/bateaux"
              label="Bateaux"
              icon={Ship}
              count={bateauxQuery.data?.total}
              loading={bateauxQuery.isLoading}
              accent="primary"
            />
            <KpiCard
              href="/dashboard/devis"
              label="Devis"
              icon={Receipt}
              count={devisQuery.data?.total}
              loading={devisQuery.isLoading}
              accent="accent"
            />
            <KpiCard
              href="/dashboard/or"
              label="OR"
              icon={Wrench}
              count={orQuery.data?.total}
              loading={orQuery.isLoading}
              accent="chart-3"
            />
            <KpiCard
              href="/dashboard/factures"
              label="Factures"
              icon={FileText}
              count={facturesQuery.data?.total}
              loading={facturesQuery.isLoading}
              accent="chart-4"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function KpiCard({
  href,
  label,
  icon: Icon,
  count,
  loading,
  accent,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  count: number | undefined;
  loading: boolean;
  accent: "primary" | "accent" | "chart-3" | "chart-4";
}) {
  const accentClasses = {
    primary: "bg-primary/10 border-primary/30 text-primary",
    accent: "bg-accent/10 border-accent/30 text-accent",
    "chart-3": "bg-chart-3/10 border-chart-3/30 text-chart-3",
    "chart-4": "bg-chart-4/10 border-chart-4/30 text-chart-4",
  }[accent];

  return (
    <Link
      href={href}
      className={`rounded-xl border-2 p-4 flex flex-col gap-1.5 active:scale-95 transition-transform ${accentClasses}`}
    >
      <Icon className="h-5 w-5" strokeWidth={2.5} />
      {loading ? (
        <Loader2 className="h-7 w-7 animate-spin" />
      ) : (
        <span className="text-3xl font-bold tabular-nums leading-none">
          {count ?? "—"}
        </span>
      )}
      <span className="text-[11px] uppercase tracking-wide font-bold leading-tight">
        {label}
      </span>
    </Link>
  );
}
