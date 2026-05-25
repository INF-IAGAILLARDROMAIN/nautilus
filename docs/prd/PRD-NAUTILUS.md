# PRD — Nautilus

**Projet** : Nautilus — SaaS de gestion d'atelier nautique
**Auteur** : Romain Gaillard
**Version** : 1.0 · Draft à valider
**Date** : 2026-05-23
**Échéance examen** : 2026-06-29

---

## 1. Contexte & objectif

### 1.1 Pourquoi ce projet
Romain Gaillard, ancien mécanicien nautique en reconversion développeur, prépare le **TP Développeur Web et Web Mobile (RNCP 37674)** avec Studi.

Le projet **Nautilus** est l'application présentée au jury DREETS le **29 juin 2026 à Villepinte** pour valider les compétences front-end (BC01) et back-end (BC02) du titre.

### 1.2 Objectif primaire
- **Obtenir le TP DWWM** le 29/06/2026.
- Couvrir 100 % des compétences des deux blocs (BC01 + BC02) à travers un projet unique cohérent.

### 1.3 Objectif secondaire
- Construire une base réutilisable pour un éventuel produit commercial (architecture pensée multi-secteurs, livraison mono-secteur).

---

## 2. Référentiel cible — Compétences à démontrer

### BC01 — Front-end (RNCP37674BC01)
1. Installer et configurer son environnement de travail
2. Maquetter des interfaces utilisateur (web + mobile)
3. Réaliser des interfaces utilisateur statiques (web + mobile)
4. Développer la partie dynamique des interfaces

### BC02 — Back-end (RNCP37674BC02)
5. Mettre en place une base de données relationnelle
6. Développer des composants d'accès aux données **SQL et NoSQL**
7. Développer des composants métier côté serveur
8. Documenter le déploiement

### Production complémentaire
- Présentation orale devant le jury basée sur un support (diaporama)

---

## 3. Cible utilisateur

### 3.1 Persona principal — Atelier nautique
- Petit/moyen atelier (3-15 personnes)
- Mécanicien nautique, chef d'atelier, gérant
- Clients = particuliers (propriétaires de bateaux) + pros (chantiers, loueurs)

### 3.2 Rôles applicatifs (5)
| Rôle | Permissions |
|---|---|
| **ADMIN** | Tout — gestion entreprise, employés, paramétrage |
| **MANAGER** | Vue d'ensemble, planning, équipe, stats |
| **RECEPTION** | Clients, bateaux, devis, prise de RDV |
| **TECH** | Voit uniquement ses OR assignés, met à jour les statuts |
| **READONLY** | Lecture seule (audit, partenaires) |

---

## 4. Périmètre fonctionnel (User Stories)

### Périmètre IN — MVP (à livrer)

