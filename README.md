# Nautilus

> **Application web de gestion d'atelier nautique**, dotée d'un moteur de recherche en langage naturel propulsé par un agent IA.
>
> Projet de fin de formation — **TP Développeur Web et Web Mobile (RNCP 37674)**, Studi, session juin-juillet 2026. Auteur : Romain Gaillard.

---

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
3. **Génération PDF** côté serveur (devis / facture, imprimables et téléchargeables)

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
- **Prisma 6** + **PostgreSQL** (hébergé sur **Neon**)
- **MongoDB Atlas** pour l'historique des recherches IA *(justifie l'usage NoSQL au côté du relationnel)*
- **Helmet**, **CORS strict**, **Throttler** (rate limiting), validation DTO globale
- Architecture stricte **Module → Controller → Service → DTO**

### Hébergement (cible)
- Front : **Vercel** · Back : **Railway** · BDD : **Neon** + **MongoDB Atlas**

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
