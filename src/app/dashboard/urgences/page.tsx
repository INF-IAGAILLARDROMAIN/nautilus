import Link from "next/link";
import { ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UrgenceCard } from "@/components/urgence-card";
import { alertes, equipe } from "@/lib/mocks";
import { suggererMecano, trierAlertes } from "@/lib/mecano-suggestion";

const LIMITE_AFFICHAGE = 5;

export default function UrgencesPage() {
  const nonAttribuees = trierAlertes(alertes.filter((a) => !a.assigneeName));
  const attribuees = alertes.filter((a) => !!a.assigneeName);
  const nonAttribueesAffichees = nonAttribuees.slice(0, LIMITE_AFFICHAGE);
  const restantes = nonAttribuees.length - nonAttribueesAffichees.length;

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      {/* Header avec retour */}
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/70">
        <div className="flex items-center gap-3 px-4 py-3 max-w-3xl mx-auto">
          <Button variant="ghost" size="icon" asChild aria-label="Retour">
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold leading-tight">
              Urgences à dispatcher
            </h1>
            <p className="text-xs text-muted-foreground">
              {nonAttribuees.length} à traiter · {attribuees.length} attribuée
              {attribuees.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-8">
        {/* Non attribuées — triées par priorité puis ancienneté */}
        {nonAttribuees.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  À dispatcher · {nonAttribuees.length}
                </h2>
              </div>
              {restantes > 0 && (
                <Badge variant="outline" className="text-[10px]">
                  {LIMITE_AFFICHAGE} affichées · {restantes} suivantes
                </Badge>
              )}
            </div>
            <div className="space-y-3">
              {nonAttribueesAffichees.map((alerte, index) => {
                const suggestion = suggererMecano(alerte, equipe);
                return (
                  <UrgenceCard
                    key={alerte.id}
                    alerte={alerte}
                    suggestion={suggestion}
                    equipe={equipe}
                    isPrincipale={index === 0}
                    defaultOpen={index === 0}
                  />
                );
              })}
            </div>
            {restantes > 0 && (
              <Button variant="outline" className="w-full mt-4 h-12" asChild>
                <Link href="#">Voir les {restantes} urgences suivantes →</Link>
              </Button>
            )}
          </section>
        )}

        {/* Déjà attribuées */}
        {attribuees.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-chart-3" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Attribuées · {attribuees.length}
              </h2>
            </div>
            <div className="space-y-3">
              {attribuees.map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl bg-card border border-l-4 border-l-chart-3 p-4"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-chart-3 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold leading-tight">{a.bateau}</h3>
                      <p className="text-xs text-muted-foreground">
                        {a.client} · {a.date}
                      </p>
                    </div>
                    <Badge className="bg-chart-3/15 text-chart-3 border-chart-3/30">
                      <Avatar className="h-5 w-5 mr-1.5">
                        <AvatarFallback className="bg-chart-3 text-white text-[9px] font-bold">
                          {a.assigneeName
                            ?.split(" ")
                            .map((p) => p[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {a.assigneeName}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {nonAttribuees.length === 0 && (
          <div className="text-center py-12 space-y-2">
            <CheckCircle2 className="h-12 w-12 text-chart-3 mx-auto" />
            <p className="text-lg font-bold">Tout est dispatché 👌</p>
            <p className="text-sm text-muted-foreground">
              Aucune urgence en attente d'attribution.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
