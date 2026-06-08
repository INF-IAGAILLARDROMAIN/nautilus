import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Devis, Prisma, StatutDevis } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OrdreReparationService } from '../ordre-reparation/ordre-reparation.service';
import {
  CreateDevisDto,
  CreateLigneDevisDto,
} from './dto/create-devis.dto';
import { UpdateDevisDto } from './dto/update-devis.dto';

@Injectable()
export class DevisService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orService: OrdreReparationService,
  ) {}

  // -------------------------------------------------------------------------
  // Création
  // -------------------------------------------------------------------------

  async create(dto: CreateDevisDto): Promise<Devis> {
    // Vérifie que le client existe (obligatoire — un devis a toujours un client).
    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
    });
    if (!client) {
      throw new BadRequestException(`Client ${dto.clientId} introuvable`);
    }

    // Si bateau fourni : vérifie qu'il existe ET qu'il appartient bien au client.
    // Bateau null = devis pré-vente / accessoires / sans bateau enregistré.
    if (dto.bateauId) {
      const bateau = await this.prisma.bateau.findUnique({
        where: { id: dto.bateauId },
      });
      if (!bateau) {
        throw new BadRequestException(`Bateau ${dto.bateauId} introuvable`);
      }
      if (bateau.clientId !== dto.clientId) {
        throw new BadRequestException(
          `Le bateau sélectionné n'appartient pas à ce client.`,
        );
      }
    }

    const tauxTVA = dto.tauxTVA ?? 20;
    const { totalHT, totalTTC } = this.calculerTotaux(dto.lignes, tauxTVA);
    const numeroDevis = await this.genererNumeroDevis();

    return this.prisma.devis.create({
      data: {
        numeroDevis,
        description: dto.description ?? null,
        clientId: dto.clientId,
        bateauId: dto.bateauId ?? null,
        tauxTVA,
        totalHT,
        totalTTC,
        dateValidite: dto.dateValidite ? new Date(dto.dateValidite) : null,
        modalitesPaiement: dto.modalitesPaiement ?? null,
        lignes: {
          create: dto.lignes.map((l, index) => ({
            description: l.description,
            quantite: l.quantite,
            prixUnitaireHT: l.prixUnitaireHT,
            totalLigneHT: this.arrondi(l.quantite * l.prixUnitaireHT),
            ordre: index,
          })),
        },
      },
      include: { lignes: { orderBy: { ordre: 'asc' } } },
    });
  }

  // -------------------------------------------------------------------------
  // Lecture
  // -------------------------------------------------------------------------

  async findAll(params: {
    skip?: number;
    take?: number;
    bateauId?: string;
    statut?: StatutDevis;
  }): Promise<{ data: Devis[]; total: number }> {
    const { skip = 0, take = 20, bateauId, statut } = params;

    const where: Prisma.DevisWhereInput = {
      ...(bateauId && { bateauId }),
      ...(statut && { statut }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.devis.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          // Client direct (utile pour les devis sans bateau — cas pré-vente)
          client: { select: { id: true, nom: true, prenom: true } },
          bateau: {
            select: {
              id: true,
              nom: true,
              marque: true,
              modele: true,
              client: { select: { id: true, nom: true, prenom: true } },
            },
          },
          _count: { select: { lignes: true } },
        },
      }),
      this.prisma.devis.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: string): Promise<Devis> {
    const devis = await this.prisma.devis.findUnique({
      where: { id },
      include: {
        client: true,
        bateau: { include: { client: true } },
        lignes: { orderBy: { ordre: 'asc' } },
        ordreReparation: true,
      },
    });
    if (!devis) {
      throw new NotFoundException(`Devis ${id} introuvable`);
    }
    return devis;
  }

  // -------------------------------------------------------------------------
  // Mise à jour
  // -------------------------------------------------------------------------

  async update(id: string, dto: UpdateDevisDto): Promise<Devis> {
    const devis = await this.findOne(id);

    // Si lignes fournies, on recalcule totaux + on remplace les lignes
    const updateData: Prisma.DevisUpdateInput = {};

    if (dto.bateauId) {
      const bateau = await this.prisma.bateau.findUnique({
        where: { id: dto.bateauId },
      });
      if (!bateau) {
        throw new BadRequestException(`Bateau ${dto.bateauId} introuvable`);
      }
      updateData.bateau = { connect: { id: dto.bateauId } };
    }
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.statut !== undefined) updateData.statut = dto.statut;

    const tauxTVA = dto.tauxTVA ?? Number(devis.tauxTVA);
    if (dto.tauxTVA !== undefined) updateData.tauxTVA = tauxTVA;

    if (dto.lignes) {
      const { totalHT, totalTTC } = this.calculerTotaux(dto.lignes, tauxTVA);
      updateData.totalHT = totalHT;
      updateData.totalTTC = totalTTC;
      updateData.lignes = {
        deleteMany: {},
        create: dto.lignes.map((l, index) => ({
          description: l.description,
          quantite: l.quantite,
          prixUnitaireHT: l.prixUnitaireHT,
          totalLigneHT: this.arrondi(l.quantite * l.prixUnitaireHT),
          ordre: index,
        })),
      };
    }

    const devisMisAJour = await this.prisma.devis.update({
      where: { id },
      data: updateData,
      include: {
        lignes: { orderBy: { ordre: 'asc' } },
        ordreReparation: true,
      },
    });

    // ⚡ Création automatique de l'OR quand le devis passe au statut VALIDE
    if (
      dto.statut === StatutDevis.VALIDE &&
      !(devisMisAJour as Devis & { ordreReparation: unknown }).ordreReparation
    ) {
      await this.orService.create({ devisId: id });
    }

    return devisMisAJour;
  }

  // -------------------------------------------------------------------------
  // Suppression
  // -------------------------------------------------------------------------

  async remove(id: string): Promise<Devis> {
    const devis = await this.findOne(id);
    // Si un OR est déjà lié, on refuse la suppression (intégrité métier)
    if ((devis as Devis & { ordreReparation?: unknown }).ordreReparation) {
      throw new BadRequestException(
        `Impossible de supprimer un devis lié à un ordre de réparation. Supprimez d'abord l'OR.`,
      );
    }
    return this.prisma.devis.delete({ where: { id } });
  }

  // -------------------------------------------------------------------------
  // Helpers privés
  // -------------------------------------------------------------------------

  private calculerTotaux(
    lignes: CreateLigneDevisDto[],
    tauxTVA: number,
  ): { totalHT: number; totalTTC: number } {
    const totalHT = this.arrondi(
      lignes.reduce((acc, l) => acc + l.quantite * l.prixUnitaireHT, 0),
    );
    const totalTTC = this.arrondi(totalHT * (1 + tauxTVA / 100));
    return { totalHT, totalTTC };
  }

  private arrondi(montant: number): number {
    return Math.round(montant * 100) / 100;
  }

  /**
   * Génère un numéro de devis lisible : DEV-AAAA-XXXX
   * (séquentiel par année, padding 4 chiffres).
   */
  private async genererNumeroDevis(): Promise<string> {
    const annee = new Date().getFullYear();
    const debutAnnee = new Date(annee, 0, 1);
    const finAnnee = new Date(annee + 1, 0, 1);

    const count = await this.prisma.devis.count({
      where: { createdAt: { gte: debutAnnee, lt: finAnnee } },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `DEV-${annee}-${sequence}`;
  }
}