| # | User Story | Compétence |
|---|---|---|
| **US1** | En tant qu'utilisateur, je peux **m'inscrire/me connecter** avec email + mot de passe sécurisé | BC02-#7, sécurité |
| **US2** | En tant qu'admin, je peux **créer/gérer les comptes employés** et attribuer des rôles | BC02-#7 |
| **US3** | En tant que réception, je peux **gérer un fichier clients** (CRUD particulier + pro) | BC01-#3/#4, BC02-#6 |
| **US4** | En tant que réception, je peux **enregistrer un bateau** lié à un client (marque, modèle, immatriculation, type moteur, heures) | BC01-#4, BC02-#5/#6 |
| **US5** | En tant que réception, je peux **créer un ordre de réparation (OR)** avec workflow (Reçu → Accepté → En préparation → En réparation → Livré → Facturé) | BC01-#4, BC02-#7 |
| **US6** | En tant que tech, je peux **voir mes OR assignés**, mettre à jour leur statut, ajouter des notes | BC01-#4, BC02-#7 |
| **US7** | En tant que réception, je peux **générer un devis PDF** et l'envoyer par email au client avec lien de validation | BC02-#6/#7 |
| **US8** | En tant que client (sans compte), je peux **valider le devis** via un lien unique sécurisé | BC02-#7, sécurité |
| **US9** | En tant que réception, je peux **gérer un stock de pièces** avec alertes stock bas | BC01-#4, BC02-#6 |
| **US10** | En tant que manager, je consulte un **dashboard KPI** : OR en cours, devis en attente, CA du mois, bateaux présents | BC01-#3/#4 |
| **US11** | En tant que manager, je consulte des **statistiques avancées** (CA par mois, top bateaux entretenus, top pièces) — *backend MongoDB* | **BC02-#6 (NoSQL)** |
| **US12** ⭐ | En tant qu'utilisateur, je reçois des **alertes maintenance préventive** sur les bateaux (basées sur heures moteur, dernière intervention, saison) | **BC01-#4, BC02-#7 — feature "waouh"** |
| **US13** ⭐⭐ | En tant que réception, je peux **planifier un Hivernage ou un Déshivernage** sur un bateau, avec checklist d'opérations standard (modifiable par le tech au fil de l'intervention) | **BC01-#4, BC02-#7 — différenciateur métier** |
| **US14** ⭐⭐ | En tant que tech, je peux **gérer l'inventaire sécurité d'un bateau** (feux à main, fusées, gilets, extincteur, etc.) avec quantité + dates de péremption. Le système **alerte 30j avant péremption** et permet de générer une **décharge de responsabilité PDF signée** si le client refuse un remplacement préconisé | **BC01-#4, BC02-#6/#7 — sécurité réglementaire** |
| **US15** ⭐ | En tant que manager, je consulte un **inventaire prévisionnel saison** : liste des équipements de sécurité à commander avant la mise à l'eau (ex. *"50 feux à main à commander avant le 1er mars"*) | **BC01-#4, BC02-#6/#7** |
| **US16** ⭐⭐ | En tant que réception, je peux **créer un OR de type DEPANNAGE_URGENCE depuis un appel client**, en mode rapide (sans phase devis bloquante — devis a posteriori), avec note téléphonique du problème | **BC01-#4, BC02-#7 — workflow urgence** |
| **US17** ⭐⭐ | En tant que mécano sur le terrain, je peux **rechercher un bateau en 1 clic** (plaque moteur ou immatriculation) et consulter une **fiche "résumé urgence" mobile-first** : dernière intervention + pannes passées + pièces récemment remplacées + heures moteur + notes — pour anticiper les pistes avant d'arriver | **BC01-#2/#4 (mobile), BC02-#6/#7** |
| **US18** | Le système **détecte automatiquement** si un OR urgent survient < 30 jours après un entretien réalisé par l'atelier → flag *"Vigilance responsabilité atelier"* pour le manager | **BC02-#7 — logique métier** |
| **US23** ⭐ | En tant que chef d'atelier (MANAGER), je vois toutes les alertes/urgences **non attribuées** et je peux les **assigner à un mécano en 1 tap**. Le système **suggère automatiquement le dernier mécano à avoir touché au bateau** (continuité + responsabilité) et permet d'en choisir un autre. Le mécano assigné reçoit une notification | **BC02-#7 — workflow de distribution** |
| **US19** ⭐ | En tant que réception, je peux **créer une demande de garantie constructeur** (Suzuki, Yamaha, Mercury, Mercruiser, Volvo Penta…) attachée à un OR : suivi du statut (En attente → Accordée → Pièce reçue → Réparée), N° dossier constructeur, pièces concernées, documents joints (photos, rapport panne). Facturation à destination du constructeur (et non du client) | **BC01-#4, BC02-#5/#6/#7 — workflow garantie** |
| **US20** | Le système **alerte 6 mois avant la fin de garantie constructeur** d'un moteur — l'atelier peut proposer une extension ou anticiper un entretien préventif sous garantie | **BC02-#7** |
| **US21** | En tant que réception, je peux **créer un OR de type `EXPERTISE_OCCASION`** pour un bateau d'occasion (avec ou sans client existant), avec checklist standardisée (état coque, moteur, électronique, sécurité, antifouling, historique) et **génération d'un rapport d'expertise PDF** signé incluant l'estimation de valeur et les recommandations | **BC01-#4, BC02-#6/#7 — service à haute valeur ajoutée** |
| **US22** ⭐⭐⭐ | **🎯 FEATURE COEUR** — En tant que mécano arrivant sur un bateau, je **scanne la plaque moteur** (photo → OCR) : Nautilus affiche instantanément (1) l'**historique complet** du bateau, (2) les **opérations préconisées** calculées automatiquement (vidange due à 100h, anodes à changer, alertes maintenance, opérations saison, etc.), et (3) la **liste des pièces nécessaires**. Je peux **ajouter / retirer des pièces ou opérations** d'un clic pour composer l'intervention du jour. | **BC01-#2/#4, BC02-#5/#6/#7 — IA OCR (bonus certifs Studi)** |

