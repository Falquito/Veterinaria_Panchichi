import { Module } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CategoriasController } from './categorias.controller';
import { Producto } from 'src/productos/entities/producto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';

@Module({
  controllers: [CategoriasController],
  providers: [CategoriasService],
  imports:[TypeOrmModule.forFeature([ Producto,Categoria])]
})
export class CategoriasModule {}
