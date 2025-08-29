import { Module } from '@nestjs/common';
import { DepositosService } from './depositos.service';
import { DepositosController } from './depositos.controller';
import { Deposito } from './entities/deposito.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
    imports: [
  
    TypeOrmModule.forFeature([Deposito]),
  ],

  controllers: [DepositosController],
  providers: [DepositosService],
})
export class DepositosModule {}
