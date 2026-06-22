```{=openxml}
<w:p><w:pPr><w:pStyle w:val="Title"/><w:spacing w:before="2400" w:after="0"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="56"/></w:rPr><w:t>Dossier Professionnel</w:t></w:r></w:p>
<w:p><w:pPr><w:spacing w:before="240" w:after="0"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="28"/></w:rPr><w:t>Titre Professionnel Développeur Web et Web Mobile</w:t></w:r></w:p>
<w:p><w:pPr><w:spacing w:before="80" w:after="0"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>RNCP 37674 — Session Juin-Juillet 2026</w:t></w:r></w:p>
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

# Identité du candidat

| Champ | Valeur |
|---|---|
| **Nom de naissance** | GAILLARD |
| **Nom d'usage** | GAILLARD |
| **Prénom** | Romain |
| **Adresse** | 8 rue de Lann er Scasse, 56690 Landévant |
| **Apprenant Studi n°** | 512363 |
| **Centre de formation** | Studi |
| **Session d'examen** | Lundi 29 juin 2026 — Bâtiment Rostand, Villepinte (93) |

## Titre professionnel visé

**Développeur web et web mobile** (RNCP 37674)

## Modalité d'accès

- ☒ Parcours de formation (CPF — Studi)
- ☐ Validation des Acquis de l'Expérience (VAE)

```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

# Présentation du dossier

Le dossier professionnel (DP) constitue un élément du système de validation du titre professionnel. Ce titre est délivré par le Ministère chargé de l'emploi (Arrêté du 22 décembre 2015). Le DP appartient au candidat ; il le conserve, l'actualise durant son parcours et le présente obligatoirement à chaque session d'examen. Il est consulté par le jury au moment de la session.

Ce dossier comporte, pour chacune des deux activités-types du titre visé, trois exemples de pratique professionnelle issus de missions réelles encadrées par INF-IA et/ou réalisées via la SASU RANKIA (dont je suis président fondateur), ainsi qu'un projet personnel (Vite & Gourmand — ECF) et un projet personnel destiné à la soutenance (Nautilus).

```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

# Sommaire

**Activité-type 1 — Développer la partie front-end d'une application web ou web mobile sécurisée**

- Exemple n° 1 — Site vitrine Kosmos Solutions (Astro 6 + îles React)
- Exemple n° 2 — Site vitrine ING+ (bureau d'études techniques BTP, Astro 6)
- Exemple n° 3 — Vite & Gourmand : front-end traiteur événementiel (Next.js 16)

**Activité-type 2 — Développer la partie back-end d'une application web ou web mobile sécurisée**

- Exemple n° 4 — Backend Winaxion : diagnostic 360° dirigeants TPE-PME (NestJS 10)
- Exemple n° 5 — Backend Vite & Gourmand : API REST PostgreSQL + MongoDB (NestJS 11)
- Exemple n° 6 — Backend Nautilus : agent IA souverain Mistral (NestJS 11)

**Annexes**

- Titres, diplômes, CQP, attestations de formation
- Déclaration sur l'honneur

```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

# Activité-type 1 — Développer la partie front-end d'une application web ou web mobile sécurisée

## EXEMPLE 1 — Site vitrine Kosmos Solutions

### Intitulé de l'activité-type
Développer la partie front-end d'une application web ou web mobile sécurisée.

### Intitulé de l'exemple
Je développe en architecture hybride Astro 6 + îles React le site vitrine d'une entreprise de destruction de nuisibles, avec un tunnel de devis multi-étapes et des pages dynamiques optimisées pour le SEO. Je conduis également la migration de la v1 Next.js vers la v2 Astro pour gagner en performance.

### 1. Tâches / opérations effectuées

Au sein de l'agence INF-IA, je prends en charge le développement intégral du front-end du site vitrine de Kosmos Solutions, entreprise de désinsectisation et dératisation située en Île-de-France. Mon mentor, Fabien Leyrissoux, dirigeant d'INF-IA, valide les choix techniques et l'architecture en amont.

Une première version (`kosmos-3d-frontend` v1) avait été développée en Next.js 16. Après analyse des Core Web Vitals et de l'objectif Lighthouse 100/100/100/100 fixé par le référentiel qualité interne RANKIA, je propose et conduis (en accord avec Fabien) la migration vers Astro 6 (`v2-astro`). Cette décision repose sur l'architecture en îles d'Astro : les pages sont rendues statiquement en HTML pur, et seuls les composants réellement interactifs sont hydratés côté client en React, ce qui réduit drastiquement le bundle JavaScript envoyé au navigateur.

