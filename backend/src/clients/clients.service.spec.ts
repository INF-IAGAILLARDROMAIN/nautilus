import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Tests unitaires du service Clients.
 *
 * On mocke Prisma pour rester isolé du Postgres réel.
 * Pattern standard NestJS : Test.createTestingModule avec providers stubbés.
 */
describe('ClientsService', () => {
  let service: ClientsService;
  let prisma: { client: { findUnique: jest.Mock; create: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      client: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  describe('findOne', () => {
    it('retourne le client + ses bateaux + ses devis quand il existe', async () => {
      const fakeClient = {
        id: 'cli-1',
        nom: 'Martin',
        prenom: 'Sophie',
        bateaux: [],
        devis: [],
      };
      prisma.client.findUnique.mockResolvedValue(fakeClient);

      const result = await service.findOne('cli-1');

      expect(result).toEqual(fakeClient);
      expect(prisma.client.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'cli-1' } }),
      );
    });

    it("lève NotFoundException si l'id est inconnu", async () => {
      prisma.client.findUnique.mockResolvedValue(null);

      await expect(service.findOne('cli-inconnu')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
