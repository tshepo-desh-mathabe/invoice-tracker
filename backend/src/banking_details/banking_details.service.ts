import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateBankingDetailsDto } from './dto/create-banking_detail.dto';
import { MapperUtil } from 'src/util/mapper.util';
import { BankingDetails } from './entities/banking_detail.entity';
import { IBankingDetailsService } from './interfaces/banking_details.service.interface';
import { IBankNameService } from 'src/bank_name/interfaces/bank_name.service.interface';

@Injectable()
export class BankingDetailsService implements IBankingDetailsService {
  private readonly LOGGER = new Logger(BankingDetailsService.name);

  constructor(
    @InjectRepository(BankingDetails)
    private readonly bankingRepo: Repository<BankingDetails>,
    private readonly bankNameService: IBankNameService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) { }

  async create(dto: CreateBankingDetailsDto): Promise<BankingDetails> {
    try {
      const existing = await this.bankingRepo.findOneBy({ accountNumber: dto.accountNumber });

      if (existing) return existing;

      const bankName = await this.bankNameService.getByName(dto.bankName);

      const entity = MapperUtil.toEntity(dto, BankingDetails);
      entity.bankName = bankName;
      const saved = await this.bankingRepo.save(entity);

      this.LOGGER.log(`Bank account ${saved.accountNumber} created successfully.`);

      await this.cacheManager.set(`bankingDetails:${saved.accountNumber}`, saved, 0);

      return saved;
    } catch (err) {
      this.LOGGER.error(`Failed to create bank account ${dto.accountNumber}`, err.stack);
      throw new Error(`Unable to create bank account ${dto.accountNumber}`);
    }
  }

  async findByAccountNumber(accountNumber: string): Promise<BankingDetails> {
    const cacheKey = `bankingDetails:${accountNumber}`;
    const cached = await this.cacheManager.get<BankingDetails>(cacheKey);

    if (cached) return cached;

    const bankDetail = await this.bankingRepo.findOne({
      where: { accountNumber },
      relations: ['bankName'],
    });

    if (!bankDetail) {
      throw new NotFoundException(`Bank account ${accountNumber} not found.`);
    }

    await this.cacheManager.set(cacheKey, bankDetail, 0);
    this.LOGGER.log(`Bank account ${accountNumber} retrieved successfully.`);
    return bankDetail;
  }
}
