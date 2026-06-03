# PRD Nautilus — Version Examen (V1)

> **Document de référence figé** décrivant **exactement** ce qui sera codé, déposé et présenté au jury Studi le 29 juin 2026. Cette version est délibérément minimaliste pour maximiser la maîtrise (objectif : 16/20).
>
> Ce PRD complète **mais ne remplace PAS** [PRD-NAUTILUS.md](../prd/PRD-NAUTILUS.md), qui décrit la vision produit complète RANKIA (post-examen, version commerciale).

---

## 🎯 Pitch en une phrase (descriptif)

> **Nautilus est une application web de gestion d'atelier nautique qui permet à un chef d'atelier d'enregistrer ses clients et leurs bateaux, de chiffrer des devis, de suivre les ordres de réparation jusqu'à la facturation, et de retrouver toute son information en interrogeant la base de données en langage naturel via un moteur de recherche IA.**

## 🎤 Pitch oral officiel — à mémoriser pour l'examen

> Validé le 02/06/2026 — version "B" — ~45 secondes à dire. Ne plus modifier sans raison majeure.

> *« Nautilus, c'est une application web pour gérer un atelier nautique.*
>
> *Concrètement, le chef d'atelier enregistre ses clients, leurs bateaux, prépare des devis, lance des ordres de réparation et édite ses factures en PDF.*
>
> *Ce qui rend l'app différente, c'est son moteur de recherche en langage naturel : au lieu de naviguer dans des menus, tu poses une question en français — par exemple "historique du bateau de M. Dupont" — et un agent IA va chercher la réponse dans la base.*
>
> *Côté technique, le front est en Next.js, le back en NestJS, les données métier en PostgreSQL, et l'historique des recherches IA en MongoDB.*
>
> *Tout est déployé sur Vercel et Railway, avec une authentification Supabase. »*

## 📦 Pourquoi cette version (Option B)

Choix arrêté le 01/06/2026, sur conseil de Fabien Leyrissoux (Lead dev INF-IA, réunion Fireflies du 27/05).

