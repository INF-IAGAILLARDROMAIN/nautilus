// Client Supabase pour les Server Components / Server Actions / Route Handlers.
// Gère la session via les cookies httpOnly de Next.js.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component : on ne peut pas écrire les cookies depuis ici.
            // Le middleware refresh la session à chaque requête, donc OK.
          }
        },
      },
    },
  );
}
