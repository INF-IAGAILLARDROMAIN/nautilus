"use client";

import * as React from "react";
import {
  AlertTriangle,
  MessageSquare,
  ChevronRight,
  Phone,
  Check,
  User,
  Ship,
  UserCheck,
  History,
  Users,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export type AlerteType = "panne" | "demande";
export type AlertePriorite = "critique" | "haute" | "moyenne";

export interface DernierIntervenant {
  nom: string;
  date: string;
  intervention: string;
}

export interface Alerte {
  id: string;
  bateau: string;
  client: string;
  type: AlerteType;
  prio: AlertePriorite;
  message: string;
  date: string;
  /** Minutes écoulées depuis l'arrivée de l'urgence (sert au tri) */
  arriveeIlYaMin: number;
  contact?: { tel?: string; email?: string };
  dernierIntervenant?: DernierIntervenant;
  assigneeName?: string;
}

function visualConfig(prio: AlertePriorite, type: AlerteType) {
  const cardBg =
    prio === "critique"
      ? "bg-destructive/5 border-destructive/40 border-l-destructive border-l-4"
      : prio === "haute"
      ? "bg-accent/5 border-accent/30 border-l-accent border-l-4"
      : "bg-card border-l-chart-4 border-l-4";

  const iconBg =
    prio === "critique"
      ? "bg-destructive text-white"
      : prio === "haute"
      ? "bg-accent text-white"
      : "bg-chart-4 text-white";

  const Icon = type === "panne" ? AlertTriangle : MessageSquare;

  const prioLabel =
    prio === "critique" ? "Critique" : prio === "haute" ? "Haute" : "Moyenne";

  const prioBadge =
    prio === "critique"
      ? "bg-destructive text-white"
      : prio === "haute"
      ? "bg-accent text-white"
      : "bg-chart-4 text-white";

  const typeLabel = type === "panne" ? "🚨 Panne" : "📞 Demande";

  return { cardBg, iconBg, Icon, prioLabel, prioBadge, typeLabel };
}

export function AlerteItem({ alerte }: { alerte: Alerte }) {
  const [open, setOpen] = React.useState(false);
  const v = visualConfig(alerte.prio, alerte.type);
  const isAssigned = !!alerte.assigneeName;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`w-full flex items-start gap-3 p-4 rounded-xl border ${v.cardBg} text-left active:scale-[0.99] transition-transform hover:brightness-95`}
      >
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${v.iconBg}`}
        >
          <v.Icon className="h-5 w-5" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start gap-2 justify-between">
            <h3 className="text-lg font-bold leading-tight truncate">
              {alerte.bateau}
            </h3>
            <Badge className={`${v.prioBadge} border-transparent shrink-0 text-[10px]`}>
              {v.prioLabel}
            </Badge>
          </div>
          <p className="text-sm font-medium leading-tight">{alerte.client}</p>
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xs text-foreground/70 font-medium">
              {v.typeLabel} · {alerte.date}
            </span>
            {isAssigned ? (
              <Badge variant="outline" className="h-5 text-[10px] font-semibold">
                👷 {alerte.assigneeName}
              </Badge>
            ) : (
              <Badge className="h-5 text-[10px] bg-accent text-accent-foreground border-transparent font-semibold">
                À attribuer
              </Badge>
            )}
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-foreground/60 shrink-0 mt-1" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl max-h-[90vh] overflow-y-auto"
        >
          <SheetHeader className="text-left pb-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={`${v.prioBadge} border-transparent`}>
                {v.prioLabel}
              </Badge>
              <Badge variant="outline">{v.typeLabel}</Badge>
            </div>
            <SheetTitle className="text-2xl flex items-center gap-2">
              <Ship className="h-6 w-6 text-primary shrink-0" />
              <span>{alerte.bateau}</span>
            </SheetTitle>
            <SheetDescription className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              {alerte.client} · {alerte.date}
            </SheetDescription>
          </SheetHeader>

          <Separator />

          {/* Message client */}
          <div className="py-4 px-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Message du client
            </h3>
            <p className="text-base leading-relaxed">{alerte.message}</p>
          </div>

          <Separator />

          {/* Attribution du chef d'atelier */}
          <div className="py-4 px-4 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Attribution
            </h3>

            {isAssigned ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/30">
                <UserCheck className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    Attribuée à {alerte.assigneeName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Le mécano a reçu la notification
                  </p>
                </div>
              </div>
            ) : alerte.dernierIntervenant ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted border">
                <History className="h-5 w-5 text-chart-4 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm">
                    Dernier intervenant sur ce bateau :
                  </p>
                  <p className="font-semibold">
                    👷 {alerte.dernierIntervenant.nom}{" "}
                    <span className="text-muted-foreground font-normal text-xs">
                      · {alerte.dernierIntervenant.date} ·{" "}
                      {alerte.dernierIntervenant.intervention}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Aucune intervention précédente sur ce bateau.
              </p>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <SheetFooter className="grid grid-cols-1 gap-2 pt-4 pb-2">
            {!isAssigned && alerte.dernierIntervenant && (
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-14 text-base"
                type="button"
              >
                <UserCheck className="h-5 w-5 mr-2" />
                Attribuer à {alerte.dernierIntervenant.nom}
              </Button>
            )}
            <Button variant="outline" className="h-12" type="button">
              <Users className="h-5 w-5 mr-2" />
              Choisir un autre mécano
            </Button>
            {alerte.contact?.tel && (
              <Button variant="outline" className="h-12" type="button" asChild>
                <a href={`tel:${alerte.contact.tel}`}>
                  <Phone className="h-5 w-5 mr-2" />
                  Rappeler le client
                </a>
              </Button>
            )}
            <Button variant="ghost" className="h-12" type="button">
              <Check className="h-5 w-5 mr-2" />
              Marquer traitée
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
