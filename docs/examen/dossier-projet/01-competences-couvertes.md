# 1. Compétences du référentiel couvertes par le projet

> Cette section liste **explicitement** chaque compétence du référentiel TP DWWM (RNCP 37674) et indique **comment Nautilus la couvre**, avec un renvoi vers la section du dossier où la preuve concrète est apportée. C'est la première chose que le jury cherche — il faut que ce soit limpide.

## Activité-type 1 — Développer la partie front-end d'une application web ou web mobile sécurisée (BC01)

| Compétence | Couverture dans Nautilus | Preuves |
|---|---|---|
| **Maquetter des interfaces utilisateur web ou web mobile** | Démarche itérative avec **charte graphique** définie en amont (couleurs, typographie, contrastes AAA pour usage atelier bicontexte soleil/sombre) + **design system shadcn/ui + Tailwind v4** comme socle technique. Pas de maquettage Figma formel séparé : choix assumé pour une V1 individuelle à court délai (justifié dans le DP). | Section 3.1 + [`docs/charte-graphique/`](../../charte-graphique/) |
| **Réaliser des interfaces utilisateur web ou web mobile statiques** | **15 pages Next.js** réparties entre Server Components (pages liste, pages détail) et Client Components (formulaires, recherche IA). Pages servies depuis Vercel CDN edge. | Section 3.2 + 3.4 + captures en annexes |
| **Développer la partie dynamique des interfaces utilisateur web ou web mobile** | Formulaires **React Hook Form + Zod** (validation typée), **barre de recherche IA en live** via TanStack Query, navigation dynamique avec cache et invalidation, **bouton « Imprimer en PDF »** qui déclenche un téléchargement avec JWT en header | Section 3.5 (extraits de code) |

> **Sécurité front-end intégrée** : vérification auth côté Server Component avant rendu HTML, cookies httpOnly (anti-XSS), validation côté client systématique, pas de `dangerouslySetInnerHTML`, pas de token en `localStorage`. Détails complets en section 5.

## Activité-type 2 — Développer la partie back-end d'une application web ou web mobile sécurisée (BC02)

| Compétence | Couverture dans Nautilus | Preuves |
|---|---|---|
| **Mettre en place une base de données relationnelle** | **PostgreSQL** hébergé sur **Neon** (région Frankfurt), schéma **Prisma 6** avec **4 entités métier liées** (Client → Bateau → Devis → OR) + 1 entité technique (LigneDevis pour les lignes de devis). **Migrations versionnées** dans `backend/prisma/migrations/`, appliquées en prod via `prisma migrate deploy`. La Facture n'est pas une entité séparée — c'est un PDF généré à la volée à partir de l'OR au statut FACTURE (avec numéro de facture séquentiel `FAC-AAAA-XXXX`). | Section 4.1 + `backend/prisma/schema.prisma` |
| **Développer des composants d'accès aux données SQL et NoSQL** | **SQL — PostgreSQL via Prisma** pour les 4 entités métier (CRUD, relations, agrégations). **NoSQL — MongoDB Atlas via Mongoose** (région Paris) pour l'historique des recherches IA, avec agrégations natives utilisées pour les statistiques. Justification du multi-BDD : structuré + ACID côté métier, semi-structuré + audit côté logs IA. | Section 4.3 |
| **Développer des composants métier côté serveur** | **API NestJS** structurée Module → Controller → Service → DTO. **9 modules** : `auth`, `prisma`, `clients`, `bateaux`, `devis`, `ordre-reparation`, `pdf`, `recherche-ia`, `recherche-log`. Le module phare est `recherche-ia` qui implémente le **pattern « Intent + Entities »** avec **20 intents pré-codés** + 4 catégories de refus sécurité. Génération PDF côté serveur via `pdfkit`. | Section 4.2 + `backend/src/` |
| **Documenter le déploiement d'une application dynamique web ou web mobile** | Section dédiée du DP : architecture détaillée (front Vercel + back Railway europe-west4 + Neon Frankfurt + MongoDB Atlas Paris + Supabase Paris + Mistral France — 100 % UE pour RGPD), liste exhaustive des variables d'environnement, commandes de migration, commandes de smoke test post-déploiement, URLs de production. | Section 4.5 |

> **Sécurité back-end intégrée** : Guard JWT ES256 asymétrique via JWKS (lib `jose`), DTOs + class-validator avec `whitelist`/`forbidNonWhitelisted`, ThrottlerModule global, Helmet, CORS strict multi-origines (splittage RFC-conforme), pattern Intent+Entities qui empêche toute injection SQL via le prompt LLM. Détails complets en section 5.

---

## Compétences transversales (toutes deux activités-types)

| Compétence | Couverture dans Nautilus | Preuves |
|---|---|---|
| **Sécurité applicative (OWASP Top 10)** | Couverture explicite des 10 risques de l'OWASP Top 10 (cf. tableau section 5.3) + couverture de l'**OWASP LLM Top 10** (10 risques spécifiques aux applications IA, cf. section 5.4.4). | Section 5 |
| **Jeu d'essai sur fonctionnalité signature** | **20 scénarios** exécutés en production sur le moteur de recherche IA (10 métier + 4 UX + 3 sécurité + 3 homonymes). Taux de réussite **100 %** après 3 corrections en boucle. Bugs identifiés et corrigés tracés par commits Git nommés. | Section 6 |
| **Veille sur les vulnérabilités de sécurité** | Méthode de veille documentée (OWASP, CERT-FR, Dependabot, OWASP LLM Top 10). **9 vulnérabilités / risques identifiés** et corrigés (prompt injection, fuite credentials, CORS RFC, DDoS interne, anti-scraping, etc.). **Campagne de mise à jour proactive** des dépendances le 15/06/2026 : 19 paquets mis à jour, 0 régression. | Section 7 |
| **Tests** | **9 tests Jest** sur les services critiques (clients, devis, PDF, log MongoDB). Tests intégrés à la pipeline CI implicite (Git → Vercel/Railway). | `backend/src/**/*.spec.ts` |
| **Versioning** | Git + GitHub avec **conventions de commit strictes** (`feat`, `fix`, `docs`, `chore` + scope) + historique propre permettant de retracer chaque décision. Repo : `INF-IAGAILLARDROMAIN/nautilus`. | `git log` |
| **Documentation projet** | PRD figé (Option B 01/06/2026), README racine + README technique back, Dossier Projet de 7 sections, charte graphique, architecture diagrammée, journal des décisions. | `/docs/` + READMEs |

---

## Synthèse — preuve par les chiffres

```
📊 NAUTILUS — UN PROJET ROBUSTE ET MESURÉ

✅ 4 entités métier liées (Client → Bateau → Devis → OR)
✅ 9 modules NestJS structurés (Module → Controller → Service → DTO)
✅ 15 pages Next.js (Server + Client Components)
✅ 20 intents IA (16 métier + 3 UX + 1 sécurité)
✅ 9 tests Jest verts
✅ 20 scénarios jeu d'essai validés (100 %)
✅ 9 vulnérabilités identifiées + corrigées
✅ 0 vulnérabilité npm résiduelle (audit clean)
✅ 100 % infrastructure UE (conformité RGPD)
✅ ~600 ms temps de réponse moyen IA
✅ HTTP 200 sur front + back en production
```

## ✍️ Annexes pour chaque compétence

Les preuves concrètes (extraits de code commentés, captures écran, schémas MCD, captures du jeu d'essai en prod) sont rassemblées dans le dossier [`annexes/`](annexes/) (limite 30 pages).
