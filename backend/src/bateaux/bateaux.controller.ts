import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BateauxService } from './bateaux.service';
import { CreateBateauDto } from './dto/create-bateau.dto';
import { UpdateBateauDto } from './dto/update-bateau.dto';

@Controller('bateaux')
export class BateauxController {
  constructor(private readonly bateauxService: BateauxService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateBateauDto) {
    return this.bateauxService.create(dto);
  }

  @Get()
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take: number,
    @Query('search') search?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.bateauxService.findAll({ skip, take, search, clientId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bateauxService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBateauDto) {
    return this.bateauxService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.bateauxService.remove(id);
  }
}
