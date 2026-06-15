# 7. Veille sur les vulnérabilités de sécurité

> Section exigée par le référentiel TP DWWM : décrire la **veille effectuée durant le projet** sur les vulnérabilités, lister celles qui ont été identifiées, et expliquer les corrections apportées.

## 7.1 Méthode de veille mise en place

J'ai construit ma veille de sécurité autour de **cinq sources complémentaires**, consultées à des fréquences différentes selon leur criticité.

### 7.1.1 Sources consultées régulièrement

| Source | Périmètre | Fréquence | Format |
|---|---|---|---|
| **OWASP Top 10** (web) | Vulnérabilités applicatives génériques | À chaque démarrage de chantier | Documentation officielle |
| **OWASP API Security Top 10** | Vulnérabilités spécifiques aux API REST | À chaque ajout d'endpoint | Documentation officielle |
| **OWASP Top 10 for LLM Applications** | Vulnérabilités spécifiques aux applications IA (prompt injection, sensitive information disclosure, etc.) | À chaque évolution de l'agent IA | Documentation officielle |
| **CERT-FR / ANSSI** | Alertes officielles françaises | Hebdomadaire | Bulletins email |
| **GitHub Security Advisories + Dependabot** | Vulnérabilités sur les dépendances npm utilisées | En temps réel (alertes automatiques) | Issues automatiques dans le repo |

### 7.1.2 Outils automatisés intégrés au workflow

| Outil | Rôle | Fréquence |
|---|---|---|
| `npm audit` | Scan des vulnérabilités des dépendances directes et transitives | À chaque `npm install`, et systématiquement avant chaque commit majeur |
| **Dependabot** | Alertes + PRs automatiques pour les mises à jour de sécurité | Activé sur le repo GitHub `INF-IAGAILLARDROMAIN/nautilus` |
| **helmet** (NestJS) | Application automatique des headers HTTP de sécurité (X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, etc.) | Au démarrage du back |
| **ValidationPipe** (NestJS) | Rejet automatique des payloads malformés et des champs non déclarés (anti-injection) | À chaque requête |
| **class-validator** | Validation déclarative des DTOs (type, longueur, format) | À chaque requête |

### 7.1.3 Fréquence et discipline de veille

