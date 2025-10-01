import { Test, TestingModule } from '@nestjs/testing';
import { BankNameService } from './bank_name.service';

describe('BankNameService', () => {
  let service: BankNameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BankNameService],
    }).compile();

    service = module.get<BankNameService>(BankNameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
