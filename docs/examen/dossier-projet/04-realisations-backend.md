# 4. Réalisations back-end

> Cette section présente les éléments les plus significatifs du back-end Nautilus + les arguments des choix techniques, **y compris pour la sécurité**.

## 4.1 Présentation de la base de données

### 4.1.1 Schéma conceptuel (MCD) avec données et relations

> **À PRODUIRE** — diagramme MCD (Mermaid ou Draw.io) reflétant les 4 entités et le flux métier réel.

```
┌──────────┐ 1   N ┌─────────┐ 1   N ┌────────┐ 1   1 ┌─────┐
│  Client  │───────│ Bateau  │───────│ Devis  │───────│ OR  │
└──────────┘       └─────────┘       └────────┘       └─────┘
                                                          │
                                                          └─→ [PDF Facture généré au statut "facturé"]
```

**Flux métier** : Client a un Bateau → on chiffre un **Devis** → si validé, un **OR** est créé → quand l'OR est terminé puis facturé, on génère le **PDF Facture** (avec numéro de facture séquentiel).

**Entités et attributs principaux :**

| Entité | Attributs principaux | Statuts |
|---|---|---|
| **Client** | id, nom, prénom, email, téléphone, adresse, type (particulier/pro), createdAt | — |
| **Bateau** | id, marque, modèle, plaque moteur (unique), année, clientId (FK), createdAt | — |
| **Devis** | id, numéroDevis, lignes (table dédiée), totalHT, TVA, totalTTC, bateauId (FK), createdAt | brouillon → envoyé → validé → refusé |
| **OR** (Ordre de Réparation) | id, description, type (entretien/réparation/hivernage/déshivernage/dépannage), urgence, mécano (string), devisId (FK unique), numéroFacture (généré au statut "facturé"), createdAt | créé → en cours → terminé → facturé |

> **Note importante** : la **Facture n'est PAS une entité séparée** — c'est un PDF généré à la volée à partir de l'OR + son Devis, quand l'OR passe au statut "facturé". Économie d'une table sans perte fonctionnelle.

### 4.1.2 Schéma physique (MLD/MPD)

> **À PRODUIRE** — schéma Prisma + diagramme physique des tables PostgreSQL.

### 4.1.3 Script de création de la base de données

> **À INSÉRER** — extrait du schema Prisma (`schema.prisma`) et de la migration SQL générée.

```prisma
model Client {
  id        String   @id @default(cuid())
  nom       String
  prenom    String
  email     String?
  // ...
  bateaux   Bateau[]
}
// ... (à compléter avec le vrai schéma)
```

## 4.2 Extraits de code — composants métier

> **À INSÉRER** — extraits significatifs des services NestJS.

Exemples à inclure (les plus représentatifs) :
- **Service Recherche IA** : reçoit une question en langage naturel, interroge l'agent IA, traduit en requêtes SQL, retourne les résultats structurés
- Service Devis : génération du numéro de facture lors du passage en statut "validé"
- **Service PDF** : génération d'un PDF de devis/facture côté serveur (lib pdfkit ou puppeteer), avec mentions légales, lignes, totaux, logo

## 4.3 Extraits de code — composants d'accès aux données

> **À INSÉRER** — extraits des accès SQL (Prisma) **et** NoSQL (MongoDB).

**Côté SQL (PostgreSQL via Prisma) :**
- Requête liste clients avec leurs bateaux (include)
- Requête historique des OR d'un bateau (avec jointures)
- Pagination + filtrage côté serveur

**Côté NoSQL (MongoDB) :**
- Sauvegarde d'une recherche IA (question + réponse + utilisateur + timestamp)
- Lecture de l'historique des recherches récentes d'un utilisateur
- Index de recherche pour retrouver d'anciennes recherches similaires

> 🎯 **Justification de l'usage NoSQL (exigence du référentiel)** : les recherches IA sont par nature semi-structurées et volumineuses (question texte libre, réponse contenant des extraits variés). MongoDB est mieux adapté qu'une table PostgreSQL rigide pour ce cas d'usage, et son indexation full-text accélère la recherche d'historique.

## 4.4 Arguments des choix techniques (y compris sécurité)

| Choix | Argument |
|---|---|
| NestJS 11 | Architecture modulaire stricte (Module/Controller/Service/DTO), maintenable, testable. Injection de dépendances native |
| Prisma 7 | ORM type-safe, migrations versionnées, génération automatique du client TypeScript |
| PostgreSQL (Neon) | Base relationnelle robuste, hébergée serverless (scaling auto), idéale pour les données métier structurées |
| MongoDB Atlas | Choix justifié par le cas d'usage IA (cf. section 4.3) |
| Supabase Auth + JWT | Standard de l'industrie, vérification du token via Guard NestJS sur toutes les routes protégées |
| DTOs + class-validator | Validation systématique des entrées avant le service métier — défense contre l'injection et les payloads malformés |
| CORS configuré strictement | N'accepte que l'origine du front Vercel — pas de wildcard |
| Rate limiting (ThrottlerModule) | Protection contre le brute force, en particulier sur les routes d'auth et de recherche IA (coût LLM) |
| Variables d'environnement | Secrets jamais commités, fichier `.env.example` documenté |

## 4.5 Documentation du déploiement

> **À RÉDIGER** — instructions de déploiement complètes.

**Variables d'environnement requises** (NestJS) :
```
DATABASE_URL=postgresql://...
MONGODB_URI=mongodb+srv://...
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
JWT_SECRET=...
OPENAI_API_KEY=... (ou autre fournisseur LLM)
PDF_GENERATOR_CONFIG=...
```

**Commandes de déploiement :**
- `npx prisma migrate deploy` — appliquer les migrations en prod
- `pnpm build` — build Next.js + NestJS
- Vercel : connexion repo GitHub + déploiement auto sur push main
- Railway : déploiement Docker du back-end, variables d'environnement configurées dans le dashboard
