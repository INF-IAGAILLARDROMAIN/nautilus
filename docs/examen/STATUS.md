# STATUS Nautilus — Avancement vs PRD-EXAMEN-V1

> Document **vivant** : mis à jour à chaque fin de session. Reflète l'état réel du code vs le périmètre figé dans [PRD-NAUTILUS-EXAMEN-V1.md](PRD-NAUTILUS-EXAMEN-V1.md).
>
> Dernière mise à jour : **2026-06-06**.

---

## 📅 Position dans le calendrier

| Semaine | Mission PRD | Statut |
|---|---|---|
| S1 (02-08/06) | BDD + Auth + CRUD | 🟢 **EN COURS** (jour 5/7) |
| S2 (09-15/06) | Moteur de recherche IA + PDF + déploiement | ⏳ À venir |
| S3 (16-22/06) | Rédaction Dossier Projet + DP + 1er dépôt | ⏳ À venir |
| S4 (23-28/06) | Diaporama + répétitions orales | ⏳ À venir |
| **29/06** | 🎓 **Examen Villepinte** | 🎯 Objectif 16/20 min |

---

## ✅ FAIT (validé fonctionnellement)

### Backend (NestJS sur port 4001)
- Schéma Prisma 4 entités liées : Client → Bateau → Devis → OrdreReparation
- Modules CRUD complets : `clients`, `bateaux`, `devis`, `ordre-reparation`
- Workflow auto :
  - Devis statut → `VALIDE` ⇒ création automatique de l'OR
  - OR statut → `FACTURE` ⇒ génération automatique du numéro `FAC-AAAA-XXXX`
- Numérotation auto séquentielle par année : `DEV-2026-XXXX`, `FAC-2026-XXXX`
- Calcul auto des totaux HT / TVA / TTC sur les devis
- Sécurité : `Helmet`, `CORS` strict, `ValidationPipe` global, `ThrottlerGuard`
- Connecté à PostgreSQL Neon (eu-central-1)
- Test end-to-end validé : Sophie Martin → Beneteau Antares 7 → DEV-2026-0001 → OR → FAC-2026-0001

### Frontend (Next.js 16 sur port 3000)
- Provider TanStack Query (cache 30 s, retry x1, devtools en dev)
- Lib API client typée (`src/lib/api.ts`) couvrant clients/bateaux/devis/or/factures
- Variable `NEXT_PUBLIC_API_URL` (gitignored)
- 6 pages branchées à l'API :
  - `/dashboard` — entité racine "Clients" + 4 KPIs temps réel
  - `/dashboard/clients` — liste
  - `/dashboard/bateaux` — liste avec client lié + nb devis
  - `/dashboard/devis` — liste avec statuts colorés + total TTC
  - `/dashboard/or` — liste avec type + urgence + mécano + numéro facture
  - `/dashboard/factures` — OR filtrés au statut `FACTURE`
- Sidebar épurée (6 liens, plus aucun lien fantôme)
- Login UI : visuel OK mais **pas branché à Supabase**

### Qualité / Outils
- Audit `npm` après chaque install (règle systématique)
- Override `postcss ≥ 8.5.10` pour patch CVE GHSA-qx2v-qp2m-jg93 (0 vulnerability)
- Secrets stockés dans 1Password vault `nautilus`
- Git workflow : tout sur `dev`, jamais sur `main` sans validation Fabien
- Commits réguliers + push sur `origin/dev`

---

## 🔴 PAS ENCORE FAIT (mais prévu PRD)

### S1 — à terminer cette semaine
- ❌ **Auth Supabase** (login UI existe mais ne vérifie rien — redirige tout le monde vers dashboard)
- ❌ **Formulaires de CRÉATION** (le front fait READ uniquement)
- ❌ **Pages détail** (fiche client riche avec ses bateaux/devis/or, fiche bateau riche, etc.)

### S2 — semaine prochaine
- ❌ **🌟 Moteur de recherche IA** en langage naturel (cœur examen, fonctionnalité signature)
- ❌ **MongoDB Atlas** (historique des recherches IA — exigence SQL+NoSQL du référentiel)
- ❌ **Génération PDF** côté serveur (devis + facture, pdfkit/puppeteer)
- ❌ **Déploiement** Vercel (front) + Railway (back) — _attention : pas de Vercel avant validation Romain_

### S3-S4
- ❌ Dossier Projet rédigé
- ❌ Dossier Professionnel (Winaxion + Kosmos/ING+ + Nautilus)
- ❌ Diaporama soutenance + répétitions

---

## 🔧 Décisions techniques prises depuis le PRD V1

| Décision | Raison | Impact PRD |
|---|---|---|
| Type `OR.type` modifiable a posteriori | Default `REPARATION` ne couvre pas tous les cas | Aucun (le PRD prévoit déjà les 5 types) |
| Dashboard = carte "Clients" + grille 4 KPIs | Hiérarchie métier respectée (le client est racine) | PRD ajusté (1 ligne en hors-périmètre) |
| Exemple recherche IA "Devis impayés" → "Devis non validés" | Pas de statut "impayé" dans le schéma | PRD ajusté (1 ligne) |
| Scan plaque retiré du code/repo | Décidé en début de session, hors examen | ✅ Déjà au PRD |

---

## 🎯 Priorités pour les prochaines sessions

1. **Auth Supabase** — débloquer la sécurité (sinon faille évidente à l'oral)
2. **Formulaires de création** Client + Bateau + Devis (CUD complet)
3. **Pages détail** d'au moins Client (montre la relation 1:N vers bateaux/devis/or)
4. **Moteur IA** — début S2

---

## 📊 Score d'avancement subjectif

| Bloc | Avancement |
|---|---|
| Backend | 🟢🟢🟢🟢🟢🟢🟢🟢🟢⚪ **90 %** (manque génération PDF + endpoint recherche IA) |
| Frontend | 🟢🟢🟢🟢🟢⚪⚪⚪⚪⚪ **50 %** (lecture OK, CUD à faire, auth à faire, détails à faire) |
| Sécurité | 🟢🟢🟢🟢🟢🟢🟢⚪⚪⚪ **70 %** (back sécurisé, front auth manquante) |
| Documentation examen | 🟢🟢🟢⚪⚪⚪⚪⚪⚪⚪ **30 %** (PRD ok, Dossier Projet à rédiger) |
| Démo orale | ⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪ **0 %** |

> **Avancement global : ~50 %** — sur les rails pour S2, S3, S4.
