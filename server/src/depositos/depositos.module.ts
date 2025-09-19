import { Module } from '@nestjs/common';
import { DepositosService } from './depositos.service';
import { DepositosController } from './depositos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deposito } from './entities/deposito.entity';

@Module({
  controllers: [DepositosController],
  providers: [DepositosService],
  imports:[TypeOrmModule.forFeature([ Deposito])],
  exports:[DepositosService]
})
export class DepositosModule {}
