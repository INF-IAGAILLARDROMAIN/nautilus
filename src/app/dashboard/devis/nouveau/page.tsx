"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, Save, Plus, Trash2, ChevronDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListPageHeader } from "@/components/list-page-header";
import { AutocompleteInput } from "@/components/autocomplete-input";
import { FORFAITS, CATEGORIES_DEVIS } from "@/lib/data/forfaits";
import { api, type CreateDevisInput } from "@/lib/api";
import { formatEuro } from "@/lib/format";

// Schéma de validation du formulaire Devis
//
// Mentions légales FR couvertes :
// - Date de validité (dateValidite) — par défaut J+30
// - Modalités de paiement (modalitesPaiement)
// - Total HT / TVA / TTC (calculés en live à partir des lignes)
// - Détail des prestations (description + quantité + prix unitaire HT par ligne)
// Les coordonnées atelier + client seront ajoutées par le PDF généré (S2).
const LigneSchema = z.object({
  description: z.string().min(2, "Description requise"),
  quantite: z.coerce
    .number({ message: "Quantité requise" })
    .min(0.01, "Quantité > 0"),
  prixUnitaireHT: z.coerce
    .number({ message: "Prix unitaire requis" })
    .min(0, "Prix ≥ 0"),
});

const DevisSchema = z.object({
  clientId: z.string().min(1, "Sélectionne un client"),
  // bateauId peut être vide → devis pré-vente / accessoires / sans bateau
  bateauId: z.string().optional(),
  description: z.string().max(500).optional(),
  tauxTVA: z.coerce.number().min(0).max(100).default(20),
  dateValidite: z.string().optional(),
  modalitesPaiement: z.string().max(500).optional(),
  lignes: z
    .array(LigneSchema)
    .min(1, "Au moins 1 ligne requise dans le devis"),
});

type FormValues = z.infer<typeof DevisSchema>;

