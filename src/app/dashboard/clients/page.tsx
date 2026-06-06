"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight, User, Mail, Phone, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ListPageHeader } from "@/components/list-page-header";
import { api, type Client } from "@/lib/api";

export default function ClientsListPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["clients"],
    queryFn: api.clients.list,
  });

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <ListPageHeader
        title="Clients"
        subtitle={
          isLoading
            ? "Chargement…"
            : data
              ? `${data.total} client${data.total > 1 ? "s" : ""} au total`
              : undefined
        }
        action={{ label: "Nouveau client", href: "/dashboard/clients/nouveau" }}
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-5">
        <Input
          type="search"
          placeholder="Rechercher par nom, email, téléphone…"
          className="h-12 text-base"
        />

        {isLoading && (
          <div className="flex items-center justify-center gap-2 p-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Chargement des clients…</span>
          </div>
        )}

        {isError && (
          <div className="p-4 rounded-xl border border-destructive bg-destructive/10 text-destructive">
            <p className="font-semibold">Impossible de charger les clients</p>
            <p className="text-sm mt-1">{(error as Error).message}</p>
            <p className="text-xs mt-2 text-muted-foreground">
              Vérifie que le backend NestJS tourne sur le port 4001.
            </p>
          </div>
        )}

        {data && data.data.length === 0 && (
          <div className="p-8 text-center rounded-xl border border-dashed bg-muted/30">
            <p className="font-semibold">Aucun client pour le moment</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crée ton premier client avec le bouton « Nouveau client ».
            </p>
          </div>
        )}

        {data && data.data.length > 0 && (
          <div className="space-y-3">
            {data.data.map((c: Client) => (
              <button
                key={c.id}
                type="button"
                className="w-full flex items-start gap-3 p-4 rounded-xl bg-card border text-left active:scale-[0.99] transition-transform hover:bg-muted/30"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                  <User className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="text-lg font-bold leading-tight">
                    {c.prenom} {c.nom}
                  </h3>
                  {(c.email || c.telephone) && (
                    <div className="flex flex-col gap-0.5 text-sm text-muted-foreground">
                      {c.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" />
                          {c.email}
                        </span>
                      )}
                      {c.telephone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          {c.telephone}
                        </span>
                      )}
                    </div>
                  )}
                  {c.ville && (
                    <p className="text-xs text-muted-foreground">
                      {c.codePostal} {c.ville}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
