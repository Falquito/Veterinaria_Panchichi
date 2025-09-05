import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { Producto } from './entities/producto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from 'src/categorias/entities/categoria.entity';
import { MovimientosxLotexDeposito } from 'src/entities/MovimientosXLoteXDeposito.entity';
import { Lote } from 'src/lotes/entities/lote.entity';
import { LoteXDeposito } from 'src/entities/LoteXDeposito.entity';
import { DepositosService } from 'src/depositos/depositos.service';
import { Deposito } from 'src/depositos/entities/deposito.entity';

@Module({
  controllers: [ProductosController],
  providers: [ProductosService,DepositosService],
  imports:[TypeOrmModule.forFeature([ Producto,Categoria,MovimientosxLotexDeposito,Lote,LoteXDeposito,Deposito])]
})
export class ProductosModule {}
