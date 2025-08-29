import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { Producto } from './entities/producto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from 'src/categorias/entities/categoria.entity';

@Module({
  controllers: [ProductosController],
  providers: [ProductosService],
  imports:[TypeOrmModule.forFeature([ Producto,Categoria])]
})
export class ProductosModule {}
