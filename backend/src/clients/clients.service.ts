import { Injectable, NotFoundException } from '@nestjs/common';
import { Client, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientDto): Promise<Client> {
    return this.prisma.client.create({ data: dto });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    search?: string;
  }): Promise<{ data: Client[]; total: number }> {
    const { skip = 0, take = 20, search } = params;

    const where: Prisma.ClientWhereInput = search
      ? {
          OR: [
            { nom: { contains: search, mode: 'insensitive' } },
            { prenom: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.client.findMany({
        where,
        skip,
        take,
        // Tri alphabétique par défaut (nom puis prénom) — comme un annuaire métier.
        // Cohérent avec la pratique des ERP type Infocob.
        orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
        include: { _count: { select: { bateaux: true } } },
      }),
      this.prisma.client.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: string): Promise<Client> {
    // Page détail Client : on inclut bateaux + devis (avec OR imbriqué).
    // Les OR/factures sont dérivés côté front depuis devis.ordreReparation.
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        bateaux: { orderBy: { createdAt: 'desc' } },
        devis: {
          orderBy: { createdAt: 'desc' },
          include: {
            bateau: { select: { id: true, nom: true, marque: true, modele: true } },
            ordreReparation: {
              select: {
                id: true,
                statut: true,
                numeroFacture: true,
                createdAt: true,
                mecano: true,
              },
            },
            _count: { select: { lignes: true } },
          },
        },
      },
    });
    if (!client) {
      throw new NotFoundException(`Client ${id} introuvable`);
    }
    return client;
  }

  async update(id: string, dto: UpdateClientDto): Promise<Client> {
    await this.findOne(id); // garantit l'existence
    return this.prisma.client.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<Client> {
    await this.findOne(id);
    return this.prisma.client.delete({ where: { id } });
  }
}
