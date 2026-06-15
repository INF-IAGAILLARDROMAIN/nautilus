# 2. Contexte du projet

## 2.1 Présentation de l'entreprise et du service

### RANKIA, jeune éditeur de logiciels métiers

**RANKIA** est une SASU française que j'ai créée et immatriculée au registre du commerce le **21 avril 2026** (SIREN 104 046 610). Son objet social principal est l'**édition de logiciels métiers** à destination des PME et des artisans.

Je suis le **Président** et l'unique actionnaire de la société. En parallèle, RANKIA collabore avec **INF-IA**, société fondée par Fabien Leyrissoux, dont je bénéficie de l'expérience technique en tant que mentor sur les choix d'architecture (voir section 2.4).

**Caractéristiques de la société :**

| Élément | Valeur |
|---|---|
| Forme juridique | SASU (Société par Actions Simplifiée Unipersonnelle) |
| Date d'immatriculation | 21 avril 2026 |
| SIREN | 104 046 610 |
| Activité principale | Édition de logiciels (NAF 5829C) |
| Effectif | 1 (Président) |

### La vision produit RANKIA

RANKIA développe des **SaaS sectoriels** qui partagent un même fil conducteur : **faire gagner du temps aux équipes terrain** grâce à la combinaison ergonomie + intelligence artificielle.

Le positionnement assumé : **l'IA restitue l'information de la base de données, mais c'est toujours l'humain qui décide**. Aucun diagnostic ni recommandation automatisée ne se substitue à l'expert métier. Cette ligne directrice est centrale dans les choix UX et techniques de Nautilus (cf. section 5 sur la sécurité et la traçabilité des décisions).

### Nautilus, premier produit de RANKIA

**Nautilus** est le premier produit propre de RANKIA, ciblant un marché précis : les **ateliers de maintenance et de réparation de bateaux à moteur hors-bord**.

Le choix de ce marché n'est pas un hasard. Avant ma reconversion dans le développement, j'ai exercé pendant plusieurs années comme **mécanicien nautique spécialisé en moteurs hors-bord**. Je connais donc :

- Le **cycle métier complet** : devis → ordre de réparation → suivi → facturation → hivernage / déshivernage saisonnier.
- Les **terminologies** précises (plaque moteur, coque stratifiée, embase, immatriculation Affaires Maritimes, etc.).
- Les **frictions quotidiennes** des chefs d'atelier : devis bâclés au stylo, Excel partagé sur clé USB, recherche fastidieuse d'un OR vieux de trois mois pour facturer un complément.

Cette double casquette (ancien praticien + développeur fondateur) me permet de **concevoir un produit aligné sur le terrain**, et constitue une barrière à l'entrée pour des concurrents qui ne disposeraient que de la compétence technique sans le savoir métier.

---

## 2.2 Cahier des charges / expression des besoins

### Le contexte métier observé

Les ateliers nautiques que j'ai pu fréquenter (en tant que mécanicien puis en phase de pré-étude RANKIA) présentent quasiment tous les mêmes symptômes :

- **L'information est dispersée** entre un Excel partagé, un classeur papier, le carnet personnel du chef d'atelier, et parfois la mémoire orale de l'équipe.
- **L'historique d'un bateau est difficile à reconstituer**, surtout quand le client revient au bout de plusieurs mois ou après une vente d'occasion.
- Les **devis sont établis en urgence**, souvent au comptoir, avec des outils non adaptés (Word, calculatrice, copier-coller du devis précédent).
- La **facturation** repose en grande partie sur la mémoire de l'OR et la rigueur du chef d'atelier — toute erreur ou oubli se paye en chiffre d'affaires perdu.

### Le problème métier à résoudre

À partir de ces observations, j'ai formalisé le problème central que Nautilus doit résoudre :

> **Un chef d'atelier nautique perd du temps chaque jour à retrouver une information qui devrait être à portée d'une seule question.**

Les conséquences concrètes :

- Devis en retard → clients qui partent ailleurs.
- Oubli de facturation → marge perdue.
- Mécaniciens qui ré-interrogent le chef plusieurs fois par jour → friction d'équipe et perte de focus.
- Informations clients incomplètes → relation commerciale dégradée.

### Les besoins exprimés

J'ai traduit ces frictions en **besoins fonctionnels** clairs :

