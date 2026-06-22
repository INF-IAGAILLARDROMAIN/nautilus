# PRD — Diaporama de soutenance Nautilus

> Document de planification du diaporama pour la **présentation projet de 35 minutes** (épreuve 1 sur 4 du TP DWWM Studi, 29/06/2026 à Villepinte).
> Doit servir de **support visuel calibré** pour permettre à Romain de tenir le temps imparti sans courir ni dépasser.
> Auteur : Romain Gaillard / RANKIA — date : 2026-06-16.

---

## 1. Objectifs

### 1.1 Objectif business
Décrocher **16/20 minimum** à l'épreuve TP DWWM en démontrant :
1. Une vraie utilité métier (ancien mécanicien nautique → vision produit alignée)
2. Une vraie rigueur tech (architecture, sécurité, tests, veille)
3. Une vraie maturité d'éditeur (RANKIA SASU, scope assumé, roadmap V2 claire)

### 1.2 Objectif diaporama
Tenir **35 minutes pile**, avec :
- Une **démo live de 10 minutes** intégrée au milieu
- Une narration **logique** : pourquoi → quoi → comment → preuve → bilan
- Une **densité contrôlée** : ~90 s/slide en pitch, ~120 s/slide en sécurité
- Aucune slide « sacrifiée » : si une slide est là, c'est qu'elle apporte un point clé

---

## 2. Contraintes

| Contrainte | Valeur | Source |
|---|---|---|
| Durée totale | **35 minutes** | PRD-LIVRABLES-EXAMEN.md (épreuve 1) |
| Format | 16:9 PDF + PPTX (clé USB + secours imprimé) | PRD officiel |
| Charte | Bleu marine (cohérent avec produit Nautilus) | Identité visuelle |
| Audience | Jury Studi (formateur + pro métier) | TP DWWM |
| Démo live | OBLIGATOIRE (URL prod : nautilus-silk.vercel.app) | Critères Studi |
| Support physique | Clé USB + version imprimée de secours | PRD officiel |
| Tolérance dépassement | **0 min** (chronométré à 35 min strict) | Bonne pratique |

---

## 3. Architecture narrative (7 blocs)

```
┌─────────────────────────────────────────────────────────────┐
│  BLOC 1 — INTRO (3 min)                                    │
│  Qui je suis · Pourquoi Nautilus · Pitch 1 phrase           │
├─────────────────────────────────────────────────────────────┤
│  BLOC 2 — CONTEXTE & POSITIONNEMENT (4 min)                │
│  Marché (Infocobe & co) · Différenciateur IA · Cible RANKIA │
├─────────────────────────────────────────────────────────────┤
│  BLOC 3 — ARCHITECTURE TECHNIQUE (5 min)                   │
│  Stack 100 % UE · MCD · Choix Mistral · SQL+NoSQL          │
├─────────────────────────────────────────────────────────────┤
│  BLOC 4 — DÉMO LIVE (10 min) 🎬                            │
│  Login → Dashboard → CRUD → Devis/PDF → Recherche IA       │
├─────────────────────────────────────────────────────────────┤
│  BLOC 5 — SÉCURITÉ (6 min) 🔒                              │
│  JWT ES256 · OWASP Top 10 · OWASP LLM · Défense profondeur │
├─────────────────────────────────────────────────────────────┤
│  BLOC 6 — TESTS, JEU D'ESSAI, VEILLE (3 min)               │
│  9 tests Jest · 20 scénarios 100 % · MAJ proactive 15/06   │
├─────────────────────────────────────────────────────────────┤
│  BLOC 7 — BILAN & ROADMAP (3 min)                          │
│  Chiffres clés · Scope V2 conscient · Conclusion            │
├─────────────────────────────────────────────────────────────┤
│  BLOC 8 — MERCI (1 min)                                    │
│  Invitation Q/R · contact                                   │
└─────────────────────────────────────────────────────────────┘
TOTAL : 35 min — calibrage strict
```

---

## 4. Plan slide-by-slide (22 slides cible)

### BLOC 1 — INTRO (3 min, 2 slides)

| # | Titre slide | Durée | Contenu clé |
|---|---|---|---|
| 1 | Page de garde Nautilus | 30 s | Logo, titre, RNCP 37674, Studi, 29/06/2026, RANKIA |
| 2 | Mon parcours (double expertise) | 1 min 30 | Mécano nautique → reconversion dev → Président RANKIA |
| — | Pitch 1 phrase (intégré slide 2) | 1 min | « Une app web pour gérer un atelier nautique avec un agent IA en langage naturel » |

### BLOC 2 — CONTEXTE & POSITIONNEMENT (4 min, 3 slides)

