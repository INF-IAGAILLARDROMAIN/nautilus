# Nautilus

**SaaS de gestion d'atelier nautique** — Web app responsive pour mécaniciens, chefs d'atelier et réception d'un chantier naval.

> Projet réalisé dans le cadre du **TP Développeur Web et Web Mobile (RNCP 37674)** — Studi · Session juin/juillet 2026

---

## 🎯 Le projet

Nautilus permet à un atelier nautique (de 3 à 15 personnes) de piloter son activité :

- 📥 Réception des **demandes clients** (pannes, devis, hivernage)
- 🛠️ Gestion des **ordres de réparation (OR)** avec workflow (Reçu → Accepté → Préparation → Réparation → Livré → Facturé)
- 📝 Génération de **devis PDF** et envoi par email avec validation client par lien unique
- 💰 Suivi des **factures** (émission, encaissement, retards)
- 👥 **Dispatch intelligent** : le chef d'atelier attribue les urgences au mécano suggéré (dernier intervenant sur le bateau, avec fallback automatique si en congé)
- 🚤 **Fiche bateau enrichie** : historique des interventions, sécurité réglementaire, garantie constructeur, préconisations de maintenance préventive
- 📷 **Feature CORE** : scan plaque moteur → OCR → résumé instantané du bateau (historique, opérations dues, pièces à prévoir)
- 📊 **Dashboard chef d'atelier** : KPIs, alertes urgentes triées FIFO, équipe avec charge, OR en cours

### Spécificités métier nautique

- **Cycle saisonnier** : Hivernage (oct-nov) + Déshivernage (mar-avr) avec checklists standardisées
- **Sécurité réglementaire** : inventaire des équipements (feux à main, fusées, gilets, extincteur) avec dates de péremption + décharges de responsabilité PDF si le client refuse un remplacement préconisé
- **Garantie constructeur** : workflow B2B (Suzuki, Yamaha, Mercury, Mercruiser, Volvo Penta, Honda, Tohatsu)
- **Dépannage urgent** : workflow rapide sans devis bloquant, briefing mécano avant intervention via fiche résumé

---

## 🛠️ Stack technique

### Front-end
- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** + **shadcn/ui** + **Lucide React**
- **next-themes** (clair / sombre)
- Police **Inter** via `next/font`

### Back-end *(à venir)*
- **NestJS 11** + **Prisma 7** + **PostgreSQL (Neon)**
- **MongoDB Atlas** pour les statistiques agrégées
- **JWT** (bcrypt + passport)
- **Nodemailer** pour les emails transactionnels

### Architecture cible
```
nautilus/
├── apps/
│   ├── vitrine/     # Astro — site marketing
│   ├── web/         # Next.js — app métier (le code actuel)
│   └── api/         # NestJS — back-end REST
├── database/
└── docs/
```

> ⚠️ État actuel : le repo contient l'app **Next.js** (`apps/web` future). Le scaffolding `apps/api` est prévu pour la semaine suivante.

---

## 🎨 Contraintes UX

Nautilus s'utilise dans deux contextes extrêmes :
- ☀️ **Plein soleil sur un bateau** (luminosité écrasante)
- 🌑 **Atelier sombre** (faible luminosité)

→ La charte est construite autour d'une règle non négociable : la **lisibilité avant l'esthétique**.

- Contrastes **AAA (ratio 21:1)** sur le texte principal
- **Mode clair = haute visibilité** par défaut (noir pur sur blanc pur)
- **Mode sombre** pour l'atelier
- **Texte ≥ 18 px** sur mobile (lecture rapide)
- **Boutons ≥ 56 px** (mains gantées / sales / sel)
- **Touch targets ≥ 44 px** (norme Apple/Material)

---

## 🚀 Installation locale

### Pré-requis
- Node.js ≥ 20
- npm ≥ 10

### Démarrage

```bash
# Cloner le repo
git clone https://github.com/INF-IAGAILLARDROMAIN/nautilus.git
cd nautilus

# Installer les dépendances
npm install

# Démarrer le serveur de dev
npm run dev
```

L'app est accessible sur **http://localhost:3000**.

### Pages disponibles
- `/` — Connexion (fake login, valide n'importe quel email/mdp)
- `/dashboard` — Dashboard chef d'atelier
- `/dashboard/urgences` — Liste des urgences à dispatcher (5 premières, tri FIFO)
- `/dashboard/or` — Ordres de réparation
- `/dashboard/devis` — Devis
- `/dashboard/factures` — Factures

---

## 📋 Comptes de test *(à venir avec le back-end)*

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | admin@nautilus-demo.fr | *(à définir)* |
| Manager (chef d'atelier) | manager@nautilus-demo.fr | *(à définir)* |
| Technicien (mécano) | tech@nautilus-demo.fr | *(à définir)* |

---

## 📅 Roadmap

- ✅ **S0** (23-25 mai) — Cadrage + scaffolding Next.js + charte graphique + dashboard chef d'atelier
- 🟡 **S1** (26-31 mai) — API NestJS + Prisma + auth JWT + modules Client + Bateau
- 🔲 **S2** (1-7 juin) — Modules OR/Devis/Stock + intégration API côté front
- 🔲 **S3** (8-14 juin) — Tous les écrans front (CRUD complets)
- 🔲 **S4** (15-21 juin) — Feature CORE scan plaque moteur + stats MongoDB + vitrine Astro
- 🔲 **S5** (22-28 juin) — Dossier de Projet + DP + diaporama + répétitions + impression
- 🎯 **29 juin** — Examen à Villepinte

---

## 📝 Auteur

**Romain Gaillard** — Formation TP Développeur Web et Web Mobile (Studi, 2026)

Ancien mécanicien nautique en reconversion développeur. Le projet Nautilus est nourri par cette double expertise terrain + tech.
