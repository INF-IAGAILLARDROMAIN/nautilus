# STATUS Nautilus — Avancement vs PRD-EXAMEN-V1

> Document **vivant** : mis à jour à chaque fin de session. Reflète l'état réel du code vs le périmètre figé dans [PRD-NAUTILUS-EXAMEN-V1.md](PRD-NAUTILUS-EXAMEN-V1.md).
>
> Dernière mise à jour : **2026-06-10** (matin — S1 bouclée : pages détail Client/Bateau + search bars branchées + pré-remplissage formulaires).

---

## 📅 Position dans le calendrier

| Semaine | Mission PRD | Statut |
|---|---|---|
| S1 (02-08/06) | BDD + Auth + CRUD | ✅ **BOUCLÉE** (avec 2 jours de débord — 10/06) |
| S2 (09-15/06) | Moteur de recherche IA + PDF + déploiement | 🟡 **DÉMARRAGE** (10/06) |
| S3 (16-22/06) | Rédaction Dossier Projet + DP + 1er dépôt | ⏳ À venir |
| S4 (23-28/06) | Diaporama + répétitions orales | ⏳ À venir |
| **29/06** | 🎓 **Examen Villepinte** | 🎯 Objectif 16/20 min |

---

## ✅ FAIT (validé fonctionnellement)

### Backend (NestJS sur port 4001)
- Schéma Prisma 4 entités liées : Client → Bateau → Devis → OrdreReparation
- Modules CRUD complets : `clients`, `bateaux`, `devis`, `ordre-reparation`
- Workflow auto :
  - Devis statut → `VALIDE` ⇒ création automatique de l'OR
  - OR statut → `FACTURE` ⇒ génération automatique du numéro `FAC-AAAA-XXXX`
- Numérotation auto séquentielle par année : `DEV-2026-XXXX`, `FAC-2026-XXXX`
- Calcul auto des totaux HT / TVA / TTC sur les devis
- Sécurité de base : `Helmet`, `CORS` strict, `ValidationPipe` global, `ThrottlerGuard`
- **Auth JWT (Supabase ES256)** ⭐ NEW
  - Module `AuthModule` avec `SupabaseJwtGuard` appliqué globalement
  - Vérification asymétrique via JWKS public (aucun secret stocké côté serveur)
  - Décorateur `@Public()` pour exempter le healthcheck `GET /api`
  - Décorateur `@CurrentUser()` pour récupérer l'utilisateur dans les controllers
  - Test validé : `GET /api/clients` sans token → 401 Unauthorized
- Connecté à PostgreSQL Neon (eu-central-1)
- Test end-to-end métier validé : Sophie Martin → Beneteau Antares 7 → DEV-2026-0001 → OR → FAC-2026-0001