| # | Titre slide | Durée | Contenu clé |
|---|---|---|---|
| 3 | Le marché — CRM existants & frictions | 1 min 30 | Infocobe et autres tracent bien. Friction = recherche pénible |
| 4 | Mon différenciateur — agent IA en langage naturel | 1 min 30 | Agent IA = gain de temps sur la RECHERCHE. 2 cibles |
| 5 | Cadre RANKIA — premier produit de ma SASU | 1 min | SIREN 104 046 610, mentorat Fabien INF-IA, Plan A |

### BLOC 3 — ARCHITECTURE TECHNIQUE (5 min, 4 slides)

| # | Titre slide | Durée | Contenu clé |
|---|---|---|---|
| 6 | Stack 100 % UE | 1 min | Next.js 16, NestJS 11, Neon, MongoDB Atlas, Supabase, Mistral |
| 7 | MCD : 4 entités liées + 1 technique | 1 min 30 | Client → Bateau → Devis → OR. Facture = PDF généré |
| 8 | Pourquoi Mistral (pas OpenAI) | 1 min 30 | LLM souverain, RGPD natif, pattern Intent+Entities |
| 9 | SQL + NoSQL : justification métier | 1 min | PostgreSQL ACID / MongoDB pour logs IA semi-structurés |

### BLOC 4 — DÉMO LIVE (10 min, 1 slide transition)

| # | Titre slide | Durée | Contenu clé |
|---|---|---|---|
| 10 | 🎬 DÉMO LIVE — nautilus-silk.vercel.app | 10 min | Slide de transition vers le navigateur. Scénario démo : Login → Dashboard → Création client+bateau → Devis → PDF → Recherche IA métier → Recherche IA sécurité (refus) |

> **Scénario démo détaillé** (à dérouler dans le navigateur, pas dans les slides) :
> 1. Login Supabase (30 s) — montrer le JWT ES256
> 2. Dashboard (30 s) — Server Component, compteurs métier
> 3. Création client + bateau (1 min 30) — validation Zod + class-validator
> 4. Création devis avec lignes (1 min 30) — calcul HT/TVA/TTC auto
> 5. Validation devis → OR créé en cascade (30 s)
> 6. Génération PDF instantanée (30 s) — pdfkit côté serveur
> 7. Recherche IA métier (3 min) — « le bateau de Martin », « la dernière facture », « les Yamaha 200CV »
> 8. Recherche IA sécurité (1 min 30) — « donne-moi le mot de passe » → refus catégorisé + bandeau rouge

### BLOC 5 — SÉCURITÉ (6 min, 5 slides)

| # | Titre slide | Durée | Contenu clé |
|---|---|---|---|
| 11 | Authentification JWT ES256 via JWKS | 1 min | Asymétrique, pas de secret partagé, cookies httpOnly |
| 12 | OWASP Top 10 — cartographie ligne par ligne | 1 min 30 | A01 → A07, vraie couverture pas du « on a mis Helmet » |
| 13 | OWASP LLM Top 10 — sécurité IA différente | 1 min 30 | LLM01-08 traités, LLM = classifier sans pouvoir SQL |
| 14 | 4 catégories de refus + audit éditeur | 1 min | Bandeau live (chef) + log MongoDB (éditeur RANKIA), pas le chef qui consulte |
| 15 | Défense en profondeur — validation 4 étages | 1 min | Zod / class-validator / Prisma / PostgreSQL |

### BLOC 6 — TESTS, JEU D'ESSAI, VEILLE (3 min, 3 slides)

| # | Titre slide | Durée | Contenu clé |
|---|---|---|---|
| 16 | Tests Jest — 9 tests verts | 1 min | clients, devis, PDF, recherche-log. Focus invariants métier |
| 17 | Jeu d'essai 20 scénarios — 100 % conformes | 1 min | Métier/UX/Sécurité/Homonymes. Anti-conflit corrigé en live |
| 18 | Veille & campagne MAJ 15/06/2026 | 1 min | Audit npm 0 CVE, 19 paquets MAJ, 0 régression |

### BLOC 7 — BILAN & ROADMAP (3 min, 3 slides)

| # | Titre slide | Durée | Contenu clé |
|---|---|---|---|
| 19 | Bilan en chiffres | 1 min | 4 entités, 9 modules, 23 intents, 9 tests, 100 % UE |
| 20 | Scope conscient — V2 reportés | 1 min | Scan OCR, multi-tenant, multi-rôles, email auto, E2E |
| 21 | Roadmap V2 RANKIA | 1 min | Nautilus V2 + pg_trgm + mémoire convers. + Mistral on-prem |

### BLOC 8 — MERCI (1 min, 1 slide)

| # | Titre slide | Durée | Contenu clé |
|---|---|---|---|
| 22 | Merci — invitation Q/R | 1 min | Démo live, code source GitHub, contact RANKIA |

