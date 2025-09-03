import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { DataSource, Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Categoria } from 'src/categorias/entities/categoria.entity';
import { MovimientosxLotexDeposito } from 'src/entities/MovimientosXLoteXDeposito.entity';
import { Lote } from 'src/lotes/entities/lote.entity';
import { LoteXDeposito } from 'src/entities/LoteXDeposito.entity';
import { DepositosService } from 'src/depositos/depositos.service';
import { Deposito } from '../depositos/entities/deposito.entity';

@Injectable()
export class ProductosService {

  @InjectDataSource()
  private readonly dataSource:DataSource
  private readonly logger = new Logger('ProductsService')
  @InjectRepository(Producto)
  private readonly productRepository:Repository<Producto>;
  @InjectRepository(Categoria)
  private readonly categoryRepository:Repository<Categoria>;
  @InjectRepository(MovimientosxLotexDeposito)
  private readonly movimientosRepository:Repository<MovimientosxLotexDeposito>;
  @InjectRepository(Lote)
  private readonly loteRepository:Repository<Lote>

  @Inject(DepositosService)
  private readonly depositoService:DepositosService;

  @InjectRepository(LoteXDeposito)
  private readonly lotexDepositoRepository:Repository<LoteXDeposito>;

  async create(createProductoDto: CreateProductoDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //Creacion de producto
      const {categoriaId,fechaelaboracion,fechaVencimiento,IdDeposito,cantidad,...productDetails} = createProductoDto;
      
      const categoria = await queryRunner.manager.findOneBy(Categoria,{id:categoriaId})

      const product = queryRunner.manager.create(Producto,{...productDetails,categoria})

      await queryRunner.manager.save(product)
      //Creo lote
      const lote = queryRunner.manager.create(Lote,{idProducto:product,fechaElaboracion:fechaelaboracion,fechaVencimiento:fechaVencimiento})

      await queryRunner.manager.save(lote)
      //Inserto movimiento de INS

      const movimiento = queryRunner.manager.create(MovimientosxLotexDeposito,{id_producto:product.id,id_lote:lote.idLote,id_deposito:IdDeposito,tipo:"INS",cantidad:cantidad})

      await queryRunner.manager.save(movimiento);

      //Actualizo movimiento en la tabla LoteXDeposito

      const deposito = await queryRunner.manager.findOneBy(Deposito,{id_deposito:IdDeposito})

      //Calculo de stock
      const totalResult = await queryRunner.manager
      .createQueryBuilder(MovimientosxLotexDeposito, "mov")
      .select("SUM(mov.cantidad)", "total")
      .innerJoin("producto", "p", "p.id = mov.id_producto")
      .innerJoin("lote", "l", "l.id_lote = mov.id_lote")
      .innerJoin("deposito", "d", "d.id_deposito = mov.id_deposito")
      .where("mov.tipo LIKE :tipo", { tipo: '%INS%' })
      .andWhere("mov.id_producto = :idProducto", { idProducto: product.id })
      .getRawOne();

      const total = parseInt(totalResult.total ?? 0);
      
      const loteXDeposito = queryRunner.manager.create(LoteXDeposito,{lote:lote,deposito:deposito,stock:total})

      await queryRunner.manager.save(loteXDeposito)


      await queryRunner.commitTransaction()





      return product
    } catch (error) {
      await queryRunner.rollbackTransaction()
      this.handleDbExceptions(error)
      
    }finally{
      await queryRunner.release();
    }
    

  }

  async findAll() {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result = await queryRunner.manager.createQueryBuilder(Producto,"p")
      .select("p.id,p.nombre,p.descripcion,p.precio,p.activo,c.nombre as NombreCategoria,ld.stock,ld.id_deposito AS IdDeposito")
      .innerJoin("categoria","c","c.id = p.categoriaId")
      .innerJoin("lote", "l", "p.id = l.id_producto")
      .innerJoin("lote_x_deposito", "ld", "ld.id_lote = l.id_lote")
      .groupBy("ld.id_deposito,p.id,NombreCategoria,ld.stock")
      .getRawMany()
      await queryRunner.commitTransaction()
      console.log(result)


      // 🔥 Agrupamos por depósito
      const grouped = result.reduce((acc, row) => {
      const depositoId = row.iddeposito;
      if (!acc[depositoId]) {
        acc[depositoId] = {
          idDeposito: depositoId,
          productos: [],
        };
      }
      acc[depositoId].productos.push({
        id: row.id,
        nombre: row.nombre,
        descripcion: row.descripcion,
        precio: row.precio,
        activo: row.activo,
        nombreCategoria: row.nombrecategoria,
        stock: row.stock,
      });
      return acc;
    }, {});
      return grouped

    } catch (error) {
      await queryRunner.rollbackTransaction()
      this.handleDbExceptions(error)
    }finally{
      await queryRunner.release()
    }

  }

  async findOne(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result = await queryRunner.manager.createQueryBuilder(Producto,"p")
      .select("p.id,p.nombre,p.descripcion,p.precio,p.activo,c.nombre as Categoria,ld.stock,ld.id_deposito AS IdDeposito")
      .innerJoin("categoria","c","c.id = p.categoriaId")
      .innerJoin("lote", "l", "p.id = l.id_producto")
      .innerJoin("lote_x_deposito", "ld", "ld.id_lote = l.id_lote")
      .where("p.id = :id",{id:id})
      .groupBy("IdDeposito,p.id,Categoria,ld.stock")
      .getRawOne()
      await queryRunner.commitTransaction()
      console.log(result)
      return result

    } catch (error) {
      await queryRunner.rollbackTransaction()
      this.handleDbExceptions(error)
    }finally{
      await queryRunner.release()
    }



    /*
    select p.id,p.nombre.p.descripcion,p.precio,p.activo,p.imagenURL,c.nombre,ld.stock,ld.id_deposito from productos p
    inner join categoria c on p.categoriaId = c.id
    inner join lote l on p.id=l.id_lote
    inner join lote_x_deposito ld on l.id_lote=ld.id_lote
    where p.id = 25
    */
  }

  async update(id: number, updateProductoDto: UpdateProductoDto) {
    const queryRunner = this.dataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()
      //Actualixa lo del producto
      const {categoriaId,IdDeposito,cantidad} = updateProductoDto
      const categoria = await queryRunner.manager.findOneBy(Categoria,{id:categoriaId})
      const productUpdated = await queryRunner.manager.preload(Producto,{id:id,...updateProductoDto,categoria:categoria})
      //Consigo id_lote
      const {id_lote} = await queryRunner.manager.createQueryBuilder(Lote,"l")
      .select("id_lote")
      .innerJoin("producto","p","l.id_producto = p.id")
      .where("p.id= :id",{id})
      .getRawOne();
      
      //Actualizo tabla movimientos
      await queryRunner.manager.save(MovimientosxLotexDeposito,{tipo:"UPD",cantidad:cantidad,id_deposito:IdDeposito,id_producto:id,id_lote:id_lote})

      
      await queryRunner.manager.save(Producto,productUpdated)
       // 5. Recalcular stock (sum de cantidad de movimientos tipo INS/UPD)
      const { total } = await queryRunner.manager
        .createQueryBuilder(MovimientosxLotexDeposito, "mov")
        .select("SUM(mov.cantidad)", "total")
        .where("mov.id_producto = :idProducto", { idProducto: id })
        .andWhere("mov.id_deposito = :idDeposito", { idDeposito: IdDeposito })
        .getRawOne();

      const stock = parseInt(total) || 0;
      console.log(stock)
      
      const deposito  = await queryRunner.manager.findOneBy(Deposito,{id_deposito:IdDeposito})
      const {idLoteDeposito} = await queryRunner.manager.createQueryBuilder(LoteXDeposito,"ld")
      .select("id","idLoteDeposito")
      .where("ld.id_lote = :id_lote",{id_lote:id_lote})
      .andWhere("ld.id_deposito = :id_deposito",{id_deposito:IdDeposito})
      .getRawOne();
      const lotexDepositoUpdated = await queryRunner.manager.preload(LoteXDeposito,{id:idLoteDeposito,lote:id_lote,deposito:deposito,stock:stock})

      await queryRunner.manager.save(lotexDepositoUpdated)

      await queryRunner.commitTransaction()
      return productUpdated
    } catch (error) {
      await queryRunner.rollbackTransaction()
      this.handleDbExceptions(error)
    }finally{
      await queryRunner.release()
    }
  }

  async remove(id: number) {
    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
    product.activo=false
    await this.productRepository.save(product);

    return { message: `Producto con id ${id} eliminado correctamente` };
  }

  private handleDbExceptions (error:any){
    console.log(error)
    if(error.code==='23505'){
      throw new BadRequestException(error.detail)
    }
    this.logger.error(error)
    throw new InternalServerErrorException("Unexpected errir, check server logs")
  }

}
