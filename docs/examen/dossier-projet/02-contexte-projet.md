# 2. Contexte du projet

## 2.1 Présentation de l'entreprise et du service

> **À RÉDIGER** — quelques paragraphes sur RANKIA et le positionnement de Nautilus.

**Éléments à inclure :**
- RANKIA SASU (immatriculée le 21/04/2026, SIREN 104 046 610), société française dans l'édition de logiciels métiers.
- Vision produit : outils SaaS sectoriels qui font gagner du temps aux équipes via l'ergonomie + l'IA (l'IA restitue les informations de la base de données, l'humain décide).
- Nautilus = premier produit de RANKIA, ciblant les **ateliers nautiques** (maintenance et réparation de moteurs hors-bord). Marché choisi en raison du parcours professionnel du fondateur (ex-mécanicien nautique).

## 2.2 Cahier des charges / expression des besoins

> **À RÉDIGER** — décrire le problème métier que Nautilus résout.

**Problème observé chez les ateliers nautiques :**
- Multiples sources d'information dispersées (Excel, papier, mémoire du chef d'atelier).
- Difficulté à retrouver rapidement l'historique d'un bateau ou d'un client.
- Devis à établir en urgence, sans outillage adapté.

**Besoin exprimé :**
- Centraliser clients, bateaux, ordres de réparation et devis.
- Pouvoir retrouver une information **en langage naturel** (sans formation à un outil complexe).
- Imprimer un devis ou un ordre de réparation au format PDF.

## 2.3 Contraintes du projet et livrables attendus

**Contraintes :**
- Délai de réalisation court (5 semaines de développement intensif, juin 2026).
- Développement individuel.
- Budget : auto-financement RANKIA.
- Stack imposée par le choix produit RANKIA : Next.js + NestJS + PostgreSQL + MongoDB + Supabase.
- Hébergement cloud (Vercel + Railway + Neon + MongoDB Atlas).

**Livrables attendus :**
- Application web responsive (desktop + mobile) déployée en production.
- Code source versionné sur GitHub.
- Documentation technique (ce dossier projet) et utilisateur.

## 2.4 Environnement humain et technique, objectifs de qualité

**Environnement humain :**
- Romain Gaillard, développeur fondateur de RANKIA.
- Accompagnement et revue technique par Fabien Leyrissoux (Lead dev / fondateur INF-IA).

**Environnement technique :**

| Couche | Technologies |
|---|---|
| Front-end | Next.js 16, React 19, TypeScript, Tailwind CSS v4, React Hook Form + Zod, TanStack Query, Framer Motion |
| Back-end | NestJS 11, TypeScript, Prisma 7 (ORM) |
| BDD relationnelle | PostgreSQL hébergé sur Neon |
| BDD NoSQL | MongoDB hébergé sur MongoDB Atlas (historique des recherches IA) |
| Authentification | Supabase Auth (JWT) |
| Déploiement front | Vercel |
| Déploiement back | Railway |
| Versioning | Git + GitHub (repo public : `INF-IAGAILLARDROMAIN/nautilus`) |
| Outils IDE | VSCode + Claude Code |

**Objectifs de qualité :**
- Code propre, typé strict (TypeScript), formaté Prettier + ESLint.
- Architecture NestJS stricte : Module → Controller → Service → DTO.
- Sécurité by design : auth obligatoire, validation systématique des entrées, isolation des données.
- Couverture du référentiel TP DWWM intégrale.
