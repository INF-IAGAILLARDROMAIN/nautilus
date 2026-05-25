"use client";

import * as React from "react";
import { PhoneCall, Phone, Sun } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { equipe } from "@/lib/mocks";

export function AppelerMecanoFab() {
  const [open, setOpen] = React.useState(false);
  const actifs = equipe.filter((m) => m.statut === "actif");
  const conges = equipe.filter((m) => m.statut === "conge");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Appeler un mécano"
        className="
          fixed z-50
          bottom-24 right-5
          md:bottom-10 md:right-10
          h-16 w-16 md:h-18 md:w-18
          rounded-full
          bg-primary text-white
          shadow-2xl shadow-primary/40
          flex items-center justify-center
          active:scale-95 transition-transform
          ring-4 ring-primary/20
        "
      >
        <PhoneCall className="h-7 w-7" strokeWidth={2.5} />
        <span className="sr-only">Appeler un mécano</span>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl max-h-[85vh] overflow-y-auto"
        >
          <SheetHeader className="text-left pb-4">
            <SheetTitle className="text-2xl flex items-center gap-2">
              <PhoneCall className="h-6 w-6 text-primary" />
              Appeler un mécano
            </SheetTitle>
            <SheetDescription>
              Tape sur un mécano pour composer son numéro
            </SheetDescription>
          </SheetHeader>

          <div className="px-4 pb-4 space-y-3">
            {/* Mécanos actifs */}
            {actifs.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">
                  Disponibles · {actifs.length}
                </p>
                <div className="space-y-2">
                  {actifs.map((m) => (
                    <a
                      key={m.id}
                      href={m.tel ? `tel:${m.tel}` : undefined}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card border active:scale-[0.99] transition-transform hover:bg-muted/30"
                    >
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarFallback className="bg-primary text-white font-bold">
                          {m.initiales}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold leading-tight">{m.nom}</p>
                          <Badge variant="outline" className="h-5 text-[10px]">
                            {m.niveau}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {m.orActuel
                            ? `🔧 ${m.orActuel.bateau} · ${m.orActuel.type}`
                            : "Aucun OR actif"}
                        </p>
                        {m.tel && (
                          <p className="text-sm font-medium text-primary mt-0.5">
                            {m.tel}
                          </p>
                        )}
                      </div>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                        <Phone className="h-5 w-5" strokeWidth={2.5} />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Mécanos en congé (séparés, juste pour info) */}
            {conges.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2 mt-4">
                  En congé · {conges.length}
                </p>
                <div className="space-y-2">
                  {conges.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border opacity-70"
                    >
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                          {m.initiales}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold leading-tight">{m.nom}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Sun className="h-3.5 w-3.5" />
                          Congé jusqu'au {m.congeJusquau}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
