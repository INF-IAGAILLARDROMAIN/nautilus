import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RechercheLog, RechercheLogDocument } from './recherche-log.schema';

@Injectable()
export class RechercheLogService {
  private readonly logger = new Logger(RechercheLogService.name);

  constructor(
    @InjectModel(RechercheLog.name)
    private readonly model: Model<RechercheLogDocument>,
  ) {}

  /**
   * Enregistre une nouvelle recherche dans MongoDB.
   * Volontairement résilient : si Mongo est down, on log l'erreur mais
   * on ne casse PAS la requête métier de l'utilisateur. Le log d'IA est
   * un nice-to-have, pas un bloquant.
   */
  async log(data: Partial<RechercheLog>): Promise<RechercheLogDocument | null> {
    try {
      return await this.model.create(data);
    } catch (e) {
      this.logger.error(
        `Impossible d'enregistrer la recherche IA en BDD : ${(e as Error).message}`,
      );
      return null;
    }
  }

  /**
   * Liste les recherches récentes d'un utilisateur (page "Mes recherches").
   */
  async findRecentByUser(
    userId: string,
    limit = 20,
  ): Promise<RechercheLogDocument[]> {
    return this.model
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Stats globales pour la démo orale : taux de succès, recherches du jour, etc.
   * Aggrégation MongoDB pure — démontre la maîtrise du NoSQL.
   */
  async stats(): Promise<{
    total: number;
    parStatut: { _id: string; count: number }[];
    parProvider: { _id: string; count: number }[];
    tempsMoyenMs: number;
  }> {
    const [total, parStatut, parProvider, agg] = await Promise.all([
      this.model.countDocuments().exec(),
      this.model
        .aggregate<{ _id: string; count: number }>([
          { $group: { _id: '$statut', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .exec(),
      this.model
        .aggregate<{ _id: string; count: number }>([
          { $match: { llmProvider: { $exists: true } } },
          { $group: { _id: '$llmProvider', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .exec(),
      this.model
        .aggregate<{ _id: null; avg: number }>([
          { $group: { _id: null, avg: { $avg: '$tempsMs' } } },
        ])
        .exec(),
    ]);

    return {
      total,
      parStatut,
      parProvider,
      tempsMoyenMs: Math.round(agg[0]?.avg ?? 0),
    };
  }
}
