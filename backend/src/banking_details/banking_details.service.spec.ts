import { Test, TestingModule } from '@nestjs/testing';
import { BankingDetailsService } from './banking_details.service';

describe('BankingDetailsService', () => {
  let service: BankingDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BankingDetailsService],
    }).compile();

    service = module.get<BankingDetailsService>(BankingDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
