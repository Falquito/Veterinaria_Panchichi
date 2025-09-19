import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateOrdenDeCompraDto } from './dto/create-orden-de-compra.dto';
import { UpdateOrdenDeCompraDto } from './dto/update-orden-de-compra.dto';
import { DataSource, Repository } from 'typeorm';
import { OrdenDeCompra } from './entities/orden-de-compra.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ProductosService } from 'src/productos/productos.service';
import { OrdenDeCompraPorProducto } from 'src/entities/Orden_de_compra_Por_Producto.entity';
import { Producto } from 'src/productos/entities/producto.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';

@Injectable()
export class OrdenDeCompraService {
  private readonly logger = new Logger('OrdenDeCompraService')
  @InjectDataSource()
  private readonly dataSource:DataSource
  @InjectRepository(OrdenDeCompra)
  private readonly ordenRepository:Repository<OrdenDeCompra>

  @Inject(ProductosService)
  private readonly productoService:ProductosService;
  @InjectRepository(OrdenDeCompraPorProducto)
  private readonly ordenProdRepository:Repository<OrdenDeCompraPorProducto>
  
  async create(createOrdenDeCompraDto: CreateOrdenDeCompraDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //COnsigo proveedor

      const proveedor = await queryRunner.manager.findOneBy(Proveedor,{id_proveedor:createOrdenDeCompraDto.proveedorId})
      const fecha = new Date();

      const year = fecha.getFullYear() % 100; // últimos 2 dígitos
      const month = fecha.getMonth() + 1; // los meses van de 0 a 11
      const day = fecha.getDate();

      const fechaFormateada = `${year.toString().padStart(2,'0')}-${month.toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
      const orden = queryRunner.manager.create(OrdenDeCompra,{fecha:fechaFormateada,proveedor:proveedor});
      let total = 0;
      console.log(orden)

      orden.productos = [];

      for (const item of createOrdenDeCompraDto.productos) {
        const producto = await queryRunner.manager.findOneBy(Producto,{id:item.productoId} );

        const ordenProducto = queryRunner.manager.create(OrdenDeCompraPorProducto,{
          producto,
          cantidad: item.cantidad,
          // ordenDeCompra: orden,
        });

        total += Number(producto.precio) * item.cantidad;
        
        orden.productos.push(ordenProducto);
      }
      orden.total = total;
      console.log(orden)

      await queryRunner.manager.save(orden);
      await queryRunner.commitTransaction();

      return orden
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDbExceptions(error);
    }finally{
      await queryRunner.release();
    }
    
  }

  async findAll() {
    return await  this.ordenRepository.find();
  }

  async findOne(id: number) {
    const orden =await this.ordenRepository.findOneBy({id_oc:id});
    if(orden){
      return orden;
    }else{
      throw new NotFoundException("No se encontor la orden con el id: " + id)
    }
  }

  private handleDbExceptions (error:any){
      console.log(error);
              if (error.code === '42703') {
                  this.logger.error("El error es: " + error.driverError + " te aconsejo: " + error.hint);
                  throw new InternalServerErrorException("Error inesperado en el servidor, por favor revise los logs.");
              }
              this.logger.error(error);
              throw new InternalServerErrorException("Unexpected errir, check server logs");
    }
}