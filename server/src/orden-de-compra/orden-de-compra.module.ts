import { Module } from '@nestjs/common';
import { OrdenDeCompraService } from './orden-de-compra.service';
import { OrdenDeCompraController } from './orden-de-compra.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdenDeCompra } from './entities/orden-de-compra.entity';
import { OrdenDeCompraPorProducto } from 'src/entities/Orden_de_compra_Por_Producto.entity';
import { ProductosModule } from 'src/productos/productos.module'; // Importar el MÓDULO
import { ProveedoresModule } from 'src/proveedores/proveedores.module'; // Si lo necesitas

@Module({
  controllers: [OrdenDeCompraController],
  providers: [OrdenDeCompraService], // Solo tu servicio propio
  imports: [
    TypeOrmModule.forFeature([OrdenDeCompra, OrdenDeCompraPorProducto]),
    ProductosModule, // Importar el módulo completo que ya maneja sus dependencias
    ProveedoresModule, // Si necesitas servicios de proveedores
  ]
})
export class OrdenDeCompraModule {}