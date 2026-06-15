# Nautilus

> **Application web de gestion d'atelier nautique**, dotée d'un moteur de recherche en langage naturel propulsé par **Mistral AI**.
>
> Projet de fin de formation — **TP Développeur Web et Web Mobile (RNCP 37674)**, Studi, session juin-juillet 2026. Auteur : Romain Gaillard.

[![Front](https://img.shields.io/badge/Front-Vercel-black)](https://nautilus-silk.vercel.app)
[![Back](https://img.shields.io/badge/Back-Railway-purple)](https://nautilus-production-970f.up.railway.app/api)
[![IA](https://img.shields.io/badge/IA-Mistral_AI-orange)](https://mistral.ai)
[![Tests](https://img.shields.io/badge/Tests-9%2F9_passing-green)]()

---

## 🌐 Application en production

- **Front (Next.js)** : https://nautilus-silk.vercel.app
- **Back API (NestJS)** : https://nautilus-production-970f.up.railway.app/api
- **Infrastructure 100 % UE** : Vercel (CDN edge) · Railway (europe-west4) · Neon (Frankfurt) · MongoDB Atlas (Paris) · Supabase (Paris) · Mistral AI (France)

## 🎯 Le produit en une phrase

Nautilus permet à un chef d'atelier nautique d'enregistrer ses clients et leurs bateaux, de **chiffrer des devis**, de **suivre les ordres de réparation** jusqu'à la **facturation**, et de retrouver toute son information en interrogeant la base de données **en français** via un agent IA.

## ⚙️ Fonctionnalités du périmètre examen

### 4 entités liées
```
Client  →  Bateau  →  Devis  →  OR (Ordre de Réparation)
                                  │
                                  └─→ [PDF Facture généré quand statut = "facturé"]
```

### 3 briques fonctionnelles
1. **CRUD complet** sur les 4 entités (créer, lire, modifier, supprimer)
2. **🌟 Moteur de recherche IA** en langage naturel — la fonctionnalité signature
   - **20 intents** pré-codés (métier + UX + sécurité)
   - Pattern « Intent + Entities » : le LLM ne génère JAMAIS de SQL → 0 injection possible
   - **Refus catégorisés** : credentials, RGPD, confidentiel, manipulation
   - Toutes les recherches loguées en MongoDB (audit + stats)
   - Temps de réponse moyen ~600 ms
3. **Génération PDF** côté serveur (devis / OR / facture, imprimables et téléchargeables)

### Flux métier
1. Le chef crée un **Devis** sur un bateau (statut `brouillon → envoyé`)
2. Le client accepte → statut `validé` → **un OR est créé automatiquement**
3. Le mécano réalise le travail (statut OR `créé → en cours → terminé`)
4. Le chef facture → statut `facturé` → **le PDF Facture est généré**

## 🛠️ Stack technique

### Front-end (`/`)
- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** + **shadcn/ui** + **Lucide React**
- **React Hook Form** + **Zod** (validation)
- **TanStack Query** (cache des appels API)
- **Supabase Auth** côté client

### Back-end (`/backend`)
- **NestJS 11** + **TypeScript**
- **Prisma 6** + **PostgreSQL** (hébergé sur **Neon**, région Frankfurt)
- **Mongoose** + **MongoDB Atlas** (Paris) pour l'historique des recherches IA *(justifie l'usage NoSQL au côté du relationnel)*
- **Mistral AI** (`mistral-small-latest`, hébergé en France) pour la classification d'intent
- **Helmet**, **CORS strict multi-origines**, **Throttler** (rate limiting), validation DTO globale
- **Guard JWT Supabase ES256** via JWKS (lib `jose`)
- **PDFKit** pour la génération PDF côté serveur
- Architecture stricte **Module → Controller → Service → DTO**
- **9 tests Jest verts** sur les services critiques (clients, devis, PDF, log)

### Hébergement (en production)
- Front : **Vercel** · Back : **Railway** (europe-west4) · BDD : **Neon** + **MongoDB Atlas** · Auth : **Supabase** · IA : **Mistral AI**
- **100 % UE** pour conformité RGPD

## 🚀 Démarrage local

### Pré-requis
- Node.js ≥ 20
- npm ≥ 10
- Un compte gratuit **Neon** (BDD PostgreSQL) — https://neon.tech

### Front-end
```bash
git clone https://github.com/INF-IAGAILLARDROMAIN/nautilus.git
cd nautilus
npm install
npm run dev
```
→ http://localhost:3000

### Back-end
```bash
cd backend
npm install
cp .env.example .env   # puis ajouter ton DATABASE_URL Neon
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```
→ http://localhost:4000/api

## 📚 Documentation projet

| Document | Contenu |
|---|---|
| [docs/examen/PRD-NAUTILUS-EXAMEN-V1.md](docs/examen/PRD-NAUTILUS-EXAMEN-V1.md) | PRD figé du périmètre examen |
| [docs/examen/PRD-LIVRABLES-EXAMEN.md](docs/examen/PRD-LIVRABLES-EXAMEN.md) | Modalités d'examen Studi (livrables, dépôts, jour J) |
| [docs/examen/dossier-projet/](docs/examen/dossier-projet/) | Squelette du Dossier Projet (livrable jury) |
| [docs/architecture/](docs/architecture/) | Parcours utilisateur et architecture |
| [docs/charte-graphique/](docs/charte-graphique/) | Charte graphique |
| [backend/README.md](backend/README.md) | Guide spécifique back NestJS |

## 🎨 Contraintes UX

Nautilus s'utilise dans deux contextes :
- ☀️ **Plein soleil sur un bateau** (luminosité écrasante)
- 🌑 **Atelier sombre** (faible luminosité)

→ **Lisibilité avant l'esthétique** : contrastes AAA, texte ≥ 18 px sur mobile, boutons ≥ 56 px (mains gantées / sales / sel), modes clair + sombre.

## 📝 Auteur

**Romain Gaillard** — Ancien mécanicien nautique en reconversion développeur. Le projet Nautilus est nourri par cette double expertise terrain + tech.