### 4 prime — La feature CORE : Scan plaque → Préconisations

> *"Le mécano arrive sur le bateau. Il sort son téléphone. Il scanne la plaque moteur. En 3 secondes, il voit tout ce qu'il doit faire."*

C'est **LE moment-clé** qui justifie l'existence de Nautilus.

#### Le flux

1. **Scan** : photo de la plaque moteur via l'app mobile
2. **OCR** (Tesseract.js) → identification du moteur en base
3. **Affichage instantané** sur smartphone :
   - 📜 **Historique complet** : dernière intervention (date, opérations, tech), 5 dernières opérations majeures, pièces remplacées < 12 mois
   - 🔧 **Préconisations calculées** : opérations dues selon heures moteur (vidange à 100h ?), date dernière intervention (anodes annuelles ?), saison (déshivernage à faire ?), alertes maintenance, sécurité périmée
   - 📦 **Liste des pièces nécessaires** : pré-remplie depuis les préconisations
4. **Composition du panier d'intervention** : le mécano **ajoute/retire** des opérations ou pièces d'un clic
5. **Validation** → crée l'OR avec les opérations validées

#### Pourquoi c'est différenciant
- Aucun SaaS générique ne fait ça (les concurrents demandent une saisie manuelle longue)
- **Gain de temps réel** : 5-10 minutes économisées par intervention
- **Réduction d'erreur** : pas d'oubli d'opération due
- **Vendeur fort devant le jury** : *"Voici le moment où la techno simplifie vraiment le quotidien du métier"*

#### Couverture compétences référentiel
- **BC01-#2** (maquetter web mobile) : UI scan + résumé sur smartphone
- **BC01-#4** (dynamique) : interactions ajout/retrait composition panier
- **BC02-#5/#6** (BDD SQL + NoSQL) : recherche bateau, agrégation historique, calcul préconisations
- **BC02-#7** (logique métier serveur) : moteur de préconisations (règles métier)
- **Bonus IA** : OCR (Tesseract.js) → utilisable pour les certifs Studi Front IA + Back IA

### 4bis. Cycle saisonnier nautique — Spécificité métier forte

Le métier nautique se structure autour de **2 grandes opérations saisonnières** par bateau et par an. C'est la base du carnet de commande d'un atelier naval — et un différenciateur fort vs un SaaS multi-secteurs générique.

#### 🍂 Hivernage (octobre → novembre)
Préparation du bateau pour 4-6 mois de stockage à sec ou à flot.
- Sortie d'eau (si nécessaire)
- **Carénage** = nettoyage complet de la coque à la sortie d'eau
- **Entretien moteur complet** (la majorité des ateliers le fait ici) :
  - Vidange + filtre à huile
  - Filtre à carburant
  - Bougies
  - Huile d'embase
  - Anodes
- Protection circuit de refroidissement (antigel)
- Stockage des batteries (au sec, sur chargeur lent)
- Bâchage / mise sous housse

