import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Mistral } from '@mistralai/mistralai';
import { PrismaService } from '../prisma/prisma.service';
import { RechercheLogService } from '../recherche-log/recherche-log.service';

/**
 * Moteur de recherche IA en langage naturel pour Nautilus.
 *
 * Architecture : "Intent + entités" (pas de NL2SQL).
 *   - Le LLM classifie la question en un intent + extrait les entités.
 *   - Le service dispatche sur des fonctions Prisma typées.
 *   - Aucun SQL généré → aucun risque d'injection.
 *
 * Pourquoi pas NL2SQL ?
 *   Pour un atelier, la précision et la sécurité priment. Si le LLM
 *   hallucine un JOIN ou un WHERE, c'est inacceptable. Avec "intent
 *   + entités", la seule liberté du LLM est de choisir parmi N intents
 *   pré-codés et d'extraire un nom/statut.
 *
 * Compatible MongoDB log (RechercheLogService) pour la démo orale.
 */

// ----- Types résultats -----

type IntentName =
  | 'find_bateau_by_client'
  | 'find_devis_by_client'
  | 'find_or_by_client'
  | 'find_facture_by_client'
  | 'list_or_by_statut'
  | 'list_or_urgents'
  | 'find_facture_by_numero'
  | 'list_recent_devis'
  | 'stats_global'
  | 'fallback';

interface LlmResponse {
  intent: IntentName;
  entities: Record<string, string>;
  explanation?: string;
}

export interface RechercheResultat {
  question: string;
  intent: IntentName;
  entities: Record<string, string>;
  resultats: unknown;
  resultatsCount: number;
  tempsMs: number;
  llmProvider: string;
  llmModele: string;
  explanation?: string;
  /**
   * Message contextuel généré par le service quand il a fallback
   * automatiquement (ex : "0 OR EN_COURS pour Martin — voici tous ses OR").
   * Permet au front d'afficher un bandeau d'information.
   */
  messageInfo?: string;
}

