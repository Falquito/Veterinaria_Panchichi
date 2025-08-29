import { Module } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CategoriasController } from './categorias.controller';
import { Producto } from 'src/productos/entities/producto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [CategoriasController],
  providers: [CategoriasService],
  imports:[TypeOrmModule.forFeature([ Producto])]
})
export class CategoriasModule {}
