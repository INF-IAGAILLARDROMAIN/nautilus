# 3. Réalisations front-end

> Cette section présente les éléments les plus significatifs du front-end Nautilus + les arguments des choix techniques, **y compris pour la sécurité**.

## 3.1 Conception de l'interface — démarche et système de design

### 3.1.1 Démarche de conception

Pour la V1 examen, j'ai privilégié une **démarche itérative** plutôt qu'une phase de maquettage Figma formelle séparée :

- **Inspiration métier** : mon vécu de mécanicien hors-bord a directement orienté l'ergonomie (boutons larges pour mains gantées, contrastes élevés pour usage en plein soleil sur un bateau, hiérarchie de l'information centrée sur le chef d'atelier).
- **Charte graphique** définie en amont du code dans [`docs/charte-graphique/charte-graphique.md`](../../charte-graphique/charte-graphique.md) : couleurs, typographies, espacements, tons.
- **Design system shadcn/ui + Tailwind v4** comme socle technique cohérent. Chaque composant (`Button`, `Card`, `Input`, `Badge`, `Avatar`, `Label`) est versionné dans `src/components/ui/` et réutilisé partout.
- **Itérations courtes en cours de développement** : chaque écran est conçu directement en code Next.js et ajusté visuellement en mode dev.

> **Justification** : pour une V1 individuelle à court délai, maquetter chaque écran dans Figma puis le re-coder en React aurait dupliqué le travail. La cohérence est garantie par le design system (shadcn) et la charte graphique. Pour une V2 RANKIA commerciale (équipe multi-personnes), une phase Figma formelle deviendra incontournable.

### 3.1.2 Contraintes UX spécifiques au métier nautique

Le **double contexte d'usage** a guidé tous les choix d'UI :

| Contexte | Contrainte | Réponse UI |
|---|---|---|
| ☀ Plein soleil sur un bateau | Luminosité écrasante, écran difficilement lisible | Contrastes AAA (texte foncé sur fond clair, palette pleine teinte) |
| 🌑 Atelier sombre | Faible luminosité ambiante | Mode sombre automatique (`next-themes`) |
| 🧤 Mains gantées / sales | Précision tactile dégradée | Boutons ≥ 56 px (hauteur), zones de touche larges |
| 📱 Consultation mobile en atelier | Mobile-first sur les flux mécanos | Responsive nuancé — chef = desktop-first, mécano = mobile-first |

## 3.2 Écrans livrés (parcours utilisateur)

Le parcours complet du chef d'atelier comprend **15 pages Next.js** organisées sous l'App Router :

```
[/ Landing] ──> [/auth/login] ──> [/dashboard]
                                        │
                                        ├──> [/dashboard/recherche]      ⭐ Fonctionnalité signature
                                        │       └──> Résultats IA (par intent)
                                        │
                                        ├──> [/dashboard/clients]
                                        │       ├──> [/dashboard/clients/[id]]
                                        │       └──> [/dashboard/clients/nouveau]
                                        │
                                        ├──> [/dashboard/bateaux]
                                        │       ├──> [/dashboard/bateaux/[id]]
                                        │       └──> [/dashboard/bateaux/nouveau]
                                        │
                                        ├──> [/dashboard/devis]
                                        │       ├──> [/dashboard/devis/[id]]  → PDF
                                        │       └──> [/dashboard/devis/nouveau]
                                        │
                                        ├──> [/dashboard/or]
                                        │       └──> [/dashboard/or/[id]]      → PDF (OR + Facture)
                                        │
                                        └──> [/dashboard/factures]
```

### Liste exhaustive des routes

| Route | Type | Rôle |
|---|---|---|
| `/` | Server Component | Landing publique |
| `/auth/login` | Client Component | Connexion Supabase |
| `/dashboard` | Server Component | Vue d'ensemble + accès rapide IA |
| `/dashboard/recherche` | Client Component | Moteur de recherche IA (fonctionnalité signature) |
| `/dashboard/clients` | Server Component | Liste paginée |
| `/dashboard/clients/[id]` | Server Component dynamique | Fiche client + bateaux + devis |
| `/dashboard/clients/nouveau` | Client Component | Formulaire création (RHF + Zod) |
| `/dashboard/bateaux` | Server Component | Liste paginée |
| `/dashboard/bateaux/[id]` | Server Component dynamique | Fiche bateau + devis + OR |
| `/dashboard/bateaux/nouveau` | Client Component | Formulaire création (RHF + Zod) |
| `/dashboard/devis` | Server Component | Liste paginée |
| `/dashboard/devis/[id]` | Server Component dynamique | Fiche devis + lignes + bouton PDF |
| `/dashboard/devis/nouveau` | Client Component | Formulaire création (multi-lignes) |
| `/dashboard/or` | Server Component | Liste paginée |
| `/dashboard/or/[id]` | Server Component dynamique | Fiche OR + workflow statuts + bouton PDF |
| `/dashboard/factures` | Server Component | Liste des OR au statut FACTURE |

## 3.3 Captures d'écran