#### 🌷 Déshivernage (mars → avril)
Remise en route pour la saison.
- **Antifouling** (peinture anti-salissures de la coque)
- Nettoyage complet (coque, pont, intérieur)
- **Repose ou vérification charge des batteries**
- Mise en route moteur + test
- Vérifications sécurité (extincteur, fusées, gilets, balisage)
- Entretien moteur **complémentaire** (pour les ateliers qui l'ont scindé entre hivernage et déshivernage)
- Mise à l'eau

#### Implications produit
- 2 nouveaux **types d'intervention** dédiés : `HIVERNAGE` et `DESHIVERNAGE`
- Chaque intervention saisonnière a une **checklist standard** que le tech valide point par point
- Une **alerte automatique** dans le panneau alertes : *"15 bateaux à déshiverner d'ici fin avril"* / *"Hivernage à prévoir avant 1er novembre"*
- Possibilité de **forfaits saisonniers** dans les devis (Pack Hivernage / Pack Déshivernage)

#### 🚨 Sécurité à bord — composante réglementaire
L'atelier vérifie systématiquement le matériel de sécurité du bateau et **préconise les remplacements** des éléments périmés ou défectueux. Si le client refuse, une **décharge de responsabilité** doit être tracée (signée par le client, archivée).

Le suivi d'inventaire sécurité par bateau permet aussi de **piloter les commandes de l'atelier avant la haute saison** : *« 50 feux à main périment dans les 3 mois → commande groupée à passer avant le 1er mars »*.

### 4ter. Dépannage urgence — Workflow rapide

Un client en panne **doit être dépanné vite** (en mer, à quai, surtout s'il sort d'entretien atelier). Le workflow est différent d'un OR planifié :

1. **Appel téléphonique entrant** : la réception qualifie
   - Soit on **renseigne au téléphone** et c'est résolu (info, débrouille)
   - Soit on **déclenche une intervention mécano rapide**
2. **Création OR `DEPANNAGE_URGENCE`** : sans phase devis bloquante, devis a posteriori
3. **Identification rapide du bateau** : plaque moteur (idéalement via photo OCR, sinon recherche texte), N° d'immatriculation, ou téléphone client
4. **Briefing mécano avant intervention** : consultation **fiche résumé urgence** mobile-first sur le bateau :
   - Dernière intervention (date, opérations, tech)
   - Pannes similaires déjà rencontrées (filtre auto par symptômes)
   - Pièces récemment remplacées (< 12 mois)
   - Heures moteur connues
   - Notes utiles
   → permet au mécano d'**anticiper les pistes**
5. **Trace responsabilité** : si la panne survient < 30 jours après un entretien atelier, flag *"Vigilance responsabilité"* pour le manager (peut donner lieu à prise en charge gracieuse)

> **Note technique** : la fonctionnalité OCR plaque moteur (US22) est **CORE du MVP** et **non plus optionnelle** — c'est LE moment-clé de l'application qui démarque Nautilus. Implémentation : Tesseract.js (open-source, gratuit) en première intention, fallback recherche texte si l'OCR échoue. Bonus : couvre aussi les certifs Studi Front IA et Back IA.

### 4quater. Garantie constructeur — Workflow B2B

L'atelier est l'interface entre le client final et le constructeur moteur (**Suzuki, Yamaha, Mercury, Mercruiser, Volvo Penta…**). Quand une pièce défectueuse est détectée sur un moteur sous garantie :

1. Le mécano **constate le défaut** sur le moteur (photos, rapport)
2. L'atelier **contacte le constructeur** pour ouvrir un dossier de garantie
3. Le constructeur **valide / refuse** la prise en charge
4. Si validée → expédition de la pièce de remplacement à l'atelier
5. Le mécano **remplace la pièce**
6. La **facturation va au constructeur**, pas au client

#### Implications produit
- **Modèle `Constructeur`** : Suzuki, Yamaha, Mercury, Mercruiser, Volvo Penta, Honda, Tohatsu… (avec coordonnées commerciales / hotline garantie)
- **Bateau enrichi** : date achat, durée garantie constructeur, constructeur, numéro série moteur, concessionnaire d'origine
- **Modèle `DemandeGarantie`** : lié à un OR + un constructeur, avec N° dossier, statut (PENDING → APPROVED → REJECTED → PART_RECEIVED → COMPLETED), pièces concernées, documents joints (photos, rapport)
- **Facturation** : champ "Bénéficiaire facture" sur Devis/Facture (client OU constructeur)
- **Alerte fin de garantie proche** : 6 mois avant expiration sur un moteur

### Périmètre OUT — Hors MVP (mentionné, non livré)
- Application mobile native (iOS/Android)
- Déclinaison sectorielle Auto / Moto / autres secteurs (architecture pensée pour, **non livrée**)
- Module facturation comptable (Stripe, export Sage)
- Notifications push temps réel
- Gestion multi-établissements (le multi-tenant est en BDD mais pas exposé en UI)
- Module RH / planning équipe avancé
- **Gestion des places de stockage atelier** (m² intérieur/extérieur, facturation place pendant hivernage) — *évolution phase 2 quand le chantier propose le service stockage*

---

## 5. Architecture technique

### 5.1 Stack
| Couche | Techno | Justification |
|---|---|---|
| **Vitrine** | **Astro + îlots React** | Site marketing → perf max, SEO, Lighthouse 100. Stack alignée avec INF-IA (Kosmos/ING+) |
| **App métier** | **Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui** | Couvre BC01-#4 (dynamique riche). Cohérent avec ECF Vite & Gourmand |
| **Back-end** | **NestJS 11 + TypeScript** | Architecture modulaire, validation DTO, cohérent avec V&G |
| **BDD relationnelle** | **PostgreSQL (Neon) + Prisma 7** | Couvre BC02-#5 et #6 SQL |
| **BDD NoSQL** | **MongoDB Atlas + Mongoose** | Couvre **BC02-#6 NoSQL** (stats agrégées dashboard) |
| **Auth** | **JWT + bcrypt + Passport** | Cohérent V&G. 5 rôles via Guards + decorators |
| **Emails** | **Nodemailer + templates HTML** | Devis, validation, notifications |
| **PDF** | Bibliothèque PDF Node | Devis et factures |
| **Hébergement** | **Vercel** (front+back serverless) + **Neon** (PG) + **Atlas** (Mongo) | Identique V&G — process déjà rodé |

### 5.2 Repo & arborescence
```
INF-IAGAILLARDROMAIN/nautilus (GitHub public)
├── apps/
│   ├── vitrine/      # Astro — landing page Nautilus
│   ├── web/          # Next.js — app gestion atelier
│   └── api/          # NestJS — back-end REST
├── database/
│   ├── create_tables.sql
│   └── seed_data.sql
├── docs/             # MCD, archi, sécu, déploiement, charte graphique
├── ROADMAP.md
└── README.md
```

Local : `~/Development/Studi/nautilus/`

### 5.3 Schéma BDD (à détailler en S0) — 10-12 modèles cibles
- `User`, `Role`
- `Client`, `Bateau`
- `OrdreReparation` (avec workflow statut + `type: ENTRETIEN | REPARATION | DEPANNAGE_URGENCE | HIVERNAGE | DESHIVERNAGE | DIAGNOSTIC | POSE_INSTRUMENT | GARANTIE | EXPERTISE_OCCASION`), `OrdreLigne`. ⚠️ Le **type d'OR = action globale du devis**, pas la liste des pièces (ex. "Entretien moteur" et non "vidange + bougies + anodes")
- `AppelEntrant` (log téléphonique : motif, décision *renseigné*/*intervention*, lien OR créé si intervention)
- `Constructeur` (Suzuki, Yamaha, Mercury, Mercruiser, Volvo Penta, Honda, Tohatsu… + coordonnées hotline garantie)
- `DemandeGarantie` (lié à un OR + un Constructeur : N° dossier, statut, pièces, documents joints)
- `RapportExpertise` (lié à un OR de type `EXPERTISE_OCCASION` : état coque/moteur/électronique/sécurité/antifouling, estimation valeur, recommandations, PDF signé)
- `ChecklistSaisonniere` + `ChecklistItem` (checklist standard Hivernage/Déshivernage adaptable par OR)
- `Devis`, `DevisLigne`, `Paiement`
- `Piece`, `MouvementStock`
- `EquipementSecurite` (lié au bateau : type, quantité, date fabrication, date péremption, état, dernière vérif)
- `DechargeResponsabilite` (PDF signé client si refus de remplacement sécurité)
- `AlerteMaintenance` (préventive + saisonnière + **péremption sécurité**)
- `OrderStat` (MongoDB)

---

## 6. Livrables Studi — Mapping complet

| Livrable Studi | Contenu | Échéance cible | Source |
|---|---|---|---|
| **Dossier Projet — 1er dépôt** (optionnel) | Brouillon 30-50 p sur Nautilus | ~9 juin | Récit + screenshots + extraits code |
| **Dossier Projet — 2ème dépôt** (optionnel) | Version corrigée | ~17 juin | Idem + corrections formateur |
| **Dossier Projet — Dépôt final** 🔒 | Version jury | ~26 juin | 30-50 p + 30 p annexes |
| **DP — 1er dépôt** (optionnel) | Récit pro 6 exemples | ~9 juin | Grille validation déjà OK |
| **DP — 2ème dépôt** (optionnel) | Version corrigée | ~17 juin | Idem |
| **DP — Dépôt final** 🔒 | Version jury | ~26 juin | À imprimer en 2 ex. reliés |
| **Diaporama** 🔒 | Support oral | ~27 juin | 15-25 slides |
| **App déployée** | URL publique fonctionnelle | ~25 juin | Vercel |
| **Repo GitHub public** | Code lisible | Permanent | INF-IAGAILLARDROMAIN/nautilus |
| **Charte graphique PDF** | Couleurs, polices, maquettes | ~25 juin | docs/charte-graphique.pdf |
| **Doc technique PDF** | MCD, UML, cas d'usage, séquence | ~25 juin | docs/documentation-technique.pdf |
| **Doc gestion projet PDF** | Kanban, sprints, méthodo | ~25 juin | docs/gestion-projet.pdf |
| **Manuel utilisation PDF** | Comptes test, parcours visiteur/user/admin | ~25 juin | docs/manuel-utilisation.pdf |
| **Fichiers SQL** | create_tables.sql + seed_data.sql | Dans repo | database/ |

🔒 = obligatoire pour le jury

---

## 7. Critères d'acceptation globaux

Pour considérer Nautilus "prêt pour le jury" :

- [ ] App déployée en ligne, accessible 24/7
- [ ] 3 comptes démo fonctionnels (admin / manager / tech) avec mot de passe simple
- [ ] Parcours utilisateur complet jouable en démo sans bug : login → dashboard → créer client → créer bateau → créer OR → générer devis PDF → envoyer email → valider devis client → marquer livré
- [ ] Au moins 1 module utilisant MongoDB (stats dashboard)
- [ ] Maquettes Figma versionnées dans docs/
- [ ] MCD + MPD + UML cas d'usage dans docs/
- [ ] Veille sécurité documentée (CSRF, XSS, injection SQL, JWT, etc.)
- [ ] Jeu d'essai pour 1 fonctionnalité représentative (entrée/attendue/obtenue + écarts)
- [ ] README.md complet avec instructions d'installation locale
- [ ] Repo GitHub public, branches main / develop, board GitHub actif

---

## 8. Risques & mitigations

| Risque | Criticité | Mitigation |
|---|---|---|
| Glissement temps | 🔴 Critique | Suivi quotidien progression, board GitHub à jour |
| Non-libération journées INF-IA | 🔴 Critique | Confirmer au point Fabien du 27/05 |
| Fin convention Studi 29/05 → plus de corrections ? | 🟠 Élevé | Demander à Léa LAPLACE / Elodia |
| Reliure dossier (24-48h imprimeur) | 🟠 Élevé | Anticiper S5, garder 1 semaine de marge |
| Scope creep | 🟠 Élevé | Verrouiller le périmètre IN/OUT dès S0 |
| Démo qui plante le jour J | 🟠 Élevé | Scénario de démo répété 3+ fois en S5 |
| Le jury creuse sur déclinaisons (auto, etc.) | 🟡 Modéré | Narration claire : "Architecture pensée multi-secteurs, livraison nautique" |
| Bug en production avant examen | 🟡 Modéré | Branches `develop` → `main`, déploiement testé |

---

## 9. Planning macro (à partir du 23/05)

| Semaine | Période | Objectifs |
|---|---|---|
| **S0** | 23-25 mai | Cadrage + scaffolding + maquettes + 1er déploiement vide |
| **S1** | 26-31 mai | API : auth, modèles Prisma, modules Client + Bateau |
| **S2** | 1-7 juin | API : OR, Devis, Stock + Front-end auth & listings |
| **S3** | 8-14 juin | Front-end : tous les écrans + intégration API |
| **S4** | 15-21 juin | Feature waouh (alertes) + MongoDB stats + Vitrine Astro + 1er dépôt Studi |
| **S5** | 22-28 juin | Dossier projet + DP + diaporama + répétitions + impression reliure + logistique |
| **29 juin** | Lundi | 🎯 EXAMEN |

---

## 10. Hors périmètre — Explicitement non livré

À mentionner au jury pour anticiper les questions :

- Multi-secteurs (auto, moto, agri, aéro, BTP, loisirs) — architecture pensée pour, livraison nautique uniquement, suite produit en backlog
- App mobile native — la version web mobile responsive suffit pour le MVP
- Intégrations comptables (Stripe, Sage) — backlog
- Multi-établissements — la BDD est multi-tenant, l'UI livrée mono-tenant
- Notifications push temps réel — emails transactionnels suffisent pour le MVP
- Module RH avancé — gestion d'équipe basique via les rôles

---

## 11. Définitions

- **OR** : Ordre de Réparation
- **DP** : Dossier Professionnel (narratif parcours)
- **Dossier Projet** : doc technique sur Nautilus
- **ECF** : Évaluation en Cours de Formation (= Vite & Gourmand, déjà rendu)
- **BC01 / BC02** : Blocs de Compétences 1 et 2 du RNCP 37674
- **MCD / MPD** : Modèle Conceptuel / Physique de Données

---

**Validation requise avant passage au découpage Jira.**
