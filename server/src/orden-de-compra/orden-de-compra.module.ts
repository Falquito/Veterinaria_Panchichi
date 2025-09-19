import { Module } from '@nestjs/common';
import { OrdenDeCompraService } from './orden-de-compra.service';
import { OrdenDeCompraController } from './orden-de-compra.controller';
import { ProductosService } from 'src/productos/productos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdenDeCompra } from './entities/orden-de-compra.entity';
import { OrdenDeCompraPorProducto } from 'src/entities/Orden_de_compra_Por_Producto.entity';
import { Producto } from 'src/productos/entities/producto.entity';
import { Categoria } from 'src/categorias/entities/categoria.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';

@Module({
  controllers: [OrdenDeCompraController],
  providers: [OrdenDeCompraService,ProductosService],
  imports:[TypeOrmModule.forFeature([OrdenDeCompra,OrdenDeCompraPorProducto,Producto,Categoria,Proveedor])]
})
export class OrdenDeCompraModule {}