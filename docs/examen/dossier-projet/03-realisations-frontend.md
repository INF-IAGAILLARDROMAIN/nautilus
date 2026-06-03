# 3. Réalisations front-end

> Cette section présente les éléments les plus significatifs du front-end Nautilus + les arguments des choix techniques, **y compris pour la sécurité**.

## 3.1 Maquettes — versions web et web mobile

> **À PRODUIRE** — exporter les maquettes Figma des écrans suivants, en versions **desktop** et **mobile**.

**Écrans à maquetter (minimum) :**
1. Page de connexion (Supabase Auth)
2. Dashboard (vue d'ensemble : compteurs OR en cours, devis en attente)
3. Liste des clients + fiche client détail
4. Fiche bateau (avec historique des OR)
5. Liste des OR + fiche OR détail
6. Devis (création + visualisation)
7. **Barre de recherche IA** (avec résultats en langage naturel) ← la fonctionnalité signature
8. Bouton "Imprimer en PDF" (devis / OR)

**Argument du choix :**
> Le responsive est conçu en pensant à un usage **bicontexte** : chef d'atelier au bureau (desktop) et consultation mobile en atelier. Une seule application Next.js qui s'adapte aux deux résolutions évite la duplication de code et garantit la cohérence.

## 3.2 Schéma de l'enchaînement des maquettes

> **À PRODUIRE** — diagramme (Mermaid ou Figma) montrant comment les écrans s'enchaînent.

```
[Login] ──> [Dashboard]
              │
              ├──> [Recherche IA] ──> [Résultats]
              ├──> [Clients] ──> [Fiche client] ──> [Bateau] ──> [OR] ──> [Devis] ──> [PDF]
              └──> [Liste OR] ──> [Fiche OR] ──> [Devis]
```

## 3.3 Captures d'écran — versions web et web mobile

> **À PRODUIRE** — capturer les pages réellement développées (UI finalisée), en **desktop** et **mobile**.

Voir [annexes/](annexes/) pour les versions haute résolution.

## 3.4 Extraits de code — interfaces utilisateur statiques

> **À INSÉRER** — extraits significatifs de pages Next.js statiques (Server Components).

Exemples à inclure :
- Page liste des clients (rendu côté serveur, props typées)
- Fiche bateau (composition de composants statiques)
- Layout principal avec sidebar + header

## 3.5 Extraits de code — partie dynamique des interfaces

> **À INSÉRER** — extraits significatifs des interactions client (Client Components).

Exemples à inclure :
- **Barre de recherche IA** : input + appel API + affichage résultats en streaming
- Formulaire de création d'un OR (React Hook Form + Zod, gestion d'erreurs)
- Navigation dynamique avec TanStack Query (cache + invalidation)
- Bouton "Imprimer en PDF" qui déclenche un téléchargement

## 3.6 Arguments des choix techniques (y compris sécurité)

| Choix | Argument |
|---|---|
| Next.js 16 | App Router, Server Components, SSR/CSR mixé pour la performance et le SEO |
| TypeScript strict | Sécurité de typage à la compilation, moins de bugs runtime |
| Tailwind v4 | Stylage utilitaire rapide, design system cohérent, bundle minimal |
| React Hook Form + Zod | Validation déclarative côté client **et** schémas réutilisés côté serveur (DTOs NestJS) — défense en profondeur |
| TanStack Query | Cache intelligent des requêtes API, invalidation contrôlée, pas d'état dupliqué |
| Supabase Auth côté front | Gestion des tokens JWT, refresh automatique, middleware Next.js pour protéger les routes |
| Pas de stockage local sensible | Aucun token ou donnée client n'est conservé en localStorage : cookies httpOnly via Supabase |
