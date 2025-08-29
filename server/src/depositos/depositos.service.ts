import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDepositoDto } from './dto/create-deposito.dto';
import { UpdateDepositoDto } from './dto/update-deposito.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Deposito } from './entities/deposito.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DepositosService {

  @InjectRepository(Deposito)
  private readonly depositoRepository:Repository<Deposito>

  async create(createDepositoDto: CreateDepositoDto) {
    const deposito = this.depositoRepository.create(createDepositoDto);


    await this.depositoRepository.save(deposito)
    return deposito;
  }

  async findAll() {
    return await this.depositoRepository.find();
  }

  async findOne(id: number) {
    const deposito = await this.depositoRepository.findOneBy({id})

    if(deposito){
      return deposito
    }else{
      throw new NotFoundException()
    }
  }

  async update(id: number, updateDepositoDto: UpdateDepositoDto) {
    const deposito = await this.depositoRepository.preload({
      id,
      ...updateDepositoDto
    });

    return await this.depositoRepository.save(deposito);
  }

  async remove(id: number) {
    const deposito = await this.findOne(id)

    await this.depositoRepository.remove(deposito)

    return deposito;
  }
}
