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
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { bateaux: true } } },
      }),
      this.prisma.client.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: { bateaux: true },
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
