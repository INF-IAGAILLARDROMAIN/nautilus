"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Wrench, Package, FileSignature, Sun, ChevronRight } from "lucide-react";

export interface Mecano {
  id: string;
  nom: string;
  initiales: string;
  niveau: "Senior" | "Junior" | "Apprenti";
  statut: "actif" | "conge";
  tel?: string;
  orActuel?: {
    id: string;
    bateau: string;
    type: string;
  };
  orEnAttentePieces: number;
  orEnAttenteAccord: number;
  orTotalEnCours: number;
  congeJusquau?: string;
}

export function EquipeSection({ equipe }: { equipe: Mecano[] }) {
  return (
    <div className="space-y-2">
      {equipe.map((m) => (
        <MecanoCard key={m.id} m={m} />
      ))}
    </div>
  );
}

function MecanoCard({ m }: { m: Mecano }) {
  const isConge = m.statut === "conge";

  const dot = isConge
    ? "bg-muted-foreground"
    : m.orActuel
    ? "bg-chart-3"
    : "bg-accent";

  return (
    <button
      type="button"
      className="w-full flex items-start gap-3 p-4 rounded-xl bg-card border text-left active:scale-[0.99] transition-transform hover:bg-muted/30"
    >
      <div className="relative shrink-0">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="bg-primary text-primary-foreground font-bold text-base">
            {m.initiales}
          </AvatarFallback>
        </Avatar>
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full ${dot} border-2 border-card`}
        />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="text-base font-bold leading-tight">{m.nom}</h3>
          <Badge variant="outline" className="h-5 text-[10px]">
            {m.niveau}
          </Badge>
        </div>

        {isConge ? (
          <p className="text-sm flex items-center gap-2 text-muted-foreground">
            <Sun className="h-4 w-4" />
            <span>Congé jusqu'au {m.congeJusquau}</span>
          </p>
        ) : (
          <>
            {m.orActuel ? (
              <p className="text-sm flex items-center gap-2">
                <Wrench className="h-4 w-4 text-chart-3 shrink-0" />
                <span className="truncate">
                  <span className="font-semibold text-foreground">
                    {m.orActuel.bateau}
                  </span>
                  <span className="text-muted-foreground"> · {m.orActuel.type}</span>
                </span>
              </p>
            ) : (
              <p className="text-sm flex items-center gap-2 text-accent font-semibold">
                <Wrench className="h-4 w-4" />
                Disponible pour urgence
              </p>
            )}
            <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
              <span className="font-medium tabular-nums">
                {m.orTotalEnCours} OR
              </span>
              {m.orEnAttentePieces > 0 && (
                <span className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  {m.orEnAttentePieces} pièces
                </span>
              )}
              {m.orEnAttenteAccord > 0 && (
                <span className="flex items-center gap-1">
                  <FileSignature className="h-3.5 w-3.5" />
                  {m.orEnAttenteAccord} accord
                </span>
              )}
            </div>
          </>
        )}
      </div>

      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
    </button>
  );
}
