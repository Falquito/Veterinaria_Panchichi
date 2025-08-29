import { Module } from '@nestjs/common';
import { LotesService } from './lotes.service';
import { LotesController } from './lotes.controller';

@Module({
  controllers: [LotesController],
  providers: [LotesService],
})
export class LotesModule {}
