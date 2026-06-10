import {
  Body,
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
import { StatutDevis } from '@prisma/client';
import { DevisService } from './devis.service';
import { CreateDevisDto } from './dto/create-devis.dto';
import { UpdateDevisDto } from './dto/update-devis.dto';
import { PdfService, DevisPdfInput } from '../pdf/pdf.service';

@Controller('devis')
export class DevisController {
  constructor(
    private readonly devisService: DevisService,
    private readonly pdfService: PdfService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateDevisDto) {
    return this.devisService.create(dto);
  }

  @Get()
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take: number,
    @Query('bateauId') bateauId?: string,
    @Query('statut', new ParseEnumPipe(StatutDevis, { optional: true }))
    statut?: StatutDevis,
  ) {
    return this.devisService.findAll({ skip, take, bateauId, statut });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.devisService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDevisDto) {
    return this.devisService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.devisService.remove(id);
  }

  /**
   * Génère et renvoie le PDF du devis (inline dans le navigateur si possible,
   * sinon téléchargement). Le nom du fichier suit le numéro de devis.
   */
  @Get(':id/pdf')
  async getPdf(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const devis = await this.devisService.findOne(id);
    const d = devis as unknown as DevisPdfInput & {
      client?: DevisPdfInput['client'] | null;
    };
    if (!d.client) {
      throw new NotFoundException(
        `Le devis ${id} n'a pas de client associé — PDF impossible`,
      );
    }
    const pdf = await this.pdfService.genererDevisPdf({
      ...d,
      client: d.client,
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${d.numeroDevis}.pdf"`,
    );
    res.setHeader('Content-Length', pdf.length.toString());
    return new StreamableFile(Readable.from(pdf));
  }
}
