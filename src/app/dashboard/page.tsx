import Link from "next/link";
import {
  Anchor,
  Wrench,
  Receipt,
  FileText,
  Bell,
  Search,
  ChevronRight,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { AlerteItem } from "@/components/alerte-item";
import { EquipeSection } from "@/components/equipe-section";
import { alertes, equipe } from "@/lib/mocks";
import { trierAlertes } from "@/lib/mecano-suggestion";

const nonAttribuees = trierAlertes(alertes.filter((a) => !a.assigneeName));
const aDispatcher = nonAttribuees.length;
const alertesAffichees = nonAttribuees.slice(0, 3);

type OrdreStatus =
  | "RECU"
  | "ACCEPTE"
  | "EN_PREPARATION"
  | "EN_REPARATION"
  | "LIVRE"
  | "URGENCE";

const ordresJour: {
  id: string;
  bateau: string;
  client: string;
  type: string;
  status: OrdreStatus;
  tech?: string;
}[] = [
  {
    id: "OR-0141",
    bateau: "La Brise",
    client: "Martin",
    type: "Dépannage urgent",
    status: "URGENCE",
    tech: "Romain",
  },
  {
    id: "OR-0142",
    bateau: "Le Mistral",
    client: "Dupont",
    type: "Hivernage",
    status: "EN_PREPARATION",
    tech: "Pierre",
  },
  {
    id: "OR-0139",
    bateau: "Petit Bleu",
    client: "Petit",
    type: "Entretien moteur",
    status: "EN_REPARATION",
    tech: "Romain",
  },
  {
    id: "OR-0140",
    bateau: "L'Échappée",
    client: "Bernard",
    type: "Entretien moteur",
    status: "LIVRE",
  },
];

function statusBadge(status: OrdreStatus) {
  switch (status) {
    case "URGENCE":
      return {
        className:
          "bg-destructive text-destructive-foreground border-transparent animate-pulse",
        label: "URGENCE",
      };
    case "RECU":
      return {
        className: "bg-muted text-muted-foreground border-transparent",
        label: "Reçu",
      };
    case "ACCEPTE":
      return {
        className: "bg-chart-4 text-white border-transparent",
        label: "Accepté",
      };
    case "EN_PREPARATION":
      return {
        className: "bg-chart-5 text-white border-transparent",
        label: "En préparation",
      };
    case "EN_REPARATION":
      return {
        className: "bg-primary text-primary-foreground border-transparent",
        label: "En réparation",
      };
    case "LIVRE":
      return {
        className: "bg-chart-3 text-white border-transparent",
        label: "Livré",
      };
  }
}

// === Page ===

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      {/* Header sticky — bleu marine plein, identité forte */}
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
        {/* ============================================
            BANDEAU URGENCES — sobre, accent ciblé
            ============================================ */}
        {aDispatcher > 0 && (
          <Link
            href="/dashboard/urgences"
            className="block w-full rounded-2xl bg-card border border-l-4 border-l-destructive p-5 flex items-center gap-4 active:scale-[0.99] transition-transform hover:bg-muted/30"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <div className="text-4xl font-bold tabular-nums leading-none text-destructive">
                {aDispatcher}
              </div>
              <div className="text-xs uppercase tracking-widest font-bold mt-1.5 text-muted-foreground">
                {aDispatcher > 1 ? "urgences à dispatcher" : "urgence à dispatcher"}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        )}

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Rechercher un bateau, un client…"
            className="pl-11 h-12 text-base"
          />
        </div>

        {/* ============================================
            ACTIONS RAPIDES — créer en 1 tap (workflow flexible)
            ============================================ */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Créer en 1 tap
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <Link
              href="/dashboard/devis/nouveau"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border-2 border-accent/30 hover:bg-accent/5 active:scale-95 transition-transform"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white">
                <Receipt className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wide text-center leading-tight">
                Nouveau<br />devis
              </span>
            </Link>
            <Link
              href="/dashboard/or/nouveau"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border-2 border-primary/30 hover:bg-primary/5 active:scale-95 transition-transform"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white">
                <Wrench className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wide text-center leading-tight">
                Nouvel<br />OR
              </span>
            </Link>
            <Link
              href="/dashboard/factures/nouveau"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border-2 border-chart-4/30 hover:bg-chart-4/5 active:scale-95 transition-transform"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-chart-4 text-white">
                <FileText className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wide text-center leading-tight">
                Nouvelle<br />facture
              </span>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2.5">
            💡 Tu peux créer à n'importe quelle étape — pas obligé de faire devis → OR → facture
          </p>
        </section>

        {/* ============================================
            KPIs grand format — cliquables vers chaque liste
            ============================================ */}
        <section className="grid grid-cols-3 gap-3">
          <Link
            href="/dashboard/devis"
            className="rounded-xl bg-accent/10 border-2 border-accent/30 p-4 flex flex-col gap-1.5 active:scale-95 transition-transform hover:bg-accent/15"
          >
            <Receipt className="h-5 w-5 text-accent" strokeWidth={2.5} />
            <div className="text-4xl font-bold tabular-nums leading-none text-accent">
              8
            </div>
            <div className="text-[11px] uppercase tracking-wide font-bold text-accent leading-tight">
              Devis attente
            </div>
          </Link>
          <Link
            href="/dashboard/or"
            className="rounded-xl bg-primary/10 border-2 border-primary/30 p-4 flex flex-col gap-1.5 active:scale-95 transition-transform hover:bg-primary/15"
          >
            <Wrench className="h-5 w-5 text-primary" strokeWidth={2.5} />
            <div className="text-4xl font-bold tabular-nums leading-none text-primary">
              12
            </div>
            <div className="text-[11px] uppercase tracking-wide font-bold text-primary leading-tight">
              OR en cours
            </div>
          </Link>
          <Link
            href="/dashboard/factures"
            className="rounded-xl bg-chart-4/10 border-2 border-chart-4/30 p-4 flex flex-col gap-1.5 active:scale-95 transition-transform hover:bg-chart-4/15"
          >
            <FileText className="h-5 w-5 text-chart-4" strokeWidth={2.5} />
            <div className="text-4xl font-bold tabular-nums leading-none text-chart-4">
              6
            </div>
            <div className="text-[11px] uppercase tracking-wide font-bold text-chart-4 leading-tight">
              Factures
            </div>
          </Link>
        </section>

        {/* ============================================
            ALERTES — bateau en GROS titre
            ============================================ */}
        <section>
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              À traiter
            </h2>
            <Link
              href="#"
              className="text-sm font-medium text-primary hover:underline"
            >
              Tout voir
            </Link>
          </div>
          <div className="space-y-3">
            {alertesAffichees.map((a) => (
              <AlerteItem key={a.id} alerte={a} />
            ))}
          </div>
        </section>

        {/* ============================================
            ÉQUIPE
            ============================================ */}
        <section>
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Mon équipe · {equipe.length}
            </h2>
            <Link
              href="#"
              className="text-sm font-medium text-primary hover:underline"
            >
              Détail
            </Link>
          </div>
          <EquipeSection equipe={equipe} />
        </section>

        {/* ============================================
            OR EN COURS — bateau en titre fort
            ============================================ */}
        <section>
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              OR en cours · {ordresJour.length}
            </h2>
            <Link
              href="#"
              className="text-sm font-medium text-primary hover:underline"
            >
              Tout voir
            </Link>
          </div>
          <div className="space-y-3">
            {ordresJour.map((or) => {
              const b = statusBadge(or.status);
              return (
                <button
                  key={or.id}
                  type="button"
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border text-left active:scale-[0.99] transition-transform hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold leading-tight">
                        {or.bateau}
                      </h3>
                      <Badge className={`${b.className} text-[10px]`}>
                        {b.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {or.type} · {or.client}
                      {or.tech && (
                        <span className="ml-1">· 👷 {or.tech}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {or.id}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
