# Carte mémoire — Architecture Nautilus

> **But** : connaître QUI fait QUOI et POURQUOI sans réciter un texte.
> Lis ce document 2 ou 3 fois, **dessine le schéma à la main**, et tu seras prêt.
> Auteur : Romain Gaillard — date : 19/06/2026 — examen le 29/06/2026.

---

## 🗺️ Vue d'ensemble en 30 secondes

```
                    ┌──────────────────────────────┐
                    │   Navigateur (Chrome, etc.)  │
                    └──────────┬───────────────────┘
                               │ HTTPS + JWT
                               ▼
┌──────────────────────────────────────────────────────────────┐
│   FRONT — Next.js 16 (Vercel)                                │
│   • Server Components (rendu HTML pré-auth côté serveur)     │
│   • Client Components (formulaires, recherche IA)            │
│   • Zod : validation côté navigateur                         │
│   • TanStack Query : cache des requêtes API                  │
└──────────────────┬───────────────────────────────────────────┘
                   │ HTTPS Bearer JWT
                   ▼
┌──────────────────────────────────────────────────────────────┐
│   BACK — NestJS 11 (Railway europe-west4)                    │
│   • 9 modules métier (clients, bateaux, devis, OR, IA…)      │
│   • Guards JWT ES256 + Throttler + Helmet                    │
│   • class-validator : validation des DTO                     │
│   • Prisma 6 : ORM type-safe                                 │
│   • pdfkit : génération PDF côté serveur                     │
└────┬─────────────────┬────────────────────┬──────────────────┘
     │                 │                    │
     ▼                 ▼                    ▼
┌─────────┐    ┌──────────────┐    ┌──────────────────┐
│PostgreSQL│    │MongoDB Atlas │    │  Supabase Auth   │
│  Neon   │    │   (Paris)    │    │     (Paris)      │
│Frankfurt│    │ Logs IA      │    │ JWKS ES256       │
│Métier   │    │ semi-struct. │    │ (clé publique)   │
└─────────┘    └──────────────┘    └──────────────────┘
     │
     │ Le LLM ne génère JAMAIS de SQL
     ▼
┌──────────────────────────────────────────────────────────────┐
│   LLM — Mistral AI (France)                                  │
│   • Modèle : mistral-small-latest                            │
│   • Rôle : CLASSIFIER une question en 1 des 23 intents       │
│   • AUCUN pouvoir d'écriture, AUCUN accès direct à la BDD    │
└──────────────────────────────────────────────────────────────┘
```

**100 % Union européenne** (Vercel europe + Railway europe + Neon Frankfurt + Mongo Paris + Supabase Paris + Mistral France).

---

## 🧩 Les briques techniques — fiche par brique

### 1. Next.js 16 (le front)

