import { Injectable } from '@nestjs/common';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Lote } from './entities/lote.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LotesService {
  @InjectRepository(Lote)
  private readonly loteRepository:Repository<Lote>;

  async create(createLoteDto: CreateLoteDto) {
    const lote = this.loteRepository.create(createLoteDto);
    return await this.loteRepository.save(lote);
  }

  findAll() {
    return `This action returns all lotes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lote`;
  }

  update(id: number, updateLoteDto: UpdateLoteDto) {
    return `This action updates a #${id} lote`;
  }

  remove(id: number) {
    return `This action removes a #${id} lote`;
  }
}
