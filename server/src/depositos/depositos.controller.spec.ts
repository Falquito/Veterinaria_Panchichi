import { Test, TestingModule } from '@nestjs/testing';
import { DepositosController } from './depositos.controller';
import { DepositosService } from './depositos.service';

describe('DepositosController', () => {
  let controller: DepositosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepositosController],
      providers: [DepositosService],
    }).compile();

    controller = module.get<DepositosController>(DepositosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
