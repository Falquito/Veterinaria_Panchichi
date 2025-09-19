import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, PipeTransform, ArgumentMetadata } from '@nestjs/common';
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
    allowed_formats: ['jpg', 'png', 'jpeg'],
  } as any,
});

// ---- Pipe para multipart (misma que tenías) ----
export class MultipartValidationPipe implements PipeTransform {
  constructor(private readonly dtoClass: any) {}
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') return value;
    if (value.depositos && typeof value.depositos === 'string') {
      try { value.depositos = JSON.parse(value.depositos); }
      catch { throw new BadRequestException('depositos must be a valid JSON array'); }
    }
    if (value.precio !== undefined) value.precio = Number(value.precio);
    if (value.categoriaId !== undefined) value.categoriaId = Number(value.categoriaId);
    if (Array.isArray(value.depositos)) {
      value.depositos = value.depositos.map(d => plainToInstance(DepositoStockDto, d));
    }
    const dtoObject = plainToInstance(this.dtoClass, value);
    const errors = validateSync(dtoObject, { whitelist: true, forbidNonWhitelisted: true });
    if (errors.length > 0) {
      const messages = errors.map(e => Object.values(e.constraints || {})).flat();
      throw new BadRequestException(messages);
    }
    return dtoObject;
  }
}

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', { storage })) 
  create(
    @Body(new MultipartValidationPipe(CreateProductoDto)) createProductoDto: CreateProductoDto,
    @UploadedFile() file: Express.Multer.File
  ) {
  
    return this.productosService.create(createProductoDto, file);
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
  @UseInterceptors(FileInterceptor('image', { storage }))
  update(
    @Param('id') id: string,
    @Body(new MultipartValidationPipe(UpdateProductoDto)) dto: UpdateProductoDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.productosService.update(+id, dto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productosService.remove(+id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.productosService.restore(+id);
  }
}
