import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RechercheLogDocument = RechercheLog & Document;

/**
 * Historique des recherches IA en langage naturel.
 *
 * Stocké en MongoDB (et non en PostgreSQL) parce que les champs varient
 * selon le type de question et selon le LLM utilisé : data semi-structurée,
 * pas de relation forte avec les entités métier, écriture rapide souhaitée.
 *
 * Cas d'usage :
 *   - debug ("pourquoi cette recherche n'a rien trouvé ?")
 *   - stats démo ("X recherches en 30 jours, Y% utiles")
 *   - amélioration des prompts (analyse des patterns en échec)
 */
@Schema({
  collection: 'recherche_logs',
  timestamps: true, // créé createdAt + updatedAt auto
})
export class RechercheLog {
  // -----------------------------------------------------------------------
  // Identité de l'auteur de la recherche (JWT Supabase)
  // -----------------------------------------------------------------------

  /** ID Supabase de l'utilisateur qui a posé la question. */
  @Prop({ required: true, index: true })
  userId: string;

  /** Email de l'utilisateur (snapshot, pour debug sans rejointure). */
  @Prop()
  userEmail?: string;

  // -----------------------------------------------------------------------
  // Question + interprétation
  // -----------------------------------------------------------------------

  /** Question brute tapée par l'utilisateur ("bateau de Dupont"). */
  @Prop({ required: true })
  question: string;

  /** Intent détecté par le LLM (ex. "find_boat_by_client", "list_or_in_progress"). */
  @Prop({ index: true })
  intent?: string;

  /** Entités extraites de la question (ex. { client: "Dupont", statut: "VALIDE" }). */
  @Prop({ type: Object })
  entities?: Record<string, unknown>;

  // -----------------------------------------------------------------------
  // Exécution
  // -----------------------------------------------------------------------

  /** Requête SQL générée par le LLM (s'il y en a eu une). */
  @Prop()
  sqlGenere?: string;

  /** Nombre de lignes retournées par la requête. */
  @Prop({ default: 0 })
  resultatsCount: number;

  /** Temps total d'exécution (LLM + SQL) en millisecondes. */
  @Prop({ default: 0 })
  tempsMs: number;

  // -----------------------------------------------------------------------
  // Résultat
  // -----------------------------------------------------------------------

  /** "ok" / "no_results" / "llm_error" / "sql_error" / "rate_limit". */
  @Prop({ required: true, default: 'ok', index: true })
  statut: string;

  /** Message d'erreur si statut != "ok". */
  @Prop()
  erreur?: string;

  // -----------------------------------------------------------------------
  // LLM utilisé
  // -----------------------------------------------------------------------

  /** Nom du provider LLM ("mistral", "openai", "anthropic", "mock"). */
  @Prop({ index: true })
  llmProvider?: string;

  /** Nom du modèle exact ("mistral-small-latest", "gpt-4o-mini", etc). */
  @Prop()
  llmModele?: string;

  /** Tokens consommés (pour suivi coût/quota). */
  @Prop()
  llmTokens?: number;
}

export const RechercheLogSchema = SchemaFactory.createForClass(RechercheLog);

// Index composé pour les requêtes "mes recherches récentes"
RechercheLogSchema.index({ userId: 1, createdAt: -1 });