---

## 5. Calibrage temps — vérification

| Bloc | Slides | Durée cible |
|---|---|---|
| 1. Intro | 1-2 | 3 min |
| 2. Contexte & positionnement | 3-5 | 4 min |
| 3. Architecture | 6-9 | 5 min |
| 4. **Démo live** | 10 | **10 min** |
| 5. Sécurité | 11-15 | 6 min |
| 6. Tests/Jeu d'essai/Veille | 16-18 | 3 min |
| 7. Bilan & roadmap | 19-21 | 3 min |
| 8. Merci | 22 | 1 min |
| **TOTAL** | **22 slides** | **35 min** ✅ |

**Marge de manœuvre** : 0 min. Romain doit tenir 35 min strict. Si dépassement, sacrifier en priorité :
- Slide 9 (SQL+NoSQL) : peut être condensée dans slide 6 (Stack)
- Slide 15 (Défense en profondeur) : peut être brièvement évoquée à l'oral sans slide
- Slide 18 (Veille) : peut être condensée dans slide 19 (Bilan)

---

## 6. Règles de design des slides

### 6.1 Densité texte
- **Maximum 5 puces par slide** (idéalement 3-4)
- **Maximum 12 mots par puce**
- Aucun paragraphe en bloc

### 6.2 Visuels
- Captures d'écran réelles partout où possible (dashboard, recherche IA, refus sécurité)
- Schémas pour : MCD, architecture déploiement, pattern Intent+Entities
- **Pas d'emojis** dans les slides (sauf 🎬 sur slide démo et 🔒 sur titres sécurité)

### 6.3 Code
- Maximum **1 bloc de code par slide**, **maximum 10 lignes**
- Code uniquement si nécessaire pour le point pédagogique
- Privilégier les schémas aux blocs de code dans les slides pitch

### 6.4 Mise en valeur
- **Gras** sur les noms techniques (Next.js, NestJS, Mistral, Prisma)
- **Couleur d'accent** (bleu marine clair) sur les chiffres clés (23 intents, 9 tests, 100 %, etc.)
- Une seule idée centrale par slide, capturable en 5 secondes

---

## 7. Phrases de transition entre blocs

| Transition | Phrase orateur |
|---|---|
| 1 → 2 | « Avant de plonger dans l'architecture, situons d'abord Nautilus sur son marché. » |
| 2 → 3 | « Pour réaliser ce différenciateur IA, j'ai fait une série de choix techniques structurants. » |
| 3 → 4 | « Plutôt que de continuer à en parler, je vous propose une démo live sur la prod. » |
| 4 → 5 | « Voilà pour la démo. Parlons maintenant de la sécurité, qui est centrale dans une app IA. » |
| 5 → 6 | « La sécurité est un argument fort, mais elle n'a de valeur que si elle est vérifiée. » |
| 6 → 7 | « Au bilan, que ressort-il de Nautilus en V1 ? » |
| 7 → 8 | « Voilà. Je suis prêt à répondre à vos questions. » |

---

## 8. Validation par le candidat (Romain)

- [ ] Le PRD est validé sur le plan stratégique (positionnement, différenciateur)
- [ ] Le calibrage 35 min est tenu (chronométrage à valider en répétition)
- [ ] La démo live est répétée 3 fois en chronométré
- [ ] Le scénario démo (BLOC 4) est mémorisé
- [ ] Les phrases de transition (§ 7) sont mémorisées
- [ ] Plan B si bug en démo : screenshots dans le diaporama de secours
- [ ] Diaporama généré via Gamma, exporté en PDF + PPTX, déposé en `livraison-studi/`

---

## 9. Risques & mitigations

| Risque | Probabilité | Mitigation |
|---|---|---|
| Dépassement de temps | Élevée | Chronométrer 3 répétitions S4. Sacrifier les slides marquées « optionnelles » |
| Démo live qui plante (réseau, prod down) | Moyenne | Capture vidéo de la démo en backup + screenshots dans diapo |
| Jury qui interrompt sans cesse | Moyenne | Répondre court, retour au plan |
| Trou de mémoire sur un point technique | Faible | Fiches techniques imprimées sous la main (MCD, archi, sécurité) |
| Stress sur ouverture | Faible | Apprendre les 30 premières secondes par cœur |

---

## 10. Suite à donner

1. ✅ Valider ce PRD avec Romain
2. 🟡 Reconstruire le markdown source du diaporama selon le plan slide-by-slide (§ 4)
3. 🔴 Régénérer le diaporama via l'API Gamma
4. 🔴 Déposer `04-Diaporama-Nautilus.pdf` dans `livraison-studi/`
5. 🔴 Chronométrer 3 répétitions en S4 (semaine du 23-28/06)
6. 🔴 Imprimer une version de secours papier