@Injectable()
export class RechercheIaService {
  private readonly logger = new Logger(RechercheIaService.name);
  private readonly client: Mistral | null;
  private readonly modele = 'mistral-small-latest';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logSvc: RechercheLogService,
  ) {
    const apiKey = process.env.MISTRAL_API_KEY;
    this.client = apiKey ? new Mistral({ apiKey }) : null;
    if (!this.client) {
      this.logger.warn(
        'MISTRAL_API_KEY absente — le moteur IA répondra avec une erreur 503',
      );
    }
  }

  // -------------------------------------------------------------------------
  // Entrée principale
  // -------------------------------------------------------------------------

  async rechercher(
    question: string,
    user: { sub: string; email?: string },
  ): Promise<RechercheResultat> {
    const t0 = Date.now();

    if (!this.client) {
      throw new ServiceUnavailableException(
        "Le moteur de recherche IA n'est pas configuré (MISTRAL_API_KEY manquante).",
      );
    }

    // 1. Classification + extraction d'entités via Mistral
    let llmResp: LlmResponse;
    try {
      llmResp = await this.classifierAvecMistral(question);
    } catch (e) {
      const tempsMs = Date.now() - t0;
      await this.logSvc.log({
        userId: user.sub,
        userEmail: user.email,
        question,
        statut: 'llm_error',
        erreur: (e as Error).message,
        tempsMs,
        llmProvider: 'mistral',
        llmModele: this.modele,
      });
      throw new ServiceUnavailableException(
        `Le moteur IA est temporairement indisponible : ${(e as Error).message}`,
      );
    }

    // 2. Dispatch sur l'intent → exécution Prisma
    let resultats: unknown = [];
    let statut: 'ok' | 'no_results' | 'sql_error' = 'ok';
    let messageInfo: string | undefined;
    let entitiesEffectives = llmResp.entities;

    try {
      resultats = await this.executerIntent(llmResp.intent, llmResp.entities);

      // Fallback métier : si find_or_by_client avec statut → 0 résultat,
      // on relâche le filtre statut et on prévient l'utilisateur.
      // (Plus utile que "Aucun résultat" sec, et démontre l'intelligence du service.)
      if (
        Array.isArray(resultats) &&
        resultats.length === 0 &&
        llmResp.intent === 'find_or_by_client' &&
        llmResp.entities.statut?.trim()
      ) {
        const sansStatut = await this.executerIntent('find_or_by_client', {
          client_name: llmResp.entities.client_name ?? '',
        });
        if (Array.isArray(sansStatut) && sansStatut.length > 0) {
          resultats = sansStatut;
          entitiesEffectives = {
            client_name: llmResp.entities.client_name ?? '',
          };
          messageInfo = `Aucun OR au statut « ${llmResp.entities.statut} » pour ce client — voici tous ses OR (${sansStatut.length}).`;
        }
      }
    } catch (e) {
      statut = 'sql_error';
      this.logger.error(
        `Exécution intent ${llmResp.intent} a échoué : ${(e as Error).message}`,
      );
    }

    const resultatsCount = Array.isArray(resultats) ? resultats.length : 1;
    if (statut === 'ok' && resultatsCount === 0) {
      statut = 'no_results';
    }
    const tempsMs = Date.now() - t0;

    // 3. Log MongoDB (résilient, ne casse pas la requête)
    void this.logSvc.log({
      userId: user.sub,
      userEmail: user.email,
      question,
      intent: llmResp.intent,
      entities: llmResp.entities,
      statut,
      resultatsCount,
      tempsMs,
      llmProvider: 'mistral',
      llmModele: this.modele,
    });

    return {
      question,
      intent: llmResp.intent,
      entities: entitiesEffectives,
      resultats,
      resultatsCount,
      tempsMs,
      llmProvider: 'mistral',
      llmModele: this.modele,
      explanation: llmResp.explanation,
      messageInfo,
    };
  }

  // -------------------------------------------------------------------------
  // Étape 1 — classification de la question
  // -------------------------------------------------------------------------

  private async classifierAvecMistral(question: string): Promise<LlmResponse> {
    const prompt = this.construirePrompt(question);

    const response = await this.client!.chat.complete({
      model: this.modele,
      temperature: 0.0, // déterministe — on veut une classification fiable
      responseFormat: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const raw = response.choices?.[0]?.message?.content;
    const text = typeof raw === 'string' ? raw : '';
    if (!text) {
      throw new Error('Réponse vide du LLM');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      throw new Error(`Réponse non-JSON du LLM : ${text.slice(0, 100)}…`);
    }

    return this.validerLlmResponse(parsed);
  }

  private construirePrompt(question: string): string {
    return `Question utilisateur : "${question}"\n\nClassifie cette question et extrait les entités. Réponds UNIQUEMENT en JSON valide.`;
  }

  private validerLlmResponse(parsed: unknown): LlmResponse {
    const p = parsed as Record<string, unknown>;
    const intent = p.intent as IntentName;
    const entities = (p.entities ?? {}) as Record<string, string>;
    const explanation = p.explanation as string | undefined;

    const intentsValides: IntentName[] = [
      'find_bateau_by_client',
      'find_devis_by_client',
      'find_or_by_client',
      'find_facture_by_client',
      'list_or_by_statut',
      'list_or_urgents',
      'find_facture_by_numero',
      'list_recent_devis',
      'stats_global',
      'fallback',
    ];

    if (!intentsValides.includes(intent)) {
      this.logger.warn(`Intent inconnu retourné par le LLM : ${intent}`);
      return { intent: 'fallback', entities: {}, explanation };
    }

    return { intent, entities, explanation };
  }

  // -------------------------------------------------------------------------
  // Étape 2 — dispatch sur Prisma
  // -------------------------------------------------------------------------

  private async executerIntent(
    intent: IntentName,
    entities: Record<string, string>,
  ): Promise<unknown> {
    switch (intent) {
      case 'find_bateau_by_client':
        return this.findBateauByClient(entities.client_name ?? '');

      case 'find_devis_by_client':
        return this.findDevisByClient(entities.client_name ?? '');

      case 'find_or_by_client':
        return this.findOrByClient(
          entities.client_name ?? '',
          entities.statut ?? '',
        );

      case 'find_facture_by_client':
        return this.findFactureByClient(entities.client_name ?? '');

      case 'list_or_by_statut':
        return this.listOrByStatut(entities.statut ?? '');

      case 'list_or_urgents':
        return this.listOrUrgents();

      case 'find_facture_by_numero':
        return this.findFactureByNumero(entities.numero ?? '');

      case 'list_recent_devis':
        return this.listRecentDevis();

      case 'stats_global':
        return this.statsGlobal();

      case 'fallback':
      default:
        return [];
    }
  }

  // ----- Implémentations Prisma typées (zéro SQL généré) -----

  private async findBateauByClient(name: string) {
    if (!name.trim()) return [];
    return this.prisma.bateau.findMany({
      where: {
        OR: [
          { client: { nom: { contains: name, mode: 'insensitive' } } },
          { client: { prenom: { contains: name, mode: 'insensitive' } } },
          { nom: { contains: name, mode: 'insensitive' } },
        ],
      },
      include: {
        client: { select: { id: true, nom: true, prenom: true } },
      },
      take: 20,
    });
  }

  private async findDevisByClient(name: string) {
    if (!name.trim()) return [];
    return this.prisma.devis.findMany({
      where: {
        OR: [
          { client: { nom: { contains: name, mode: 'insensitive' } } },
          { client: { prenom: { contains: name, mode: 'insensitive' } } },
        ],
      },
      include: {
        client: { select: { id: true, nom: true, prenom: true } },
        bateau: { select: { id: true, marque: true, modele: true, nom: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  private async findOrByClient(name: string, statut: string) {
    if (!name.trim()) return [];
    const mapping: Record<string, 'CREE' | 'EN_COURS' | 'TERMINE' | 'FACTURE'> =
      {
        cree: 'CREE',
        crée: 'CREE',
        nouveau: 'CREE',
        en_cours: 'EN_COURS',
        'en cours': 'EN_COURS',
        encours: 'EN_COURS',
        termine: 'TERMINE',
        terminé: 'TERMINE',
        fini: 'TERMINE',
        facture: 'FACTURE',
        facturé: 'FACTURE',
      };
    const statutFiltre = mapping[statut.toLowerCase().trim()];
    return this.prisma.ordreReparation.findMany({
      where: {
        ...(statutFiltre && { statut: statutFiltre }),
        devis: {
          client: {
            OR: [
              { nom: { contains: name, mode: 'insensitive' } },
              { prenom: { contains: name, mode: 'insensitive' } },
            ],
          },
        },
      },
      include: {
        devis: {
          include: {
            client: { select: { id: true, nom: true, prenom: true } },
            bateau: { select: { id: true, marque: true, modele: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  private async findFactureByClient(name: string) {
    if (!name.trim()) return [];
    return this.prisma.ordreReparation.findMany({
      where: {
        statut: 'FACTURE',
        devis: {
          client: {
            OR: [
              { nom: { contains: name, mode: 'insensitive' } },
              { prenom: { contains: name, mode: 'insensitive' } },
            ],
          },
        },
      },
      include: {
        devis: {
          include: {
            client: { select: { id: true, nom: true, prenom: true } },
            bateau: { select: { id: true, marque: true, modele: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  private async listOrByStatut(statut: string) {
    const mapping: Record<string, 'CREE' | 'EN_COURS' | 'TERMINE' | 'FACTURE'> =
      {
        cree: 'CREE',
        crée: 'CREE',
        nouveau: 'CREE',
        en_cours: 'EN_COURS',
        'en cours': 'EN_COURS',
        encours: 'EN_COURS',
        termine: 'TERMINE',
        terminé: 'TERMINE',
        fini: 'TERMINE',
        facture: 'FACTURE',
        facturé: 'FACTURE',
      };
    const statutPrisma = mapping[statut.toLowerCase().trim()] ?? 'EN_COURS';
    return this.prisma.ordreReparation.findMany({
      where: { statut: statutPrisma },
      include: {
        devis: {
          include: {
            client: { select: { id: true, nom: true, prenom: true } },
            bateau: { select: { id: true, marque: true, modele: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  private async listOrUrgents() {
    return this.prisma.ordreReparation.findMany({
      where: { urgence: 'URGENT', NOT: { statut: 'FACTURE' } },
      include: {
        devis: {
          include: {
            client: { select: { id: true, nom: true, prenom: true } },
            bateau: { select: { id: true, marque: true, modele: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  private async findFactureByNumero(numero: string) {
    if (!numero.trim()) return [];
    return this.prisma.ordreReparation.findMany({
      where: {
        numeroFacture: { contains: numero, mode: 'insensitive' },
      },
      include: {
        devis: {
          include: {
            client: { select: { id: true, nom: true, prenom: true } },
            bateau: { select: { id: true, marque: true, modele: true } },
          },
        },
      },
      take: 20,
    });
  }

  private async listRecentDevis() {
    return this.prisma.devis.findMany({
      include: {
        client: { select: { id: true, nom: true, prenom: true } },
        bateau: { select: { id: true, marque: true, modele: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  private async statsGlobal() {
    const [clients, bateaux, devis, ors, factures] = await Promise.all([
      this.prisma.client.count(),
      this.prisma.bateau.count(),
      this.prisma.devis.count(),
      this.prisma.ordreReparation.count(),
      this.prisma.ordreReparation.count({ where: { statut: 'FACTURE' } }),
    ]);
    return { clients, bateaux, devis, ors, factures };
  }
}

// -----------------------------------------------------------------------------
// Prompt système — décrit les intents au LLM
// -----------------------------------------------------------------------------
//
// On garde le prompt court et en français parce que :
//   1. Mistral est francophone natif
//   2. Plus le prompt est court, plus c'est rapide
//   3. Plus l'instruction est claire, moins le LLM hallucine

const SYSTEM_PROMPT = `Tu es l'assistant Nautilus, un atelier nautique français.
Tu DOIS classifier chaque question utilisateur en UN seul intent
parmi cette liste, puis extraire les entités utiles.

Réponds STRICTEMENT en JSON valide, sans markdown, format :
{
  "intent": "...",
  "entities": { ... },
  "explanation": "1 phrase en français expliquant ce que tu as compris"
}

Liste des intents :

1. "find_bateau_by_client" — trouver les bateaux d'un client.
   entities: { "client_name": "Dupont" }
   Exemples : "le bateau de Martin", "bateaux de Dupont", "le Beneteau de Sophie"

2. "find_devis_by_client" — trouver les devis d'un client.
   entities: { "client_name": "Martin" }
   Exemples : "devis de Martin", "tous les devis de Sophie Dupont"

3. "find_or_by_client" — trouver les OR d'un client (statut optionnel).
   entities: { "client_name": "Martin", "statut": "EN_COURS" }
   Le champ "statut" est OPTIONNEL — laisse-le vide si non précisé.
   Exemples : "OR de Martin", "les réparations en cours de Sophie",
              "tous les OR de Dupont", "qu'est-ce qu'il y a sur le bateau de Martin"

4. "find_facture_by_client" — trouver les factures d'un client.
   entities: { "client_name": "Martin" }
   Exemples : "factures de Martin", "ce que Sophie a payé", "factures de Dupont"

5. "list_or_by_statut" — lister TOUS les OR par statut (pas filtré par client).
   entities: { "statut": "EN_COURS" | "CREE" | "TERMINE" | "FACTURE" }
   Exemples : "OR en cours", "réparations terminées", "ordres facturés"
   ⚠ N'utilise CET intent que si AUCUN nom de client n'est mentionné.
   Sinon, utilise "find_or_by_client".

6. "list_or_urgents" — lister les OR urgents non encore facturés.
   entities: {}
   Exemples : "OR urgents", "réparations urgentes", "qu'est-ce qui presse"

7. "find_facture_by_numero" — trouver une facture par son numéro.
   entities: { "numero": "FAC-2026-0001" }
   Exemples : "facture FAC-2026-0001", "facture numéro 0042"

8. "list_recent_devis" — lister les derniers devis créés.
   entities: {}
   Exemples : "derniers devis", "devis récents", "devis du mois"

9. "stats_global" — compter les entités (clients, bateaux, devis, OR, factures).
   entities: {}
   Exemples : "combien de clients", "stats globales", "résumé de l'atelier"

10. "fallback" — utilisé UNIQUEMENT si la question ne correspond à aucun intent.
    entities: {}
    explanation : "Je n'ai pas compris ta question, peux-tu reformuler ?"

Règles strictes :
- TOUJOURS renvoyer un JSON valide.
- Le champ "intent" doit être EXACTEMENT une des valeurs ci-dessus.
- Si tu hésites entre deux intents, choisis celui qui maximise l'utilité métier.
- "fallback" est un dernier recours — préfère TOUJOURS un intent thématique si
  un nom de client OU un statut OU un type d'objet (devis, OR, facture, bateau)
  est mentionné dans la question.
- Tolère les fautes d'orthographe ("en cour" = "en cours", "factur" = "facture",
  "ordre" / "OR" = ordre de réparation) et les contractions du langage parlé.
- Les noms de clients dans "client_name" doivent être en français normal (pas en majuscules).
- Ne génère AUCUN texte hors du JSON.`;
