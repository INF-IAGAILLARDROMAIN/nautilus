"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListPageHeader } from "@/components/list-page-header";
import { api, type CreateClientInput } from "@/lib/api";

// Schéma de validation — décrit les règles métier des champs.
// Le ".or(z.literal(''))" pour les optionnels permet d'accepter
// un champ vide (UX) sans casser la validation.
//
// PÉRIMÈTRE V1 EXAMEN — Type de client :
// La BDD supporte PARTICULIER et PROFESSIONNEL (enum TypeClient).
// Le formulaire V1 ne propose QUE le particulier (default Prisma).
// Le PRO nécessite raison sociale + SIRET + N° TVA + facturation B2B,
// prévu en V2 commerciale RANKIA (pattern d'affichage conditionnel déjà
// implémenté sur le formulaire de contact Kosmos).
const ClientSchema = z.object({
  nom: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  prenom: z.string().min(2, "Le prénom doit faire au moins 2 caractères"),
  email: z
    .string()
    .email("Email invalide")
    .or(z.literal(""))
    .optional(),
  telephone: z
    .string()
    .regex(/^[0-9 +().-]{6,20}$/, "Téléphone invalide")
    .or(z.literal(""))
    .optional(),
  adresse: z.string().optional(),
  ville: z.string().optional(),
  codePostal: z
    .string()
    .regex(/^\d{5}$/, "Code postal invalide (5 chiffres)")
    .or(z.literal(""))
    .optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof ClientSchema>;

export default function NouveauClientPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(ClientSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      adresse: "",
      ville: "",
      codePostal: "",
      notes: "",
    },
  });

  const createClient = useMutation({
    mutationFn: (data: CreateClientInput) => api.clients.create(data),
    onSuccess: (client) => {
      // Rafraîchit la liste des clients en cache → la nouvelle ligne apparaît
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      // Format NOM Prénom — convention française métier (Infocob, ERP)
      toast.success(`${client.nom.toUpperCase()} ${client.prenom} ajouté(e)`, {
        description: "Le client a été enregistré avec succès.",
      });
      router.push("/dashboard/clients");
    },
    onError: (err) => {
      toast.error("Création impossible", {
        description: (err as Error).message,
      });
    },
  });

  function onSubmit(values: FormValues) {
    // Convertit les strings vides en null (cohérent avec la BDD)
    const payload: CreateClientInput = {
      nom: values.nom,
      prenom: values.prenom,
      email: values.email || null,
      telephone: values.telephone || null,
      adresse: values.adresse || null,
      ville: values.ville || null,
      codePostal: values.codePostal || null,
      notes: values.notes || null,
    };
    // Toast "loading" pendant la mutation (perception de feedback immédiat)
    toast.loading(
      `Enregistrement de ${values.nom.toUpperCase()} ${values.prenom}…`,
      { id: "create-client" },
    );
    createClient.mutate(payload, {
      onSettled: () => toast.dismiss("create-client"),
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <ListPageHeader title="Nouveau client" subtitle="Crée une fiche client" />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Erreur API globale */}
          {createClient.isError && (
            <div className="p-3 rounded-lg border border-destructive bg-destructive/10 text-destructive text-sm">
              <p className="font-semibold">Création impossible</p>
              <p className="text-xs mt-1">
                {(createClient.error as Error).message}
              </p>
            </div>
          )}

          {/* Identité */}
          <section className="space-y-4 p-4 rounded-xl border bg-card">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Identité
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Prénom *"
                error={errors.prenom?.message}
                input={
                  <Input
                    {...register("prenom")}
                    placeholder="Ex. Sophie"
                    autoComplete="given-name"
                    disabled={isSubmitting}
                  />
                }
              />
              <Field
                label="Nom *"
                error={errors.nom?.message}
                input={
                  <Input
                    {...register("nom")}
                    placeholder="Ex. Martin"
                    autoComplete="family-name"
                    disabled={isSubmitting}
                  />
                }
              />
            </div>
          </section>

          {/* Contact */}
          <section className="space-y-4 p-4 rounded-xl border bg-card">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Contact
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Email"
                error={errors.email?.message}
                input={
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="Ex. sophie@martin.fr"
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                }
              />
              <Field
                label="Téléphone"
                error={errors.telephone?.message}
                input={
                  <Input
                    {...register("telephone")}
                    type="tel"
                    placeholder="Ex. 06 12 34 56 78"
                    autoComplete="tel"
                    disabled={isSubmitting}
                  />
                }
              />
            </div>
          </section>

          {/* Adresse */}
          <section className="space-y-4 p-4 rounded-xl border bg-card">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Adresse
            </h2>

            <Field
              label="Adresse"
              error={errors.adresse?.message}
              input={
                <Input
                  {...register("adresse")}
                  placeholder="Ex. 12 rue du Port"
                  autoComplete="street-address"
                  disabled={isSubmitting}
                />
              }
            />

            <div className="grid grid-cols-3 gap-4">
              <Field
                label="Code postal"
                error={errors.codePostal?.message}
                input={
                  <Input
                    {...register("codePostal")}
                    placeholder="Ex. 56690"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    disabled={isSubmitting}
                  />
                }
              />
              <div className="col-span-2">
                <Field
                  label="Ville"
                  error={errors.ville?.message}
                  input={
                    <Input
                      {...register("ville")}
                      placeholder="Ex. Landévant"
                      autoComplete="address-level2"
                      disabled={isSubmitting}
                    />
                  }
                />
              </div>
            </div>
          </section>

          {/* Notes */}
          <section className="space-y-4 p-4 rounded-xl border bg-card">
            <Field
              label="Notes"
              hint="Infos sur le client (les infos techniques iront sur le bateau)"
              error={errors.notes?.message}
              input={
                <textarea
                  {...register("notes")}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground/60 placeholder:italic focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  rows={3}
                  placeholder="Ex. Contact uniquement par SMS · Hivernage annuel chez nous depuis 2020 · Paiement par virement"
                  disabled={isSubmitting}
                />
              }
            />
          </section>

          {/* Actions */}
          <div className="flex gap-3 sticky bottom-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enregistrement…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  input,
}: {
  label: string;
  hint?: string;
  error?: string;
  input: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {input}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
