// src/proveedores/proveedores.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { Proveedor } from './entities/proveedor.entity';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

@Injectable()
export class ProveedoresService {
  private readonly logger = new Logger('ProveedoresService');

  constructor(
    @InjectRepository(Proveedor)
    private readonly repo: Repository<Proveedor>,
  ) {}

  // CREATE
  async create(dto: CreateProveedorDto) {
    try {
      const entity = this.repo.create(dto);
      return await this.repo.save(entity);
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  // READ (listado con búsqueda/paginación opcional)
  async findAll(opts?: { q?: string; page?: number; limit?: number }) {
    try {
      const page = Math.max(Number(opts?.page ?? 1), 1);
      const limit = Math.min(Math.max(Number(opts?.limit ?? 10), 1), 100);

      const where: any[] = [];
      if (opts?.q) {
        where.push({ nombre: ILike(`%${opts.q}%`) });
        where.push({ cuit: ILike(`%${opts.q}%`) });
        where.push({ email: ILike(`%${opts.q}%`) });
      }

      const [items, total] = await this.repo.findAndCount({
        where: where.length ? where : undefined,
        order: { nombre: 'ASC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      return { items, total, page, limit, pages: Math.ceil(total / limit) };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  // READ (detalle)
  async findOne(id: number) {
    try {
      const prov = await this.repo.findOne({ where: { id_proveedor:id } });
      if (!prov) throw new NotFoundException(`Proveedor con id ${id} no encontrado`);
      return prov;
    } catch (error) {
      // si vino por NotFound, relanzo; si es otra cosa, centralizo
      if (error instanceof NotFoundException) throw error;
      this.handleDbExceptions(error);
    }
  }

  // UPDATE
  async update(id: number, dto: UpdateProveedorDto) {
    try {
      const prov = await this.repo.preload({ id_proveedor:id, ...dto });
      if (!prov) throw new NotFoundException(`Proveedor con id ${id} no encontrado`);
      return await this.repo.save(prov);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDbExceptions(error);
    }
  }

  // DELETE (baja lógica)
  async remove(id: number) {
    try {
      const prov = await this.repo.findOne({ where: { id_proveedor:id } });
      if (!prov) throw new NotFoundException(`Proveedor con id ${id} no encontrado`);
      prov.activo = false;
      await this.repo.save(prov);
      return { message: `Proveedor con id ${id} desactivado correctamente` };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDbExceptions(error);
    }
  }

  // Manejo centralizado de errores
  private handleDbExceptions(error: any): never {
    this.logger.error(error);

    // ejemplo: violación de índice único, etc.
    // if (error.code === '23505') { throw new BadRequestException(error.detail); }

    throw new InternalServerErrorException('Error inesperado, revisa los logs del servidor.');
  }
}