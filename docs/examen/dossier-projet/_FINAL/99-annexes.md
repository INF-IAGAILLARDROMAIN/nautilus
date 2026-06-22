\newpage

# 8. Annexes

> Les annexes regroupent les preuves visuelles et techniques du projet Nautilus. Volume maximum : 30 pages.

## Annexe A — Modèle Conceptuel de Données (MCD)

Le schéma ci-dessous présente les 4 entités métier liées de Nautilus (Client → Bateau → Devis → OR) ainsi que l'entité technique LigneDevis. Source : `backend/prisma/schema.prisma`.

![MCD Nautilus — 4 entités métier + LigneDevis](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/01-mcd/mcd-nautilus.png)

\newpage

## Annexe B — Schéma Prisma complet et description du MLD

Le détail complet du Modèle Logique de Données (MLD) et du schéma physique (MPD) avec types PostgreSQL, contraintes, clés étrangères et index est documenté dans le fichier `annexes/01-mcd/mcd-nautilus.md` du dépôt Git.

**Liens de référence (repo public) :**

- Schéma Prisma : `backend/prisma/schema.prisma`
- Migration SQL initiale : `backend/prisma/migrations/`
- Documentation complète MCD/MLD/MPD : `docs/examen/dossier-projet/annexes/01-mcd/`

\newpage

## Annexe C — Captures d'écran de l'application

URL de production : **https://nautilus-silk.vercel.app**

### C.1 — Authentification et tableau de bord

![Page de connexion (desktop)](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/screen-login-desktop.png)

![Page de connexion (mobile)](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/screen-login-mobile.png)

![Dashboard (desktop)](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/screen-dashboard-desktop.png)

![Dashboard (mobile)](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/screen-dashboard-mobile.png)

![Dashboard — mode sombre (desktop)](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/screen-dashboard-mode-nuit-desktop.png)

\newpage

### C.2 — Moteur de recherche IA (fonctionnalité signature)

![Recherche IA — Trouver un bateau (intent find_bateau)](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/screen-recherche-find-bateau-desktop.png)

![Recherche IA — Lister les dernières factures (intent list_recent_factures)](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/screen-recherche-list-recent-factures-desktop.png)

![Recherche IA — Salutation (intent salutation)](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/screen-recherche-salutation-desktop.png)

![Recherche IA — Aide (intent help)](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/screen-recherche-help-desktop.png)

![Recherche IA — Refus sécurité (intent securite_refus)](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/screen-recherche-securite-refus-credentials-desktop.png)

![Recherche IA — Hors domaine](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/screen-recherche-hors-domaine-desktop.png)

\newpage

### C.3 — Clients, bateaux, devis, OR

![Liste des clients (desktop)](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/screen-clients-liste-desktop.png)

![Fiche client (desktop)](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/screen-client-detail-dupont-desktop.png)

![Liste des bateaux (desktop)](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/screen-bateaux-liste-desktop.png)

![Liste des bateaux (mobile)](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/screen-bateaux-liste-mobile.png)

![Fiche bateau — haut (desktop)](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/screen-bateau-detail-haut-le-rivage-desktop.png)

![Fiche bateau — bas (desktop)](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/screen-bateau-detail-bas-le-rivage-desktop.png)

\newpage

### C.4 — Devis et Ordres de Réparation

![Liste des devis (desktop)](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/screen-devis-liste-desktop.png)

![Fiche devis — haut (desktop)](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/screen-devis-detail-haut-dev-2026-0003-desktop.png)

![Fiche devis — bas (desktop)](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/screen-devis-detail-bas-dev-2026-0003-desktop.png)

![Liste des OR (desktop)](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/screen-or-liste-desktop.png)

![Fiche OR (desktop)](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/screen-or-detail-reparation-desktop.png)

![Liste des factures (desktop)](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/screen-factures-liste-desktop.png)

\newpage

### C.5 — PDF générés (devis, OR, facture)

![PDF Devis (haut)](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/pdf-devis-haut-dev-2026-0003.png)

![PDF Devis (bas)](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/pdf-devis-bas-dev-2026-0003.png)

![PDF Ordre de Réparation](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/pdf-or-dev-2026-0003.png)

![PDF Facture](/Users/gaillardromain/Development/Studi/nautilus/docs/examen/dossier-projet/annexes/02-captures-ecran/pdf-facture-fac-2026-0002.png)

\newpage

# 9. Déclaration sur l'honneur

Je soussigné, **Romain Gaillard**, candidat au Titre Professionnel Développeur Web et Web Mobile (RNCP 37674), session Juin-Juillet 2026, déclare sur l'honneur que :

- Le projet **Nautilus** présenté dans ce dossier a été conçu, développé et documenté **intégralement par moi-même** dans le cadre de la création de mon entreprise **RANKIA SASU** (SIREN 104 046 610).
- Le code source, la documentation, les schémas, captures d'écran et l'ensemble des livrables associés sont mon œuvre originale.
- Les sources externes éventuellement utilisées (bibliothèques open source, articles de référence, documentation officielle) sont citées explicitement dans le présent document.
- Je m'engage à présenter ce dossier devant le jury le **lundi 29 juin 2026 à Villepinte (93)** et à répondre de bonne foi à toutes les questions relatives à la conception, à la réalisation et à la sécurité de l'application.

---

**Fait à Landévant, le \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_**

**Signature du candidat :**

\vspace{3cm}

**Romain Gaillard**

Président de RANKIA SASU

Apprenant Studi n° 512363
