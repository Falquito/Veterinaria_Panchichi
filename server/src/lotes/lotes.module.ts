import { Module } from '@nestjs/common';
import { LotesService } from './lotes.service';
import { LotesController } from './lotes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoteXDeposito } from 'src/entities/LoteXDeposito.entity';
import { Producto } from 'src/productos/entities/producto.entity';
import { Lote } from './entities/lote.entity';

@Module({
  controllers: [LotesController],
  providers: [LotesService],
  imports:[TypeOrmModule.forFeature([LoteXDeposito,Producto,Lote])]
})
export class LotesModule {}
