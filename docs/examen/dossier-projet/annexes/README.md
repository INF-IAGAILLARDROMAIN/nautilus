# Annexes — Dossier Projet Nautilus

> Volume maximum **30 pages**. Les annexes contiennent les éléments de la **fonctionnalité la plus représentative** (le moteur de recherche IA), côté front-end **et** back-end, plus les éléments transversaux du projet.

## 📋 Checklist des annexes à produire avant le 26/06/2026

### 📐 01 — MCD / Schéma de données (1-2 pages)

- [ ] **MCD propre** (4 entités liées Client → Bateau → Devis → OR + LigneDevis) — exporté depuis Mermaid ou Draw.io en PNG/PDF haute résolution
- [ ] **MLD** (schéma physique avec types PostgreSQL, FKs, indexes, contraintes) — extrait du `schema.prisma`

### 🎨 02 — Captures écran de l'application (8-12 pages)

> URL prod : **https://nautilus-silk.vercel.app** · à capturer en mode clair

| # | Écran | Desktop | Mobile | Statut |
|---|---|---|---|---|
| 1 | Login Supabase | ⬜ | ⬜ | À faire |
| 2 | Dashboard | ⬜ | ⬜ | À faire |
| 3 | Recherche IA — barre vide | ⬜ | ⬜ | À faire |
| 4 | Recherche IA — résultat `find_bateau` | ⬜ | ⬜ | À faire |
| 5 | Recherche IA — résultat `list_recent_factures` (quantite=1) | ⬜ | ⬜ | À faire |
| 6 | Recherche IA — bandeau ROUGE `securite_refus` | ⬜ | ⬜ | À faire |
| 7 | Recherche IA — bandeau ORANGE `hors_domaine` | ⬜ | ⬜ | À faire |
| 8 | Recherche IA — `help` avec liste exemples | ⬜ | ⬜ | À faire |
| 9 | Liste clients | ⬜ | ⬜ | À faire |
| 10 | Fiche client (avec bateaux + devis) | ⬜ | ⬜ | À faire |
| 11 | Liste bateaux | ⬜ | ⬜ | À faire |
| 12 | Fiche bateau (avec OR) | ⬜ | ⬜ | À faire |
| 13 | Liste devis | ⬜ | ⬜ | À faire |
| 14 | Fiche devis (lignes + bouton PDF) | ⬜ | ⬜ | À faire |
| 15 | Liste OR + filtre statut | ⬜ | ⬜ | À faire |
| 16 | Fiche OR (workflow statuts) | ⬜ | ⬜ | À faire |
| 17 | PDF généré — devis | ⬜ | — | À faire |
| 18 | PDF généré — facture | ⬜ | — | À faire |
| 19 | PDF généré — OR | ⬜ | — | À faire |

**Convention de nommage** : `screen-<page>-<desktop|mobile>.png` (ex : `screen-recherche-securite-desktop.png`)

**Astuce capture mobile** : Chrome DevTools (Cmd+Opt+I) → mode responsive → iPhone 14 Pro pour la cohérence visuelle.

### 💻 03 — Extraits de code (10-12 pages)

#### Code métier (back-end)

- [ ] `recherche-ia.service.ts` — extrait du SYSTEM_PROMPT (20 intents)
- [ ] `recherche-ia.service.ts` — extrait du dispatch `executerIntent()`
- [ ] `recherche-ia.service.ts` — helper `buildClientWhere` (gestion homonymes + split)
- [ ] `recherche-log.service.ts` — méthode `log()` MongoDB (résilience)
- [ ] `devis.service.ts` — génération `DEV-AAAA-XXXX`
- [ ] `ordre-reparation.service.ts` — workflow statut + génération facture
- [ ] `pdf.service.ts` — génération PDF (pdfkit)

#### Code accès données

