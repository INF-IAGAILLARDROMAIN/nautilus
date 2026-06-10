import {
  Body,
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { Readable } from 'stream';
import { StatutOR } from '@prisma/client';
import { OrdreReparationService } from './ordre-reparation.service';
import { CreateOrdreReparationDto } from './dto/create-ordre-reparation.dto';
import { UpdateOrdreReparationDto } from './dto/update-ordre-reparation.dto';
import { PdfService, FacturePdfInput, OrPdfInput } from '../pdf/pdf.service';

@Controller('or')
export class OrdreReparationController {
  constructor(
    private readonly orService: OrdreReparationService,
    private readonly pdfService: PdfService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateOrdreReparationDto) {
    return this.orService.create(dto);
  }

  @Get()
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take: number,
    @Query('statut', new ParseEnumPipe(StatutOR, { optional: true }))
    statut?: StatutOR,
    @Query('mecano') mecano?: string,
  ) {
    return this.orService.findAll({ skip, take, statut, mecano });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrdreReparationDto) {
    return this.orService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.orService.remove(id);
  }

  /**
   * Génère le PDF de l'OR (document INTERNE pour le mécano en atelier).
   * Pas de mentions légales, pas de RGPD : c'est un papier de travail.
   * Cases à cocher pour les étapes, zone observations, signature mécano.
   */
  @Get(':id/pdf')
  async getOrPdf(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const or = (await this.orService.findOne(id)) as unknown as {
      type: string;
      urgence: string;
      mecano: string | null;
      description: string | null;
      dateDebut: Date | null;
      dateFin: Date | null;
      createdAt: Date;
      devis: {
        numeroDevis: string;
        lignes: OrPdfInput['lignes'];
        client: OrPdfInput['client'] | null;
        bateau?: OrPdfInput['bateau'] | null;
      };
    };

    if (!or.devis?.client) {
      throw new NotFoundException(
        `Aucun client associé au devis lié à cet OR — PDF impossible`,
      );
    }

    const pdf = await this.pdfService.genererOrPdf({
      numeroDevis: or.devis.numeroDevis,
      type: or.type,
      urgence: or.urgence,
      mecano: or.mecano,
      description: or.description,
      dateDebut: or.dateDebut,
      dateFin: or.dateFin,
      createdAt: or.createdAt,
      lignes: or.devis.lignes,
      client: or.devis.client,
      bateau: or.devis.bateau ?? null,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="OR-${or.devis.numeroDevis}.pdf"`,
    );
    res.setHeader('Content-Length', pdf.length.toString());
    return new StreamableFile(Readable.from(pdf));
  }

  /**
   * Génère le PDF de FACTURE pour un OR au statut FACTURE.
   * Réutilise les données du devis lié (lignes, totaux, client, bateau) +
   * le numéro de facture (FAC-AAAA-XXXX) généré au passage en FACTURE.
   */
  @Get(':id/facture-pdf')
  async getFacturePdf(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const or = (await this.orService.findOne(id)) as unknown as {
      numeroFacture: string | null;
      statut: StatutOR;
      mecano: string | null;
      devis: FacturePdfInput & {
        client: FacturePdfInput['client'] | null;
      };
    };

    if (!or.numeroFacture) {
      throw new BadRequestException(
        `Cet OR n'est pas encore facturé (statut actuel : ${or.statut}). ` +
          `Faites passer l'OR en statut FACTURE pour générer le numéro de facture.`,
      );
    }
    if (!or.devis?.client) {
      throw new NotFoundException(
        `Aucun client associé au devis lié à cet OR — PDF impossible`,
      );
    }

    const pdf = await this.pdfService.genererFacturePdf({
      ...or.devis,
      client: or.devis.client,
      numeroFacture: or.numeroFacture,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${or.numeroFacture}.pdf"`,
    );
    res.setHeader('Content-Length', pdf.length.toString());
    return new StreamableFile(Readable.from(pdf));
  }
}
