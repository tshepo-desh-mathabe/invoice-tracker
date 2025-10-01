import { Test, TestingModule } from '@nestjs/testing';
import { BankNameController } from './bank_name.controller';
import { BankNameService } from './bank_name.service';

describe('BankNameController', () => {
  let controller: BankNameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankNameController],
      providers: [BankNameService],
    }).compile();

    controller = module.get<BankNameController>(BankNameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