// Date par défaut = J+30 (validité standard d'un devis FR)
function defaultDateValidite(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

// useSearchParams() est appelé dans le composant pour lire ?clientId=...&bateauId=...
// Il doit être wrappé dans une <Suspense> (contrainte Next.js App Router).
function NouveauDevisPageInner() {
  const router = useRouter();
  const queryClient = useQueryClient();
  // Pré-remplissage depuis la page détail Client/Bateau
  // (ex. /dashboard/devis/nouveau?clientId=xxx&bateauId=yyy)
  const searchParams = useSearchParams();
  const presetClientId = searchParams.get("clientId") ?? "";
  const presetBateauId = searchParams.get("bateauId") ?? "";

  // Sélecteurs : client (obligatoire) + bateau (facultatif, filtré par client)
  const [clientSearch, setClientSearch] = useState("");
  const [clientPickerOpen, setClientPickerOpen] = useState(false);
  const [bateauSearch, setBateauSearch] = useState("");
  const [bateauPickerOpen, setBateauPickerOpen] = useState(false);
  // Sélecteur de forfait (templates multi-lignes)
  const [forfaitPickerOpen, setForfaitPickerOpen] = useState(false);

  // Charge les listes
  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: api.clients.list,
  });
  const bateauxQuery = useQuery({
    queryKey: ["bateaux"],
    queryFn: api.bateaux.list,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    // Cast nécessaire : Zod v3 et react-hook-form ont un mismatch de types
    // sur les unions/coerce, alors qu'au runtime la résolution fonctionne.
    resolver: zodResolver(DevisSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      clientId: presetClientId,
      bateauId: presetBateauId,
      description: "",
      tauxTVA: 20,
      dateValidite: defaultDateValidite(),
      modalitesPaiement: "",
      lignes: [{ description: "", quantite: 1, prixUnitaireHT: 0 }],
    },
  });

  // useFieldArray = gestion native RHF des tableaux de sous-champs (les lignes du devis)
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "lignes",
  });

  /**
   * Applique un forfait prédéfini en remplaçant les lignes du devis.
   * Si l'utilisateur a déjà saisi des lignes non vides, on demande confirmation.
   * Renseigne aussi la description du devis avec la catégorie du forfait.
   */
  function appliquerForfait(forfaitId: string) {
    const forfait = FORFAITS.find((f) => f.id === forfaitId);
    if (!forfait) return;

    // Si des lignes ont déjà du contenu réel, demander avant d'écraser
    const lignesActuelles = watch("lignes");
    const auMoinsUneLigneSaisie = lignesActuelles.some(
      (l) => l.description.trim() !== "" || Number(l.prixUnitaireHT) > 0,
    );

    if (
      auMoinsUneLigneSaisie &&
      !window.confirm(
        `Le devis contient déjà des lignes. Les remplacer par "${forfait.nom}" ?`,
      )
    ) {
      return;
    }

    // Remplace les lignes par celles du forfait
    replace(
      forfait.lignes.map((l) => ({
        description: l.description,
        quantite: l.quantite,
        prixUnitaireHT: l.prixUnitaireHT,
      })),
    );

    // Auto-remplit la description du devis si vide
    const descActuelle = watch("description");
    if (!descActuelle || descActuelle.trim() === "") {
      setValue("description", forfait.description);
    }

    setForfaitPickerOpen(false);
    toast.success(`Forfait "${forfait.nom}" appliqué`, {
      description: `${forfait.lignes.length} lignes ajoutées au devis.`,
    });
  }

  // Watch des valeurs pour calculer les totaux en temps réel
  const lignes = watch("lignes");
  const tauxTVA = watch("tauxTVA") || 20;
  const selectedClientId = watch("clientId");
  const selectedBateauId = watch("bateauId");
  const selectedBateau = bateauxQuery.data?.data.find(
    (b) => b.id === selectedBateauId,
  );

  const selectedClient = clientsQuery.data?.data.find(
    (c) => c.id === selectedClientId,
  );

  // Helper : récupère les bateaux d'un client (utile pour identifier les homonymes)
  const bateauxParClient = (id: string) =>
    bateauxQuery.data?.data.filter((b) => b.clientId === id) ?? [];

  // Filtre clients pour la recherche dans le combobox.
  // Cherche aussi dans les marques/modèles/noms de bateaux du client
  // (utile pour distinguer 2 homonymes par leur bateau).
  const filteredClients = clientsQuery.data?.data.filter((c) => {
    if (!clientSearch) return true;
    const q = clientSearch.toLowerCase();
    const bateaux = bateauxParClient(c.id);
    return (
      c.nom.toLowerCase().includes(q) ||
      c.prenom.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      bateaux.some(
        (b) =>
          b.marque.toLowerCase().includes(q) ||
          b.modele.toLowerCase().includes(q) ||
          b.nom?.toLowerCase().includes(q),
      )
    );
  });

  // Filtre bateaux : d'abord par client (cascade), puis par recherche texte
  const filteredBateaux = bateauxQuery.data?.data
    .filter((b) =>
      selectedClientId ? b.clientId === selectedClientId : false,
    )
    .filter((b) => {
      if (!bateauSearch) return true;
      const q = bateauSearch.toLowerCase();
      return (
        b.marque.toLowerCase().includes(q) ||
        b.modele.toLowerCase().includes(q) ||
        b.nom?.toLowerCase().includes(q) ||
        b.plaqueMoteur?.toLowerCase().includes(q)
      );
    });

  // Calculs de totaux en LIVE (recalculés à chaque modif des lignes ou taux TVA)
  const totaux = useMemo(() => {
    const totalHT = lignes.reduce((sum, l) => {
      const qte = Number(l.quantite) || 0;
      const pu = Number(l.prixUnitaireHT) || 0;
      return sum + qte * pu;
    }, 0);
    const totalTVA = totalHT * (Number(tauxTVA) / 100);
    const totalTTC = totalHT + totalTVA;
    return { totalHT, totalTVA, totalTTC };
  }, [lignes, tauxTVA]);

  const createDevis = useMutation({
    mutationFn: (data: CreateDevisInput) => api.devis.create(data),
    onSuccess: (devis) => {
      queryClient.invalidateQueries({ queryKey: ["devis"] });
      queryClient.invalidateQueries({ queryKey: ["bateaux"] });
      toast.success(`Devis ${devis.numeroDevis} créé`, {
        description: `Total TTC : ${formatEuro(Number(devis.totalTTC))}`,
      });
      router.push("/dashboard/devis");
    },
    onError: (err) => {
      toast.error("Création impossible", {
        description: (err as Error).message,
      });
    },
  });

  function onSubmit(values: FormValues) {
    const payload: CreateDevisInput = {
      clientId: values.clientId,
      bateauId: values.bateauId || null,
      description: values.description || null,
      tauxTVA: values.tauxTVA,
      dateValidite: values.dateValidite
        ? new Date(values.dateValidite).toISOString()
        : null,
      modalitesPaiement: values.modalitesPaiement || null,
      lignes: values.lignes.map((l) => ({
        description: l.description,
        quantite: Number(l.quantite),
        prixUnitaireHT: Number(l.prixUnitaireHT),
      })),
    };
    toast.loading("Enregistrement du devis…", { id: "create-devis" });
    createDevis.mutate(payload, {
      onSettled: () => toast.dismiss("create-devis"),
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <ListPageHeader
        title="Nouveau devis"
        subtitle="Chiffrage pour un bateau"
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {createDevis.isError && (
            <div className="p-3 rounded-lg border border-destructive bg-destructive/10 text-destructive text-sm">
              <p className="font-semibold">Création impossible</p>
              <p className="text-xs mt-1">
                {(createDevis.error as Error).message}
              </p>
            </div>
          )}

          {/* Client (sélection obligatoire avant le bateau) */}
          <section className="space-y-4 p-4 rounded-xl border bg-card">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              👤 Client *
            </h2>

            <div className="space-y-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setClientPickerOpen((v) => !v)}
                  disabled={isSubmitting || clientsQuery.isLoading}
                  className="w-full flex items-center justify-between h-11 px-3 rounded-md border border-input bg-transparent text-base hover:bg-muted/50 disabled:opacity-50"
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
                  <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-72 overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-popover border-b">
                      <Input
                        type="search"
                        placeholder="Nom, prénom, email, marque ou nom de bateau…"
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
                      {filteredClients?.map((c) => {
                        const bateaux = bateauxParClient(c.id);
                        return (
                          <li key={c.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setValue("clientId", c.id, {
                                  shouldValidate: true,
                                });
                                setClientPickerOpen(false);
                                setClientSearch("");
                                setValue("bateauId", "");
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                            >
                              <div>
                                <span className="font-bold uppercase">
                                  {c.nom}
                                </span>{" "}
                                {c.prenom}
                                {c.ville && (
                                  <span className="text-xs text-muted-foreground">
                                    {" "}· {c.ville}
                                  </span>
                                )}
                              </div>
                              {/* Bateaux du client : aide à identifier les homonymes */}
                              {bateaux.length > 0 ? (
                                <div className="mt-0.5 text-xs text-muted-foreground space-y-0.5">
                                  {bateaux.map((b) => (
                                    <div key={b.id}>
                                      ⚓{" "}
                                      {b.nom && (
                                        <span className="italic">
                                          {b.nom} ·{" "}
                                        </span>
                                      )}
                                      {b.marque} {b.modele}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="mt-0.5 text-xs text-muted-foreground italic">
                                  Aucun bateau enregistré
                                </div>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Bateau — facultatif. Cascade : filtré sur le client sélectionné.
              Sans bateau = devis pré-vente / accessoires / sans bateau enregistré. */}
          <section className="space-y-4 p-4 rounded-xl border bg-card">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              🚤 Bateau concerné
            </h2>

            <div className="space-y-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    selectedClientId && setBateauPickerOpen((v) => !v)
                  }
                  disabled={
                    isSubmitting || bateauxQuery.isLoading || !selectedClientId
                  }
                  className="w-full flex items-center justify-between h-11 px-3 rounded-md border border-input bg-transparent text-base hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedBateau ? (
                    <span className="text-left">
                      {/* Client déjà visible au-dessus → on affiche surnom + marque/modèle */}
                      {selectedBateau.nom && (
                        <>
                          <span className="font-semibold italic">
                            {selectedBateau.nom}
                          </span>
                          <span className="text-muted-foreground"> · </span>
                        </>
                      )}
                      <span>
                        {selectedBateau.marque} {selectedBateau.modele}
                      </span>
                      {selectedBateau.plaqueMoteur && (
                        <span className="text-muted-foreground text-sm">
                          {" · "}
                          {selectedBateau.plaqueMoteur}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">
                      {selectedClientId
                        ? "Sélectionner un bateau…"
                        : "Choisis d'abord un client"}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>

                {bateauPickerOpen && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-72 overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-popover border-b">
                      <Input
                        type="search"
                        placeholder="Rechercher par marque, modèle, plaque, client…"
                        value={bateauSearch}
                        onChange={(e) => setBateauSearch(e.target.value)}
                        className="h-9"
                        autoFocus
                      />
                    </div>
                    <ul className="py-1">
                      {filteredBateaux?.length === 0 && (
                        <li className="px-3 py-2 text-sm text-muted-foreground italic">
                          {selectedClient
                            ? `${selectedClient.nom.toUpperCase()} ${selectedClient.prenom} n'a aucun bateau enregistré`
                            : "Aucun bateau trouvé"}
                        </li>
                      )}
                      {filteredBateaux?.map((b) => (
                        <li key={b.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setValue("bateauId", b.id, {
                                shouldValidate: true,
                              });
                              setBateauPickerOpen(false);
                              setBateauSearch("");
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-muted"
                          >
                            {/* Tous les bateaux ici sont du client sélectionné → on affiche surnom (si présent) + marque/modèle */}
                            <div className="text-sm">
                              {b.nom ? (
                                <>
                                  <span className="font-semibold italic">
                                    {b.nom}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {" · "}
                                  </span>
                                  <span>
                                    {b.marque} {b.modele}
                                  </span>
                                </>
                              ) : (
                                <span className="font-medium">
                                  {b.marque} {b.modele}
                                </span>
                              )}
                            </div>
                            {b.plaqueMoteur && (
                              <div className="text-xs text-muted-foreground font-mono">
                                {b.plaqueMoteur}
                              </div>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {errors.bateauId && (
                <p className="text-xs text-destructive">
                  {errors.bateauId.message}
                </p>
              )}
            </div>
          </section>

          {/* Description */}
          <section className="space-y-4 p-4 rounded-xl border bg-card">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              📝 Description
            </h2>
            <Field
              label="Catégorie du devis"
              error={errors.description?.message}
              input={
                <AutocompleteInput
                  value={watch("description") ?? ""}
                  onChange={(v) =>
                    setValue("description", v, { shouldValidate: true })
                  }
                  suggestions={CATEGORIES_DEVIS}
                  placeholder="Ex. Entretien moteur"
                  disabled={isSubmitting}
                  maxLength={500}
                />
              }
            />
          </section>

          {/* Lignes dynamiques */}
          <section className="space-y-4 p-4 rounded-xl border bg-card">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                💶 Lignes du devis *
              </h2>
              <div className="flex items-center gap-2">
                {/* Bouton "Forfait rapide" — ouvre la liste des templates */}
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setForfaitPickerOpen((v) => !v)}
                    disabled={isSubmitting}
                    className="bg-accent/10 border-accent/40 hover:bg-accent/20 text-accent"
                  >
                    <Zap className="h-3.5 w-3.5 mr-1" />
                    Forfait rapide
                  </Button>
                  {forfaitPickerOpen && (
                    <div className="absolute z-20 mt-1 right-0 w-80 rounded-md border bg-popover shadow-lg max-h-96 overflow-y-auto">
                      <div className="p-2 border-b bg-muted/40">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Choisir un forfait
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Remplace les lignes actuelles
                        </p>
                      </div>
                      <ul className="py-1">
                        {FORFAITS.map((f) => (
                          <li key={f.id}>
                            <button
                              type="button"
                              onClick={() => appliquerForfait(f.id)}
                              className="w-full text-left px-3 py-2 hover:bg-muted"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-semibold">
                                  {f.nom}
                                </span>
                                <span className="text-[10px] uppercase tracking-wide font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                                  {f.categorie}
                                </span>
                              </div>
                              {f.hint && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {f.hint}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {f.lignes.length} ligne
                                {f.lignes.length > 1 ? "s" : ""}
                              </p>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ description: "", quantite: 1, prixUnitaireHT: 0 })
                  }
                  disabled={isSubmitting}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Ajouter une ligne
                </Button>
              </div>
            </div>

            {fields.map((field, index) => {
              const ligne = lignes[index];
              const totalLigne =
                (Number(ligne?.quantite) || 0) *
                (Number(ligne?.prixUnitaireHT) || 0);
              return (
                <div
                  key={field.id}
                  className="p-3 rounded-lg border bg-muted/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Ligne {index + 1}
                    </span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={isSubmitting}
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <Field
                    label="Description"
                    error={errors.lignes?.[index]?.description?.message}
                    input={
                      <Input
                        {...register(`lignes.${index}.description`)}
                        placeholder="Ex. Vidange moteur + filtre à huile"
                        disabled={isSubmitting}
                      />
                    }
                  />

                  <div className="grid grid-cols-3 gap-3">
                    <Field
                      label="Quantité"
                      error={errors.lignes?.[index]?.quantite?.message}
                      input={
                        <Input
                          {...register(`lignes.${index}.quantite`)}
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={isSubmitting}
                        />
                      }
                    />
                    <Field
                      label="Prix unitaire HT (€)"
                      error={errors.lignes?.[index]?.prixUnitaireHT?.message}
                      input={
                        <Input
                          {...register(`lignes.${index}.prixUnitaireHT`)}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          disabled={isSubmitting}
                        />
                      }
                    />
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Total ligne</Label>
                      <div className="h-11 px-3 flex items-center rounded-md border border-input bg-muted/50 text-base font-semibold tabular-nums">
                        {formatEuro(totalLigne)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {errors.lignes?.root && (
              <p className="text-xs text-destructive">
                {errors.lignes.root.message}
              </p>
            )}
          </section>

          {/* Totaux + TVA */}
          <section className="space-y-4 p-4 rounded-xl border-2 border-primary/40 bg-primary/5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">
              🧮 Totaux (calculés en direct)
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Taux TVA (%)"
                error={errors.tauxTVA?.message}
                input={
                  <Input
                    {...register("tauxTVA")}
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    disabled={isSubmitting}
                  />
                }
              />
              <div />
            </div>

            <div className="space-y-1.5 pt-3 border-t border-primary/30">
              <div className="flex justify-between text-sm">
                <span>Total HT</span>
                <span className="font-semibold tabular-nums">
                  {formatEuro(totaux.totalHT)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>TVA ({tauxTVA}%)</span>
                <span className="font-semibold tabular-nums">
                  {formatEuro(totaux.totalTVA)}
                </span>
              </div>
              <div className="flex justify-between text-lg pt-1 border-t border-primary/30">
                <span className="font-bold">Total TTC</span>
                <span className="font-bold tabular-nums text-primary">
                  {formatEuro(totaux.totalTTC)}
                </span>
              </div>
            </div>
          </section>

          {/* Validité + paiement */}
          <section className="space-y-4 p-4 rounded-xl border bg-card">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              📅 Mentions légales
            </h2>

            <Field
              label="Date de validité"
              hint="Par défaut J+30 (devis caduc au-delà)"
              error={errors.dateValidite?.message}
              input={
                <Input
                  {...register("dateValidite")}
                  type="date"
                  disabled={isSubmitting}
                />
              }
            />

            <Field
              label="Modalités de paiement"
              error={errors.modalitesPaiement?.message}
              input={
                <textarea
                  {...register("modalitesPaiement")}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base placeholder:text-muted-foreground/60 placeholder:italic disabled:opacity-50"
                  rows={2}
                  placeholder="Ex. Acompte 30% à la signature, solde à la livraison"
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
                  Enregistrer le devis
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

export default function NouveauDevisPage() {
  return (
    <Suspense fallback={null}>
      <NouveauDevisPageInner />
    </Suspense>
  );
}
