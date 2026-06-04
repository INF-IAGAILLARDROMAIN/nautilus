import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrdreReparation,
  Prisma,
  StatutDevis,
  StatutOR,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrdreReparationDto } from './dto/create-ordre-reparation.dto';
import { UpdateOrdreReparationDto } from './dto/update-ordre-reparation.dto';

@Injectable()
export class OrdreReparationService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------------------------
  // Création
  // -------------------------------------------------------------------------

  /**
   * Crée un OR à partir d'un devis VALIDÉ.
   * Si le devis n'est pas validé OU si un OR existe déjà pour ce devis → erreur.
   * Cette méthode est appelée :
   *   - manuellement via POST /api/or
   *   - automatiquement par DevisService quand un devis passe au statut VALIDE
   */
  async create(dto: CreateOrdreReparationDto): Promise<OrdreReparation> {
    const devis = await this.prisma.devis.findUnique({
      where: { id: dto.devisId },
      include: { ordreReparation: true },
    });

    if (!devis) {
      throw new BadRequestException(`Devis ${dto.devisId} introuvable`);
    }
    if (devis.statut !== StatutDevis.VALIDE) {
      throw new BadRequestException(
        `Impossible de créer un OR : le devis ${devis.numeroDevis} n'est pas VALIDÉ (statut actuel : ${devis.statut}).`,
      );
    }
    if (devis.ordreReparation) {
      throw new BadRequestException(
        `Un OR existe déjà pour le devis ${devis.numeroDevis}.`,
      );
    }

    return this.prisma.ordreReparation.create({
      data: {
        devisId: dto.devisId,
        description: dto.description ?? null,
        type: dto.type,
        urgence: dto.urgence,
        mecano: dto.mecano ?? null,
      },
      include: { devis: true },
    });
  }

  // -------------------------------------------------------------------------
  // Lecture
  // -------------------------------------------------------------------------

  async findAll(params: {
    skip?: number;
    take?: number;
    statut?: StatutOR;
    mecano?: string;
  }): Promise<{ data: OrdreReparation[]; total: number }> {
    const { skip = 0, take = 20, statut, mecano } = params;

    const where: Prisma.OrdreReparationWhereInput = {
      ...(statut && { statut }),
      ...(mecano && { mecano: { equals: mecano, mode: 'insensitive' } }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.ordreReparation.findMany({
        where,
        skip,
        take,
        orderBy: [{ urgence: 'desc' }, { createdAt: 'desc' }],
        include: {
          devis: {
            select: {
              id: true,
              numeroDevis: true,
              totalTTC: true,
              bateau: {
                select: {
                  marque: true,
                  modele: true,
                  client: { select: { nom: true, prenom: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.ordreReparation.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: string): Promise<OrdreReparation> {
    const or = await this.prisma.ordreReparation.findUnique({
      where: { id },
      include: {
        devis: {
          include: {
            bateau: { include: { client: true } },
            lignes: { orderBy: { ordre: 'asc' } },
          },
        },
      },
    });
    if (!or) {
      throw new NotFoundException(`OR ${id} introuvable`);
    }
    return or;
  }

  // -------------------------------------------------------------------------
  // Mise à jour (statut, mecano, dates, etc.)
  // -------------------------------------------------------------------------

  async update(
    id: string,
    dto: UpdateOrdreReparationDto,
  ): Promise<OrdreReparation> {
    const or = await this.findOne(id);

    const updateData: Prisma.OrdreReparationUpdateInput = {};
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.urgence !== undefined) updateData.urgence = dto.urgence;
    if (dto.mecano !== undefined) updateData.mecano = dto.mecano;
    if (dto.dateDebut !== undefined)
      updateData.dateDebut = new Date(dto.dateDebut);
    if (dto.dateFin !== undefined) updateData.dateFin = new Date(dto.dateFin);

    if (dto.statut !== undefined) {
      updateData.statut = dto.statut;

      // Quand l'OR passe au statut FACTURE, on génère le numéro de facture
      if (dto.statut === StatutOR.FACTURE && !or.numeroFacture) {
        updateData.numeroFacture = await this.genererNumeroFacture();
      }
    }

    return this.prisma.ordreReparation.update({
      where: { id },
      data: updateData,
      include: { devis: true },
    });
  }

  // -------------------------------------------------------------------------
  // Suppression
  // -------------------------------------------------------------------------

  async remove(id: string): Promise<OrdreReparation> {
    await this.findOne(id);
    return this.prisma.ordreReparation.delete({ where: { id } });
  }

  // -------------------------------------------------------------------------
  // Helper : génération numéro de facture séquentiel
  // -------------------------------------------------------------------------

  /**
   * Génère un numéro de facture lisible : FAC-AAAA-XXXX
   * (séquentiel par année sur les OR au statut FACTURE).
   */
  private async genererNumeroFacture(): Promise<string> {
    const annee = new Date().getFullYear();
    const debutAnnee = new Date(annee, 0, 1);
    const finAnnee = new Date(annee + 1, 0, 1);

    const count = await this.prisma.ordreReparation.count({
      where: {
        numeroFacture: { not: null },
        updatedAt: { gte: debutAnnee, lt: finAnnee },
      },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `FAC-${annee}-${sequence}`;
  }
}