- [ ] **SQL via Prisma** — requête `findOrByClient` (jointures + statut)
- [ ] **SQL via Prisma** — requête `listBateauxByMoteur` (filtres dynamiques)
- [ ] **NoSQL via Mongoose** — agrégation des stats MongoDB
- [ ] `schema.prisma` — extrait des 4 entités + LigneDevis

#### Code front-end (static + dynamic)

- [ ] `app/dashboard/layout.tsx` — Server Component avec auth redirect
- [ ] `app/dashboard/clients/page.tsx` — Server Component (liste)
- [ ] `app/dashboard/recherche/page.tsx` — Client Component (TanStack Query + Suspense)
- [ ] `app/dashboard/clients/nouveau/page.tsx` — RHF + Zod
- [ ] `lib/api.ts` — `downloadPdf()` avec JWT en header

### 🧪 04 — Jeu d'essai (preuves d'exécution, 4-5 pages)

- [ ] 20 captures écran de la recherche IA en production (les 20 scénarios du jeu d'essai documenté en section 6 du DP)
- [ ] Capture d'un log MongoDB depuis Atlas (preuve de la traçabilité)
- [ ] Output `npm test` (9/9 verts)
- [ ] Output `npm audit` (0 vulnérabilité)

### 🛡 05 — Sécurité (2-3 pages)

- [ ] Capture des headers HTTP de réponse Helmet (Chrome DevTools → Network → Response Headers)
- [ ] Capture du contenu d'un JWT décodé sur jwt.io (preuve ES256)
- [ ] Schéma de l'architecture de sécurité (auth → middleware → guard → DTO → service)

### 📊 06 — Bonus (si place restante)

- [ ] Capture du diff d'un commit majeur (par exemple `53de5d6` sur la refonte IA V2)
- [ ] Capture de l'historique Git récent (`git log --oneline`)
- [ ] Capture d'une page du PRD figé (preuve de la démarche structurée)

---

## 📐 Suggestion d'organisation

À placer dans ce dossier au fur et à mesure :

```
annexes/
├── 01-mcd/
│   ├── mcd-mermaid.png
│   └── mld-prisma-schema.pdf
├── 02-captures-ecran/
│   ├── screen-login-desktop.png
│   ├── screen-login-mobile.png
│   ├── screen-recherche-find-bateau-desktop.png
│   ├── ...
│   ├── pdf-devis.pdf
│   ├── pdf-facture.pdf
│   └── pdf-or.pdf
├── 03-code/
│   ├── back-recherche-ia-system-prompt.md
│   ├── back-recherche-ia-dispatch.md
│   ├── back-build-client-where.md
│   ├── back-recherche-log-resilient.md
│   ├── front-layout-auth-redirect.md
│   ├── front-recherche-tanstack-suspense.md
│   ├── front-formulaire-rhf-zod.md
│   └── schema-prisma-extrait.md
├── 04-jeu-essai/
│   ├── jeu-essai-screenshots-01-10.pdf
│   ├── jeu-essai-screenshots-11-20.pdf
│   ├── mongodb-log-sample.png
│   ├── npm-test-output.txt
│   └── npm-audit-output.txt
├── 05-securite/
│   ├── helmet-headers.png
│   ├── jwt-decoded-es256.png
│   └── archi-securite.png
└── 06-bonus/
    ├── commit-diff-refonte-ia.png
    ├── git-log-recent.txt
    └── prd-page-figee.png
```

---

## 💡 Astuces de production

- **Numéroter et commenter** chaque extrait de code (langage + chemin du fichier source + objectif). Facilite la lecture du jury et démontre la rigueur.
- **Captures écran propres** : retirer les barres d'outils navigateur (mode plein écran F11 → Cmd+Maj+4 pour sélection).
- **Captures mobile** : utiliser Chrome DevTools en mode responsive (iPhone 14 Pro 393×852) pour cohérence.
- **PDF haute résolution** : exporter en 300 DPI minimum.
- **Limite stricte 30 pages** : prioriser. Si dépassement, retirer le bonus avant les essentiels.
