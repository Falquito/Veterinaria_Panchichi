import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { Producto } from './entities/producto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from 'src/categorias/entities/categoria.entity';

import { DepositosService } from 'src/depositos/depositos.service';
import { Deposito } from 'src/depositos/entities/deposito.entity';

@Module({
  controllers: [ProductosController],
  providers: [ProductosService,DepositosService],
  imports:[TypeOrmModule.forFeature([ Producto,Categoria,Deposito])]
})
export class ProductosModule {}
