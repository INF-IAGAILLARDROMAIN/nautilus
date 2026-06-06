// Middleware racine Next.js : exécuté avant CHAQUE requête entrante.
// Sert à : refresh la session Supabase + protéger les routes /dashboard/*.
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // On exclut les assets statiques (images, fonts, favicon) — pas besoin
  // de vérifier la session pour ces requêtes (perf).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
