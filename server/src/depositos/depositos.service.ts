import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Deposito } from './entities/deposito.entity';
import { CreateDepositoDto } from './dto/create-deposito.dto';
import { UpdateDepositoDto } from './dto/update-deposito.dto';
@Injectable()
export class DepositosService {
  constructor(
    @InjectRepository(Deposito)
    private readonly repo: Repository<Deposito>,
  ) {}
  // CREATE
  async create(dto: CreateDepositoDto): Promise<Deposito> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }
  // READ (listado con búsqueda/paginación)
  async findAll(opts?: {
    q?: string;      // búsqueda por nombre/dirección
    page?: number;   // página (1..N)
    limit?: number;  // tamaño de página
  }) {
    const page  = Math.max(Number(opts?.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(opts?.limit ?? 10), 1), 100);


    const where: any[] = [];
    if (opts?.q) {
      where.push({ nombre: ILike(`%${opts.q}%`) });
      where.push({ direccion: ILike(`%${opts.q}%`) });
    }


    const [items, total] = await this.repo.findAndCount({
      where: where.length ? where : undefined,
      order: { nombre: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });


    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }


  // READ (detalle)
    async findOne(id: string): Promise<Deposito> {
      const dep = await this.repo.findOneBy({id_deposito:+id}); // si pongo id da error
      if (!dep) throw new NotFoundException('Depósito no encontrado');
      return dep;
    }
  // UPDATE
  async update(id: string, dto: UpdateDepositoDto): Promise<Deposito> {
    const dep = await this.findOne(id);
    Object.assign(dep, dto);
    return this.repo.save(dep);
  }
  // DELETE

  async remove(id: string) {
    const dep = await this.findOne(id);
    dep.activo=false
    return await this.repo.save(dep);;
  }
}


