import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Bateau, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBateauDto } from './dto/create-bateau.dto';
import { UpdateBateauDto } from './dto/update-bateau.dto';

@Injectable()
export class BateauxService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBateauDto): Promise<Bateau> {
    // Vérifie que le client existe avant de créer le bateau
    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
    });
    if (!client) {
      throw new BadRequestException(`Client ${dto.clientId} introuvable`);
    }

    try {
      return await this.prisma.bateau.create({ data: dto });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        // P2002 = unique constraint violation (sur plaqueMoteur)
        throw new BadRequestException(
          `Un bateau avec la plaque "${dto.plaqueMoteur}" existe déjà.`,
        );
      }
      throw e;
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    search?: string;
    clientId?: string;
  }): Promise<{ data: Bateau[]; total: number }> {
    const { skip = 0, take = 20, search, clientId } = params;

    const where: Prisma.BateauWhereInput = {
      ...(clientId && { clientId }),
      ...(search && {
        OR: [
          { marque: { contains: search, mode: 'insensitive' } },
          { modele: { contains: search, mode: 'insensitive' } },
          { plaqueMoteur: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.bateau.findMany({
        where,
        skip,
        take,
        // Tri alphabétique par défaut (marque puis modèle) — comme un annuaire.
        orderBy: [{ marque: 'asc' }, { modele: 'asc' }],
        include: {
          client: { select: { id: true, nom: true, prenom: true } },
          _count: { select: { devis: true } },
        },
      }),
      this.prisma.bateau.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: string): Promise<Bateau> {
    const bateau = await this.prisma.bateau.findUnique({
      where: { id },
      include: {
        client: true,
        devis: {
          orderBy: { createdAt: 'desc' },
          include: { ordreReparation: true },
        },
      },
    });
    if (!bateau) {
      throw new NotFoundException(`Bateau ${id} introuvable`);
    }
    return bateau;
  }

  async update(id: string, dto: UpdateBateauDto): Promise<Bateau> {
    await this.findOne(id); // garantit l'existence
    try {
      return await this.prisma.bateau.update({ where: { id }, data: dto });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new BadRequestException(
          `Un autre bateau utilise déjà cette plaque moteur.`,
        );
      }
      throw e;
    }
  }

  async remove(id: string): Promise<Bateau> {
    await this.findOne(id);
    return this.prisma.bateau.delete({ where: { id } });
  }
}