> 📂 Les captures haute résolution (desktop + mobile) sont placées dans [`annexes/`](annexes/) avec convention de nommage `screen-<page>-<desktop|mobile>.png`.

Captures à fournir au minimum :

- 🔐 Page de connexion (desktop + mobile)
- 🏠 Dashboard (desktop + mobile)
- 🤖 Recherche IA (desktop) avec exemple de résultat (intent `list_recent_factures`)
- 🤖 Recherche IA — bandeau sécurité refus (intent `securite_refus`)
- 🤖 Recherche IA — bandeau hors_domaine
- 👥 Liste clients (desktop + mobile)
- 👤 Fiche client (desktop)
- 🚤 Fiche bateau (desktop)
- 📋 Liste OR + filtre par statut
- 📄 Fiche devis + bouton PDF
- 🧾 PDF généré (devis et facture)

## 3.4 Extraits de code — interfaces statiques (Server Components)

Next.js App Router permet de mixer **Server Components** (rendu côté serveur, props typées, pas de JavaScript envoyé au navigateur) et **Client Components** (interactifs). J'utilise les Server Components par défaut pour toutes les pages de liste et de détail.

### Exemple : layout principal du dashboard

```tsx
// src/app/dashboard/layout.tsx — Server Component
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  // Vérification d'auth côté SERVEUR — l'utilisateur ne reçoit
  // jamais le HTML protégé s'il n'est pas connecté.
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={user} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

**Avantage sécurité** : l'utilisateur non connecté est redirigé **avant** que le HTML du dashboard ne soit généré. Aucune donnée privée ne fuite via le HTML.

### Exemple : page liste clients

```tsx
// src/app/dashboard/clients/page.tsx — Server Component
import Link from "next/link";
import { api } from "@/lib/api";

