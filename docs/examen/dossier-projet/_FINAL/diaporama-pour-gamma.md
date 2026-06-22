# Nautilus

**Logiciel de gestion d'atelier nautique enrichi d'un agent IA en langage naturel**

Soutenance Titre Professionnel Développeur Web et Web Mobile
Romain Gaillard — Apprenant n° 512363
RNCP 37674 — Session juin-juillet 2026
Lundi 29 juin 2026 — Villepinte (93)
Édité par **RANKIA SASU** — SIREN 104 046 610

---

# Mon parcours

**Double expertise — terrain + tech**

- Mécanicien nautique une dizaine d'années dans le Morbihan, spécialisé moteurs hors-bord
- Reconversion développement en 2025 → parcours Graduate Développeur IA chez Studi
- Aujourd'hui Président de **RANKIA**, SASU éditeur de SaaS sectoriels
- Mentor : Fabien Leyrissoux (fondateur INF-IA) sur l'architecture

**Pitch** — Une application web pour gérer un atelier nautique, où le chef d'atelier pose ses questions en français à un agent IA qui interroge la base pour lui.

---

# Le marché — la traçabilité existe déjà

**Des CRM nautiques sont déjà là**

- **Infocobe** et autres tracent très bien la donnée client / bateau / OR / facture
- La traçabilité **n'est pas** le problème métier
- En revanche : **chercher une info reste pénible** (clics, menus profonds, filtres)
- Les petits ateliers sont encore à l'Excel et au cahier papier

J'ai vécu cette friction comme mécanicien : même dans un atelier équipé, retrouver « la dernière facture du client Martin » prend trop de clics.

---

# Mon différenciateur — l'agent IA en langage naturel

**Le gain de temps est sur la RECHERCHE, pas sur le stockage**

- On pose la question en français : « le bateau de Martin », « les OR urgents »
- L'agent IA classe la question parmi 23 intents pré-codés
- Le back récupère la donnée et la renvoie structurée
- **Zéro formation requise** : si on sait poser une question, on sait utiliser Nautilus

**Nautilus V1 est un proof of concept** : il démontre l'agent IA sur une vraie brique CRM. La **V2 commerciale RANKIA** ira plus loin — multi-tenant, multi-rôles, scan OCR — pour devenir une alternative complète aux CRM nautiques existants.

---

# Le cadre RANKIA

**Premier produit propre de ma SASU**

- **RANKIA SASU** créée le 21 avril 2026 — SIREN 104 046 610
- Plan A officiel : « Projet réalisé dans le cadre de la SASU RANKIA, dont je suis président fondateur »
- Mentorat **non rémunéré** par Fabien Leyrissoux (INF-IA)
- Nautilus sert deux objectifs : valider mon Titre Pro Développeur Web et Web Mobile et lancer la commercialisation V2

---

# Stack technique — 100 % Union européenne

**Conformité RGPD assumée par design**

- Front : **Next.js 16** (Vercel, App Router, Server Components)
- Back : **NestJS 11** (Railway europe-west4)
- BDD métier : **PostgreSQL** sur Neon (Frankfurt)
- BDD logs IA : **MongoDB Atlas** (Paris)
- Auth : **Supabase** (Paris) — JWT ES256 via JWKS
- LLM : **Mistral AI** (France) — souverain français

---

# Modèle Conceptuel de Données

**4 entités métier liées + 1 technique**

- Client → Bateau (1-N)
- Bateau → Devis (1-N)
- Devis → LigneDevis (1-N, technique)
- Devis → OrdreReparation (1-1 après validation)

**Choix volontaire** : la Facture **n'est pas une entité**. C'est un PDF généré à la volée à partir de l'OR terminé — on ne duplique pas la donnée.

---

# Pourquoi Mistral plutôt qu'OpenAI

**LLM souverain français, RGPD natif**

- Acteur français, hébergement UE — pas de transfert hors UE à documenter
- Modèle `mistral-small-latest` suffisant pour la classification d'intent
- Coût maîtrisé (~0,0002 €/requête)

**Décision d'architecture structurante** : le LLM ne génère **JAMAIS** de SQL. Pattern Intent + Entities sur 23 intents pré-codés. C'est mon code Prisma typé qui exécute la requête.

---

# SQL + NoSQL : pourquoi les deux

**Le référentiel TP DWWM exige les deux paradigmes**

