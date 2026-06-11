"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, Save, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListPageHeader } from "@/components/list-page-header";
import { AutocompleteInput } from "@/components/autocomplete-input";
import {
  MARQUES_BATEAUX,
  MARQUES_MOTEURS,
  getModelesForMarque,
} from "@/lib/data/marques";
import { api, type CreateBateauInput, type TypeCoque } from "@/lib/api";

// Schéma de validation Zod
//
// Périmètre V1 — Modélisation simple "Option A" :
// Bateau + Moteur dans la même table (1 moteur par bateau).
// La V2 prévoit une entité Moteur séparée avec relation 1:N
// (bi/tri/quadri-motorisation, scan de plaque, décodage Yamaha/Suzuki).
const BateauSchema = z.object({
  clientId: z.string().min(1, "Sélectionne un propriétaire"),

  // Bateau (coque)
  nom: z.string().max(60).optional(),
  marque: z.string().min(2, "Marque requise"),
  modele: z.string().min(1, "Modèle requis"),
  typeCoque: z.enum([
    "STRATIFIE",
    "ALUMINIUM",
    "POLYETHYLENE",
    "SEMI_RIGIDE",
    "PNEUMATIQUE",
    "BOIS",
    "ACIER",
    "AUTRE",
  ]),
  immatriculation: z.string().max(20).optional(),
  annee: z
    .union([
      z.coerce.number().int().min(1950).max(2100),
      z.literal(""),
      z.undefined(),
    ])
    .optional(),
  notes: z.string().optional(),

  // Moteur
  marqueMoteur: z.string().optional(),
  modeleMoteur: z.string().optional(),
  plaqueMoteur: z.string().max(40).optional(),
  puissanceCV: z
    .union([
      z.coerce.number().int().min(1).max(1000),
      z.literal(""),
      z.undefined(),
    ])
    .optional(),
  helice: z.string().max(100).optional(),
});

type FormValues = z.infer<typeof BateauSchema>;

const TYPES_COQUE: { value: TypeCoque; label: string; hint: string }[] = [
  { value: "STRATIFIE", label: "Stratifiée", hint: "Polyester / fibre de verre (le plus courant)" },
  { value: "ALUMINIUM", label: "Aluminium", hint: "Coque alu rivetée ou soudée" },
  { value: "POLYETHYLENE", label: "Polyéthylène", hint: "Rotomoulé (Whaly, Pioner…)" },
  { value: "SEMI_RIGIDE", label: "Semi-rigide", hint: "Zodiac, Bombard, Highfield…" },
  { value: "PNEUMATIQUE", label: "Pneumatique", hint: "100 % gonflable (annexes)" },
  { value: "BOIS", label: "Bois", hint: "Construction traditionnelle (rare)" },
  { value: "ACIER", label: "Acier", hint: "Très rare en plaisance hors-bord" },
  { value: "AUTRE", label: "Autre", hint: "À préciser dans les notes" },
];

