# Arguments oraux pour l'examen Studi du 29/06/2026

> Document **vivant** : centralise toutes les phrases prêtes à dire au jury pendant la démo orale (45 min).
> Mis à jour à chaque nouvelle décision/explication importante prise pendant le développement.
> Toutes les phrases sont en **français** (l'oral se passe en français).
> Dernière mise à jour : **2026-06-08**.

---

## 🏗️ 1 — Architecture & choix techniques

### 1.1 Choix TanStack Query côté front

> *"J'ai choisi TanStack Query parce qu'il élimine tout le code répétitif de gestion de requêtes : loading, erreur, cache, retry. C'est la lib standard 2026, utilisée par GitHub, Vercel et Shopify en production, sous licence MIT donc gratuite et auditable."*

### 1.2 Architecture front + back + BDD séparés

> *"L'application est décomposée en trois couches : un frontend Next.js sur le port 3000, un backend NestJS sur le port 4001, et la base PostgreSQL sur Neon. Ce découplage est volontaire : la base de données n'est jamais exposée directement au navigateur, le frontend doit toujours passer par le backend qui contrôle ce qu'il accepte. Demain, si je veux faire une application mobile, elle parlera à la même API."*

### 1.3 Multi-BDD (SQL + NoSQL — exigence référentiel)

> *"PostgreSQL stocke les données métier structurées et relationnelles : clients, bateaux, devis et ordres de réparation. Ces données ont des relations fortes et nécessitent des transactions ACID. MongoDB sera utilisé pour stocker l'historique des recherches IA : ce sont des données semi-structurées (question texte libre, réponse variable) volumineuses, à requêter en plein texte. C'est le cas d'usage naturel du NoSQL."*

### 1.4 Convention de routage Next.js App Router (file-based routing)

> *"L'avantage de Next.js App Router, c'est le routage par convention de fichiers : la structure des dossiers dans `src/app/` définit directement mes routes. C'est explicite, lisible, impossible à se tromper. Pour ajouter une nouvelle page, je crée un dossier et un fichier `page.tsx` — la route existe automatiquement."*

### 1.5 Migration `middleware.ts` → `proxy.ts` (Next.js 16)

> *"Next.js 16 a renommé la convention `middleware` en `proxy` pour mieux refléter son rôle. J'ai détecté l'avertissement de dépréciation dans les logs, lu la documentation locale du paquet `next` dans `node_modules`, et migré proprement. C'est un détail qui montre que je suis l'évolution des frameworks que j'utilise."*

---

## 🔐 2 — Sécurité

### 2.1 Authentification Supabase ES256 (asymétrique)

> *"Pour la vérification des JWT côté backend, j'utilise des clés asymétriques ES256 (courbe elliptique P-256) — le même standard que Auth0, Okta ou Google. La clé privée reste chez Supabase, le backend récupère uniquement la clé publique via un endpoint JWKS standard. Avantage : aucun secret à protéger côté serveur, et la rotation se fait automatiquement."*

### 2.2 Défense en profondeur (deux couches d'auth)

> *"L'authentification est implémentée en défense en profondeur : un proxy Next.js bloque l'accès aux routes `/dashboard/*` sans session valide, ET le backend NestJS refuse aussi toute requête sans Bearer token JWT vérifié. Si quelqu'un tente d'appeler l'API directement avec curl en contournant le frontend, il reçoit 401 systématiquement. On ne fait pas confiance à une seule barrière."*

### 2.3 Séparation `.env` front vs back (préfixe `NEXT_PUBLIC_`)

> *"Pendant le développement j'ai fait une erreur classique : j'ai préfixé une variable d'environnement secrète avec `NEXT_PUBLIC_*` côté Next.js, ce qui l'aurait exposée au navigateur. J'ai détecté l'erreur par revue, supprimé la ligne, et rotaté la clé côté Supabase. C'est pourquoi je sépare strictement les `.env` du front (préfixe `NEXT_PUBLIC_*` autorisé) et du back (jamais de préfixe `NEXT_PUBLIC_*`)."*

### 2.4 Stockage des secrets dans 1Password

> *"Je ne partage jamais mes clés API, même dans une conversation IA — elles sont toutes stockées dans 1Password et injectées via variables d'environnement uniquement au moment de l'exécution. Aucun secret n'est jamais committé dans Git."*

### 2.5 Audit npm systématique après chaque install

> *"Après chaque `npm install`, je lance `npm audit`. Lors de l'installation de TanStack Query, j'ai détecté 2 vulnérabilités modérées dans la sous-dépendance `postcss` utilisée par Next.js. J'ai analysé le risque (faille build-time XSS, non exploitable sur Nautilus puisque je ne traite aucun CSS user-généré), refusé `npm audit fix --force` qui aurait downgradé Next.js en v9, et appliqué un override npm pour forcer postcss en version patchée. Résultat : zéro vulnérabilité, sans casser la stack."*

### 2.6 Triple système de mots de passe Supabase

> *"Supabase offre trois niveaux de gestion des mots de passe : l'administrateur peut réinitialiser depuis le dashboard ; l'utilisateur peut auto-réinitialiser via un email magique avec `resetPasswordForEmail` ; et pour les automatisations, on a une API Admin protégée par la Service Role Key qui doit rester côté serveur uniquement."*

### 2.7 Compte test avec mot de passe fort généré

> *"Pour le compte test de l'authentification, j'ai utilisé l'API Admin Supabase pour générer un mot de passe fort aléatoire de 24 caractères et le stocker dans mon gestionnaire 1Password. Aucun mot de passe n'est jamais saisi à la main : c'est la bonne pratique pour limiter les attaques de devinette ou de réutilisation."*

### 2.8 Configuration Supabase (RLS activée, exposition désactivée)

> *"Sur le projet Supabase, j'ai désactivé l'exposition automatique des tables et activé le Row Level Security automatique : c'est la configuration recommandée par Supabase pour respecter le principe du moindre privilège — aucune donnée n'est accessible par défaut, on doit explicitement l'autoriser."*

### 2.9 Région cloud Paris (cohérence métier + RGPD)

> *"J'ai choisi la région Paris (eu-west-3) pour héberger l'authentification Supabase, parce que ma cible utilisateur est composée d'ateliers nautiques français : latence minimale, conformité RGPD avec données en France, et bonne disponibilité régionale chez Supabase."*

### 2.10 Sécurité backend NestJS (multi-couches)

> *"Côté backend NestJS, j'utilise Helmet pour les headers HTTP sécurisés (HSTS, X-Frame-Options, CSP), un CORS strict limité à l'origine du frontend, un ValidationPipe global qui rejette tout champ non déclaré dans le DTO, un ThrottlerGuard pour le rate limiting global, et Prisma avec des requêtes paramétrées qui protège contre les injections SQL par construction."*

---

## 🎨 3 — UX & frontend

### 3.1 Performance perçue (toasts)

> *"Pour le feedback utilisateur, j'utilise la lib sonner intégrée comme `<Toaster />` global dans le layout Next.js. À chaque mutation TanStack Query, je déclenche trois types de notifications : un toast de chargement au moment du clic, puis un toast de succès ou d'erreur selon le résultat du backend. Cette approche améliore la performance perçue sans changer la performance réelle : l'utilisateur voit qu'il se passe quelque chose, donc deux secondes deviennent acceptables. C'est un principe UX classique de Jakob Nielsen : il vaut mieux paraître rapide qu'être rapide."*

### 3.2 Dashboard hiérarchique (Client = entité racine)

> *"Sur le dashboard, j'ai mis en avant l'entité Client comme entrée naturelle, parce que c'est la racine du modèle : un bateau appartient toujours à un client, un devis se rattache à un bateau, un ordre de réparation découle d'un devis validé. La vue 'tous les bateaux' reste accessible via la sidebar pour le mécanicien qui cherche directement par plaque moteur. En dessous, j'ai 4 KPIs en temps réel pour les entités secondaires — chaque carte fait une requête à l'API, met le résultat en cache via TanStack Query, et affiche un chiffre qui reflète l'état réel de la base. Si je crée un nouveau bateau, le compteur incrémente sans rechargement de page."*

### 3.3 Formulaires React Hook Form + Zod

> *"Pour les formulaires, j'utilise React Hook Form combiné à Zod. RHF gère l'état des champs, la soumission, et le mode chargement. Zod décrit le schéma de validation au format TypeScript et garantit la cohérence entre frontend et backend. TanStack Query gère ensuite l'appel API et le rafraîchissement automatique du cache après création — ainsi la liste se met à jour sans recharger la page. C'est la stack moderne standard pour les applications Next.js."*

### 3.4 Cold start (à dire si le jury voit une latence en démo)

> *"En développement, on observe un démarrage à froid cumulé d'environ 3 secondes lié à la compilation Next.js, à la première connexion Prisma et au réveil de la base Neon en plan gratuit. En production, tout est précompilé et le temps de réponse passe sous 200 millisecondes."*

### 3.5 Décision : responsive nuancé par rôle (à venir)

> *"Le responsive est nuancé par rôle : le chef d'atelier travaille principalement depuis son bureau, donc desktop-first. Le mécanicien intervient sur le bateau, dans l'atelier ou sur le port, donc mobile-first. Je ne code pas un mobile-first uniforme par défaut, comme on le voit souvent."*

---

## 🚤 4 — Modélisation métier

### 4.1 Quatre entités liées (Client → Bateau → Devis → OR)

> *"Le modèle métier suit le flux réel d'un atelier nautique : un client possède un ou plusieurs bateaux, on prépare un devis sur un bateau, si le client valide on déclenche un ordre de réparation, et quand l'OR est terminé on génère une facture. La facture n'est volontairement pas une entité séparée : c'est un PDF généré à partir de l'OR et de son devis quand l'OR passe au statut facturé. Cela évite la duplication de données."*

### 4.2 Workflow automatisé (devis VALIDE → OR créé / OR FACTURE → numéro de facture)

> *"Deux automatisations métier sont implémentées dans le backend : quand un devis passe au statut validé, le service de devis appelle automatiquement le service d'ordre de réparation pour créer un OR lié. Quand un OR passe au statut facturé, un numéro de facture séquentiel par année est généré automatiquement (format FAC-AAAA-XXXX). Ces deux automatisations sont visibles dans les logs de test end-to-end et sont reproductibles via le script `test-workflow.sh`."*

### 4.3 Téléphone non unique (cas couple / famille)

> *"J'ai volontairement laissé le téléphone non unique parce qu'en atelier nautique, il est courant qu'un couple ait un seul portable mais deux fiches client distinctes — chacun signe ses propres devis. L'email reste l'identifiant unique, ce qui suffit à détecter les doublons stricts. En V2, je pourrais ajouter une normalisation du téléphone à l'enregistrement plus un avertissement souple de type 'Un autre client a déjà ce numéro' sans bloquer."*

### 4.4 Identification bateau par plaque moteur

> *"En mécanique nautique, la plaque moteur est l'identifiant légal unique d'un bateau hors-bord. Je l'ai imposée comme contrainte unique en base. Cela permet au mécanicien sur le port, devant une coque inconnue, de retrouver instantanément l'historique en scannant la plaque (fonctionnalité prévue en V2 commerciale). En MVP examen, on utilise une recherche manuelle par numéro de plaque."*

### 4.5 Scope conscient : type PROFESSIONNEL en V2

> *"Pour la V1 examen, j'ai limité le formulaire client au type PARTICULIER. La base supporte déjà l'enum PARTICULIER ou PROFESSIONNEL, mais l'ajout du type PRO nécessite une raison sociale, un SIRET, un numéro de TVA intracommunautaire et une logique de facturation B2B distincte. Cela sortait du périmètre figé dans mon PRD. J'ai déjà implémenté le pattern d'affichage conditionnel sur le formulaire de contact Kosmos. Le type PRO est prévu en V2 commerciale RANKIA."*

### 4.6 Périmètre hors-bord uniquement (spécialité Romain)

> *"Le MVP est volontairement restreint aux moteurs hors-bord, parce que c'est ma spécialité technique d'ex-mécanicien nautique. Les moteurs in-bord, les Volvo Penta et les Mercruiser sont plus complexes et nécessitent une expertise différente — ils seront ajoutés en V2 si la demande commerciale le justifie."*

### 4.7 Tri alphabétique des listes annuaire (Clients, Bateaux)

> *"J'ai distingué deux types de listes selon leur usage métier : les listes annuaire (Clients, Bateaux) sont triées alphabétiquement par défaut pour faciliter la recherche visuelle, comme dans les ERP métier type Infocob que j'ai utilisé en tant que mécanicien nautique ; les listes flux (Devis, OR, Factures) sont triées par date décroissante pour mettre en avant les éléments récents qui nécessitent une action. Je n'ai pas implémenté de sélecteur de tri dynamique parce que Nautilus apporte une chose qu'Infocob n'a pas : un agent IA qui permet de poser des questions en langage naturel comme 'tous les clients de Quiberon' ou 'les bateaux Yamaha facturés en mai'. L'agent IA rend le tri dynamique accessoire — il est plus puissant et plus naturel à utiliser."*

### 4.8 Moteur sans bateau — limitation V1, cas métier réel

> *"En V1, le moteur est rattaché à un bateau via des colonnes dans la table Bateau. Mais en mécanique nautique, un client peut très bien posséder un moteur SANS bateau associé : moteur de remplacement en stock, moteur d'occasion acheté en attente d'installation, moteur consigné à l'atelier après revente du bateau qui le portait. C'est pourquoi la V2 prévoit une entité Moteur séparée avec deux relations : Moteur → Client obligatoire, et Moteur → Bateau optionnelle. Cette finesse métier vient de mon parcours d'ex-mécanicien nautique."*

### 4.9 Type d'OR par défaut REPARATION (limitation V1)

> *"À la création automatique d'un OR depuis un devis validé, le type par défaut est REPARATION car la majorité des interventions en sont. Mais ce comportement doit évoluer : idéalement, le type devrait être demandé au chef d'atelier lors de la validation du devis (entretien planifié, panne, hivernage, déshivernage, dépannage), pour qu'il soit cohérent dès le départ. C'est une amélioration documentée pour la V2."*

---

## 🧠 5 — Méthodologie & process

### 5.1 PRD V1 figé + STATUS.md vivant

> *"J'ai séparé deux documents dans `docs/examen/` : le PRD V1 décrit exactement ce qui sera codé et présenté, il est figé. Le STATUS.md est vivant : je le mets à jour à chaque fin de session avec l'avancement réel face au PRD. Cela me permet de détecter les écarts tôt et de prendre des décisions claires sur ce qui peut basculer en V2 commerciale."*

### 5.2 Discipline d'audit systématique

> *"Dans tout projet itératif, on accumule de la dette technique mineure. Ma démarche : faire des points réguliers, détecter les loupés tôt, les noter, et les corriger avant la phase suivante. C'est plus efficace que tout prévoir à l'avance — surtout sur un projet où les exigences évoluent à l'usage. J'ai trois réflexes systématiques : avant chaque modification critique, je liste ce que ça peut casser ; avant chaque ajout d'UI partagée, je vérifie sur quelles pages ça doit apparaître ; à chaque fin de bloc majeur, je fais un mini-audit comparé au PRD."*

### 5.3 Migration BDD propre (incident DTO résolu)

> *"Pendant le développement du formulaire client, mon ValidationPipe NestJS a rejeté trois champs car ils n'étaient pas dans le DTO ni dans le schéma BDD. C'est exactement le comportement souhaité : la sécurité par défaut empêche d'envoyer n'importe quoi. J'ai alors fait une migration Prisma propre avec `prisma migrate dev` pour ajouter les colonnes avec leurs contraintes typées (VARCHAR, TEXT), mis à jour le DTO avec les validations class-validator, et tout s'est aligné. Pas de bidouille, pas de bypass de la sécurité."*

### 5.4 Git workflow protégé (dev / main)

> *"Je travaille toujours sur la branche `dev`. La branche `main` est protégée et chaque merge nécessite la validation explicite de mon lead développeur Fabien Leyrissoux. Chaque commit sur main déclenche un déploiement Vercel coûteux, donc on contrôle strictement. Tous mes commits sont conventionnels et descriptifs."*

---

## 🎤 6 — Pitch oral officiel (45 secondes — à mémoriser)

> *« Nautilus, c'est une application web pour gérer un atelier nautique.*
>
> *Concrètement, le chef d'atelier enregistre ses clients, leurs bateaux, prépare des devis, lance des ordres de réparation et édite ses factures en PDF.*
>
> *Ce qui rend l'application différente, c'est son moteur de recherche en langage naturel : au lieu de naviguer dans des menus, on pose une question en français — par exemple "historique du bateau de M. Dupont" — et un agent IA va chercher la réponse dans la base.*
>
> *Côté technique, le frontend est en Next.js, le backend en NestJS, les données métier en PostgreSQL, et l'historique des recherches IA en MongoDB.*
>
> *Tout est déployé sur Vercel et Railway, avec une authentification Supabase. »*

---

## 📌 Convention d'usage

- **Apprendre les phrases tel quel** : elles sont déjà optimisées (concises, précises, défendables).
- **Adapter au feeling du jury** : si le jury veut plus de détail, dérouler la sous-partie correspondante.
- **Ne pas tout dire** : sélectionner 5-10 phrases-clés par bloc de démo (45 min au total).
- **Lire ce document avant chaque répétition d'oral** (S4 — semaine du 23-28/06).
