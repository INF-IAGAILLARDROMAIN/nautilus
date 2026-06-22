import { AlertTriangle, UserPlus, Lock, Pencil } from "lucide-react";
import { ListPageHeader } from "@/components/list-page-header";

/**
 * Page Administration — aperçu V2 désactivé.
 *
 * Cette page démontre la vision produit (RBAC : 3 rôles métier + casquette
 * Admin séparée) sans implémenter le back. Seul l'utilisateur connecté
 * (Romain en V1) est affiché. La création et modification d'utilisateurs
 * sont volontairement désactivées — activation prévue en V2 commerciale RANKIA.
 */
export default function AdminPage() {
  // En V1, on affiche uniquement l'utilisateur connecté (Romain — créateur de l'atelier).
  // À récupérer dynamiquement depuis le contexte Supabase quand l'UI sera activée.
  const currentUser = {
    prenom: "Romain",
    nom: "Gaillard",
    email: "romain@atelier.fr",
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <ListPageHeader
        title="Administration"
        subtitle="Gestion des utilisateurs et des accès"
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Bandeau preview */}
        <div className="rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-4 dark:border-yellow-500 dark:bg-yellow-950/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-500 mt-0.5" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Aperçu V2</strong>{" "}
              — la gestion des utilisateurs est en cours de développement.
              L&apos;interface est posée pour démontrer la vision produit.
              L&apos;activation côté back est prévue dans la version
              commerciale RANKIA.
            </p>
          </div>
        </div>

        {/* Bouton inviter — désactivé */}
        <div>
          <button
            disabled
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-50 cursor-not-allowed"
            aria-disabled="true"
            title="Fonctionnalité activée en V2 commerciale RANKIA"
          >
            <UserPlus className="h-4 w-4" />
            Inviter un utilisateur
            <Lock className="h-3.5 w-3.5 ml-1" />
          </button>
        </div>

        {/* Liste utilisateurs (uniquement le user connecté en V1) */}
        <div className="rounded-lg border bg-card pointer-events-none">
          <div className="flex items-center justify-between p-4">
            <div className="space-y-1.5">
              <p className="font-semibold">
                {currentUser.prenom} {currentUser.nom}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentUser.email}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                  👔 Chef d&apos;atelier
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  🔑 Admin
                </span>
              </div>
            </div>
            <button
              disabled
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground opacity-50 cursor-not-allowed"
              aria-disabled="true"
              title="Fonctionnalité activée en V2 commerciale RANKIA"
            >
              <Pencil className="h-3.5 w-3.5" />
              Modifier
              <Lock className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Empty state */}
        <div className="rounded-lg border-2 border-dashed border-muted p-6 text-center">
          <p className="font-medium">
            📝 Aucun autre utilisateur pour le moment.
          </p>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            L&apos;invitation et la gestion des comptes seront activées dans la
            version commerciale RANKIA. Vous pourrez alors inviter vos
            collaborateurs et assigner les rôles ci-dessous.
          </p>
        </div>

        {/* Légende rôles disponibles en V2 */}
        <section>
          <h2 className="text-lg font-semibold mb-3">
            Rôles disponibles en V2
          </h2>
          <div className="grid gap-3">
            <RoleCard
              icon="🧰"
              name="Client"
              description="Voit uniquement ses bateaux, devis et factures. Accès en lecture seule."
            />
            <RoleCard
              icon="🔧"
              name="Mécano"
              description="Accès aux clients, bateaux, ordres de réparation (lecture + mise à jour de statut) et recherche IA. Pas d'accès aux devis ni aux factures."
            />
            <RoleCard
              icon="👔"
              name="Chef d'atelier"
              description="Accès complet au métier : clients, bateaux, devis, OR, factures, recherche IA."
            />
          </div>

          <h2 className="text-lg font-semibold mt-6 mb-3">
            Casquette supplémentaire
          </h2>
          <RoleCard
            icon="🔑"
            name="Admin"
            description="Cochable indépendamment du rôle métier. Donne accès à la page Administration et à la gestion des utilisateurs. C'est l'entreprise qui décide qui assume cette casquette."
            highlight
          />
        </section>
      </main>
    </div>
  );
}

function RoleCard({
  icon,
  name,
  description,
  highlight = false,
}: {
  icon: string;
  name: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        highlight ? "bg-primary/5 border-primary/20" : "bg-muted/30"
      }`}
    >
      <p className="font-semibold flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        {name}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
