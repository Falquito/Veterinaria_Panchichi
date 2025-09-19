import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrdenDeCompraService } from './orden-de-compra.service';
import { CreateOrdenDeCompraDto } from './dto/create-orden-de-compra.dto';
import { UpdateOrdenDeCompraDto } from './dto/update-orden-de-compra.dto';

@Controller('orden-de-compra')
export class OrdenDeCompraController {
  constructor(private readonly ordenDeCompraService: OrdenDeCompraService) {}

  @Post()
  create(@Body() createOrdenDeCompraDto: CreateOrdenDeCompraDto) {
    return this.ordenDeCompraService.create(createOrdenDeCompraDto);
  }

  @Get()
  findAll() {
    return this.ordenDeCompraService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordenDeCompraService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrdenDeCompraDto: UpdateOrdenDeCompraDto) {
  //   return this.ordenDeCompraService.update(+id, updateOrdenDeCompraDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.ordenDeCompraService.remove(+id);
  // }
}