- **Veille passive** quotidienne : ouverture des alertes Dependabot reçues dans la nuit.
- **Veille active** hebdomadaire : revue des bulletins CERT-FR + lecture des évolutions de l'OWASP LLM Top 10.
- **Audit interne** à chaque fin de bloc majeur (déploiement, refonte d'un module) : passage en revue de la liste OWASP Top 10 et confrontation avec le code récent.

## 7.2 Vulnérabilités identifiées et corrections apportées

Voici les vulnérabilités et risques de sécurité que j'ai détectés au cours du développement de Nautilus, et les corrections que j'ai apportées.

### 7.2.1 Tableau récapitulatif

| # | Vulnérabilité / risque | Source de détection | Sévérité | Correction apportée | Date |
|---|---|---|---|---|---|
| 1 | **Prompt injection** sur l'endpoint `/api/recherche` (OWASP LLM01) | Veille proactive OWASP LLM Top 10 | **Élevée** | Pattern « Intent + Entities » : le LLM ne génère JAMAIS de SQL, il choisit parmi 20 intents pré-codés. Aucune chaîne utilisateur n'arrive dans une requête SQL. | 04/06/2026 |
| 2 | **Sensitive information disclosure** : risque que le LLM révèle des credentials demandés naïvement (OWASP LLM02) | Veille OWASP LLM Top 10 | **Élevée** | Ajout d'un intent dédié `securite_refus` avec catégorie `credentials`. Réponse standardisée + log MongoDB de toute tentative pour audit. | 12/06/2026 |
| 3 | **Insecure output handling** : LLM qui exécuterait des instructions cachées dans l'entrée utilisateur (OWASP LLM02) | Veille OWASP LLM Top 10 | **Élevée** | Règles S4 et S5 du SYSTEM_PROMPT : refus systématique de toute demande de modification (« supprime », « modifie », « efface ») et de toute tentative de manipulation (« ignore tes consignes »). 4 catégories de refus logguées. | 12/06/2026 |
| 4 | **CORS multi-origines mal géré** (violation RFC) | Tests live en prod | **Moyenne** | Le navigateur rejetait la réponse car le header `Access-Control-Allow-Origin` contenait plusieurs origines séparées par virgule. Correction : split de `CORS_ORIGIN` côté NestJS pour n'envoyer qu'une seule origine par réponse, conforme à la RFC. | 11/06/2026 (commit `91951d0`) |
| 5 | **Exposition d'email professionnel** dans le code (few-shot example contenant `rgaillard@inf-ia`) | Audit interne pré-examen | **Faible** | Anonymisation : remplacement par `jean@dupont.fr` dans le SYSTEM_PROMPT. | 12/06/2026 (commit `bf1068a`) |
| 6 | **Téléphone personnel** dans le service PDF (`06 35 25 10 30`) | Audit interne pré-déploiement | **Faible** | Anonymisation : remplacement par `06 XX XX XX XX` dans le template PDF. | 11/06/2026 (commit `546b59f`) |
| 7 | **Recherche par nom non splittée** : `"Martin Pierre"` retournait 0 résultat car la recherche était littérale | Audit + jeu d'essai | **Faible** (UX, pas sécurité) | Helper `buildClientWhere` qui split le nom sur les espaces et cherche chaque mot dans `(nom OR prénom)`. | 12/06/2026 |
| 8 | **Risque DDoS interne** : un utilisateur malveillant pourrait demander `quantite=10000` et faire ramer la BDD | Audit du code IA | **Moyenne** | Plafond `MAX_QUANTITE = 50` côté code, indépendamment de ce que demande le LLM ou l'utilisateur. | 12/06/2026 |
| 9 | **Scraping de coordonnées clients** via téléphone partiel (`06`) qui ramènerait 90 % des clients | Audit du code IA | **Moyenne** | Minimum 4 chiffres pour la recherche par téléphone, minimum 3 caractères pour l'email. Message d'erreur clair côté UI. | 12/06/2026 |

### 7.2.2 Audit `npm audit` final

Au moment de la finalisation du dossier, l'audit npm sur les dépendances de production retourne :

```
Back NestJS  : 0 vulnerabilities
Front Next.js : 0 vulnerabilities
```

Aucune vulnérabilité connue dans les dépendances directes ou transitives.

### 7.2.3 Détails sur les risques IA (OWASP LLM Top 10)

L'application Nautilus intègre un agent IA, ce qui ouvre une **surface d'attaque spécifique** différente des applications web classiques. J'ai cartographié les 10 risques de l'OWASP LLM Top 10 et la couverture de Nautilus :

| OWASP LLM | Risque | Couverture Nautilus |
|---|---|---|
| LLM01 | Prompt Injection | ✅ Pattern « Intent + Entities » + règle S5 (refus manipulation) |
| LLM02 | Sensitive Information Disclosure | ✅ Intent `securite_refus` catégorie `credentials` + `rgpd` |
| LLM03 | Training Data Poisoning | ➖ Non applicable (Mistral est un modèle pré-entraîné, je ne le ré-entraîne pas) |
| LLM04 | Model Denial of Service | ✅ Rate limiting (ThrottlerModule NestJS) + plafond `MAX_QUANTITE` |
| LLM05 | Supply Chain Vulnerabilities | ✅ `npm audit` + Dependabot sur le SDK Mistral |
| LLM06 | Sensitive Information Disclosure in Response | ✅ Le LLM n'a JAMAIS accès aux données métier — il classifie, le code Prisma fetche, donc impossible qu'il fuite des données |
| LLM07 | Insecure Plugin Design | ➖ Non applicable (pas de plugins) |
| LLM08 | Excessive Agency | ✅ LLM en lecture seule strict, intent `securite_refus` catégorie `manipulation` |
| LLM09 | Overreliance | ✅ Vision produit assumée : « l'IA restitue, l'humain décide » — le mécano voit toujours les données brutes |
| LLM10 | Model Theft | ➖ Non applicable (modèle hébergé chez Mistral) |

## 7.3 Vulnérabilités non corrigées et raisons

Trois limitations connues subsistent en V1 et sont **assumées** comme choix conscient pour le périmètre examen :

### 7.3.1 Pas de chiffrement at-rest des logs MongoDB

- **Risque** : si la base Mongo Atlas fuit, l'historique des questions tapées par les utilisateurs serait visible en clair.
- **Pourquoi non corrigé V1** : les questions ne contiennent pas de secrets (juste des noms de clients déjà présents dans la BDD principale). Atlas applique déjà un chiffrement disque par défaut au niveau infrastructure.
- **Roadmap V2** : activation du **chiffrement at-rest applicatif** (champ par champ) si Nautilus passe en multi-tenant.

### 7.3.2 Pas de mémoire conversationnelle sur l'IA

- **Risque** : aucune, c'est un choix volontaire.
- **Pourquoi non corrigé V1** : le pattern « Intent + Entities » fonctionne mieux avec des questions auto-suffisantes, et les mécaniciens en atelier posent des questions courtes et ciblées (pas des dialogues).
- **Roadmap V2** : ajout d'une table `Conversation` + ré-injection contrôlée de l'historique récent dans le prompt.

### 7.3.3 Mono-tenant (un seul atelier dans la base)

- **Risque** : tous les utilisateurs voient l'ensemble des clients de l'atelier.
- **Pourquoi non corrigé V1** : un atelier nautique a typiquement une équipe < 10 personnes qui ont besoin de tout voir.
- **Roadmap V2** : cloisonnement par `atelierId` + politique `Row-Level Security` PostgreSQL si Nautilus est commercialisé en multi-ateliers (version commerciale RANKIA).

## 7.4 Bilan et perspectives

### 7.4.1 Posture sécurité globale du projet

Nautilus a été conçu avec une approche **« security by design »** :

- **Authentification obligatoire** sur toutes les routes API (JWT ES256 via Supabase).
- **Validation systématique** des entrées (DTOs + class-validator).
- **CORS strict** (multi-origines explicites, pas de wildcard).
- **Headers de sécurité** (helmet) appliqués automatiquement.
- **Rate limiting** sur les routes coûteuses (IA, auth).
- **LLM en lecture seule** avec refus catégorisés et traçabilité MongoDB.
- **Aucun secret en dur** dans le code (vault 1Password + variables d'environnement).
- **Toute l'infrastructure en UE** (Frankfurt, Paris, Pays-Bas) pour conformité RGPD.

### 7.4.2 Améliorations envisagées post-MVP

| # | Amélioration | Priorité |
|---|---|---|
| 1 | Audit de pénétration externe (pentest) avant mise en commercialisation | Haute |
| 2 | Activation de la 2FA (TOTP) sur Supabase pour les comptes chefs d'atelier | Haute |
| 3 | Chiffrement at-rest applicatif des logs MongoDB | Moyenne |
| 4 | Migration vers Mistral on-premise pour les clients à exigences RGPD renforcées | Moyenne |
| 5 | Tests de charge automatisés (k6 / Artillery) sur l'endpoint `/api/recherche` | Moyenne |
| 6 | Certification ISO 27001 ou SOC 2 quand Nautilus passera en version commerciale RANKIA | Long terme |

### 7.4.3 Sources de veille à continuer en exploitation

- **Newsletter OWASP** (hebdomadaire)
- **CERT-FR** (bulletins quotidiens)
- **OWASP LLM Top 10** (évolution semestrielle attendue)
- **Dependabot GitHub** (alertes temps réel)
- **Blog Mistral AI** (évolutions du modèle, nouvelles politiques de sécurité)

La veille est **partie intégrante du cycle de vie produit** chez RANKIA, pas une tâche ponctuelle de fin de chantier.
