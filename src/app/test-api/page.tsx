"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type Client } from "@/lib/api";

export default function TestApiPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["clients"],
    queryFn: api.clients.list,
  });

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Test API — Clients depuis NestJS</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Endpoint :{" "}
          <code className="bg-muted px-2 py-0.5 rounded text-xs">
            GET /api/clients
          </code>
        </p>
      </header>

      {isLoading && (
        <div className="p-4 rounded-lg border bg-muted/30">
          Chargement en cours…
        </div>
      )}

      {isError && (
        <div className="p-4 rounded-lg border border-destructive bg-destructive/10 text-destructive">
          <p className="font-semibold">Erreur API</p>
          <p className="text-sm mt-1">{(error as Error).message}</p>
        </div>
      )}

      {data && (
        <>
          <p className="mb-4 text-sm">
            <span className="font-semibold">{data.total}</span> client(s) trouvé(s)
          </p>
          <ul className="space-y-2">
            {data.data.map((c: Client) => (
              <li
                key={c.id}
                className="p-4 rounded-lg border bg-card flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">
                    {c.prenom} {c.nom}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.email ?? "—"} · {c.telephone ?? "—"}
                  </p>
                </div>
                <code className="text-xs text-muted-foreground">
                  {c.id.slice(0, 8)}…
                </code>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
