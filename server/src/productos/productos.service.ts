// src/productos/productos.service.ts
import {
  BadRequestException,
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
import { MovimientosxLotexDeposito } from 'src/entities/MovimientosXLoteXDeposito.entity';
import { Lote } from 'src/lotes/entities/lote.entity';
import { LoteXDeposito } from 'src/entities/LoteXDeposito.entity';
import { DepositosService } from 'src/depositos/depositos.service';
import { Deposito } from '../depositos/entities/deposito.entity';

@Injectable()
export class ProductosService {
  @InjectDataSource()
  private readonly dataSource: DataSource;

  private readonly logger = new Logger('ProductsService');

  @InjectRepository(Producto)
  private readonly productRepository: Repository<Producto>;

  @InjectRepository(Categoria)
  private readonly categoryRepository: Repository<Categoria>;

  @InjectRepository(MovimientosxLotexDeposito)
  private readonly movimientosRepository: Repository<MovimientosxLotexDeposito>;

  @InjectRepository(Lote)
  private readonly loteRepository: Repository<Lote>;

  @Inject(DepositosService)
  private readonly depositoService: DepositosService;

  @InjectRepository(LoteXDeposito)
  private readonly lotexDepositoRepository: Repository<LoteXDeposito>;

  // =========================
  // CREATE
  // =========================
  async create(createProductoDto: CreateProductoDto, file?: Express.Multer.File) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const {
        categoriaId,
        fechaelaboracion,
        fechaVencimiento,
        depositos,
        ...productDetails
      } = createProductoDto;

      // 1) Producto + categoría
      const categoria = await queryRunner.manager.findOneBy(Categoria, { id: categoriaId });
      const product = queryRunner.manager.create(Producto, {
        ...productDetails,
        categoria,
        ImagenURL: file?.path ?? null, // <- URL pública de Cloudinary
      });
      await queryRunner.manager.save(product);

      // 2) Lote
      const lote = queryRunner.manager.create(Lote, {
        idProducto: product,
        fechaElaboracion: fechaelaboracion,
        fechaVencimiento: fechaVencimiento,
      });
      await queryRunner.manager.save(lote);

      // 3) Movimientos iniciales y LoteXDeposito (activo=true)
      for (const dep of depositos) {
        const { IdDeposito, cantidad } = dep;

        await queryRunner.manager.save(MovimientosxLotexDeposito, {
          id_producto: product.id,
          id_lote: lote.idLote,
          id_deposito: IdDeposito,
          tipo: 'INS',
          cantidad: '' + cantidad,
        });

        const totalResult = await queryRunner.manager
          .createQueryBuilder(MovimientosxLotexDeposito, 'mov')
          .select('SUM(mov.cantidad)', 'total')
          .where('mov.tipo = :tipo', { tipo: 'INS' })
          .andWhere('mov.id_producto = :idProducto', { idProducto: product.id })
          .andWhere('mov.id_deposito = :idDeposito', { idDeposito: IdDeposito })
          .getRawOne();

        const total = parseInt(totalResult?.total ?? 0);
        const deposito = await queryRunner.manager.findOneBy(Deposito, { id_deposito: IdDeposito });

        const lxd = queryRunner.manager.create(LoteXDeposito, {
          lote,
          deposito,
          stock: total,
          activo: true,
        });
        await queryRunner.manager.save(lxd);
      }

      await queryRunner.commitTransaction();
      return product;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDbExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  // =========================
  // READ - LIST
  // =========================
  async findAll() {
    const rows = await this.dataSource.query(`
      SELECT 
        d.id_deposito            AS "idDeposito",
        d.nombre                 AS "nombreDeposito",
        p.id                     AS "idProducto",
        p.nombre                 AS "nombreProducto",
        p.descripcion,
        p.precio,
        p.activo                 AS "activo",
        p."ImagenURL"            AS "imagenURL", 
        c.nombre                 AS "nombreCategoria",
        ld.stock
      FROM producto p
      JOIN lote l              ON l.id_producto = p.id
      JOIN lote_x_deposito ld  ON ld.id_lote = l.id_lote AND ld.activo = true
      JOIN deposito d          ON d.id_deposito = ld.id_deposito
      LEFT JOIN categoria c    ON c.id = p."categoriaId"
      ORDER BY d.id_deposito, p.id;
    `);

    const result = rows.reduce((acc, row) => {
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
        nombreCategoria: row.nombreCategoria ?? '—',
        activo: row.activo,
        imagenURL: row.imagenURL ?? null, 
      });
      return acc;
    }, [] as Array<{
      idDeposito: number;
      nombreDeposito: string;
      productos: Array<{
        id: number;
        nombre: string;
        descripcion: string;
        precio: number;
        stock: number;
        nombreCategoria: string;
        activo: boolean;
        imagenURL?: string | null;
      }>;
    }>);

    return result;
  }

  async findOne(id: number) {
    if (!Number.isInteger(id)) {
      throw new BadRequestException('El id debe ser un número entero válido');
    }

    const rows = await this.dataSource.query(
      `
      SELECT 
        p.id                     AS "idProducto",
        p.nombre                 AS "nombreProducto",
        p.descripcion,
        p.precio,
        p.activo                 AS "activo",
        p."ImagenURL"            AS "imagenURL", 
        c.nombre                 AS "nombreCategoria",
        d.id_deposito            AS "idDeposito",
        d.nombre                 AS "nombreDeposito",
        ld.stock
      FROM producto p
      JOIN lote l              ON l.id_producto = p.id
      JOIN lote_x_deposito ld  ON ld.id_lote = l.id_lote AND ld.activo = true
      JOIN deposito d          ON d.id_deposito = ld.id_deposito
      LEFT JOIN categoria c    ON c.id = p."categoriaId"
      WHERE p.id = $1;
      `,
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }

    return {
      idProducto: rows[0].idProducto,
      nombre: rows[0].nombreProducto,
      descripcion: rows[0].descripcion,
      precio: rows[0].precio,
      categoria: rows[0].nombreCategoria ?? '—',
      activo: rows[0].activo,
      imagenURL: rows[0].imagenURL ?? null, 
      depositos: rows.map((row) => ({
        idDeposito: row.idDeposito,
        nombreDeposito: row.nombreDeposito,
        stock: row.stock,
      })),
    };
  }

  // =========================
  // UPDATE (acepta imagen opcional)
  // =========================
  async update(id: number, updateProductoDto: UpdateProductoDto, file?: Express.Multer.File) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { categoriaId, depositos, removeDepositos, ...productData } = updateProductoDto as any;

      let categoria = null;
      if (categoriaId) {
        categoria = await queryRunner.manager.findOneBy(Categoria, { id: categoriaId });
      }

      const productUpdated = await queryRunner.manager.preload(Producto, {
        id,
        ...productData,
        ...(categoria ? { categoria } : {}),
        ...(file ? { ImagenURL: file.path } : {}), 
      });
      await queryRunner.manager.save(productUpdated);

      const lotes = await queryRunner.manager.find(Lote, { where: { idProducto: { id } } });

      if (Array.isArray(depositos) && depositos.length > 0) {
        for (const dep of depositos) {
          const { IdDeposito, cantidad } = dep;

          for (const lote of lotes) {
            await queryRunner.manager.save(MovimientosxLotexDeposito, {
              tipo: 'UPD',
              cantidad: '' + cantidad,
              id_producto: id,
              id_lote: lote.idLote,
              id_deposito: IdDeposito,
            });

            const { total } = await queryRunner.manager
              .createQueryBuilder(MovimientosxLotexDeposito, 'mov')
              .select('SUM(mov.cantidad)', 'total')
              .where('mov.id_producto = :idProducto', { idProducto: id })
              .andWhere('mov.id_deposito = :idDeposito', { idDeposito: IdDeposito })
              .getRawOne();

            const stock = parseInt(total) || 0;
            const depositoEntity = await queryRunner.manager.findOneBy(Deposito, {
              id_deposito: IdDeposito,
            });

            let loteXDep = await queryRunner.manager.findOne(LoteXDeposito, {
              where: { lote: { idLote: lote.idLote }, deposito: { id_deposito: IdDeposito } },
            });

            if (!loteXDep) {
              loteXDep = queryRunner.manager.create(LoteXDeposito, {
                lote,
                deposito: depositoEntity,
                stock,
                activo: true,
              });
            } else {
              loteXDep.stock = stock;
              if (!loteXDep.activo) loteXDep.activo = true;
            }
            await queryRunner.manager.save(loteXDep);
          }
        }
      }

      if (Array.isArray(removeDepositos) && removeDepositos.length > 0) {
        for (const depId of removeDepositos) {
          for (const lote of lotes) {
            await queryRunner.manager
              .createQueryBuilder()
              .update(LoteXDeposito)
              .set({ activo: false })
              .where('id_lote = :idLote AND id_deposito = :depId', {
                idLote: lote.idLote,
                depId,
              })
              .execute();
          }
        }
      }

      await queryRunner.commitTransaction();
      return productUpdated;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDbExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const result = await this.productRepository.update({ id }, { activo: false });
    if (!result.affected) throw new NotFoundException(`Producto ${id} no encontrado`);
    return { message: `Producto ${id} archivado` };
  }

  async restore(id: number) {
    const result = await this.productRepository.update({ id }, { activo: true });
    if (!result.affected) throw new NotFoundException(`Producto ${id} no encontrado`);
    return { message: `Producto ${id} restaurado` };
  }

  private handleDbExceptions(error: any) {
    console.log(error);
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
