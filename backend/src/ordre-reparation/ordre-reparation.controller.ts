import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { StatutOR } from '@prisma/client';
import { OrdreReparationService } from './ordre-reparation.service';
import { CreateOrdreReparationDto } from './dto/create-ordre-reparation.dto';
import { UpdateOrdreReparationDto } from './dto/update-ordre-reparation.dto';

@Controller('or')
export class OrdreReparationController {
  constructor(private readonly orService: OrdreReparationService) {}

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
}
