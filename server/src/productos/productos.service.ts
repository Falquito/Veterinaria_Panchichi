import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { DataSource, Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Categoria } from 'src/categorias/entities/categoria.entity';
import { DepositosService } from 'src/depositos/depositos.service';
import { Deposito } from '../depositos/entities/deposito.entity';
import { Movimientos } from 'src/entities/Movimientos.entity';
import { Movimientos_Por_Producto } from 'src/entities/Movimientos_Por_Producto.entity';
import { Producto_Por_Deposito } from 'src/entities/Producto_Por_Deposito.entity';

@Injectable()
export class ProductosService {
  @InjectDataSource()
  private readonly dataSource: DataSource;

  private readonly logger = new Logger('ProductsService');

  @InjectRepository(Producto)
  private readonly productRepository: Repository<Producto>;

  @InjectRepository(Categoria)
  private readonly categoryRepository: Repository<Categoria>;

  @Inject(DepositosService)
  private readonly depositoService: DepositosService;

  async create(createProductoDto: CreateProductoDto, file: Express.Multer.File) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      let { categoriaId, fechaelaboracion, fechaVencimiento, depositos, proveedoresId, ...productDetails } =
        createProductoDto as any;

      if (typeof depositos === 'string') {
        try {
          depositos = JSON.parse(depositos);
        } catch {
          depositos = [];
        }
      }
      if (!Array.isArray(depositos)) depositos = [];

      const categoria =
        categoriaId != null
          ? await qr.manager.findOneBy(Categoria, { id: Number(categoriaId) })
          : null;

      const product = qr.manager.create(Producto, {
        ...productDetails,
        proveedoresIds: proveedoresId, 
        categoria,
        ImagenURL: file?.path,
        fecha_vencimiento: fechaVencimiento,
      });
      await qr.manager.save(product);

      const movimientoPrincipal = qr.manager.create(Movimientos, {
        tipo: 'INS',
        fecha: new Date().toISOString(),
        motivo: '',
        observaciones: '',
      });
      await qr.manager.save(movimientoPrincipal);

      for (const dep of depositos) {
        const IdDeposito = Number(dep?.IdDeposito);
        const cantidad = Number(dep?.cantidad) || 0;

        // Línea
        const linea = qr.manager.create(Movimientos_Por_Producto, {
          productos: product,
          movimientos: movimientoPrincipal,
          cantidad,
          id_deposito: IdDeposito,
        });
        await qr.manager.save(linea);

        // Total INS para el producto en ese depósito
        const { total: totalInsRaw } = await qr.manager
          .createQueryBuilder(Movimientos_Por_Producto, 'mp')
          .select('SUM(mp.cantidad)', 'total')
          .innerJoin(Movimientos, 'm', 'm.id = mp.movimientosId')
          .where('m.tipo = :tipo', { tipo: 'INS' })
          .andWhere('mp.productosId = :productoId', { productoId: product.id })
          .andWhere('mp.id_deposito = :idDeposito', { idDeposito: IdDeposito })
          .getRawOne();

        const totalIns = Number(totalInsRaw) || 0;

        const depositoEntity = await qr.manager.findOneBy(Deposito, {
          id_deposito: IdDeposito,
        });

        let prodPorDeposito = await qr.manager.findOne(Producto_Por_Deposito, {
          where: {
            producto: { id: product.id },
            deposito: { id_deposito: IdDeposito },
          },
          relations: ['producto', 'deposito'],
        });

        if (!prodPorDeposito) {
          prodPorDeposito = qr.manager.create(Producto_Por_Deposito, {
            producto: product,
            deposito: depositoEntity,
            stock: totalIns,
          });
        } else {
          prodPorDeposito.stock = totalIns;
        }

        await qr.manager.save(prodPorDeposito);
      }

