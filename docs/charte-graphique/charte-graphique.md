# Charte graphique — Nautilus

**Projet** : Nautilus — SaaS de gestion d'atelier nautique
**Version** : 1.0 · Draft
**Date** : 2026-05-23

---

## 1. Principes fondateurs

Nautilus s'utilise dans deux contextes extrêmes :
- ☀️ **Plein soleil sur un bateau** (luminosité écrasante)
- 🌑 **Atelier sombre** (faible luminosité ambiante)

→ La charte est construite autour d'**une seule règle non négociable : la lisibilité avant l'esthétique**.

### Implications design
- **Contrastes AAA** (ratio 7:1) sur le texte principal — *WCAG niveau le plus exigeant*
- **Double thème** : mode clair (bateau soleil) + mode sombre (atelier) + toggle manuel
- **Mode "Haute visibilité"** : option encore plus contrastée (texte agrandi + couleurs plus pures)
- **Pas de gris faible** sur fond clair (gris #999 = lavé au soleil)
- **Pas de gradient ni de couleur pastel** (perte de contraste)
- **Texte ≥ 18px sur mobile**, ≥ 16px sur desktop
- **Boutons ≥ 56px** sur mobile (mains gantées / sales / dans le sel)
- **Zones cliquables ≥ 48px** (touch friendly)

---

## 2. Palette de couleurs

### 2.1 Mode CLAIR — pour utilisation bateau / extérieur

| Rôle | Couleur | Hexa | Contraste sur fond |
|---|---|---|---|
| **Fond principal** | Blanc cassé | `#FAFAFA` | — |
| **Surface (cards)** | Blanc pur | `#FFFFFF` | — |
| **Texte principal** | Noir profond | `#0A0A0A` | **19.5:1** AAA |
| **Texte secondaire** | Gris très foncé | `#3A3A3A` | **10.4:1** AAA |
| **Bordure** | Gris moyen | `#888888` | — |
| **Primaire** (marque) | Bleu marine | `#003D6B` | **12.6:1** AAA |
| **Accent** (CTA, alertes) | Orange maritime vif | `#E85D04` | **4.8:1** AA — *à valider en gros caractères seulement* |
| **Succès** | Vert vif | `#0E8C3A` | **5.1:1** AA |
| **Erreur / Critique** | Rouge vif | `#C81E1E` | **5.6:1** AA |
| **Avertissement** | Ambre | `#A85700` | **5.9:1** AA |
| **Info** | Bleu cyan | `#0066B3` | **6.2:1** AA |

### 2.2 Mode SOMBRE — pour utilisation atelier / intérieur

| Rôle | Couleur | Hexa | Contraste sur fond |
|---|---|---|---|
| **Fond principal** | Anthracite | `#0F1419` | — |
| **Surface (cards)** | Gris très foncé | `#1A2028` | — |
| **Texte principal** | Blanc cassé | `#F5F5F5` | **18.3:1** AAA |
| **Texte secondaire** | Gris clair | `#B8B8B8` | **9.2:1** AAA |
| **Bordure** | Gris moyen | `#4A4A4A` | — |
| **Primaire** (marque) | Bleu clair lumineux | `#5BA4E8` | **7.8:1** AAA |
| **Accent** (CTA, alertes) | Orange clair | `#FF8533` | **8.4:1** AAA |
| **Succès** | Vert clair | `#3DDC84` | **9.1:1** AAA |
| **Erreur / Critique** | Rouge clair | `#FF6B6B` | **6.4:1** AA+ |
| **Avertissement** | Ambre clair | `#FFB84D` | **10.2:1** AAA |
| **Info** | Cyan clair | `#5BC0EB` | **8.7:1** AAA |

### 2.3 Mode HAUTE VISIBILITÉ — option bateau soleil intense

Activable par toggle, **dérive du mode clair** :
- Texte principal : **noir pur** `#000000` (au lieu de #0A0A0A)
- Fond principal : **blanc pur** `#FFFFFF`
- Bordures plus épaisses (2px au lieu de 1px)
- Tailles de police **+ 2 niveaux** (18px → 22px, 16px → 20px)
- Boutons + 25% de hauteur (56px → 70px)
- Suppression des animations / transitions

---

## 3. Typographie

### 3.1 Choix de police
**Police principale : Inter**
- Open source (gratuit, OFL)
- Excellente lisibilité écran à toute taille
- Disponible en variable font (1 seul fichier, tous poids)
- Support tabular numbers (pour KPIs et prix alignés)
- Utilisée par Vercel, Notion, Linear → standard pro

**Fallback système** : `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

### 3.2 Échelle typographique

| Usage | Mobile | Desktop | Poids |
|---|---|---|---|
| Texte courant | 18px | 16px | 400 |
| Texte secondaire | 16px | 14px | 400 |
| Légende / labels | 14px | 13px | 500 |
| Bouton | 18px | 16px | 600 |
| Titre H4 | 18px | 18px | 600 |
| Titre H3 | 22px | 22px | 600 |
| Titre H2 | 28px | 28px | 700 |
| Titre H1 | 36px | 36px | 700 |
| KPI / chiffre clé | 40-56px | 40-56px | 700 + `font-variant-numeric: tabular-nums` |

### 3.3 Espacement
- Interlignage texte courant : **1.6** (lecture confortable)
- Interlignage titres : **1.2-1.3**
- Letter-spacing : **0** par défaut, **-0.02em** sur les gros titres

---

## 4. Composants — règles de base

### 4.1 Boutons

| Type | Mobile | Desktop | Couleur fond | Texte |
|---|---|---|---|---|
| **Primaire (CTA)** | 56px h | 48px h | Accent orange | Blanc 18px 600 |
| **Secondaire** | 56px h | 48px h | Transparent + bordure 2px primaire | Primaire 18px 600 |
| **Danger** | 56px h | 48px h | Rouge | Blanc 18px 600 |
| **Ghost** | 56px h | 48px h | Transparent | Primaire 18px 500 |

Padding intérieur : **24px horizontal** minimum.
Border-radius : **8px** (jamais arrondi total — esthétique pro/technique).

### 4.2 Inputs (formulaires)
- Hauteur : **56px** mobile, **48px** desktop
- Bordure : **2px** (visible au soleil)
- État focus : bordure primaire + outline 4px à 30% opacité
- Label **au-dessus** du champ, jamais flottant (illisible au soleil)
- Erreur : bordure rouge + message **sous** le champ en rouge 14px 600

### 4.3 Cards
- Border-radius : **12px**
- Ombre : `0 2px 8px rgba(0,0,0,0.08)` (clair) / `0 2px 8px rgba(0,0,0,0.4)` (sombre)
- Padding interne : **24px** mobile, **20px** desktop
- Bordure 1px optionnelle pour démarcation forte

### 4.4 Badges de statut (OR, devis, alertes)
Tous les badges suivent un code couleur **cohérent** dans l'app :

| Statut | Couleur fond | Texte |
|---|---|---|
| RECU / EN_ATTENTE | Gris | Texte foncé |
| ACCEPTE | Cyan info | Blanc |
| EN_PREPARATION | Ambre | Noir |
| EN_REPARATION | Bleu primaire | Blanc |
| LIVRE / TERMINE | Vert succès | Blanc |
| FACTURE | Vert foncé | Blanc |
| ANNULE | Rouge erreur | Blanc |
| URGENT | Rouge erreur + bordure pulsante | Blanc |

### 4.5 Tableaux (listes OR, clients, bateaux)
- Lignes alternées (zebra) avec **2 % de teinte** (suffisant en clair, plus marqué en sombre)
- Hauteur ligne : **56px** mobile, **48px** desktop
- Sticky header sur scroll
- Filtrage / tri visibles dans le header

---

## 5. Iconographie

**Set choisi : Lucide React** *(même que Vite & Gourmand et Kosmos/ING+, cohérence INF-IA)*

Règles :
- Taille standard : **24px** (mobile + desktop)
- Taille tap target : **44px** (zone cliquable autour)
- Stroke width : **2px** (visible au soleil)
- Couleur : héritée du texte parent

Icônes clés Nautilus :
- ⚓ `Anchor` — bateau, mouillage
- 🛠️ `Wrench` — intervention, mécanique
- 📋 `ClipboardList` — OR, checklist
- 💰 `Receipt` — devis, facture
- 📦 `Package` — pièce, stock
- ⚠️ `AlertTriangle` — alerte, urgence
- 📷 `Camera` — scan plaque (feature CORE)
- ⏱️ `Clock` — heures moteur, planning
- 🌊 `Waves` — marque, identité nautique

---

## 6. Identité visuelle / Logo

À définir en S0. Pistes :
- **Ancre stylisée** moderne + tipographie Inter en bleu marine
- **Hélice** géométrique (3 ou 4 pales) = côté mécanique
- **Vague + clé à molette** = symbole composé

**Couleur logo** :
- Sur fond clair : bleu marine `#003D6B`
- Sur fond sombre : blanc `#F5F5F5`
- Version monochrome obligatoire pour print

**Tagline candidate** :
- *"L'atelier nautique connecté"*
- *"Tout votre atelier, en un scan"* ← lien direct avec la feature CORE
- *"Votre atelier nautique, plus simple"*

---

## 7. Ton & vocabulaire

Nautilus s'adresse à **des pros du nautique**, pas à des devs.

### Règles d'écriture
- **Vocabulaire métier** : OR (ordre de réparation), hivernage, déshivernage, antifouling, carénage, anode, embase, turbine, plaque moteur — **on parle leur langue**
- **Pas de jargon tech** : pas de "modal", "row", "endpoint" dans l'UI
- **Phrases courtes** : un mécano lit vite
- **Tutoiement** dans l'app (chaleur, pro de terrain ≠ banque)
- **Vouvoiement** sur les communications externes (devis client, emails)
- **Confiance & sérieux** : on touche à la sécurité, à la responsabilité

### Vocabulaire à proscrire
- ❌ "Cliquez ici" → ✅ "Voir le bateau"
- ❌ "Validez votre saisie" → ✅ "Enregistrer"
- ❌ "Une erreur est survenue" → ✅ "Impossible d'enregistrer — vérifie ta connexion"

---

## 8. Accessibilité

- **WCAG 2.1 AA** minimum sur tous les écrans
- **WCAG 2.1 AAA** sur les textes critiques (OR, devis, alertes sécurité)
- Navigation **clavier complète** (Tab order logique)
- **Aria labels** sur tous les boutons icône
- **Focus visible** très marqué (outline 4px sur état focus)
- **Tailles de touch target** ≥ 44px (norme Apple/Material)
- Pas de couleur seule pour transmettre une info (toujours un texte + icône)

---

## 9. Animations

**Principe** : sobriété, lisibilité avant tout.

- Transitions max **200ms** (au-delà → impatience utilisateur)
- Easing standard : `cubic-bezier(0.4, 0, 0.2, 1)`
- **Pas d'animations décoratives** sur l'app métier
- **Animations utiles uniquement** : pulsation alerte critique, spinner chargement, transition de page
- **Désactivées en mode haute visibilité**
- Respecter `prefers-reduced-motion`

---

## 10. À livrer (Studi)

- ✅ Ce document `charte-graphique.md` exporté en PDF
- ✅ Palette couleurs visualisée (capture Figma)
- ✅ Échantillons typographiques (Figma)
- ✅ Composants UI (boutons, inputs, cards, badges) en Figma
- ✅ **3 maquettes desktop** + **3 maquettes mobile** (référentiel Studi)
- ✅ Logo + variations (sur fond clair, sombre, monochrome)

→ Tout sera regroupé dans `~/Documents/Pro/Formation/Studi/dossier-projet/charte-graphique/` + export PDF final.
