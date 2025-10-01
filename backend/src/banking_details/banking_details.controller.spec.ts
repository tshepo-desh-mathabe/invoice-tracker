import { Test, TestingModule } from '@nestjs/testing';
import { BankingDetailsController } from './banking_details.controller';
import { BankingDetailsService } from './banking_details.service';

describe('BankingDetailsController', () => {
  let controller: BankingDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankingDetailsController],
      providers: [BankingDetailsService],
    }).compile();

    controller = module.get<BankingDetailsController>(BankingDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
