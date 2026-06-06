// Proxy Next.js 16 (anciennement "middleware") : exécuté avant CHAQUE requête entrante.
// Sert à : refresh la session Supabase + protéger les routes /dashboard/*.
//
// Renommé "middleware" → "proxy" dans Next.js 16 — voir node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // On exclut les assets statiques (images, fonts, favicon) — pas besoin
  // de vérifier la session pour ces requêtes (perf).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
