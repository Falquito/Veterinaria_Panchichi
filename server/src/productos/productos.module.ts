import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { Producto } from './entities/producto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from 'src/categorias/entities/categoria.entity';
import { DepositosModule } from 'src/depositos/depositos.module'; // Importar el módulo, no el servicio

@Module({
  controllers: [ProductosController],
  providers: [ProductosService], // Solo tu propio servicio
  imports: [
    TypeOrmModule.forFeature([Producto, Categoria]),
    DepositosModule, // Importar el módulo completo
  ],
  exports: [ProductosService], // Exportar para que otros módulos puedan usarlo
})
export class ProductosModule {}