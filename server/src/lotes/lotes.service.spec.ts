import { Test, TestingModule } from '@nestjs/testing';
import { LotesService } from './lotes.service';

describe('LotesService', () => {
  let service: LotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LotesService],
    }).compile();

    service = module.get<LotesService>(LotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