Je structure l'arborescence Astro autour du file-based routing : pages statiques (`index.astro`, `a-propos.astro`, `garanties-et-certifications.astro`, `articles-de-presse.astro`, `plan-du-site.astro`, `teamkosmos.astro`), pages tarifaires une par nuisible traité (`tarifs-desinsectisation-punaises-de-lit.astro`, `tarifs-deratisation.astro`, `tarifs-blattes-cafards.astro`, `tarifs-guepes-et-frelons.astro`, etc.), pages dynamiques de blog (`blog.astro`, `blog-rongeurs.astro`, `blog-autres.astro`) et page de devis (`demande-de-devis.astro`). Pour chaque page, je rédige le frontmatter (title, description, JSON-LD) afin d'optimiser le référencement naturel.

Je conçois ensuite les composants de la homepage : `HeroHome`, `ProcessSteps`, `GoogleReviews`, `ServiceGrid`, `PricingSection`, `CoverageZone`, `TeamSection`, `FaqHome` et `CtaFinal`. Je mets en place un tunnel de devis en trois étapes (`DevisForm`) en **île React** qui utilise React Hook Form pour la gestion d'état et Zod pour la validation côté client. À la dernière étape, j'implémente une fonction `calculateEstimation` qui calcule une fourchette de prix selon la surface saisie et le type de traitement choisi, puis je redirige l'utilisateur vers une conversation WhatsApp pré-remplie.

Je configure les en-têtes HTTP de sécurité dans la configuration Astro et au niveau Vercel (Content-Security-Policy, HSTS, X-Frame-Options, X-Content-Type-Options, Permissions-Policy, Referrer-Policy) afin de répondre aux exigences OWASP et au pilier sécurité du référentiel qualité interne. Je veille au respect du RGPD (mentions légales, politique de confidentialité, bandeau cookies) et à l'accessibilité (contrastes, attributs `aria-*`, navigation clavier).

Enfin, je teste manuellement chaque parcours sur Chrome, Firefox et Safari, puis sur mobile via les DevTools, et je corrige les défauts d'affichage responsive avant la mise en recette client.

### 2. Moyens utilisés

- **Framework** : Astro 6.1 (architecture en îles, file-based routing, SSG)
- **Langage** : TypeScript 5 (mode strict)
- **UI** : React 19 (uniquement en îles hydratées), Tailwind CSS v4, shadcn/ui (variante base-nova)
- **Formulaires** : React Hook Form + Zod
- **Animation** : GSAP 3.14, Framer Motion 12
- **Icônes** : Lucide React
- **Notifications** : Sonner (toasts)
- **Contenu** : Astro Content Collections + MDX (blog)
- **Intégrations Astro** : `@astrojs/sitemap`, `@astrojs/react`, `@astrojs/tailwind`
- **Outils de développement** : VS Code, Git / GitHub, ESLint, Prettier
- **Méthodologie** : référentiel qualité interne RANKIA (10 piliers : performance, SEO, CRO, accessibilité, sécurité, RGPD, éco-conception, etc.)
- **Outils de suivi** : Jira (tickets KEVIN-82 à KEVIN-89), Notion
- **Hébergement** : Vercel (CDN Paris CDG1)

### 3. Avec qui avez-vous travaillé

- **Fabien Leyrissoux** — dirigeant d'INF-IA, mon mentor, qui valide l'architecture, les choix techniques et la conformité au référentiel qualité interne.
- **Kevin** — chef de projet / client interne Kosmos, qui fournit le cahier des charges, valide les maquettes et arbitre les itérations.
- **Karim Mahjoub** — COO d'INF-IA, qui apporte la stratégie commerciale et le tunnel de vente (positionnement du formulaire, choix des CTA).

### 4. Contexte

- **Entreprise** : INF-IA (agence digitale et conseil en IA, dirigeant Fabien Leyrissoux)
- **Client final** : Kosmos Solutions (destruction de nuisibles, Île-de-France)
- **Statut** : développeur front-end junior, en mission encadrée
- **Période** : avril à juin 2026
- **Durée** : environ 6 semaines de développement actif

### 5. Informations complémentaires