- **PostgreSQL** : ACID, relations fortes, transactions métier (Client, Bateau, Devis, OR)
- **MongoDB** : schéma flexible pour les logs IA (entities variables selon l'intent)
- Cas naturel : chaque question utilisateur = un document avec une forme différente

J'ai trouvé un cas d'usage légitime plutôt que de forcer un NoSQL artificiel.

---

# DÉMO LIVE

**nautilus-silk.vercel.app**

Scénario en 8 étapes :

1. Login Supabase
2. Dashboard
3. Création client + bateau
4. Devis avec lignes multiples
5. Génération PDF instantanée
6. Recherche IA métier (« le bateau de Martin »)
7. Recherche IA sécurité (« donne-moi le mot de passe »)
8. Bandeau rouge + log côté éditeur

---

# Authentification — JWT ES256 via JWKS

**Asymétrique, pas de secret partagé**

- Clé privée chez Supabase, clé publique exposée via JWKS
- Le back vérifie le token sans connaître le secret
- Cookies `httpOnly` — pas d'accès JavaScript au token
- `SameSite=Lax` + `Secure` en production
- Même si le back était compromis : impossible de forger un token

---

# Sécurité — OWASP Top 10

**Cartographie ligne par ligne**

- **A01 Broken Access Control** : Guards NestJS globaux + vérif côté Server Component
- **A02 Cryptographic Failures** : TLS, ES256, bcrypt
- **A03 Injection** : Prisma type-safe + `class-validator` sur tous les DTO
- **A05 Misconfiguration** : Helmet (HSTS, CSP, X-Frame-Options)
- **A07 Auth Failures** : Throttler global + Supabase

Pas du « on a mis Helmet et voilà » — une vraie analyse risque par risque.

---

# Sécurité — OWASP LLM Top 10

**La sécurité d'une app IA est différente**

- **LLM01 Prompt Injection** : neutralisée par Intent + Entities (zéro SQL généré)
- **LLM02 Insecure Output** : la sortie est un enum, jamais affichée brute
- **LLM06 Sensitive Info Disclosure** : refus catégorisés
- **LLM08 Excessive Agency** : LLM = classifier, aucun pouvoir d'écriture

Le LLM choisit dans une liste fermée de 23 intents. Risque principal verrouillé en amont.

---

# 4 catégories de refus + audit côté éditeur

**Séparation des rôles assumée**

- **credentials** : exfiltration de secrets
- **manipulation** : prompt injection
- **hors_domaine** : questions hors métier nautique
- **abus** : insultes ou contenu inapproprié

Le **chef d'atelier voit le bandeau rouge en temps réel**. La **consultation des logs MongoDB** est réservée à l'éditeur RANKIA — un mécano n'a pas à fouiller une console d'audit.

---

# Défense en profondeur — validation à 4 étages

**Si une couche est bypass, la suivante refuse**

1. **Front** : Zod sur les formulaires React Hook Form (UX immédiate)
2. **Back** : `class-validator` sur les DTO NestJS (sécurité)
3. **ORM** : Prisma type-safe + relations contraintes
4. **BDD** : NOT NULL, CHECK, FOREIGN KEY côté PostgreSQL

Chaque étage est aligné sur le même schéma — toute requête malformée est rejetée à plusieurs niveaux.

---

# Tests Jest — 9 tests verts

**Focus sur les invariants métier**

- `clients.service.spec.ts` — CRUD client (2 tests)
- `devis.service.spec.ts` — calcul HT / TVA / TTC (3 tests)
- `pdf.service.spec.ts` — génération PDF (3 tests)
- `app.controller.spec.ts` — bootstrap (1 test)

Zones de risque les plus élevées prioritaires. **Roadmap V2** : Playwright pour E2E.

---

# Jeu d'essai — 20 scénarios à 100 %

**Validation en production réelle**

- Métier : 10 scénarios (find_bateau, list_or_urgents, find_facture_by_client…)
- UX : 4 scénarios (salutation, help, hors_domaine, incompréhensible)
- Sécurité : 3 scénarios (credentials, prompt injection, modification)
- Homonymes : 3 scénarios (résolution noms identiques)

**3 boucles de correction** ont amené le taux à 100 %. Notamment ajout d'une règle anti-conflit après détection sur un scénario réel.

---

# Veille — campagne MAJ proactive 15/06/2026

**Mise à jour 15 jours avant l'examen**

- Sources : OWASP, CERT-FR, Dependabot, blog Mistral
- `npm audit` : 0 CVE mais 25 paquets en retard
- **19 paquets mis à jour** (patches + mineures sûres)
- 6 majeures à risque reportées en V2 avec justification
- **0 régression**, 9 tests verts, prod redéployée

---

# Bilan en chiffres

**Ce qui a été livré**

- **4 entités** métier + 1 technique
- **9 modules** NestJS structurés
- **23 intents IA** (19 métier + 3 UX + 1 sécurité)
- **9 tests** Jest verts
- **100 %** infrastructure UE

Périmètre figé le 1er juin et respecté à 100 %. Pas de feature qui dépasse, pas de feature en moins.

---

# Scope conscient — V2 reportés

**Ce qui est volontairement absent**

- Scan OCR plaque moteur (lourd RGPD)
- Activation back du RBAC (UI déjà posée en V1, page Administration en preview)
- Multi-tenant SaaS
- Email automatique devis / facture
- Tests E2E Playwright + interface admin de consultation des logs IA

Pas un oubli, un choix : livrer un produit cohérent à 100 % plutôt qu'un patchwork à 60 %.

---

# Roadmap V2 RANKIA

**Le premier produit propre de ma société**

- **V2 commerciale** : V1 + scan OCR + multi-tenant + multi-rôles
- **Recherche IA améliorée** : pg_trgm pour la tolérance aux fautes
- **Mémoire conversationnelle** : suivi du fil de la conversation
- **Suggestions proactives** : question suivante recommandée
- **Mistral on-premise** : option pour clients exigeants

---

# Merci

**Une vraie utilité métier + une vraie rigueur tech**

Démo live : **https://nautilus-silk.vercel.app**
Code source : **github.com/INF-IAGAILLARDROMAIN/nautilus**
Contact : **Romain Gaillard** — Président RANKIA

*Je suis prêt à répondre à toutes vos questions.*
