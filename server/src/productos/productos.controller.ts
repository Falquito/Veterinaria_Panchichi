// src/productos/productos.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  BadRequestException,
  PipeTransform,
  ArgumentMetadata,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto, DepositoStockDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

import cloudinary from 'src/providers/cloudinary/cloudinary.provider';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { FileInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'productos',
    allowed_formats: ['jpg', 'png', 'jpeg'], // si tu lib usa allowedFormats, deja esto igual: ya está tipado como any
  } as any,
});

// Pipe para multipart + arrays + normalización de tipos
export class MultipartValidationPipe implements PipeTransform {
  constructor(private readonly dtoClass: any) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') return value;

    // depositos puede venir como string en multipart
    if (value.depositos && typeof value.depositos === 'string') {
      try {
        value.depositos = JSON.parse(value.depositos);
      } catch {
        throw new BadRequestException('depositos must be a valid JSON array');
      }
    }

    // removeDepositos (si lo usas) puede venir como string
    if (value.removeDepositos && typeof value.removeDepositos === 'string') {
      try {
        value.removeDepositos = JSON.parse(value.removeDepositos);
      } catch {
        throw new BadRequestException('removeDepositos must be a valid JSON array');
      }
    }

    // Normalizar números
    if (value.precio !== undefined && value.precio !== null) {
      value.precio = Number(value.precio);
    }
    if (value.categoriaId !== undefined && value.categoriaId !== null) {
      value.categoriaId = Number(value.categoriaId);
    }

    // Normalizar booleanos (acepta "true"/"false" desde multipart)
    const toBool = (v: any) =>
      v === true || v === 'true' || v === '1' || v === 1
        ? true
        : v === false || v === 'false' || v === '0' || v === 0
        ? false
        : v;

    if (value.status !== undefined) value.status = toBool(value.status);
    if (value.activo !== undefined) value.activo = toBool(value.activo);

    // Mapear cada depósito al DTO correspondiente
    if (Array.isArray(value.depositos)) {
      value.depositos = value.depositos.map((d) =>
        plainToInstance(DepositoStockDto, d),
      );
    }

    // Transformar al DTO principal (Create o Update según se use)
    const dtoObject = plainToInstance(this.dtoClass, value);

    // Validar
    const errors = validateSync(dtoObject, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errors.length > 0) {
      const messages = errors
        .map((err) => Object.values(err.constraints || {}))
        .flat();
      throw new BadRequestException(messages);
    }

    return dtoObject;
  }
}

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  // CREATE con imagen (multipart) o sin (JSON)
  @Post()
  @UseInterceptors(FileInterceptor('image', { storage }))
  create(
    @Body(new MultipartValidationPipe(CreateProductoDto)) createProductoDto: CreateProductoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productosService.create(createProductoDto, file);
  }

  @Get()
  findAll() {
    return this.productosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.findOne(id);
  }

  // UPDATE con imagen opcional (multipart) o solo JSON
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', { storage }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new MultipartValidationPipe(UpdateProductoDto)) dto: UpdateProductoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // ⬇️ Asegúrate de haber cambiado la firma del service:
    // async update(id: number, dto: UpdateProductoDto, file?: Express.Multer.File)
    return this.productosService.update(id, dto, file);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.remove(id);
  }

  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.restore(id);
  }
}
