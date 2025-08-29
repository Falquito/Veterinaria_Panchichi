import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LotesService } from './lotes.service';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';

@Controller('lotes')
export class LotesController {
  constructor(private readonly lotesService: LotesService) {}

  @Post()
  create(@Body() createLoteDto: CreateLoteDto) {
    return this.lotesService.create(createLoteDto);
  }

  @Get()
  findAll() {
    return this.lotesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lotesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLoteDto: UpdateLoteDto) {
    return this.lotesService.update(+id, updateLoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lotesService.remove(+id);
  }
}
