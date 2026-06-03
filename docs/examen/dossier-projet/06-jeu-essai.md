# 6. Jeu d'essai

> Le référentiel exige un **jeu d'essai sur la fonctionnalité la plus représentative** du projet, avec analyse des écarts éventuels.
> Pour Nautilus, la fonctionnalité la plus représentative = **le moteur de recherche IA en langage naturel**.

## 6.1 Fonctionnalité testée

**Nom** : Moteur de recherche IA en langage naturel
**Endpoint** : `POST /recherche-ia`
**Objectif** : permettre à un utilisateur de poser une question en français et obtenir les données pertinentes de sa base (clients, bateaux, OR, devis), sans connaître la structure SQL.

## 6.2 Protocole du jeu d'essai

> **À COMPLÉTER** avec 5 à 8 scénarios de test représentatifs des cas réels.

### Scénario 1 — Recherche par nom de client

| Champ | Valeur |
|---|---|
| **Entrée** (question utilisateur) | "Le bateau de Dupont" |
| **Données attendues** | Fiche bateau du client "Dupont" + son historique d'OR |
| **Données obtenues** | *(à remplir après test)* |
| **Conformité** | ✅ / ❌ |
| **Analyse écart** | *(si écart, expliquer pourquoi)* |

### Scénario 2 — Recherche par statut

| Champ | Valeur |
|---|---|
| **Entrée** | "OR en cours" |
| **Données attendues** | Tous les OR avec statut = "en cours" |
| **Données obtenues** | *(à remplir)* |
| **Conformité** | ✅ / ❌ |
| **Analyse écart** | *(si écart)* |

### Scénario 3 — Recherche temporelle

| Champ | Valeur |
|---|---|
| **Entrée** | "Devis impayés de mai" |
| **Données attendues** | Liste des devis avec statut = "envoyé" ou "validé non encaissé" sur la période 01-31 mai |
| **Données obtenues** | *(à remplir)* |
| **Conformité** | ✅ / ❌ |

### Scénario 4 — Recherche sur attribut technique

| Champ | Valeur |
|---|---|
| **Entrée** | "Quels moteurs Yamaha 250 chez moi ?" |
| **Données attendues** | Liste des bateaux dont le moteur correspond à la marque "Yamaha" et au modèle contenant "250" |
| **Données obtenues** | *(à remplir)* |
| **Conformité** | ✅ / ❌ |

### Scénario 5 — Question ambiguë (cas limite)

| Champ | Valeur |
|---|---|
| **Entrée** | "Truc" |
| **Données attendues** | Message "Je n'ai pas compris votre demande" + suggestions d'exemples |
| **Données obtenues** | *(à remplir)* |
| **Conformité** | ✅ / ❌ |

### Scénarios additionnels à ajouter

> Compléter avec 3 cas supplémentaires : recherche multi-critères, gestion d'une question hors-domaine, performance sur grand volume de données.

## 6.3 Synthèse de l'analyse

> **À RÉDIGER après les tests réels.**

Présenter :
- Le taux de réussite global (X/Y scénarios conformes)
- Les écarts observés et leurs causes (mauvaise interprétation de l'IA ? bug de traduction question → SQL ? données manquantes en base ?)
- Les corrections apportées suite à ces écarts
- Les limites identifiées et les pistes d'amélioration