Ce projet m'a confronté à un arbitrage technologique réel : j'ai dû argumenter puis conduire la migration de la v1 Next.js vers la v2 Astro 6 sur la base d'une analyse des Core Web Vitals et du référentiel qualité interne. C'est la première fois que je prends une décision d'architecture qui revoit un choix initial, et cela m'a appris à formaliser un comparatif technique (taille de bundle, hydratation, SSG vs ISR) avant de proposer une bascule. L'architecture en îles m'a obligé à raisonner différemment qu'avec Next.js : décider explicitement quels composants ont besoin d'être interactifs côté client (et donc payer le coût de l'hydratation) versus quels composants restent du HTML pur statique. Le tunnel de devis multi-étapes avec validation Zod et redirection WhatsApp pré-remplie a démontré un taux de conversion satisfaisant dès la mise en ligne.

---

## EXEMPLE 2 — Site vitrine ING+ (bureau d'études techniques BTP)

### Intitulé de l'activité-type
Développer la partie front-end d'une application web ou web mobile sécurisée.

### Intitulé de l'exemple
Je développe en architecture hybride Astro + îles React le site vitrine d'un bureau d'études techniques du BTP, avec une thématisation contextuelle multi-segments (particulier, architecte, promoteur, syndic, collectivité).

### 1. Tâches / opérations effectuées

Toujours au sein de l'agence INF-IA et sous le mentorat de Fabien Leyrissoux, je prends en charge le front-end du site vitrine de l'entreprise ING+, bureau d'études techniques (NAF 7112B) situé à Villejust et spécialisé dans les pôles Structure, Fluides et Économie de la construction.

Je conçois directement l'application en **Astro 6** (sans phase Next.js intermédiaire) afin d'atteindre l'objectif Lighthouse 100/100/100/100 imposé par le référentiel qualité interne. Cette décision repose sur l'architecture en îles d'Astro : les pages sont rendues statiquement en HTML pur, et seuls les composants réellement interactifs sont hydratés côté client en React, ce qui réduit drastiquement le bundle JavaScript envoyé au navigateur — un avantage majeur pour un site vitrine BTP où la rapidité du premier rendu mobile est un critère commercial fort.

Je conçois ensuite l'arborescence métier multi-segments : `/` pour la homepage générique, `/particulier` pour les diagnostics fissures et expertises résidentielles, `/professionnel` avec ses cinq sous-segments (architecte, promoteur, entreprise BTP, collectivité, syndic), `/pole-structure`, `/pole-fluides`, `/pole-economie` pour les pages d'expertise, `/realisations` pour le portfolio, `/blog` pour les articles métier et `/admin` pour l'espace de gestion. Pour chaque segment, je mets en place une thématisation contextuelle (couleur de marque, logo variant, CTA ciblé) en utilisant des variables CSS personnalisées (`--text-primary`, `--bg-surface`, `--border`).

Je développe le composant `DevisForm.tsx`, une île React générique réutilisée par sept segments, avec validation côté client (regex e-mail et téléphone), gestion des erreurs et écran de succès. Je code également `BeforeAfterSlider` (comparateur visuel de réalisations), `IntroCinematic` (animation d'entrée), `Navbar` sticky avec scrollspy et menu responsive, et `WhatsAppButton` flottant.

Je configure l'authentification de l'espace admin via Magic Link Supabase, en m'appuyant sur l'Edge Middleware de Vercel pour protéger les routes `/admin/*` sans backend dédié. J'intègre Decap CMS afin que le client puisse rédiger des articles de blog en autonomie via une interface Markdown. Je termine par la mise en place du sitemap XML automatique (`@astrojs/sitemap`), du `robots.txt`, d'un fichier `llms.txt` (pilier GEO du référentiel) et des structures JSON-LD.

### 2. Moyens utilisés

- **Framework** : Astro 6.1 (architecture en îles, file-based routing)
- **Langage** : TypeScript 5
- **UI interactive** : React 19 via `@astrojs/react` (composants client-hydratés)
- **Styling** : Tailwind CSS 4.3 via `@tailwindcss/vite`, variables CSS personnalisées
- **Icônes** : Lucide React
- **Optimisation images** : Sharp via `astro/assets`
- **Contenu** : Astro Content Collections + MDX (blog)
- **Auth admin** : Magic Link Supabase + Edge Middleware Vercel
- **CMS** : Decap CMS (commits Git automatiques)
- **SEO** : `@astrojs/sitemap`, JSON-LD, llms.txt
- **Outils dev** : VS Code, Git / GitHub, ESLint
- **Hébergement** : Vercel (adapter officiel `@astrojs/vercel`, edge middleware activé)
- **Node** : version 22.12+
- **Suivi** : Jira, Notion, référentiel RANKIA

### 3. Avec qui avez-vous travaillé

- **Fabien Leyrissoux** — dirigeant d'INF-IA, mentor, qui valide le choix Astro 6 et l'architecture en îles.
- **Janvre** — référent client ING+, en charge de la rédaction du contenu via Decap CMS, qui valide les maquettes et le tunnel de devis.
- **Karim Mahjoub** — COO d'INF-IA, qui définit la stratégie commerciale par segment (particulier vs professionnel) et la cinématique des CTA.

### 4. Contexte

- **Entreprise** : INF-IA (agence digitale et conseil en IA)
- **Client final** : ING+ (bureau d'études BTP, SAS 9 employés, Villejust)
- **Statut** : développeur front-end junior, en mission encadrée
- **Période** : mars à mai 2026
- **Durée** : environ 8 semaines de développement actif sur Astro 6

### 5. Informations complémentaires

Ce projet m'a appris à concevoir une architecture en îles dès le départ, ce qui change radicalement la manière de penser un site vitrine par rapport à un framework SPA classique : il faut décider explicitement quels composants ont besoin d'être interactifs côté client (et donc payer le coût de l'hydratation) versus quels composants restent du HTML pur statique. La thématisation multi-segments avec sept variantes d'un même formulaire de devis a été l'occasion d'apprendre à factoriser des composants génériques tout en autorisant des variations visuelles fines via les variables CSS. C'est aussi le projet sur lequel j'ai le plus poussé l'intégration Decap CMS pour offrir au client une autonomie éditoriale complète sur le blog.

---

## EXEMPLE 3 — Vite & Gourmand : front-end d'une plateforme de traiteur événementiel

### Intitulé de l'activité-type
Développer la partie front-end d'une application web ou web mobile sécurisée.

### Intitulé de l'exemple
Je développe le front-end d'une application web complète permettant la commande en ligne de prestations traiteur événementiel, avec espace client authentifié, back-office d'administration et tunnel de commande responsive.

### 1. Tâches / opérations effectuées

Dans le cadre de l'Examen en Cours de Formation (ECF) de mon parcours Studi, je conçois et développe seul, sur une période de plusieurs mois, l'intégralité du front-end d'une application destinée à une traiteur événementielle fictive située à Bordeaux. Le projet est encadré pédagogiquement par mon formateur Studi qui valide les jalons.

Je commence par étudier le cahier des charges et produire les maquettes Figma de chaque parcours (visiteur, client connecté, administrateur). Je modélise ensuite 22 routes dans Next.js 16 en App Router : routes publiques (`/`, `/menus`, `/menus/:id`, `/contact`, `/connexion`, `/inscription`, `/mot-de-passe-oublie`, `/reset-password`, `/mentions-legales`, `/cgv`), routes authentifiées (`/mon-compte`, `/mon-compte/commandes`, `/mon-compte/commandes/:id`, `/commander/:menuId`) et routes d'administration (`/admin`, `/admin/commandes`, `/admin/menus`, `/admin/avis`, `/admin/horaires`, `/admin/employes`).

Je construis une bibliothèque de composants réutilisables avec TypeScript : `Button` (cinq variantes plus un état de chargement), `Input` et `Textarea` (avec validation visuelle), `Card` (animations Framer Motion), `Badge`. Je découpe la homepage en sections (`HeroSection`, `FeaturesSection`, `TestimonialsSection`, `CTASection`) et je mets en place le layout global (`Header`, `Footer`).

Je mets en place l'authentification côté front via un Context React (`AuthProvider`) qui stocke le JWT en `localStorage` et l'ajoute automatiquement aux en-têtes HTTP des appels API via un client centralisé (`lib/api.ts`). Je gère les états de chargement, les erreurs et les redirections (utilisateur non connecté redirigé vers `/connexion`, administrateur redirigé vers `/admin`).

Je développe le tunnel de commande (`/commander/:menuId`) avec sélection du nombre de personnes, calcul automatique du prix (avec réduction de 10 % si plus de 5 personnes), saisie de l'adresse de livraison et confirmation. Je termine par l'intégration SEO (métadonnées OpenGraph, sitemap XML, robots.txt, données JSON-LD type `Restaurant`), l'optimisation des polices (`next/font` avec Playfair Display et Inter), l'accessibilité (contrastes, navigation clavier) et le responsive mobile-first.

### 2. Moyens utilisés

- **Framework** : Next.js 16 (App Router)
- **Langage** : TypeScript 5
- **UI** : React 19, Tailwind CSS v4
- **Animation** : Framer Motion 12
- **Icônes** : Lucide React
- **Graphiques** : Recharts (dashboard back-office)
- **Maquettage** : Figma
- **Outils dev** : VS Code, Git / GitHub
- **Tests manuels** : DevTools Chrome, BrowserStack
- **Hébergement** : Vercel
- **Méthodologie** : cycle en V allégé (cahier des charges, maquettes, dev, tests, recette)

### 3. Avec qui avez-vous travaillé

- **Formateur Studi** — qui valide le cahier des charges, les maquettes et les jalons techniques.
- Aucun autre développeur : je suis seul sur le projet, ce qui a renforcé mon autonomie sur l'ensemble du cycle (conception, dev, tests, déploiement).

### 4. Contexte

- **Centre de formation** : Studi — parcours **Graduate Développeur IA** préparant au Titre Pro Développeur Web et Web Mobile (RNCP 37674)
- **Projet** : Examen en Cours de Formation (ECF), rendu en février 2026
- **Statut** : candidat-stagiaire, en autoformation encadrée
- **Période** : septembre 2025 à février 2026
- **Durée** : environ 5 mois (en parallèle des autres modules)

### 5. Informations complémentaires

Ce projet a été ma première application web complète avec un back-office et une authentification, et il m'a permis de valider l'examen ECF avec succès. L'autonomie totale (pas de mentor ni d'équipe) m'a appris à me documenter seul, à choisir mes outils, à arbitrer entre fonctionnalités prioritaires et secondaires, et à livrer un produit fonctionnel dans les délais imposés par le centre de formation. Le code source reste consultable sur mon GitHub (`INF-IAGAILLARDROMAIN/vite-et-gourmand`) et l'application est déployée en production sur Vercel.

---

# Activité-type 2 — Développer la partie back-end d'une application web ou web mobile sécurisée

## EXEMPLE 4 — Backend Winaxion : diagnostic 360° pour dirigeants de TPE-PME

### Intitulé de l'activité-type
Développer la partie back-end d'une application web ou web mobile sécurisée.

### Intitulé de l'exemple
Je conçois et développe en autonomie totale, via ma société RANKIA, le back-end NestJS d'une application de diagnostic stratégique 360° pour dirigeants de TPE-PME, incluant API REST, persistance PostgreSQL, rate-limiting, envoi d'e-mails transactionnels et notification commerciale temps réel.

### 1. Tâches / opérations effectuées

Au sein de ma société RANKIA (SASU créée le 21 avril 2026), je signe avec Karim Mahjoub (consultant et coach business pour dirigeants de TPE-PME) une prestation full-stack pour son outil Winaxion. Je suis seul responsable du projet, en autonomie totale (pas de mentor sur cette mission, contrairement aux missions encadrées par INF-IA).

Je conçois l'architecture back-end en NestJS 10 selon le pattern modulaire imposé par le framework. Je découpe le code en cinq modules métier : `DiagnosticModule` (cœur métier, controller et service), `CoreModule` (client HTTP vers un micro-service IA externe `winaxion-core`), `EmailModule` (intégration Resend pour les e-mails transactionnels), `RateLimitModule` (protection anti-abus par IP) et `PrismaModule` (couche d'abstraction de la base).

Je modélise la base de données dans Prisma 5 avec trois entités : `DiagnosticResult` (résultats des questionnaires avec scores JSON par catégorie, problème dominant, source du clic), `DiagnosticSession` (suivi de la progression utilisateur via fingerprint) et `RateLimit` (compteur anti-abus). Je provisionne PostgreSQL chez Supabase et je gère les migrations via `prisma db push`.

Je code les endpoints REST de l'API : `GET /api/diagnostic/questions` (récupération des 48 questions), `POST /api/diagnostic/submit` (soumission des réponses, scoring délégué au micro-service Core), `POST /api/diagnostic/report` (envoi du rapport par e-mail au prospect et notification simultanée à Karim), `POST /api/diagnostic/session` et `POST /api/diagnostic/session/step` (création et persistance de la progression), `GET /api/health` (healthcheck). Chaque endpoint est typé strictement via des DTO `class-validator` avec validation globale (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`).

J'implémente la sécurité côté serveur : configuration CORS via variable d'environnement `ALLOWED_ORIGIN`, rate-limiting glissant en base (3 soumissions par heure et par IP, 2 e-mails par heure et par IP), authentification de service par en-tête `x-api-key` pour appeler le micro-service Core. Je mets en place une stratégie de dégradation gracieuse : si la base de données ou Resend est indisponible, le service log un warning mais continue de répondre, évitant un échec critique pour le prospect.

Je rédige le service `EmailService` qui génère un e-mail HTML riche (tableau de scores par domaine, réponses sectionnées, code couleur par catégorie) et qui envoie simultanément le rapport au prospect et une notification commerciale détaillée à Karim, permettant une réaction lead en quelques minutes.

Je déploie finalement le back-end sur Railway, je configure les variables d'environnement de production (DATABASE_URL, RESEND_API_KEY, CORE_API_URL, CORE_API_KEY) et je rédige le `README.md` complet.

### 2. Moyens utilisés

- **Framework** : NestJS 10.3 (architecture modulaire, injection de dépendances)
- **Langage** : TypeScript 5 (mode strict)
- **Runtime** : Node.js 20+
- **Plateforme HTTP** : Express
- **ORM** : Prisma 5.14
- **Base de données** : PostgreSQL via Supabase (région Paris)
- **Validation** : class-validator, class-transformer, ValidationPipe globale
- **Sécurité** : CORS configurable, Helmet, rate-limiting maison stocké en BDD
- **E-mails** : Resend
- **Outils dev** : VS Code, Git / GitHub, ESLint, Prettier
- **Tests** : Jest (configuré, suites unitaires à compléter post-MVP)
- **Hébergement** : Railway (back-end), Supabase (base), Vercel (front-end)
- **Outils de suivi** : Jira, Notion

### 3. Avec qui avez-vous travaillé

- **Karim Mahjoub** — client commanditaire et utilisateur métier, qui fournit le cahier des charges (48 questions, scoring par domaine, format du rapport, exigences commerciales) et valide les livrables.
- Aucun autre développeur : je suis seul sur le projet, en autonomie totale via RANKIA. Pas de mentor sur cette mission.

### 4. Contexte

- **Entreprise** : RANKIA (SASU créée le 21 avril 2026, SIREN 104 046 610, président Romain Gaillard)
- **Client** : Karim Mahjoub (consultant indépendant pour dirigeants de TPE-PME)
- **Statut** : président de RANKIA, développeur full-stack en autonomie totale
- **Période** : mars à juin 2026
- **Durée** : environ 10 semaines de développement actif

### 5. Informations complémentaires

Ce projet a une dimension particulière puisqu'il s'agit de ma première prestation signée à mon nom via ma société RANKIA, sans le filet de sécurité du mentorat INF-IA. J'ai dû assumer seul l'ensemble des choix d'architecture (NestJS modulaire), le découpage en micro-services (Backend infra vs Core IA), la stratégie de sécurité (rate-limiting, CORS, dégradation gracieuse) et la relation client. J'ai été particulièrement satisfait du pattern de dégradation gracieuse, qui m'a appris qu'un back-end professionnel ne doit jamais casser intégralement parce qu'un service tiers est temporairement indisponible. Le système de notification commerciale temps réel (Karim averti à chaque lead complet) a permis à mon client d'augmenter sa vitesse de conversion.

---

## EXEMPLE 5 — Backend Vite & Gourmand : API REST sécurisée avec PostgreSQL et MongoDB

### Intitulé de l'activité-type
Développer la partie back-end d'une application web ou web mobile sécurisée.

### Intitulé de l'exemple
Je développe le back-end NestJS d'une application de commande en ligne traiteur, avec une API REST de 28 endpoints, une persistance hybride PostgreSQL / MongoDB, une authentification JWT avec contrôle d'accès par rôle, et un workflow de commande à 8 statuts.

### 1. Tâches / opérations effectuées

Dans le cadre du même projet ECF Studi (voir exemple 3 pour le front-end), je conçois et développe seul le back-end de l'application Vite & Gourmand. Le formateur Studi valide les jalons et la conformité au cahier des charges.

Je structure le back-end en NestJS 11 selon une architecture modulaire stricte. Je découpe le code en sept modules métier : `AuthModule` (inscription, connexion, profil, mot de passe oublié, réinitialisation), `MenuModule` (gestion CRUD des menus), `CommandeModule` (workflow de commande à 8 statuts), `AvisModule` (modération des avis clients), `HoraireModule` (gestion des horaires d'ouverture), `AdminModule` (statistiques et gestion des employés) et `MailModule` (envoi de mails via Nodemailer).

Je modélise la base de données relationnelle dans Prisma 7 avec 12 entités : `Role`, `Utilisateur`, `Menu`, `MenuImage`, `Plat`, `Allergene`, `Theme`, `Regime`, `Commande`, `CommandeHistorique`, `Avis`, `Horaire`. Je définis les clés étrangères pour le contrôle d'accès par rôle (RBAC) et les relations entre menus, plats, allergènes et thèmes. J'ajoute en parallèle une base MongoDB Atlas via Mongoose pour les statistiques agrégées (chiffre d'affaires, commandes par menu, suivi temporel), démontrant la maîtrise du paradigme NoSQL et la cohabitation SQL/NoSQL dans une même application.

Je code les 28 endpoints REST de l'API, organisés par module : authentification (5 endpoints incluant la procédure complète de réinitialisation de mot de passe), menus (CRUD complet), commandes (création, lecture, mise à jour de statut, annulation), avis (création, modération, validation), horaires, contact et administration. Chaque endpoint est typé strictement via des DTO `class-validator`.

J'implémente la sécurité en profondeur : hachage des mots de passe via `bcrypt` avec 12 rounds de salage, tokens JWT signés avec expiration et stratégie Passport, contrôle d'accès par rôle via deux gardes NestJS (`JwtAuthGuard` et `RolesGuard`), validation stricte des entrées (`whitelist`, `forbidNonWhitelisted`, `transform`), configuration CORS, protection anti-énumération sur la route `forgot-password` (réponse identique que l'e-mail existe ou non), exigence d'un mot de passe fort (10 caractères minimum, majuscule, minuscule, chiffre, caractère spécial).

Je modélise le workflow de commande à 8 statuts : Reçue → Acceptée → En préparation → En livraison → Livrée → Attente retour matériel → Terminée, avec possibilité d'annulation jusqu'à l'étape « En préparation ». Chaque transition est tracée dans `CommandeHistorique` pour audit.

J'écris des tests unitaires Jest sur les services critiques (`auth.service.spec.ts`, `menu.service.spec.ts`, `app.controller.spec.ts`) totalisant environ 387 lignes de tests. Je rédige enfin la documentation technique (`README.md`, guide de déploiement, manuel utilisateur) et je déploie le back-end sur Railway, la base PostgreSQL sur Neon et la base MongoDB sur Atlas.

### 2. Moyens utilisés

- **Framework** : NestJS 11 (architecture modulaire)
- **Langage** : TypeScript 5
- **ORM SQL** : Prisma 7.4
- **ODM NoSQL** : Mongoose 9.x
- **Base de données** : PostgreSQL 16 via Neon (relations métier), MongoDB Atlas (statistiques)
- **Authentification** : JWT signé, Passport, bcrypt (12 rounds)
- **Validation** : class-validator, class-transformer
- **E-mails** : Nodemailer 8.x
- **Tests** : Jest (3 fichiers `.spec.ts`)
- **Outils dev** : VS Code, Git / GitHub, ESLint, Prettier
- **Hébergement** : Railway (back-end), Neon (PostgreSQL), MongoDB Atlas
- **Documentation** : Markdown (README, guide de déploiement, manuel utilisateur)

### 3. Avec qui avez-vous travaillé

- **Formateur Studi** — qui valide le cahier des charges, les jalons et la conformité au référentiel TP DWWM.
- Aucun autre développeur : je suis seul sur le projet, ce qui a renforcé mon autonomie sur l'ensemble du cycle back-end (conception, code, tests, déploiement, documentation).

### 4. Contexte

- **Centre de formation** : Studi — parcours **Graduate Développeur IA** préparant au Titre Pro Développeur Web et Web Mobile (RNCP 37674)
- **Projet** : Examen en Cours de Formation (ECF), rendu en février 2026
- **Statut** : candidat-stagiaire, en autoformation encadrée
- **Période** : septembre 2025 à février 2026
- **Durée** : environ 5 mois en parallèle des autres modules

### 5. Informations complémentaires

Ce projet a été l'occasion d'apprendre la cohabitation entre une base relationnelle (PostgreSQL via Prisma) et une base documentaire (MongoDB via Mongoose) dans une même application NestJS, ce qui est une compétence rarement abordée en formation initiale. J'ai également mis en place pour la première fois un contrôle d'accès par rôle (RBAC) avec deux gardes successifs (`JwtAuthGuard` puis `RolesGuard`) et une protection anti-énumération sur la procédure de réinitialisation de mot de passe, exigences essentielles d'un back-end professionnel. Les seules limites identifiées en rétrospective sont le stockage des tokens de réinitialisation en mémoire (à migrer vers Redis en production) et la couverture de tests perfectible (3 suites unitaires), points que je documente honnêtement dans le `README.md` comme axes d'amélioration.

---

## EXEMPLE 6 — Backend Nautilus : agent IA souverain de recherche en langage naturel

### Intitulé de l'activité-type
Développer la partie back-end d'une application web ou web mobile sécurisée.

### Intitulé de l'exemple
Je conçois et développe le module IA d'un back-end NestJS permettant à un utilisateur d'interroger en langage naturel la base de données d'un atelier nautique, avec un agent LLM Mistral (souverain français) restreint en lecture seule, 23 intents métier, 4 catégories de refus de sécurité et journalisation des requêtes en MongoDB.

### 1. Tâches / opérations effectuées

Dans le cadre de mon projet personnel Nautilus (logiciel de gestion d'atelier nautique destiné à présenter ma soutenance TP DWWM), je conçois et développe le back-end accompagné par Fabien Leyrissoux (INF-IA) qui joue un rôle de mentor technique non rémunéré. Je suis seul sur le code.

Je commence par modéliser le domaine métier dans Prisma 6 avec les entités principales : `Client`, `Bateau`, `Devis`, `LigneDevis`, `OrdreReparation` et `Facture`. Je provisionne une base PostgreSQL chez Neon et j'écris un script de seed avec 32 marques de bateaux et 18 marques de moteurs récupérées par scraping pour donner au LLM un contexte métier réaliste.

Je conçois ensuite le cœur du projet : le module `recherche-ia/`, qui permet à l'utilisateur de poser une question en français (« montre-moi les ordres de réparation urgents », « quels sont les derniers devis du client Dupont ? ») et de recevoir une réponse structurée extraite de la base. J'implémente un pattern Intent + Entities : la question est envoyée au LLM Mistral avec un prompt système de plus de 1200 lignes incluant 23 intents (19 intents métier comme `find_bateau`, `find_client_by_name`, `find_or_by_client`, `list_or_urgents`, `find_facture_by_numero`, `list_recent_clients` ; 3 intents UX comme `salutation`, `help`, `hors_domaine` ; 1 intent de sécurité `securite_refus`) et 58 règles d'arbitrage avec 38 exemples few-shot pour résoudre les ambiguïtés. Le LLM est configuré en température 0.0 et `response_format: json` pour garantir le déterminisme et empêcher toute génération de SQL.

Je mets en place une sécurité stricte en 4 catégories de refus : `credentials` (identifiants et mots de passe), `rgpd` (salaires, fiches de paie, RH), `confidentiel` (marges, bénéfices, données concurrents) et `manipulation` (tentatives de suppression, modification ou prompt injection — le back-end est en lecture seule). Aucune requête SQL n'est jamais générée par le LLM : c'est le service NestJS qui, à partir de l'intent et des entités extraites, appelle les méthodes Prisma typées correspondantes.

Je connecte une seconde base MongoDB Atlas via Mongoose pour journaliser toutes les requêtes IA dans une collection `recherche_logs` (modèle `RechercheLog` avec userId, e-mail, question, intent, entities, nombre de résultats, temps de réponse, statut, fournisseur LLM, modèle, nombre de tokens consommés). Cette base sert à l'audit RGPD, au monitoring qualité de l'agent et à la facturation.

Je sécurise le back-end avec un `SupabaseJwtGuard` qui valide les tokens JWT asymétriques (ES256) via la bibliothèque `jose` avec récupération dynamique du JWKS Supabase, Helmet pour le durcissement des en-têtes HTTP, un `ThrottlerGuard` pour le rate-limiting global, un CORS multi-origines configurable et une `ValidationPipe` globale stricte. J'écris des tests Jest sur les modules clients, devis, PDF et journalisation IA (9 tests verts), et je déploie sur Railway.

### 2. Moyens utilisés

- **Framework** : NestJS 11.0 (architecture modulaire)
- **Langage** : TypeScript 5.7
- **ORM SQL** : Prisma 6.0 (PostgreSQL via Neon)
- **ODM NoSQL** : Mongoose 9.7 (MongoDB Atlas pour les logs IA)
- **LLM** : `@mistralai/mistralai` 2.2, modèle `mistral-small-latest` (souverain français)
- **Sécurité** : Helmet 8, `@nestjs/throttler` 6.4, `jose` 6.2 (JWT asymétrique Supabase ES256)
- **Validation** : class-validator (DTO stricts, longueur question 2-500 caractères)
- **Génération PDF** : pdfkit (devis, ordres de réparation, factures)
- **Tests** : Jest (suites clients, devis, pdf, recherche-log)
- **Outils dev** : VS Code, Git / GitHub, ESLint, Prettier, Claude Code (assistance IA)
- **Outils de suivi** : Jira, Notion
- **Hébergement** : Railway (backend), Neon (PostgreSQL), MongoDB Atlas (logs IA), Vercel (frontend Next.js)
- **Secrets** : 1Password vault dédié `nautilus`

### 3. Avec qui avez-vous travaillé

- **Fabien Leyrissoux** — dirigeant d'INF-IA, mon mentor sur le projet personnel Nautilus, qui valide l'architecture (notamment le choix Mistral souverain plutôt qu'OpenAI), le pattern Intent + Entities, et la stratégie de sécurité en 4 catégories de refus.
- Aucun autre développeur : je suis seul sur le code, le projet est personnel et destiné à la soutenance TP DWWM.

### 4. Contexte

- **Cadre** : projet personnel Nautilus, destiné à la soutenance TP DWWM du 29 juin 2026
- **Mentorat** : non rémunéré, assuré par Fabien Leyrissoux (INF-IA)
- **Statut** : candidat TP DWWM, développeur full-stack en autonomie
- **Période** : avril à juin 2026
- **Durée** : environ 8 semaines de développement actif

### 5. Informations complémentaires

Le choix de Mistral plutôt qu'OpenAI ou Anthropic est volontaire et stratégique : Mistral est un LLM souverain français, l'argument d'IA souveraine étant porteur en France, notamment dans le secteur de la défense (cible d'alternance que je vise par ailleurs via le service de santé des armées). Le pattern Intent + Entities avec refus à 4 catégories démontre une compréhension fine des risques d'usage d'un LLM côté serveur (prompt injection, divulgation, hallucination, RGPD) qui dépasse la simple intégration d'API. La règle absolue selon laquelle le LLM ne génère jamais de SQL — c'est le code NestJS qui exécute les requêtes Prisma typées à partir de l'intent — m'a appris qu'un agent IA professionnel doit être un classificateur de questions, pas un exécuteur de code. Enfin, la journalisation MongoDB de chaque requête IA répond à une exigence RGPD réelle (traçabilité) et constitue une base pour le monitoring qualité de l'agent (taux de refus, intents les plus fréquents, temps de réponse, coût en tokens).

---

```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

# Titres, diplômes, CQP, attestations de formation

| Intitulé | Autorité ou organisme | Date |
|---|---|---|
| Attestation d'entrée en formation TP DWWM | Studi (CPF) | 29/05/2026 |
| Attestation Graduate Développeur IA | Studi | 25/05/2026 |
| *(autre titre ou diplôme à ajouter si applicable)* | | |

```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

# Déclaration sur l'honneur

Je soussigné **Romain Gaillard**, candidat au Titre Professionnel Développeur Web et Web Mobile (RNCP 37674), session Juin-Juillet 2026, déclare sur l'honneur que les renseignements fournis dans ce dossier sont exacts et que je suis l'auteur des réalisations jointes.

Fait à **Landévant**, le _\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

pour faire valoir ce que de droit.

**Signature du candidat :**

\

\

\

**Romain Gaillard** — Président de RANKIA SASU — Apprenant Studi n° 512363