### Frontend (Next.js 16 sur port 3000)
- Provider TanStack Query (cache 30 s, retry x1, devtools en dev)
- Lib API client typée (`src/lib/api.ts`) couvrant clients/bateaux/devis/or/factures
- **Injection automatique du Bearer token** dans toutes les requêtes API ⭐ NEW
- Variable `NEXT_PUBLIC_API_URL` + Supabase URL/PUBLISHABLE_KEY (gitignored)
- 10 pages branchées à l'API (6 listes + 4 détails) :
  - `/dashboard` — entité racine "Clients" + 4 KPIs temps réel + barre IA (S2) + avatar + prénom dérivés du JWT Supabase
  - **5 listes avec filtrage live côté client** (accents ignorés via NFD) sur tous les champs métier — résultats `X / Y` affichés
    - `/dashboard/clients` — filtre nom/prénom/email/tél/ville
    - `/dashboard/bateaux` — filtre marque/modèle/nom/plaque/moteur/client
    - `/dashboard/devis` — filtre n° devis/client/bateau/description
    - `/dashboard/or` — filtre type/mécano/n° devis/n° facture/bateau/client
    - `/dashboard/factures` — filtre n° facture/n° devis/client/bateau
  - **4 pages détail** (navigation profonde, clic sur n'importe quelle carte) :
    - `/dashboard/clients/[id]` — coordonnées + KPIs (bateaux/devis/CA) + sections Bateaux/Devis/OR/Factures
    - `/dashboard/bateaux/[id]` — propriétaire + caractéristiques + motorisation + Devis/OR/Factures
    - `/dashboard/devis/[id]` — workflow statut (Brouillon → Transmis → Validé/Refusé) avec création auto de l'OR
    - `/dashboard/or/[id]` — workflow statut (Créé → En cours → Terminé → Facturé) + assignation mécano éditable
- Sidebar épurée (6 liens, plus aucun lien fantôme)
- **Auth Supabase complète**
  - Login branché à `signInWithPassword` avec gestion loading/erreurs FR
  - Logout branché à `signOut`
  - Proxy (Next.js 16) qui protège `/dashboard/*` et redirige `/` vers `/dashboard` si connecté
  - Sessions stockées en cookies httpOnly (sécurisé)
  - Compte test créé via API Admin Supabase, mot de passe fort dans 1Password
- **Formulaires CUD (Create) opérationnels**
  - `/dashboard/clients/nouveau` : React Hook Form + Zod + toasts Sonner + tri NOM Prénom (convention ERP française type Infocob)
  - `/dashboard/bateaux/nouveau` : Combobox client + cascade marque → modèle + autocomplétion fuzzy (32 marques bateaux, 18 marques moteurs) + dropdown type coque (8 valeurs) + plaque moteur optionnelle + **pré-remplissage `?clientId=…` depuis page détail Client**
  - `/dashboard/devis/nouveau` : Cascade Client → Bateau stricte (bateau désactivé tant que client non choisi), combobox client enrichi avec les bateaux possédés (lève l'ambiguïté des homonymes), useFieldArray pour les lignes, AutocompleteInput sur 10 catégories métier, bouton "Forfait rapide" qui charge 10 forfaits multi-lignes prédéfinis (entretien 100h/300h, hivernage simple/complet, carénage, dépannage…), totaux HT/TVA/TTC en useMemo, mentions légales FR (date validité J+30 + modalités paiement), **pré-remplissage `?clientId=…&bateauId=…`** depuis pages détail
  - Composant `AutocompleteInput` réutilisable avec normalisation des accents (Unicode NFD)
  - Listes statiques `src/lib/data/marques.ts` (MARQUES_BATEAUX, MARQUES_MOTEURS, MODELES_BATEAUX_PAR_MARQUE) et `src/lib/data/forfaits.ts` (10 forfaits + 10 catégories devis)
- **Modèle Bateau enrichi**
  - Champs ajoutés : `nom` (surnom), `typeCoque` (enum 8 valeurs), `immatriculation`, `notes`
  - Champs moteur intégrés : `marqueMoteur`, `modeleMoteur`, `puissanceCV`, `helice`
  - `plaqueMoteur` rendue optionnelle (plaque tombée/effacée/retirée — cas métier réel)
  - V1 = 1 moteur par bateau · V2 prévue : entité Moteur séparée + cas "moteur sans bateau"

- **Modèle Devis refactoré** (migration 3 étapes pour préserver les 2 devis existants)
  - `clientId` ajouté en FK obligatoire (un devis a TOUJOURS un client)
  - `bateauId` rendu nullable (un devis sans bateau = cas pré-vente / achat / accessoires)
  - Ajout `dateValidite` + `modalitesPaiement` pour conformité légale FR
  - Vérification métier : si bateau fourni, il doit appartenir au client

### Qualité / Outils
- Audit `npm` après chaque install (règle systématique)
- Override `postcss ≥ 8.5.10` pour patch CVE GHSA-qx2v-qp2m-jg93 (0 vulnerability)
- Secrets stockés dans 1Password vault `nautilus` (3 items : Neon DB URL, Supabase DB password, Supabase credentials, compte test)
- Git workflow : tout sur `dev`, jamais sur `main` sans validation Fabien
- Commits réguliers + push sur `origin/dev`

---

## 🔴 PAS ENCORE FAIT (mais prévu PRD)

### S1 — Reste à faire (faible priorité)
- ❌ **Formulaires édition + suppression** (mutations UPDATE/DELETE — V1 manuelle par appels API, UI à venir si temps)

### S2 — EN COURS (démarrage 10/06)
- ❌ **🌟 Moteur de recherche IA** en langage naturel (cœur examen, fonctionnalité signature)
- ❌ **MongoDB Atlas** (historique des recherches IA — exigence SQL+NoSQL du référentiel)
- ❌ **Génération PDF** côté serveur (devis + facture, pdfkit/puppeteer)
- ❌ **Déploiement** Vercel (front) + Railway (back) — _attention : pas de Vercel avant validation Romain_

### S3-S4
- ❌ Dossier Projet rédigé
- ❌ Dossier Professionnel (Winaxion + Kosmos/ING+ + Nautilus)
- ❌ Diaporama soutenance + répétitions

---

## 🔧 Décisions techniques prises depuis le PRD V1

| Décision | Raison | Impact PRD |
|---|---|---|
| Type `OR.type` modifiable a posteriori | Default `REPARATION` ne couvre pas tous les cas | Aucun (le PRD prévoit déjà les 5 types) |
| Dashboard = carte "Clients" + grille 4 KPIs | Hiérarchie métier respectée (le client est racine) | PRD ajusté (1 ligne en hors-périmètre) |
| Exemple recherche IA "Devis impayés" → "Devis non validés" | Pas de statut "impayé" dans le schéma | PRD ajusté (1 ligne) |
| Scan plaque retiré du code/repo | Décidé en début de session, hors examen | ✅ Déjà au PRD |
| **JWT Supabase ES256 (asymétrique) au lieu de HS256** | Supabase a migré vers ES256 par défaut depuis 2025 | Argument oral renforcé : "même standard que Auth0/Okta, aucun secret à protéger côté serveur" |
| **Migration `middleware.ts` → `proxy.ts`** | Next.js 16 a renommé la convention | Logs propres, doc locale `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` |

---

## 🎯 Priorités pour les prochaines sessions

1. **🌟 Moteur IA** — endpoint NestJS `RechercheIA` + intégration LLM (Mistral/Anthropic) (S2 — cœur examen)
2. **MongoDB Atlas** — cluster gratuit pour historique des recherches IA (exigence SQL+NoSQL référentiel)
3. **Génération PDF** — pdfkit ou puppeteer côté back (S2)
4. **Déploiement** — Vercel front + Railway back (S2/S3, après validation Romain)
5. **Dossier Projet** + DP — rédaction (S3)

---

## 📊 Score d'avancement subjectif

| Bloc | Avancement |
|---|---|
| Backend | 🟢🟢🟢🟢🟢🟢🟢🟢🟢⚪ **90 %** (manque génération PDF + endpoint recherche IA) |
| Frontend | 🟢🟢🟢🟢🟢🟢🟢🟢⚪⚪ **80 %** (lecture + auth + CUD + détails + navigation OK · reste UI édition/suppression + agent IA) |
| Sécurité | 🟢🟢🟢🟢🟢🟢🟢🟢🟢⚪ **95 %** ⭐ (front auth ✅ + back JWT ✅ + JWKS ES256 ✅, reste : rotater Secret Key + observabilité) |
| Documentation examen | 🟢🟢🟢⚪⚪⚪⚪⚪⚪⚪ **30 %** (PRD ok, Dossier Projet à rédiger) |
| Démo orale | ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪ **0 %** |

> **Avancement global : ~65 %** — S1 bouclée, S2 démarre. Auth bout en bout + navigation profonde = 2 gros jalons franchis.

---

## 🔐 Récap de la chaîne d'authentification (à dire au jury)

```
   [ Utilisateur sur Chrome ]
         │ 1. Login email/mdp via formulaire React
         ↓
   [ Supabase Auth (Paris eu-west-3) ]
         │ 2. Signe un JWT en ES256 (Elliptic Curve P-256)
         ↓
   [ Front Next.js 16 ]
         │ 3. Stocke en cookie httpOnly sécurisé
         │ 4. Proxy NextJS protège /dashboard/* (redirect si non connecté)
         │ 5. Lib api.ts récupère le token via getSession() et l'injecte
         │    dans le header "Authorization: Bearer <token>"
         ↓
   [ Back NestJS sur port 4001 ]
         │ 6. SupabaseJwtGuard intercepte chaque requête
         │ 7. Télécharge la clé publique via JWKS (cache automatique)
         │ 8. Vérifie signature + issuer + expiration
         │ 9. Refuse 401 si invalide / Injecte user dans request.user si OK
         ↓
   [ Service métier ]
         │ 10. Exécute la logique avec Prisma
         ↓
   [ PostgreSQL Neon ]
         │ 11. Renvoie les données
         ↓
   [ Front affiche ] ✅
```

**Défense en profondeur** : 2 couches d'auth (proxy front + guard back). Si quelqu'un contourne le front avec `curl`, le back refuse quand même.
