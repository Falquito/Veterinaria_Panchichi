// src/proveedores/proveedores.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  // POST /crear proveedor
  @Post()
  create(@Body() dto: CreateProveedorDto) {
    return this.proveedoresService.create(dto);
  }


  @Get()
  findAll(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {

    return this.proveedoresService.findAll({
      q,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
  }

  // GET 
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proveedoresService.findOne(+id);
  }

  // PATCH 
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProveedorDto) {
    return this.proveedoresService.update(+id, dto);
  }

  // DELETE 
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.proveedoresService.remove(+id);
  }
}