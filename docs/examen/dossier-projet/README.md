# Dossier Projet — Nautilus

> Document écrit qui rend compte du projet de fin de formation pour le **TP Développeur Web et Web Mobile** (RNCP 37674), session **Juin-Juillet 2026**.
> Candidat : **Romain Gaillard** — apprenant Studi n° 512363.
> Examen : **lundi 29 juin 2026, Villepinte (93)**.

## 📚 Sommaire (à remplir avec les pages finales)

1. [Compétences couvertes par le projet](01-competences-couvertes.md)
2. [Contexte du projet](02-contexte-projet.md)
3. [Réalisations front-end](03-realisations-frontend.md)
4. [Réalisations back-end](04-realisations-backend.md)
5. [Éléments de sécurité](05-securite-application.md)
6. [Jeu d'essai](06-jeu-essai.md)
7. [Veille sur les vulnérabilités de sécurité](07-veille-securite.md)
8. [Annexes](annexes/) (max 30 pages)

## 🎯 Objectifs et règles formelles

- **Volume cible** : 30 à 50 pages (corps, hors page de garde / sommaire / annexes), schémas et illustrations compris.
- **Annexes** : 30 pages maximum.
- **Plan retenu** : **Plan A — Projet réalisé en entreprise** (plus riche, recommandé pour viser 16/20).
- **Compatibilité** : document final compatible avec le contrôle anti-plagiat, format .pdf ou .docx, ≤ 20 Mo.

## 🚀 Le produit en une phrase

> **Nautilus est une application web de gestion d'atelier nautique, dotée d'un moteur de recherche en langage naturel propulsé par un agent IA, qui permet à un chef d'atelier d'enregistrer ses clients et leurs bateaux, de chiffrer des devis, de suivre les ordres de réparation jusqu'à la facturation, et de retrouver toute l'information en interrogeant la base de données en français.**

## 📦 Périmètre figé (Option B — 01/06/2026)

- **4 entités liées** : Client → Bateau → Devis → OR (Facture = PDF généré à partir de l'OR terminé)
- **1 rôle utilisateur connecté** : chef d'atelier (responsive desktop + mobile)
- **Fonctionnalité signature** : moteur de recherche IA (base du jeu d'essai)
- **Composants métier** : CRUD + recherche IA + génération PDF côté serveur
- **Stack** : Next.js · NestJS · PostgreSQL (Prisma) · MongoDB (historique IA) · Supabase auth · Vercel · Railway

> L'envoi par email automatique est **hors périmètre** (en bonus si temps en semaine 4).
> Le scan de plaque moteur est **hors périmètre** examen (réservé à la version commerciale RANKIA).

## ⏱️ Plan de production (4 semaines avant le 29/06)

| Semaine | Mission |
|---|---|
| **S1** | Finaliser Nautilus (cœur + sécurité + déploiement) |
| **S2** | V1 du Dossier Projet + 1er dépôt entraînement |
| **S3** | Dossier Professionnel + intégrer retours formateur |
| **S4** | Diaporama + impression/reliure + répétitions orales |