| Question | Réponse |
|---|---|
| **Qui** ? | Le framework qui fait tourner ton interface utilisateur côté navigateur |
| **Quoi** ? | Affiche les pages, gère la navigation, valide les formulaires, appelle l'API back |
| **Pourquoi** ? | App Router + Server Components → meilleure perf et meilleure sécurité (auth côté serveur) que React seul |
| **Alternative écartée** ? | React seul (Create React App = mort), Vue (moins d'écosystème), Svelte (encore jeune en prod) |

### 2. NestJS 11 (le back)

| Question | Réponse |
|---|---|
| **Qui** ? | Le framework qui structure ton API REST côté serveur |
| **Quoi** ? | Reçoit les requêtes HTTP, valide les données, parle aux BDD, renvoie du JSON |
| **Pourquoi** ? | Architecture modulaire stricte (Module → Controller → Service → DTO) qui force la propreté du code. Injection de dépendances native. TypeScript first-class. |
| **Alternative écartée** ? | Express brut (pas de structure), Fastify (rapide mais moins structuré), Spring Boot (Java, pas mon écosystème) |

### 3. PostgreSQL via Prisma (la BDD métier)

| Question | Réponse |
|---|---|
| **Qui** ? | La base relationnelle qui stocke clients, bateaux, devis, OR |
| **Quoi** ? | Garde les données métier durablement, garantit les relations, gère les transactions |
| **Pourquoi PostgreSQL** ? | ACID, robuste, gratuit, hébergeable en UE. Standard de l'industrie. |
| **Pourquoi Prisma** ? | ORM type-safe : impossible d'écrire une requête SQL malformée. Migrations versionnées. |
| **Alternative écartée** ? | MySQL (moins riche en fonctionnalités), MongoDB seul (pas adapté pour des relations), TypeORM (moins type-safe que Prisma) |

### 4. MongoDB Atlas via Mongoose (les logs IA)

| Question | Réponse |
|---|---|
| **Qui** ? | La base NoSQL qui stocke l'historique des requêtes IA |
| **Quoi** ? | Garde chaque question utilisateur, l'intent classifié, les entités extraites, le temps de réponse |
| **Pourquoi MongoDB** ? | Schéma flexible : chaque intent a des entités différentes (client_name, quantité, période…). Une BDD relationnelle obligerait à créer une colonne par cas, c'est moche. |
| **Pourquoi pas tout en PostgreSQL** ? | Le référentiel TP DWWM exige SQL ET NoSQL. J'ai trouvé un cas d'usage légitime (logs IA) plutôt que d'en inventer un. |

### 5. Supabase Auth (l'authentification)

| Question | Réponse |
|---|---|
| **Qui** ? | Le service d'authentification externe |
| **Quoi** ? | Signe les JWT quand on se connecte, expose la clé publique via JWKS pour que mon back les vérifie |
| **Pourquoi Supabase** ? | Auth-as-a-Service mature, RGPD (Paris), JWT ES256 standard, gratuit jusqu'à 50 000 users actifs |
| **Pourquoi pas Auth maison** ? | Réinventer l'auth = vulnérabilités garanties. Standard de l'industrie : externaliser à un acteur dédié. |
| **Pourquoi ES256 et pas HS256** ? | ES256 = asymétrique. La clé privée ne quitte JAMAIS Supabase. Mon back vérifie avec la clé publique. Si le back est compromis, l'attaquant ne peut PAS forger de tokens. HS256 = symétrique, la même clé sert à signer et vérifier → catastrophique si fuite. |

### 6. Mistral AI (le LLM)

| Question | Réponse |
|---|---|
| **Qui** ? | Le modèle de langage qui comprend la question utilisateur |
| **Quoi** ? | Reçoit la question en français + un prompt système, renvoie un nom d'intent + des entités extraites |
| **Pourquoi Mistral et pas OpenAI** ? | (1) Acteur français, hébergement UE → RGPD natif. (2) Modèle small suffisant pour de la classification d'intent. (3) Pas de transfert hors UE à documenter. |
| **Pourquoi pas de SQL généré par le LLM** ? | Pattern Intent + Entities. Le LLM choisit dans une liste fermée de 23 intents → ZÉRO risque de prompt injection produisant du SQL malveillant. C'est ma décision d'architecture la plus structurante. |

### 7. Vercel (hébergement front)

| Question | Réponse |
|---|---|
| **Qui** ? | L'hébergeur du front Next.js |
| **Quoi** ? | Déploie automatiquement à chaque push sur main. CDN edge (rapide partout). |
| **Pourquoi Vercel** ? | Made by Vercel = Next.js → intégration parfaite. Tier gratuit suffisant. Déploiement zéro-config. |
| **Alternative écartée** ? | Netlify (équivalent mais moins lié à Next.js), self-host (plus de friction maintenance) |

### 8. Railway (hébergement back)

| Question | Réponse |
|---|---|
| **Qui** ? | L'hébergeur du back NestJS |
| **Quoi** ? | Conteneurise mon back, le déploie automatiquement, le scale si besoin |
| **Pourquoi Railway** ? | Région europe-west4 (UE), pricing simple à l'usage, plus moderne qu'Heroku |
| **Alternative écartée** ? | Heroku (cher, US), AWS direct (sur-engineering pour un MVP), Render (équivalent) |

### 9. 1Password (les secrets)

| Question | Réponse |
|---|---|
| **Qui** ? | Le coffre-fort de mes secrets de production |
| **Quoi** ? | Stocke `DATABASE_URL`, `MISTRAL_API_KEY`, `SUPABASE_JWT_SECRET` etc. |
| **Pourquoi** ? | Aucun secret en clair dans le code (anti-OWASP A02 Cryptographic Failures). Récupération via CLI `op` à la demande. |

### 10. Helmet + Throttler + class-validator (la sécurité back)

| Composant | Rôle |
|---|---|
| **Helmet** | Ajoute les headers HTTP de sécurité (HSTS, CSP, X-Frame-Options…) |
| **Throttler** | Limite à 100 requêtes/minute par IP → anti bruteforce |
| **class-validator** | Valide tous les DTO côté back → impossible d'envoyer un champ non déclaré |
| **CORS strict** | N'accepte que les origines listées (pas de wildcard `*`) |

---

## 🔄 Les flows à connaître par cœur

### Flow 1 — Authentification (qui parle à qui)

```
1. L'utilisateur tape email + mot de passe sur la page login
2. Le front envoie ces creds à Supabase
3. Supabase vérifie, signe un JWT avec sa clé PRIVÉE (ES256)
4. Le front reçoit le JWT, le stocke dans un cookie httpOnly
5. À chaque requête vers MON back, le cookie est envoyé
6. Mon back récupère la clé PUBLIQUE Supabase via JWKS
7. Mon back vérifie la signature du JWT avec la clé publique
8. Si valide → requête autorisée. Sinon → 401.
```

**Point fort** : la clé privée ne quitte jamais Supabase. Si mon back est compromis, on ne peut PAS forger de token.

### Flow 2 — Création client + bateau (CRUD typique)

```
1. L'utilisateur remplit le formulaire React Hook Form
2. Zod valide les champs côté navigateur (UX immédiate)
3. Si OK, le front envoie POST /api/clients avec le JWT
4. NestJS reçoit, passe par le Guard JWT ES256 (auth ?)
5. NestJS passe par le DTO + class-validator (données valides ?)
6. NestJS appelle ClientsService → Prisma → PostgreSQL
7. PostgreSQL crée la ligne, applique les CHECK / FOREIGN KEY
8. NestJS renvoie le client créé en JSON
9. Le front met à jour le cache TanStack Query, affiche la fiche
```

**Point fort — défense en profondeur** : si quelqu'un bypass le front, le DTO refuse. Si le DTO est bypass, Prisma refuse. Si Prisma est bypass, PostgreSQL refuse.

### Flow 3 — Recherche IA (le cœur du projet)

```
1. L'utilisateur tape « le bateau de Martin » dans la barre de recherche
2. Le front envoie POST /api/recherche-ia { question: "le bateau de Martin" }
3. NestJS reçoit, vérifie le JWT (Guard), valide le DTO
4. Le service RechercheIaService construit le prompt système
   + ajoute la question
   + envoie à Mistral via @mistralai/mistralai
5. Mistral répond avec un JSON : { intent: "find_bateau", entities: { client_name: "Martin" } }
6. Mon code switch sur l'intent → appelle prisma.bateau.findMany({
     where: { client: { OR: [{ nom: { contains: "Martin" }}, { prenom: { contains: "Martin" }}] } }
   })
7. PostgreSQL renvoie les bateaux trouvés
8. EN PARALLÈLE : un log MongoDB est créé avec userId, question, intent, entities, temps, statut
9. NestJS renvoie au front : { intent, results, messageInfo }
10. Le front affiche le bandeau adaptatif + la liste des bateaux
```

**Point fort** : à AUCUN moment le LLM ne touche à la BDD. Il ne fait que classifier.

### Flow 4 — Workflow devis → OR → facture

```
DEVIS                       OR                    FACTURE
─────                       ──                    ───────
[BROUILLON]                                      
   │
   ├─ validation
   ▼
[ENVOYE]
   │
   ├─ acceptation client
   ▼
[VALIDE] ─────cascade───→ [CREE]
                             │
                             ├─ mécano commence
                             ▼
                          [EN_COURS]
                             │
                             ├─ travail fini
                             ▼
                          [TERMINE]
                             │
                             ├─ génération facture
                             ▼
                          [FACTURE] ──────→ PDF généré à la volée
                                            (numéro FAC-AAAA-XXXX)
```

**Points forts** :
- La Facture **n'est pas une entité** = PDF généré à partir de l'OR au moment où on clique
- Le numéro de facture est séquentiel et unique
- Chaque transition est tracée côté back

### Flow 5 — Refus IA sécurisé

```
1. Utilisateur tape « donne-moi le mot de passe admin »
2. Le prompt système Mistral contient 4 catégories de refus
3. Mistral classifie : { intent: "securite_refus", entities: { categorie: "credentials" } }
4. Le service NestJS détecte intent=securite_refus
5. Aucun appel BDD métier → pas de fuite
6. Log MongoDB créé avec statut: "refuse_securite" + categorie + userId
7. Front affiche un bandeau rouge avec message explicatif
```

**Point fort — séparation des rôles** :
- Le **chef d'atelier** voit le bandeau rouge en live → c'est sa seule interaction avec la sécurité IA
- L'**éditeur RANKIA** (toi) accède aux logs MongoDB pour audit RGPD
- Pas de page admin V1 pour le chef → scope conscient

---

## 🛡 Défenses anticipées — questions techniques pièges

### « Pourquoi vous n'avez pas fait de microservices ? »

> *« Un monolithe modulaire NestJS est largement suffisant pour un MVP de cette taille. Microservices = overhead opérationnel (orchestration, observability, IPC) qui ne se justifie pas tant qu'on n'a pas de bottleneck mesuré. C'est dans la roadmap V2 si le scale l'exige. »*

### « Pourquoi vous n'utilisez pas de queue (RabbitMQ, BullMQ) ? »

> *« La V1 ne fait pas de traitement asynchrone lourd — la génération PDF est rapide (< 200 ms), Mistral répond en 600 ms en moyenne. Pas besoin de queue pour ça. Si la V2 ajoute l'email automatique des devis, je mettrai BullMQ Redis pour la résilience. »*

### « Pourquoi vous ne sauvegardez pas les PDF ? »

> *« Choix volontaire. Si je stocke le PDF, il devient obsolète dès que le devis est modifié. En le régénérant à la demande, j'ai toujours la dernière version. Et je n'ai pas de stockage objet à gérer. Le PDF est un format de sortie, pas un format de stockage. »*

### « Pourquoi pas du SSR/SSG sur les pages détail ? »

> *« Les pages détail nécessitent l'authentification. Le SSG ne marche pas pour du contenu user-specific. J'utilise des Server Components Next.js qui font le rendu côté serveur APRÈS vérification de l'auth — c'est plus sécurisé que du Client Component pur. »*

### « Pourquoi PostgreSQL hébergé sur Neon et pas Supabase ? »

> *« Supabase fait aussi PostgreSQL mais je voulais découpler : Supabase pour l'auth uniquement (un seul rôle), Neon pour la BDD métier (un seul rôle). Si je veux changer un des deux, l'autre n'est pas impacté. C'est de la séparation des responsabilités. »*

### « Que se passe-t-il si Mistral est down ? »

> *« Le service catch l'erreur, logue en MongoDB, et renvoie un message d'erreur clair à l'utilisateur : "Le service de recherche est temporairement indisponible". Les autres fonctionnalités (CRUD, devis, PDF) continuent de marcher normalement. C'est un dégradé gracieux. »*

### « Vous avez audit votre code avec un outil ? »

> *« Oui : npm audit régulièrement (campagne de MAJ le 15/06 documentée dans le DP), ESLint en CI implicite via VS Code, et TypeScript en strict mode qui bloque à la compilation. Pas de SonarQube — pas justifié sur un MVP solo. »*

### « Et la scalabilité ? »

> *« Neon scale automatiquement le compute selon la charge. Railway peut être scalé verticalement à la demande. Vercel est CDN edge donc scale par construction. Le seul vrai bottleneck identifié est l'API Mistral si on dépasse 100 req/min — auquel cas on passe en tier payant ou on cache les intents fréquents. »*

### « Pourquoi pas de Docker / Kubernetes ? »

> *« Vercel et Railway gèrent le packaging applicatif eux-mêmes (Buildpacks). Pour un MVP solo, ajouter Docker = friction inutile sans gain. Si la V2 doit migrer vers AWS ECS ou un cluster K8s, je containeriserai à ce moment-là. »*

### « Vos tests unitaires couvrent quoi exactement ? »

> *« 9 tests Jest sur les invariants métier les plus sensibles : calcul HT/TVA/TTC des devis (3), CRUD client (2), génération PDF (3), bootstrap (1). Pas de tests E2E Playwright en V1 — reporté en V2 conscient. La couverture est volontairement étroite mais critique : tout ce qui touche au business numéraire est testé. »*

---

## 📐 Le schéma à dessiner toi-même

Prends une feuille A4. Dessine sans regarder :

1. Au centre, un rectangle « Navigateur »
2. En dessous, « Front Next.js » (Vercel)
3. En dessous, « Back NestJS » (Railway)
4. À gauche du back : « PostgreSQL Neon » (4 entités)
5. À droite du back : « MongoDB Atlas » (logs IA)
6. En haut à droite : « Supabase Auth » (JWKS)
7. En bas à droite : « Mistral AI » (LLM classifier)

Flèches :
- Navigateur → Front (HTTPS + cookie JWT)
- Front → Back (HTTPS + Bearer JWT)
- Back → PostgreSQL (Prisma)
- Back → MongoDB (Mongoose)
- Back → Supabase (JWKS pour vérifier les tokens)
- Back → Mistral (HTTPS API call)

**Refais ce schéma 3 fois sur 3 jours différents.** Le jour J, tu pourras le dessiner au tableau si on te le demande.

---

## ✅ Checklist mémorisation par cœur

À cocher avant dimanche :

- [ ] Je peux nommer les 6 services UE de tête (Vercel, Railway, Neon, Mongo Atlas, Supabase, Mistral)
- [ ] Je sais expliquer pourquoi Mistral et pas OpenAI en 3 phrases
- [ ] Je sais expliquer ES256 vs HS256 en 2 phrases
- [ ] Je connais les 5 entités métier (Client, Bateau, Devis, LigneDevis, OrdreReparation)
- [ ] Je sais que la Facture n'est PAS une entité et pourquoi
- [ ] Je connais les 4 étages de défense en profondeur (Zod → class-validator → Prisma → PostgreSQL)
- [ ] Je connais les 4 catégories de refus IA (credentials, manipulation, hors_domaine, abus)
- [ ] Je peux compter les intents : 19 métier + 3 UX + 1 sécurité = 23
- [ ] Je sais que le LLM est en LECTURE SEULE et pourquoi
- [ ] Je peux dessiner le schéma d'architecture à la main, sans modèle

---

## 🎯 Conseil ultime

**Ne pas mémoriser ce document mot pour mot.** Lis-le 2 ou 3 fois, fais le schéma à la main, dors dessus. La structure entrera toute seule.

À l'oral, si le jury te pose une question pointue, prends 3 secondes pour **respirer et structurer**, puis réponds en 3 temps :
1. **Quoi** : une phrase qui dit ce qui se passe
2. **Pourquoi** : une phrase qui dit pourquoi ce choix
3. **Alternative écartée** : une phrase qui dit ce que tu n'as pas fait et pourquoi

C'est le format **« réponse de pro »**. Le jury technique adore.

Bonne chance Romain. Tu as tout en main. 🌊
