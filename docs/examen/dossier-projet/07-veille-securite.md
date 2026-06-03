# 7. Veille sur les vulnérabilités de sécurité

> Section exigée par le référentiel : décrire la **veille effectuée durant le projet** sur les vulnérabilités, lister celles éventuellement identifiées, et expliquer les corrections apportées.

## 7.1 Méthode de veille mise en place

> **À PERSONNALISER** avec les sources que tu suis réellement.

**Sources consultées régulièrement :**
- **OWASP** (Open Web Application Security Project) — OWASP Top 10 web, OWASP API Security Top 10
- **CERT-FR** (alertes officielles de l'ANSSI françaises)
- **MDN Web Docs** — bonnes pratiques sécurité front
- **Snyk Blog** & **GitHub Security Advisories** — vulnérabilités sur les dépendances npm
- **Veille IA** : OWASP Top 10 for LLM Applications (risques spécifiques aux apps IA)

**Outils automatisés intégrés :**
- `pnpm audit` exécuté à chaque ajout de dépendance
- **Dependabot** activé sur le repo GitHub (alertes + PRs automatiques)
- **Snyk** (optionnel) pour scanner les containers Railway

**Fréquence :** veille hebdomadaire (newsletter OWASP + revue des alertes Dependabot reçues).

## 7.2 Vulnérabilités identifiées et corrections apportées

> **À REMPLIR au fil du projet** — documenter chaque vulnérabilité détectée et corrigée.

### Exemple type (à compléter avec les vraies vulnérabilités du projet)

| # | Vulnérabilité | Source | Sévérité | Correction apportée | Date |
|---|---|---|---|---|---|
| 1 | *(ex : CVE-XXXX-XXXX dans la lib `xxx` utilisée par NestJS)* | Dependabot | Élevée | Mise à jour de la dépendance à la version X.Y.Z | jj/mm/2026 |
| 2 | *(ex : absence de header CSP détectée au scan Mozilla Observatory)* | Audit manuel | Moyenne | Ajout de la CSP via Helmet | jj/mm/2026 |
| 3 | *(ex : possibilité de prompt injection sur l'endpoint /recherche-ia)* | Veille OWASP LLM | Élevée | Sanitisation de la question + restriction du contexte LLM au schéma seul | jj/mm/2026 |

> Au fur et à mesure du développement, **noter ici chaque alerte reçue et chaque correctif appliqué** — c'est un livrable que le jury examine attentivement pour évaluer la posture sécurité.

## 7.3 Vulnérabilités non corrigées et raisons

> S'il existe des vulnérabilités connues non corrigées (par exemple : pas de correctif disponible, faux positif, hors-périmètre), les lister ici avec la justification.

## 7.4 Bilan et perspectives

> **À RÉDIGER en fin de projet** — synthèse :
> - Posture sécurité globale du projet
> - Améliorations envisagées post-MVP (audit pénétration, certification, etc.)
> - Sources de veille à continuer en exploitation