// useSearchParams() est appelé dans le composant pour lire ?clientId=...
// Il doit être wrappé dans une <Suspense> (contrainte Next.js App Router).
function NouveauBateauPageInner() {
  const router = useRouter();
  const queryClient = useQueryClient();
  // Pré-remplissage depuis la page détail Client
  // (ex. /dashboard/bateaux/nouveau?clientId=xxx)
  const searchParams = useSearchParams();
  const presetClientId = searchParams.get("clientId") ?? "";
  const [clientSearch, setClientSearch] = useState("");
  const [clientPickerOpen, setClientPickerOpen] = useState(false);

  // Charge la liste des clients pour le sélecteur de propriétaire
  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: api.clients.list,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    // Cast nécessaire : Zod v3 et react-hook-form ont un mismatch de types
    // sur les unions/coerce, alors qu'au runtime la résolution fonctionne.
    resolver: zodResolver(BateauSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      clientId: presetClientId,
      nom: "",
      marque: "",
      modele: "",
      typeCoque: "STRATIFIE",
      immatriculation: "",
      annee: undefined,
      notes: "",
      marqueMoteur: "",
      modeleMoteur: "",
      plaqueMoteur: "",
      puissanceCV: undefined,
      helice: "",
    },
  });

  const selectedClientId = watch("clientId");
  const selectedClient = clientsQuery.data?.data.find(
    (c) => c.id === selectedClientId,
  );

  // Filtre les clients selon la recherche
  const filteredClients = clientsQuery.data?.data.filter((c) => {
    if (!clientSearch) return true;
    const q = clientSearch.toLowerCase();
    return (
      c.nom.toLowerCase().includes(q) ||
      c.prenom.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  const createBateau = useMutation({
    mutationFn: (data: CreateBateauInput) => api.bateaux.create(data),
    onSuccess: (bateau) => {
      queryClient.invalidateQueries({ queryKey: ["bateaux"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success(`Bateau ${bateau.marque} ${bateau.modele} ajouté`, {
        description: bateau.nom
          ? `"${bateau.nom}" enregistré avec succès.`
          : "Le bateau a été enregistré avec succès.",
      });
      router.push("/dashboard/bateaux");
    },
    onError: (err) => {
      toast.error("Création impossible", {
        description: (err as Error).message,
      });
    },
  });

  function onSubmit(values: FormValues) {
    // Convertit les strings vides en null + force les nombres
    const payload: CreateBateauInput = {
      clientId: values.clientId,
      nom: values.nom || null,
      marque: values.marque,
      modele: values.modele,
      typeCoque: values.typeCoque,
      immatriculation: values.immatriculation || null,
      annee: typeof values.annee === "number" ? values.annee : null,
      notes: values.notes || null,
      marqueMoteur: values.marqueMoteur || null,
      modeleMoteur: values.modeleMoteur || null,
      plaqueMoteur: values.plaqueMoteur || null,
      puissanceCV:
        typeof values.puissanceCV === "number" ? values.puissanceCV : null,
      helice: values.helice || null,
    };
    toast.loading(`Enregistrement du ${values.marque} ${values.modele}…`, {
      id: "create-bateau",
    });
    createBateau.mutate(payload, {
      onSettled: () => toast.dismiss("create-bateau"),
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <ListPageHeader
        title="Nouveau bateau"
        subtitle="Enregistre un bateau et son moteur"
      />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Erreur API globale */}
          {createBateau.isError && (
            <div className="p-3 rounded-lg border border-destructive bg-destructive/10 text-destructive text-sm">
              <p className="font-semibold">Création impossible</p>
              <p className="text-xs mt-1">
                {(createBateau.error as Error).message}
              </p>
            </div>
          )}

          {/* Propriétaire — sélecteur client */}
          <section className="space-y-4 p-4 rounded-xl border bg-card">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Propriétaire *
            </h2>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Client propriétaire</Label>

              {/* Combobox simple : bouton qui ouvre une liste filtrable */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setClientPickerOpen((v) => !v)}
                  disabled={isSubmitting || clientsQuery.isLoading}
                  className="w-full flex items-center justify-between h-11 px-3 rounded-md border border-input bg-transparent text-base hover:bg-muted/50 transition-colors disabled:opacity-50"
                >
                  {selectedClient ? (
                    <span>
                      <span className="font-bold uppercase">
                        {selectedClient.nom}
                      </span>{" "}
                      {selectedClient.prenom}
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">
                      Sélectionner un client…
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>

                {clientPickerOpen && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-72 overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-popover border-b">
                      <Input
                        type="search"
                        placeholder="Rechercher par nom, prénom, email…"
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        className="h-9"
                        autoFocus
                      />
                    </div>
                    <ul className="py-1">
                      {filteredClients?.length === 0 && (
                        <li className="px-3 py-2 text-sm text-muted-foreground italic">
                          Aucun client trouvé
                        </li>
                      )}
                      {filteredClients?.map((c) => (
                        <li key={c.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setValue("clientId", c.id, {
                                shouldValidate: true,
                              });
                              setClientPickerOpen(false);
                              setClientSearch("");
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                          >
                            <span className="font-bold uppercase">
                              {c.nom}
                            </span>{" "}
                            {c.prenom}
                            {c.email && (
                              <span className="text-xs text-muted-foreground block">
                                {c.email}
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {errors.clientId && (
                <p className="text-xs text-destructive">
                  {errors.clientId.message}
                </p>
              )}
            </div>
          </section>

          {/* Bateau (coque) */}
          <section className="space-y-4 p-4 rounded-xl border bg-card">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              🚤 Bateau (coque)
            </h2>

            <Field
              label="Nom du bateau"
              hint="Surnom donné par le propriétaire (optionnel)"
              error={errors.nom?.message}
              input={
                <Input
                  {...register("nom")}
                  placeholder="Ex. Le Petit Bleu"
                  disabled={isSubmitting}
                />
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Marque coque *"
                error={errors.marque?.message}
                input={
                  <AutocompleteInput
                    value={watch("marque") ?? ""}
                    onChange={(v) =>
                      setValue("marque", v, { shouldValidate: true })
                    }
                    suggestions={MARQUES_BATEAUX}
                    placeholder="Ex. Bénéteau"
                    disabled={isSubmitting}
                    maxLength={60}
                  />
                }
              />
              <Field
                label="Modèle coque *"
                error={errors.modele?.message}
                input={
                  <AutocompleteInput
                    value={watch("modele") ?? ""}
                    onChange={(v) =>
                      setValue("modele", v, { shouldValidate: true })
                    }
                    suggestions={getModelesForMarque(watch("marque") ?? "")}
                    placeholder={
                      watch("marque")
                        ? "Ex. Antares 7"
                        : "Choisis d'abord une marque"
                    }
                    disabled={isSubmitting || !watch("marque")}
                    maxLength={60}
                  />
                }
              />
            </div>

            <Field
              label="Type de coque"
              hint="Matériau / structure (détermine la méthode d'intervention en atelier)"
              error={errors.typeCoque?.message}
              input={
                <select
                  {...register("typeCoque")}
                  disabled={isSubmitting}
                  className="w-full h-11 px-3 rounded-md border border-input bg-transparent text-base"
                >
                  {TYPES_COQUE.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} — {t.hint}
                    </option>
                  ))}
                </select>
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Immatriculation"
                hint="Affaires Maritimes (optionnel)"
                error={errors.immatriculation?.message}
                input={
                  <Input
                    {...register("immatriculation")}
                    placeholder="Ex. AY-67890"
                    disabled={isSubmitting}
                  />
                }
              />
              <Field
                label="Année"
                error={errors.annee?.message}
                input={
                  <Input
                    {...register("annee")}
                    type="number"
                    inputMode="numeric"
                    placeholder="Ex. 2024"
                    disabled={isSubmitting}
                  />
                }
              />
            </div>

            <Field
              label="Notes coque"
              error={errors.notes?.message}
              input={
                <textarea
                  {...register("notes")}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base placeholder:text-muted-foreground/60 placeholder:italic disabled:opacity-50"
                  rows={2}
                  placeholder="Ex. Anti-fouling Hempel noir · Coque blanche · Impact tribord avant"
                  disabled={isSubmitting}
                />
              }
            />
          </section>

          {/* Moteur */}
          <section className="space-y-4 p-4 rounded-xl border bg-card">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              ⚙️ Motorisation
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Marque moteur"
                error={errors.marqueMoteur?.message}
                input={
                  <AutocompleteInput
                    value={watch("marqueMoteur") ?? ""}
                    onChange={(v) =>
                      setValue("marqueMoteur", v, { shouldValidate: true })
                    }
                    suggestions={MARQUES_MOTEURS}
                    placeholder="Ex. Yamaha"
                    disabled={isSubmitting}
                    maxLength={60}
                  />
                }
              />
              <Field
                label="Modèle moteur"
                error={errors.modeleMoteur?.message}
                input={
                  <Input
                    {...register("modeleMoteur")}
                    placeholder="Ex. F250"
                    disabled={isSubmitting}
                  />
                }
              />
            </div>

            <Field
              label="Plaque moteur"
              hint="Optionnel : peut être tombée, effacée ou retirée"
              error={errors.plaqueMoteur?.message}
              input={
                <Input
                  {...register("plaqueMoteur")}
                  placeholder="Ex. YAM-1780576169"
                  disabled={isSubmitting}
                />
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Puissance (CV)"
                error={errors.puissanceCV?.message}
                input={
                  <Input
                    {...register("puissanceCV")}
                    type="number"
                    inputMode="numeric"
                    placeholder="Ex. 250"
                    disabled={isSubmitting}
                  />
                }
              />
              <Field
                label="Hélice"
                error={errors.helice?.message}
                input={
                  <Input
                    {...register("helice")}
                    placeholder="Ex. 3X16X23R inox"
                    disabled={isSubmitting}
                  />
                }
              />
            </div>
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

export default function NouveauBateauPage() {
  return (
    <Suspense fallback={null}>
      <NouveauBateauPageInner />
    </Suspense>
  );
}