1. **Centraliser** clients, bateaux, devis, ordres de réparation et factures dans une seule base de données.
2. **Retrouver une information en langage naturel** (« les OR urgents », « la dernière facture », « le bateau de Martin »), sans formation préalable à un outil complexe.
3. **Générer des PDF normalisés** (devis, ordre de réparation, facture) imprimables au comptoir.
4. **Sécuriser l'accès** : un utilisateur authentifié (chef d'atelier ou mécanicien) ; aucun accès anonyme.
5. **Tracer les recherches IA** : pour permettre un audit ultérieur (qui a cherché quoi, et quand).

### Les utilisateurs cibles

Pour la V1 examen, j'ai limité le périmètre à **un seul rôle utilisateur** : le **chef d'atelier**. Ce choix est délibéré et documenté dans le PRD :

- Il porte la responsabilité du planning, du commercial et du suivi.
- Il a le besoin le plus dense en termes de fonctionnalités.
- Démontrer la chaîne complète (CRUD + IA + PDF) sur un seul rôle suffit largement pour le référentiel TP DWWM.

Le rôle **mécanicien** (consultation en mobilité) et le rôle **administrateur** (multi-ateliers) sont conscientement reportés en V2 commerciale RANKIA.

### Périmètre figé pour l'examen

| Élément | Statut |
|---|---|
| 4 entités liées : Client → Bateau → Devis → OR | ✅ Inclus |
| Authentification (Supabase JWT) | ✅ Inclus |
| Moteur de recherche IA (Mistral) en langage naturel | ✅ Inclus (fonctionnalité signature) |
| Génération PDF (devis / OR / facture) | ✅ Inclus |
| Log MongoDB des recherches IA | ✅ Inclus |
| Responsive desktop + mobile | ✅ Inclus |
| Scan de plaque moteur (OCR) | ❌ Reporté V2 RANKIA |
| Envoi automatique du devis par email | ❌ Reporté V2 RANKIA |
| Multi-rôles (mécanicien, admin) | ❌ Reporté V2 RANKIA |
| Multi-ateliers (multi-tenant) | ❌ Reporté V2 RANKIA |

Ce périmètre a été figé le **1ᵉʳ juin 2026** et n'a pas bougé depuis, à l'exception d'un ajustement mineur (refonte du module IA en V2 le 12/06 — voir section 4).

---

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
- Romain Gaillard, développeur fondateur de RANKIA (concepteur et seul réalisateur du produit).
- Accompagnement et revue technique par Fabien Leyrissoux (Lead dev / fondateur INF-IA), dans le cadre de la collaboration RANKIA ↔ INF-IA. Fabien apporte son expérience sur les choix d'architecture et les revues de code, sans rapport hiérarchique : Nautilus est un projet 100 % personnel porté par RANKIA.

**Environnement technique :**

| Couche | Technologies |
|---|---|
| Front-end | Next.js 16, React 19, TypeScript, Tailwind CSS v4, React Hook Form + Zod, TanStack Query, Framer Motion |
| Back-end | NestJS 11, TypeScript, Prisma 7 (ORM) |
| BDD relationnelle | PostgreSQL hébergé sur Neon (région Frankfurt) |
| BDD NoSQL | MongoDB hébergé sur MongoDB Atlas (région Paris — historique des recherches IA) |
| Authentification | Supabase Auth (JWT ES256 asymétrique via JWKS) |
| Moteur IA | Mistral AI (`mistral-small-latest`) — souveraineté française, hébergement européen |
| Génération PDF | pdf-lib + templates côté serveur NestJS |
| Déploiement front | Vercel |
| Déploiement back | Railway (région europe-west4) |
| Versioning | Git + GitHub (repo public : `INF-IAGAILLARDROMAIN/nautilus`) |
| Outils IDE | VSCode + Claude Code (assistant IA de pair-programming) |

**Objectifs de qualité :**
- Code propre, typé strict (TypeScript), formaté Prettier + ESLint.
- Architecture NestJS stricte : Module → Controller → Service → DTO.
- Sécurité by design : authentification obligatoire, validation systématique des entrées (DTO + class-validator), isolation des données, prompt système renforcé pour l'IA (refus catégorisés : credentials, RGPD, confidentiel, manipulation).
- Tests Jest sur les services critiques (clients, devis, PDF).
- Couverture du référentiel TP DWWM intégrale (cf. section 1).
