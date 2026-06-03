import Link from "next/link";
import {
  Anchor,
  Wrench,
  Receipt,
  FileText,
  Bell,
  Search,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";

// Périmètre Option B — version examen :
//   1 seul rôle (chef d'atelier) · 4 entités (Client → Bateau → Devis → OR) ·
//   Facture = PDF généré quand OR passe au statut "facturé".

type OrdreStatus =
  | "CREE"
  | "EN_COURS"
  | "TERMINE"
  | "FACTURE";

const ordresJour: {
  id: string;
  bateau: string;
  client: string;
  type: string;
  status: OrdreStatus;
}[] = [
  {
    id: "OR-0142",
    bateau: "Le Mistral",
    client: "Dupont",
    type: "Hivernage",
    status: "EN_COURS",
  },
  {
    id: "OR-0139",
    bateau: "Petit Bleu",
    client: "Petit",
    type: "Entretien moteur",
    status: "EN_COURS",
  },
  {
    id: "OR-0140",
    bateau: "L'Échappée",
    client: "Bernard",
    type: "Entretien moteur",
    status: "TERMINE",
  },
];

function statusBadge(status: OrdreStatus) {
  switch (status) {
    case "CREE":
      return {
        className: "bg-muted text-muted-foreground border-transparent",
        label: "Créé",
      };
    case "EN_COURS":
      return {
        className: "bg-primary text-primary-foreground border-transparent",
        label: "En cours",
      };
    case "TERMINE":
      return {
        className: "bg-chart-3 text-white border-transparent",
        label: "Terminé",
      };
    case "FACTURE":
      return {
        className: "bg-chart-4 text-white border-transparent",
        label: "Facturé",
      };
  }
}

// === Page ===

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      {/* Header sticky — identité Nautilus */}
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
        {/* Barre de recherche — futur moteur de recherche IA en langage naturel */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Demande en français : « bateau de Dupont », « OR en cours », « devis impayés »…"
            className="pl-11 h-12 text-base"
          />
        </div>

        {/* Actions rapides — création */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Créer
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/dashboard/clients/nouveau"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border-2 border-primary/30 hover:bg-primary/5 active:scale-95 transition-transform"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white">
                <Anchor className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wide text-center leading-tight">
                Nouveau<br />client
              </span>
            </Link>
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
          </div>
        </section>

        {/* KPIs */}
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
              Facturés
            </div>
          </Link>
        </section>

        {/* OR récents */}
        <section>
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              OR récents · {ordresJour.length}
            </h2>
            <Link
              href="/dashboard/or"
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