**Principe** : faire **le minimum qui coche TOUTES les cases du référentiel TP DWWM** avec une **maîtrise totale du code** (capacité à tout expliquer à l'oral).

**3 alternatives évaluées :**

| Option | Périmètre | Décision |
|---|---|---|
| A — Riche | CRUD + IA + PDF + Email | ❌ Trop de stacks à maîtriser à l'oral |
| **B — Équilibre** | **CRUD + IA + PDF** | ✅ **Retenue** |
| C — Ultra-min | CRUD + IA seul | ❌ Manque de matière côté "composants métier serveur" |

**Sortis du périmètre** (réservés à la version commerciale RANKIA post-examen) :
- Scan de plaque moteur (OCR) — trop lourd (RGPD, cybersécurité, multi-API)
- Multi-rôles (mécano, client connecté)
- Stock de pièces
- Hivernage/déshivernage en module dédié
- Multi-tenant (un seul atelier)
- Envoi email automatique (gardé en bonus si temps en S4)

---

## 👤 Utilisateur cible (1 seul rôle connecté)

**Chef d'atelier nautique** (profil de référence : ancien parcours de Romain).
- Se connecte depuis son bureau (desktop) ou en mobilité dans l'atelier (mobile responsive)
- Gère seul tout son atelier (pas de mécanicien ni de client connectés)
- Imprime ou envoie ses devis/factures au format PDF

---

## 🗃️ Modèle de données (4 entités liées + Facture en PDF généré)

**Flux métier réel** : on **chiffre** d'abord (Devis), si validé on **exécute** (OR), une fois terminé on **facture** (PDF généré).

```
┌──────────┐ 1   N ┌─────────┐ 1   N ┌────────┐ 1   1 ┌─────┐
│  Client  │───────│ Bateau  │───────│ Devis  │───────│ OR  │
└──────────┘       └─────────┘       └────────┘       └─────┘
                                                          │
                                                          └─→ [PDF Facture généré quand statut = "terminé"]
```

| Entité | Attributs principaux | Statuts |
|---|---|---|
| **Client** | id · nom · prénom · email · téléphone · adresse · type (particulier/pro) · createdAt | — |
| **Bateau** | id · marque · modèle · numéro de plaque moteur (unique) · année · clientId (FK) · createdAt | — |
| **Devis** | id · lignes (table dédiée) · totalHT · TVA · totalTTC · bateauId (FK) · numéroDevis · createdAt | brouillon → envoyé → validé → refusé |
| **OR** (Ordre de Réparation) | id · description · type (entretien/réparation/hivernage/déshivernage/dépannage) · urgence (normal/urgent) · mécano (string libre) · devisId (FK, unique) · numéroFacture (généré au passage "facturé") · createdAt | créé → en cours → terminé → facturé |

> **Note importante** : la **Facture n'est PAS une entité séparée** — c'est un **PDF généré à la volée** à partir de l'OR + son Devis lié, quand l'OR passe en statut "terminé" puis "facturé". Le PDF reprend les lignes du devis avec la mention "FACTURE" et un numéro de facture séquentiel.

**Cycle de vie du flux :**
1. Le chef crée un **Devis** sur un bateau (statut `brouillon`)
2. Le chef génère un PDF "Devis" et l'envoie au client (statut `envoyé`)
3. Le client accepte → le chef passe le devis en `validé`, ce qui **déclenche la création d'un OR** lié
4. Le mécano exécute le travail (statut OR `créé` → `en cours` → `terminé`)
5. Le chef facture (statut OR `facturé`) → **génère le PDF Facture** (numéro de facture séquentiel)

---

## 🛠️ Fonctionnalités (le périmètre exact)

### A. CRUD des 4 entités
- Lister / créer / modifier / supprimer **Client**
- Lister / créer / modifier / supprimer **Bateau** (rattaché à un client)
- Lister / créer / modifier / supprimer **Devis** (rattaché à un bateau)
- Lister / créer / modifier / supprimer **OR** (créé automatiquement à la validation d'un devis)
- **Workflow de statuts** :
  - Devis : `brouillon → envoyé → validé (déclenche création OR) → refusé`
  - OR : `créé → en cours → terminé → facturé (génère le PDF Facture)`

### B. 🌟 Moteur de recherche IA en langage naturel (fonctionnalité signature)
- Barre de recherche unique en haut de l'application
- L'utilisateur tape une question en français
- Un agent IA traduit la question en requêtes SQL sur les 4 entités
- Les résultats sont affichés de façon structurée (fiche client / fiche bateau / liste OR / liste devis)
- L'historique de chaque recherche (question + réponse + utilisateur + timestamp) est stocké en MongoDB
- 5 cas d'usage minimum couverts (cf. jeu d'essai) :
  1. "Le bateau de Dupont" → fiche bateau + historique
  2. "OR en cours" → liste filtrée par statut
  3. "Devis impayés de mai" → liste filtrée par statut + période
  4. "Quels moteurs Yamaha 250 chez moi ?" → recherche par marque/modèle
  5. Question hors-domaine → réponse polie + suggestions

### C. Génération PDF côté serveur
- Bouton "Imprimer le devis" / "Imprimer la facture" sur la fiche Devis
- Génération côté serveur (NestJS + lib pdfkit ou puppeteer) d'un PDF formaté :
  - En-tête atelier (nom, adresse, SIRET)
  - Informations client + bateau
  - Lignes du devis (description + quantité + prix unitaire HT + total HT)
  - TVA + total TTC
  - Mentions légales
  - Numéro de devis ou de facture selon le statut
- Téléchargement direct côté front

---

## 🏗️ Architecture technique

```
┌────────────────────────────────────────────────────────────┐
│  FRONT-END (Vercel)                                         │
│  Next.js 16 + React 19 + TypeScript + Tailwind v4          │
│  · App Router (Server Components + Client Components)      │
│  · React Hook Form + Zod                                   │
│  · TanStack Query                                          │
│  · Supabase Auth (côté client)                             │
└────────────────────┬───────────────────────────────────────┘
                     │ API REST (HTTPS, JWT)
┌────────────────────┴───────────────────────────────────────┐
│  BACK-END (Railway)                                         │
│  NestJS 11 + TypeScript                                    │
│  · Architecture Module/Controller/Service/DTO              │
│  · Guards JWT + class-validator + Helmet + ThrottlerModule │
│  · Modules : Auth · Clients · Bateaux · OR · Devis ·       │
│              RechercheIA · PDF                             │
└─────────┬──────────────────┬────────────────────────────────┘
          │                  │
┌─────────┴────────┐   ┌─────┴──────────┐
│ PostgreSQL       │   │ MongoDB Atlas  │
│ (Neon)           │   │ Historique des │
│ Prisma 7 ORM     │   │ recherches IA  │
│ Données métier   │   │ (NoSQL)        │
└──────────────────┘   └────────────────┘
```

**Justification du choix multi-BDD (exigence référentiel SQL + NoSQL) :**
- **PostgreSQL** : données métier structurées et relationnelles (Client/Bateau/OR/Devis) — relations fortes, transactions ACID.
- **MongoDB** : historique des recherches IA — données semi-structurées (question texte libre, réponse variable), volumineuses, à requêter full-text. Cas d'usage naturel du NoSQL.

---

## 🔒 Sécurité (mesures intégrées by design)

| Mesure | Détail |
|---|---|
| Authentification | Supabase Auth (email + mot de passe), JWT en cookie httpOnly |
| Autorisation | Guards NestJS sur toutes les routes (sauf `/auth/*` et `/health` marqués `@Public()`) |
| Validation des entrées | DTOs typés + class-validator sur chaque endpoint |
| Protection injection | Prisma (requêtes paramétrées) + DTOs |
| CORS | Strict — uniquement l'origine du front Vercel |
| Rate limiting | ThrottlerModule sur `/auth/*` et `/recherche-ia` |
| Headers HTTP sécurisés | Helmet (HSTS, X-Frame-Options, X-Content-Type-Options, CSP) |
| Sécurité IA | Sanitisation prompt + restriction du contexte LLM au schéma SQL (pas de données brutes envoyées) |
| Secrets | Variables d'environnement uniquement, jamais commitées |

---

## ✅ Couverture du référentiel TP DWWM (RNCP 37674)

| Compétence | Comment c'est couvert |
|---|---|
| Maquetter web + web mobile | Maquettes Figma desktop + mobile |
| Interfaces statiques | Pages liste/détail Next.js |
| Interfaces dynamiques | Formulaires Zod+RHF, recherche IA en live, TanStack Query |
| BDD relationnelle | PostgreSQL + Prisma, 4 entités liées (Client → Bateau → Devis → OR) |
| SQL ET NoSQL | Prisma pour SQL ; MongoDB pour historique recherches IA |
| Composants métier serveur | Services NestJS : Clients, Bateaux, OR, Devis, RechercheIA, PDF |
| Documenter le déploiement | Section dédiée du Dossier Projet : variables env + procédures Vercel/Railway/Neon/Atlas |
| Sécurité | Mesures listées ci-dessus + section dédiée du Dossier Projet |
| Jeu d'essai | Sur le moteur de recherche IA (5 scénarios documentés) |
| Veille sécurité | OWASP + Dependabot + section dédiée du Dossier Projet |

---

## 🎤 Scénario de démo oral (35 min de présentation)

| Minutes | Étape |
|---|---|
| 0-5 | Pitch produit + contexte RANKIA + cible métier |
| 5-10 | Architecture technique (schéma) + justification des choix |
| 10-15 | Schéma BDD (MCD) + justification PostgreSQL + MongoDB |
| 15-25 | **Démo live** : connexion → créer un client → créer un bateau → créer un OR → générer un devis → imprimer en PDF → **recherche IA en langage naturel** |
| 25-30 | Focus sécurité (auth, IA, OWASP) |
| 30-35 | Bilan + veille + perspectives produit (RANKIA) |

---

## 🚫 Hors périmètre (ce qu'il NE faut PAS coder)

- ❌ Scan de plaque moteur (OCR) → gardé pour la version commerciale RANKIA
- ❌ Application mobile native (PWA possible si temps, mais responsive web suffit)
- ❌ Espace client connecté (le client reçoit ses devis par PDF, ne se connecte pas)
- ❌ Compte mécanicien (le chef d'atelier est seul utilisateur)
- ❌ Stock de pièces / gestion des fournisseurs
- ❌ Envoi email automatique (en bonus si temps en S4 — sinon Romain peut envoyer manuellement le PDF en pièce jointe par son Gmail)
- ❌ Multi-atelier / multi-tenant
- ❌ Facturation comptable / export comptable
- ❌ Tableau de bord BI avancé (un dashboard simple avec 3 compteurs suffit)

---

## 🎯 Critères de succès pour viser 16/20

1. ✅ Tous les éléments du référentiel couverts ET démontrés explicitement
2. ✅ Code que Romain comprend et explique à 100 % (pas de boîte noire IA)
3. ✅ Sécurité explicitée et défendable
4. ✅ Démo orale fluide, chronométrée, sans bug
5. ✅ Dossier Projet et DP rédigés avec rigueur (orthographe, schémas, captures)
6. ✅ Présence d'une vraie veille sécurité (pas du copier-coller OWASP)
7. ✅ Réponses précises aux questions techniques du jury sur les choix d'architecture

---

## 📅 Calendrier rappel

| Semaine | Mission |
|---|---|
| S1 (02-08/06) | BDD + Auth + CRUD |
| S2 (09-15/06) | Moteur de recherche IA + PDF + déploiement |
| S3 (16-22/06) | Rédaction Dossier Projet + DP + 1er dépôt |
| S4 (23-28/06) | Diaporama + répétitions orales + impression/reliure |
| **29/06** | 🎓 Examen Villepinte |

---

## 🔗 Documents liés

- [README dossier projet](dossier-projet/README.md) — squelette du livrable principal
- [PRD-LIVRABLES-EXAMEN.md](PRD-LIVRABLES-EXAMEN.md) — modalités de l'examen
- [PRD-NAUTILUS.md (vision complète)](../prd/PRD-NAUTILUS.md) — vision produit RANKIA post-examen