export default async function ClientsPage() {
  const { data: clients } = await api.clients.list();

  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold">Clients</h1>
      <ul className="mt-4 space-y-2">
        {clients.map((c) => (
          <li key={c.id}>
            <Link href={`/dashboard/clients/${c.id}`}>
              <span className="font-bold uppercase">{c.nom}</span> {c.prenom}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

## 3.5 Extraits de code — interfaces dynamiques (Client Components)

### 3.5.1 Barre de recherche IA — fonctionnalité signature

C'est la pièce maîtresse du front. Elle utilise **TanStack Query** pour gérer le cycle de vie de la requête (loading, success, error, retry désactivé), `useSearchParams` pour permettre le partage d'URL avec une question pré-remplie, et un système de **bandeau adaptatif** qui change de style selon l'intent retourné par l'IA.

```tsx
// src/app/dashboard/recherche/page.tsx (extrait)
"use client";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

function RecherchePageInner() {
  const searchParams = useSearchParams();
  const [question, setQuestion] = useState(searchParams.get("q") ?? "");
  const [submitted, setSubmitted] = useState(question);

  const query = useQuery({
    queryKey: ["recherche", submitted],
    queryFn: () => api.recherche.ask(submitted),
    enabled: submitted.trim().length >= 2,
    retry: false,  // Anti-spam LLM
  });

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Input value={question} onChange={(e) => setQuestion(e.target.value)} />
        <Button disabled={query.isFetching}>Demander</Button>
      </form>

      {query.data && (
        <>
          {/* Bandeau adaptatif selon l'intent */}
          {query.data.messageInfo && (
            <MessageInfo intent={query.data.intent} message={query.data.messageInfo} />
          )}

          {/* Rendu spécialisé selon le type de résultat */}
          {query.data.intent === "find_bateau" && (
            <RenduBateaux items={query.data.resultats as ResultatBateau[]} />
          )}
          {(query.data.intent === "find_devis_by_client" ||
            query.data.intent === "list_recent_devis") && (
            <RenduDevis items={query.data.resultats as ResultatDevis[]} />
          )}
          {/* …et ainsi de suite pour les 16 intents métier + 3 UX + 1 sécurité */}
        </>
      )}
    </div>
  );
}

// La page entière est wrappée dans une <Suspense> pour permettre
// l'usage de useSearchParams() conformément à la nouvelle norme Next.js 16.
export default function RecherchePage() {
  return (
    <Suspense fallback={<Loader />}>
      <RecherchePageInner />
    </Suspense>
  );
}
```

### 3.5.2 Bandeau d'intent adaptatif (style selon refus / accueil / aide)

```tsx
function MessageInfo({ intent, message }: { intent: IntentRechercheIa; message: string }) {
  let classes = "border-chart-4/40 bg-chart-4/10";
  let Icon = CircleHelp;

  if (intent === "securite_refus") {
    classes = "border-destructive bg-destructive/10 text-destructive";
    Icon = ShieldAlert;
  } else if (intent === "hors_domaine") {
    classes = "border-chart-4/40 bg-chart-4/10";
    Icon = HelpCircle;
  } else if (intent === "salutation") {
    classes = "border-chart-2/40 bg-chart-2/10";
    Icon = Hand;
  } else if (intent === "help") {
    classes = "border-primary/40 bg-primary/10";
    Icon = Sparkles;
  }

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 ${classes}`}>
      <Icon className="h-5 w-5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
```

> 🎯 **Pourquoi c'est important** : l'utilisateur perçoit visuellement la nature de la réponse (vert = bonjour, bleu = aide, orange = hors-scope, **rouge = refus sécurité**) sans avoir à lire. L'UX est cohérente avec l'intention de l'IA.

### 3.5.3 Formulaire création client (React Hook Form + Zod)

Le couple **React Hook Form + Zod** est utilisé partout pour valider les formulaires. Le schéma Zod est défini une fois et sert à la fois à la validation et à l'inférence des types TypeScript.

```tsx
// src/app/dashboard/clients/nouveau/page.tsx (extrait)
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const ClientSchema = z.object({
  nom: z.string().min(2, "Nom requis (min 2 caractères)"),
  prenom: z.string().min(2, "Prénom requis"),
  email: z.string().email().optional().or(z.literal("")),
  telephone: z.string().optional(),
  type: z.enum(["PARTICULIER", "PROFESSIONNEL"]).default("PARTICULIER"),
});

type FormValues = z.infer<typeof ClientSchema>;

export default function NouveauClientPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(ClientSchema),
  });

  const onSubmit = async (data: FormValues) => {
    const client = await api.clients.create(data);
    router.push(`/dashboard/clients/${client.id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register("nom")} />
      {errors.nom && <p className="text-destructive">{errors.nom.message}</p>}
      {/* … autres champs … */}
      <Button type="submit">Créer le client</Button>
    </form>
  );
}
```

> 🛡 **Défense en profondeur** : Zod valide le formulaire **côté navigateur** ; les DTOs NestJS + `class-validator` valident à nouveau **côté serveur**. Les deux schémas sont alignés sur les mêmes contraintes — toute requête malformée est rejetée à deux niveaux distincts.

### 3.5.4 Téléchargement de PDF (token JWT en header)

```tsx
// src/lib/api.ts (extrait)
downloadPdf: async (id: string): Promise<Blob> => {
  const token = await getAccessToken();
  const res = await fetch(`${API_URL}/devis/${id}/pdf`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`[API ${res.status}] PDF devis ${id} indisponible`);
  return res.blob();
},
```

L'appel inclut le **JWT Bearer** en header. Le back NestJS vérifie le token via le Guard ES256 avant d'autoriser le téléchargement.

## 3.6 Arguments des choix techniques (y compris sécurité)

| Choix | Argument |
|---|---|
| **Next.js 16** (App Router) | Server Components par défaut → moins de JavaScript côté client, meilleure perf, vérification d'auth côté serveur avant rendu HTML |
| **React 19** | Hooks modernes (`useFormState`, `Suspense` natif), compatibilité Next 16 |
| **TypeScript strict** | Sécurité de typage à la compilation. `strict: true` activé dans `tsconfig.json` |
| **Tailwind CSS v4** | Stylage utilitaire, design system cohérent, bundle minimal grâce à l'arbre JIT, pas de CSS-in-JS coûteux |
| **shadcn/ui** | Composants ré-utilisables versionnés DANS le repo (pas une dépendance externe à jour douteuse). Personnalisables. |
| **Radix UI** (sous shadcn) | Primitives accessibles natives (a11y AAA) — focus management, ARIA correct, navigation clavier |
| **React Hook Form + Zod** | Validation déclarative côté client **et** schémas réutilisés côté serveur (DTOs NestJS) — défense en profondeur |
| **TanStack Query** | Cache intelligent des requêtes API, invalidation contrôlée, pas d'état dupliqué, `retry: false` configurable pour les routes IA (anti-spam) |
| **`lucide-react`** | Bibliothèque d'icônes légère et cohérente |
| **`sonner`** | Toasts non bloquants pour les notifications utilisateur |
| **`next-themes`** | Bascule dark mode automatique (préférence système) |
| **Supabase Auth côté front** | Gestion automatique des tokens JWT, refresh, middleware Next.js pour protéger les routes au niveau du routing |
| **Cookies httpOnly via Supabase** | Aucun token sensible en `localStorage` (anti-XSS) ; les cookies sont posés par Supabase via `@supabase/ssr` |
| **Suspense boundary** sur `useSearchParams()` | Conformité à la nouvelle norme Next.js 16 (sinon erreur de build) |
| **`@hookform/resolvers/zod`** | Lien direct entre Zod et React Hook Form — pas de couche intermédiaire à maintenir |
| **Aucun `dangerouslySetInnerHTML`** | Toutes les valeurs utilisateur sont rendues via React (échappement automatique) — pas de XSS possible côté front |

## 3.7 Performance et accessibilité

- **Bundle JavaScript** : Server Components par défaut → la majorité des pages livrent ~0 kB de JS spécifique
- **Images** : `next/image` (optimisation auto, formats modernes)
- **Lighthouse** (cible) : ≥ 90 sur les 4 métriques (Performance, Accessibility, Best Practices, SEO)
- **A11y** : navigation clavier, contrastes AAA, labels associés à chaque champ
- **Responsive** : breakpoints Tailwind standard, testé sur mobile (Safari iOS) et desktop (Chrome / Safari)
