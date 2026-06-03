# 1. Compétences du référentiel couvertes par le projet

> Cette section liste **explicitement** chaque compétence du référentiel TP DWWM (RNCP 37674) et indique **comment Nautilus la couvre**. C'est la première chose que le jury cherche — il faut que ce soit limpide.

## Activité-type 1 — Développer la partie front-end d'une application web ou web mobile sécurisée (BC01)

| Compétence | Couverture dans Nautilus |
|---|---|
| **Maquetter des interfaces utilisateur web ou web mobile** | Maquettes Figma des écrans clés (login, dashboard, liste clients, fiche bateau, OR, devis, recherche IA) en versions desktop + mobile |
| **Réaliser des interfaces utilisateur statiques web ou web mobile** | Pages Next.js (pages liste, fiches détail) avec Tailwind CSS, responsive desktop + mobile |
| **Développer la partie dynamique des interfaces utilisateur web ou web mobile** | Formulaires de création/modification (Zod + React Hook Form), barre de recherche IA en live, navigation dynamique, gestion d'état avec TanStack Query |

## Activité-type 2 — Développer la partie back-end d'une application web ou web mobile sécurisée (BC02)

| Compétence | Couverture dans Nautilus |
|---|---|
| **Mettre en place une base de données relationnelle** | PostgreSQL hébergé sur Neon, schéma Prisma avec **4 entités liées** (Client → Bateau → Devis → OR), migrations versionnées. Facture = PDF généré à la volée à partir de l'OR terminé |
| **Développer des composants d'accès aux données SQL et NoSQL** | **SQL** : requêtes Prisma sur PostgreSQL pour le CRUD métier. **NoSQL** : MongoDB pour l'historique des recherches IA (requête + réponse + timestamp + utilisateur) |
| **Développer des composants métier côté serveur** | API NestJS structurée Module → Controller → Service → DTO : modules Clients, Bateaux, OR, Devis, **Recherche IA**, **Génération PDF** |
| **Documenter le déploiement d'une application dynamique web ou web mobile** | Section dédiée : variables d'environnement, déploiement front Vercel, back Railway, BDD Neon + MongoDB Atlas, commandes de migration Prisma |

---

## ✍️ À compléter au fil de la production

- [ ] Vérifier au fur et à mesure que chaque compétence est bien démontrée dans le code livré
- [ ] Ajouter en annexe les preuves concrètes (extraits de code) pour chaque compétence
