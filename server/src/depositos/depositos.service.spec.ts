import { Test, TestingModule } from '@nestjs/testing';
import { DepositosService } from './depositos.service';

describe('DepositosService', () => {
  let service: DepositosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DepositosService],
    }).compile();

    service = module.get<DepositosService>(DepositosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
