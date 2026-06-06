"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Anchor,
  Bell,
  Search,
  Users,
  Ship,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { api } from "@/lib/api";

// Dashboard épuré — Option B (1 rôle, périmètre examen)
// Cœur examen = barre de recherche IA en langage naturel.
// Les KPIs et listes récentes seront ajoutés au fur et à mesure de la création
// des pages Devis / OR / Factures (toutes branchées API, plus aucun mock).

export default function DashboardPage() {
  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: api.clients.list,
  });
  const bateauxQuery = useQuery({
    queryKey: ["bateaux"],
    queryFn: api.bateaux.list,
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground shadow-md">
        <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-primary-foreground"
          >
            <Anchor className="h-6 w-6" strokeWidth={2.5} />
            <span className="text-lg font-bold tracking-tight">Nautilus</span>
          </Link>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <div className="text-primary-foreground [&_button]:text-primary-foreground [&_button]:hover:bg-primary-foreground/10 [&_button]:hover:text-primary-foreground">
              <ThemeToggle />
            </div>
            <Avatar className="h-9 w-9 ring-2 ring-primary-foreground/40">
              <AvatarFallback className="bg-accent text-accent-foreground font-bold text-sm">
                RG
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-8">
        {/* Cœur examen : barre de recherche IA en langage naturel */}
        <section>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            Bonjour, Romain 👋
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            Pose ta question en français, l&apos;assistant interroge la base
            pour toi.
          </p>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="« bateau de Martin », « OR en cours », « devis impayés »…"
              className="pl-11 h-14 text-base"
              disabled
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
              Bientôt
            </span>
          </div>
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
      </main>
    </div>
  );
}
