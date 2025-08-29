import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from 'src/categorias/entities/categoria.entity';

@Injectable()
export class ProductosService {
  @InjectRepository(Producto)
  private readonly productRepository:Repository<Producto>;
  @InjectRepository(Categoria)
  private readonly categoryRepository:Repository<Categoria>

  async create(createProductoDto: CreateProductoDto) {
    const {categoriaId,...productDetails} = createProductoDto;
    
    const categoria = await this.categoryRepository.findOneBy({id:categoriaId})

    const product = this.productRepository.create({...productDetails,categoria})

    await this.productRepository.save(product)

    return product
    

  }

  async findAll() {
    return await this.productRepository.find();
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOneBy({id})

    if(product){
      return product;
    }else{
      throw new NotFoundException()
    }
  }

  async update(id: number, updateProductoDto: UpdateProductoDto) {
    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }

    // Si viene un categoriaId en el DTO, la resolvemos
    if (updateProductoDto.categoriaId) {
      const categoria = await this.categoryRepository.findOneBy({
        id: updateProductoDto.categoriaId,
      });

      if (!categoria) {
        throw new NotFoundException(
          `Categoría con id ${updateProductoDto.categoriaId} no encontrada`,
        );
      }

      product.categoria = categoria;
    }

    // Merge de los demás campos
    Object.assign(product, updateProductoDto);

    return await this.productRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }

    await this.productRepository.remove(product);

    return { message: `Producto con id ${id} eliminado correctamente` };
  }
}
