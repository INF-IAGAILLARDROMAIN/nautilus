import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { DevisService } from './devis.service';
import { OrdreReparationService } from '../ordre-reparation/ordre-reparation.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Tests unitaires du service Devis.
 *
 * On vérifie la logique métier critique :
 *   - refus si bateau d'un autre client (intégrité métier)
 *   - calcul des totaux HT/TVA/TTC
 *
 * Prisma et OrdreReparationService sont mockés pour rester isolé.
 */
describe('DevisService', () => {
  let service: DevisService;
  let prisma: {
    client: { findUnique: jest.Mock };
    bateau: { findUnique: jest.Mock };
    devis: { create: jest.Mock; count: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      client: { findUnique: jest.fn() },
      bateau: { findUnique: jest.fn() },
      devis: { create: jest.fn(), count: jest.fn().mockResolvedValue(0) },
    };

    const module = await Test.createTestingModule({
      providers: [
        DevisService,
        { provide: PrismaService, useValue: prisma },
        { provide: OrdreReparationService, useValue: { create: jest.fn() } },
      ],
    }).compile();

    service = module.get<DevisService>(DevisService);
  });

  describe('create', () => {
    it("refuse si le bateau n'appartient pas au client (sécurité métier)", async () => {
      prisma.client.findUnique.mockResolvedValue({ id: 'cli-1' });
      prisma.bateau.findUnique.mockResolvedValue({
        id: 'bat-1',
        clientId: 'autre-cli', // ≠ cli-1
      });

      await expect(
        service.create({
          clientId: 'cli-1',
          bateauId: 'bat-1',
          lignes: [{ description: 'Vidange', quantite: 1, prixUnitaireHT: 120 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("refuse si le client n'existe pas", async () => {
      prisma.client.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          clientId: 'cli-inexistant',
          lignes: [{ description: 'Vidange', quantite: 1, prixUnitaireHT: 120 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('calcule correctement les totaux HT/TTC avec TVA 20%', async () => {
      prisma.client.findUnique.mockResolvedValue({ id: 'cli-1' });
      prisma.devis.create.mockImplementation(
        ({ data }: { data: Record<string, unknown> }) =>
          Promise.resolve({ id: 'dev-1', ...data, lignes: [] }),
      );

      await service.create({
        clientId: 'cli-1',
        tauxTVA: 20,
        lignes: [
          { description: 'Vidange', quantite: 1, prixUnitaireHT: 120 },
          { description: 'Filtre', quantite: 3, prixUnitaireHT: 18 },
          { description: 'Main d œuvre', quantite: 2, prixUnitaireHT: 65 },
        ],
      });

      const createArg = prisma.devis.create.mock.calls[0][0].data as {
        totalHT: number;
        totalTTC: number;
      };
      // HT = 120 + 54 + 130 = 304
      expect(createArg.totalHT).toBe(304);
      // TTC = 304 × 1.20 = 364.80
      expect(createArg.totalTTC).toBe(364.8);
    });
  });
});