      await qr.commitTransaction();
      return product;
    } catch (error) {
      await qr.rollbackTransaction();
      this.handleDbExceptions(error);
    } finally {
      await qr.release();
    }
  }

 
  async findAll() {
    try {
      const rows = await this.dataSource.query(`
        SELECT 
          d.id_deposito   AS "idDeposito",
          d.nombre        AS "nombreDeposito",
          p.id            AS "idProducto",
          p.nombre        AS "nombreProducto",
          p.descripcion,
          p.precio,
          p.activo, 
          p."ImagenURL",  
          c.nombre        AS "nombreCategoria", 
          pd.stock
        FROM producto p
        JOIN producto_por_deposito pd ON pd.id_prod = p.id
        JOIN deposito d ON d.id_deposito = pd.id_deposito
        LEFT JOIN categoria c ON c.id = p."categoriaId"
        ORDER BY d.id_deposito, p.id;
      `);

      const result = rows.reduce((acc: any[], row: any) => {
        let deposito = acc.find((d) => d.idDeposito === row.idDeposito);
        if (!deposito) {
          deposito = {
            idDeposito: row.idDeposito,
            nombreDeposito: row.nombreDeposito,
            productos: [],
          };
          acc.push(deposito);
        }
        deposito.productos.push({
          id: row.idProducto,
          nombre: row.nombreProducto,
          descripcion: row.descripcion,
          precio: row.precio,
          stock: row.stock,
          activo: row.activo,
          ImagenURL: row.ImagenURL,
          nombreCategoria: row.nombreCategoria,
        });
        return acc;
      }, []);

      return result;
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  async findOne(id: number) {
    let notFound = false;
    try {
      const rows = await this.dataSource.query(
        `
        SELECT 
          p.id            AS "idProducto",
          p.nombre        AS "nombreProducto",
          p.descripcion,
          p.precio,
          p.activo,
          p."ImagenURL", 
          c.nombre        AS "nombreCategoria",
          d.id_deposito   AS "idDeposito",
          d.nombre        AS "nombreDeposito",
          pd.stock
        FROM producto p
        JOIN producto_por_deposito pd ON pd.id_prod = p.id
        JOIN deposito d ON d.id_deposito = pd.id_deposito
        LEFT JOIN categoria c ON c.id = p."categoriaId"
        WHERE p.id = $1;
        `,
        [id],
      );

      if (rows.length === 0) {
        notFound = true;
      }

      const producto = {
        idProducto: rows[0]?.idProducto,
        nombre: rows[0]?.nombreProducto,
        descripcion: rows[0]?.descripcion,
        precio: rows[0]?.precio,
        activo: rows[0]?.activo,
        ImagenURL: rows[0]?.ImagenURL,
        nombreCategoria: rows[0]?.nombreCategoria,
        depositos: rows.map((row: any) => ({
          idDeposito: row.idDeposito,
          nombreDeposito: row.nombreDeposito,
          stock: row.stock,
        })),
      };

      return producto;
    } catch (error) {
      if (notFound) {
        throw new NotFoundException(`Producto con id ${id} no encontrado`);
      } else {
        this.handleDbExceptions(error);
      }
    }
  }

  async update(
    id: number,
    updateProductoDto: UpdateProductoDto,
    file?: Express.Multer.File,
  ) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      let { categoriaId, depositos, ...productData } = updateProductoDto as any;

      if (file?.path) {
        productData.ImagenURL = file.path; 
      }

      if (typeof depositos === 'string') {
        try {
          depositos = JSON.parse(depositos);
        } catch {
          depositos = [];
        }
      }
      if (!Array.isArray(depositos)) depositos = [];

      if (productData?.precio !== undefined)
        productData.precio = Number(productData.precio);

      let categoria: Categoria | null = null;
      if (categoriaId !== undefined && categoriaId !== null && categoriaId !== '') {
        categoria = await qr.manager.findOneBy(Categoria, {
          id: Number(categoriaId),
        });
      }

      const productUpdated = await qr.manager.preload(Producto, {
        id,
        ...productData,
        ...(categoria ? { categoria } : {}),
      });
      if (!productUpdated) {
        throw new NotFoundException(`Producto ${id} no encontrado`);
      }
      await qr.manager.save(productUpdated);

      const movimiento = qr.manager.create(Movimientos, {
        tipo: 'UPD',
        fecha: new Date().toISOString(),
        motivo: '',
        observaciones: '',
      });
      await qr.manager.save(movimiento);

      if (depositos.length === 0) {
        await qr.commitTransaction();
        return productUpdated;
      }

      for (const dep of depositos) {
        const IdDeposito = Number(dep?.IdDeposito);
        const cantidad = Number(dep?.cantidad) || 0;

        const movPorProd = qr.manager.create(Movimientos_Por_Producto, {
          cantidad,
          movimientos: movimiento,
          productos: productUpdated,
          id_deposito: IdDeposito,
        });
        await qr.manager.save(movPorProd);

        const { total: totalUpdRaw } = await qr.manager
          .createQueryBuilder(Movimientos_Por_Producto, 'mp')
          .select('SUM(mp.cantidad)', 'total')
          .innerJoin(Movimientos, 'm', 'm.id = mp.movimientosId')
          .where('m.tipo = :tipo', { tipo: 'UPD' })
          .andWhere('mp.productosId = :productoId', { productoId: id })
          .andWhere('mp.id_deposito = :idDeposito', { idDeposito: IdDeposito })
          .getRawOne();

        const { total: totalInsRaw } = await qr.manager
          .createQueryBuilder(Movimientos_Por_Producto, 'mp')
          .select('SUM(mp.cantidad)', 'total')
          .innerJoin(Movimientos, 'm', 'm.id = mp.movimientosId')
          .where('m.tipo = :tipo', { tipo: 'INS' })
          .andWhere('mp.productosId = :productoId', { productoId: id })
          .andWhere('mp.id_deposito = :idDeposito', { idDeposito: IdDeposito })
          .getRawOne();

        const totalUpd = Number(totalUpdRaw) || 0;
        const totalIns = Number(totalInsRaw) || 0;
        const nuevoStock = totalIns + totalUpd;

        const depositoEntity = await qr.manager.findOneBy(Deposito, {
          id_deposito: IdDeposito,
        });

        let prodPorDeposito = await qr.manager.findOne(Producto_Por_Deposito, {
          where: {
            producto: { id },
            deposito: { id_deposito: IdDeposito },
          },
          relations: ['producto', 'deposito'],
        });

        if (!prodPorDeposito) {
          prodPorDeposito = qr.manager.create(Producto_Por_Deposito, {
            producto: productUpdated,
            deposito: depositoEntity,
            stock: nuevoStock,
          });
        } else {
          prodPorDeposito.stock = nuevoStock;
        }

        await qr.manager.save(prodPorDeposito);
      }

      await qr.commitTransaction();
      return productUpdated;
    } catch (error) {
      await qr.rollbackTransaction();
      this.handleDbExceptions(error);
    } finally {
      await qr.release();
    }
  }

  async remove(id: number) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
    product.activo = false;
    await this.productRepository.save(product);
    return { message: `Producto con id ${id} eliminado correctamente` };
  }

  async restore(id: number) {
    const result = await this.productRepository.update({ id }, { activo: true });
    if (!result.affected)
      throw new NotFoundException(`Producto ${id} no encontrado`);
    return { message: `Producto ${id} restaurado` };
  }


  private handleDbExceptions(error: any) {
    console.log(error);
    if (error?.code === '42703') {
      this.logger.error(
        'El error es: ' + error?.driverError + ' te aconsejo: ' + error?.hint,
      );
      throw new InternalServerErrorException(
        'Error inesperado en el servidor, por favor revise los logs.',
      );
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
