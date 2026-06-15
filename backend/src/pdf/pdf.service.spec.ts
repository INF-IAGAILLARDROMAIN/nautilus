import { Test } from '@nestjs/testing';
import { PdfService } from './pdf.service';

/**
 * Tests unitaires du service PDF.
 *
 * On vérifie que les 3 types de PDF (devis, OR, facture) sont bien
 * générés au format PDF binaire valide. C'est un smoke test qui
 * détecte toute régression majeure (crash, format cassé, etc.).
 */
describe('PdfService', () => {
  let service: PdfService;

  const fakeClient = {
    nom: 'Martin',
    prenom: 'Sophie',
    email: 'sophie@example.com',
    telephone: '06 XX XX XX XX',
    adresse: '12 quai du port',
    codePostal: '00000',
    ville: 'Ville-Type',
  };

  const fakeLignes = [
    {
      description: 'Vidange moteur',
      quantite: 1,
      prixUnitaireHT: 120,
      totalLigneHT: 120,
    },
  ];

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PdfService],
    }).compile();
    service = module.get<PdfService>(PdfService);
  });

  it('génère un PDF de devis au format binaire valide', async () => {
    const pdf = await service.genererDevisPdf({
      numeroDevis: 'DEV-2026-0001',
      createdAt: new Date('2026-06-11'),
      totalHT: 120,
      tauxTVA: 20,
      totalTTC: 144,
      lignes: fakeLignes,
      client: fakeClient,
    });

    // Magic bytes PDF : un fichier PDF commence par "%PDF-"
    expect(pdf.slice(0, 5).toString('ascii')).toBe('%PDF-');
    expect(pdf.length).toBeGreaterThan(1000);
  });

  it('génère un PDF de facture avec le numéro FAC dans le titre', async () => {
    const pdf = await service.genererFacturePdf({
      numeroDevis: 'DEV-2026-0001',
      numeroFacture: 'FAC-2026-0001',
      createdAt: new Date('2026-06-11'),
      totalHT: 120,
      tauxTVA: 20,
      totalTTC: 144,
      lignes: fakeLignes,
      client: fakeClient,
    });

    expect(pdf.slice(0, 5).toString('ascii')).toBe('%PDF-');
    // Le numéro de facture doit apparaître dans le binaire du PDF
    expect(pdf.toString('binary')).toContain('FAC-2026-0001');
  });

  it("génère un PDF d'OR (document interne) au format binaire valide", async () => {
    const pdf = await service.genererOrPdf({
      numeroDevis: 'DEV-2026-0001',
      type: 'ENTRETIEN',
      urgence: 'NORMAL',
      mecano: 'Pierre',
      createdAt: new Date('2026-06-11'),
      lignes: fakeLignes,
      client: fakeClient,
    });

    expect(pdf.slice(0, 5).toString('ascii')).toBe('%PDF-');
    expect(pdf.length).toBeGreaterThan(1000);
  });
});
