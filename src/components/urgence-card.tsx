"use client";

import * as React from "react";
import {
  AlertTriangle,
  MessageSquare,
  Phone,
  UserCheck,
  Users,
  Ship,
  User,
  Check,
  History,
  AlertCircle,
  ChevronDown,
  Star,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Alerte } from "@/components/alerte-item";
import type { Mecano } from "@/components/equipe-section";
import type { Suggestion } from "@/lib/mecano-suggestion";

interface UrgenceCardProps {
  alerte: Alerte;
  suggestion: Suggestion;
  equipe: Mecano[];
  /** Indique si c'est l'urgence principale (la première de la liste) */
  isPrincipale?: boolean;
  /** Si true, la card est dépliée d'origine (utile pour la principale) */
  defaultOpen?: boolean;
}

function visualConfig(
  prio: "critique" | "haute" | "moyenne",
  type: "panne" | "demande"
) {
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

export function UrgenceCard({
  alerte,
  suggestion,
  equipe,
  isPrincipale,
  defaultOpen,
}: UrgenceCardProps) {
  const [expanded, setExpanded] = React.useState(!!defaultOpen);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [chosenMecano, setChosenMecano] = React.useState(suggestion);
  const v = visualConfig(alerte.prio, alerte.type);

  const mecanosActifs = equipe.filter((m) => m.statut === "actif");

  function selectMecano(mecano: Mecano) {
    setChosenMecano({
      mecanoId: mecano.id,
      mecanoNom: mecano.nom,
      raison: `Choisi manuellement par le chef d'atelier · ${mecano.orTotalEnCours} OR en cours`,
      type: "disponible",
    });
  }

  function isSameAsSuggestion() {
    return chosenMecano.mecanoId === suggestion.mecanoId;
  }

  return (
    <div className={`rounded-xl border overflow-hidden ${v.cardBg}`}>
      {/* === HEADER COMPACT — toujours visible, click pour déplier === */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 active:scale-[0.995] transition-transform"
        aria-expanded={expanded}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${v.iconBg}`}
          >
            <v.Icon className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2 justify-between">
              <div className="min-w-0 flex-1">
                {isPrincipale && (
                  <div className="flex items-center gap-1 text-destructive text-[10px] font-bold uppercase tracking-widest mb-0.5">
                    <Star className="h-3 w-3 fill-current" />
                    Urgence principale
                  </div>
                )}
                <h3 className="text-lg font-bold leading-tight truncate">
                  {alerte.bateau}
                </h3>
                <p className="text-sm font-medium leading-tight">
                  {alerte.client}
                </p>
              </div>
              <Badge
                className={`${v.prioBadge} border-transparent shrink-0 text-[10px]`}
              >
                {v.prioLabel}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap pt-1.5">
              <Badge variant="outline" className="h-5 text-[10px]">
                {v.typeLabel}
              </Badge>
              <span className="text-xs text-foreground/70 font-medium">
                {alerte.date}
              </span>
              <Badge className="h-5 text-[10px] bg-accent text-white border-transparent font-semibold ml-auto">
                À attribuer
              </Badge>
            </div>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-foreground/60 shrink-0 mt-1 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* === CONTENU DÉPLIÉ — visible si expanded === */}
      {expanded && (
        <>
          <Separator />

          {/* Message client (extrait, lien pour voir tout) */}
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="w-full text-left p-4 hover:bg-muted/30 active:scale-[0.99] transition-transform"
          >
            <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1.5">
              Message du client
            </p>
            <p className="text-sm line-clamp-3 leading-relaxed">
              {alerte.message}
            </p>
            <p className="text-xs text-primary font-semibold mt-2">
              Lire en entier →
            </p>
          </button>

          <Separator />

          {/* Suggestion d'attribution */}
          <div className="p-4 space-y-3">
            <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
              Mécano suggéré
            </p>

            {/* Bloc de blocage si dernier intervenant en congé */}
            {suggestion.blocage && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted text-xs">
                <AlertCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <p>
                  <span className="font-semibold">{suggestion.blocage.mecanoNom}</span>{" "}
                  (dernier intervenant) est {suggestion.blocage.motif}.
                </p>
              </div>
            )}

            {/* Mécano choisi affiché en grand */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarFallback className="bg-primary text-white font-bold">
                  {chosenMecano.mecanoNom
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-base leading-tight">
                  {chosenMecano.mecanoNom}
                </p>
                <p className="text-xs text-muted-foreground leading-snug flex items-start gap-1 mt-0.5">
                  {chosenMecano.type === "dernier_actif" && (
                    <History className="h-3.5 w-3.5 shrink-0 mt-0.5 text-chart-3" />
                  )}
                  {chosenMecano.type === "historique" && (
                    <History className="h-3.5 w-3.5 shrink-0 mt-0.5 text-chart-4" />
                  )}
                  {chosenMecano.type === "disponible" && (
                    <UserCheck className="h-3.5 w-3.5 shrink-0 mt-0.5 text-accent" />
                  )}
                  <span>{chosenMecano.raison}</span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 gap-2 pt-1">
              <Button
                className="h-12 bg-primary hover:bg-primary/90 text-white font-semibold"
                type="button"
                disabled={!chosenMecano.mecanoId}
              >
                <UserCheck className="h-5 w-5 mr-2" />
                Attribuer à {chosenMecano.mecanoNom.split(" ")[0]}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-11 w-full" type="button">
                    <Users className="h-5 w-5 mr-2" />
                    {isSameAsSuggestion()
                      ? "Choisir un autre mécano"
                      : `Modifier (suggéré : ${suggestion.mecanoNom.split(" ")[0]})`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-72">
                  <DropdownMenuLabel>Mécanos actifs</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {mecanosActifs.map((m) => (
                    <DropdownMenuItem
                      key={m.id}
                      onClick={() => selectMecano(m)}
                      className="flex items-center gap-2 py-3"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-white text-xs font-bold">
                          {m.initiales}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{m.nom}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.niveau} · {m.orTotalEnCours} OR
                        </p>
                      </div>
                      {m.id === suggestion.mecanoId && (
                        <Badge variant="outline" className="text-[10px]">
                          Suggéré
                        </Badge>
                      )}
                      {m.id === chosenMecano.mecanoId && (
                        <Check className="h-4 w-4 text-chart-3" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {alerte.contact?.tel && (
                <Button variant="ghost" className="h-11" type="button" asChild>
                  <a href={`tel:${alerte.contact.tel}`}>
                    <Phone className="h-5 w-5 mr-2" />
                    Rappeler {alerte.client}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Drawer pour voir le message complet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl max-h-[85vh] overflow-y-auto"
        >
          <SheetHeader className="text-left">
            <SheetTitle className="flex items-center gap-2 text-2xl">
              <Ship className="h-6 w-6 text-primary" />
              {alerte.bateau}
            </SheetTitle>
            <SheetDescription className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              {alerte.client} · {alerte.date}
            </SheetDescription>
          </SheetHeader>
          <Separator className="my-4" />
          <div className="px-4 pb-4">
            <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">
              Message complet du client
            </p>
            <p className="text-base leading-relaxed">{alerte.message}</p>
          </div>
          <SheetFooter>
            <Button
              variant="outline"
              onClick={() => setSheetOpen(false)}
              className="w-full h-12"
              type="button"
            >
              Fermer
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
