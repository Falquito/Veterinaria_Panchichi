import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseInterceptors, UploadedFile, ValidationPipe, ParseIntPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';


@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

   @Post()
  create(
    @Body(new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true,
    }))
    dto: CreateProductoDto,
  ) {
    // Por si acaso, forzar a number
    dto.precio = Number(dto.precio);
    dto.categoriaId = Number(dto.categoriaId);
    dto.stock = Number(dto.stock);

    return this.productosService.create(dto);
  }
  
  @Get()
  findAll() {
    return this.productosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductoDto: UpdateProductoDto) {
    return this.productosService.update(+id, updateProductoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productosService.remove(+id);
  }
}
