import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BankName } from './entities/bank_name.entity';
import { CreateBankNameDto, BankNameDto } from './dto/create-bank_name.dto';
import { MapperUtil } from 'src/util/mapper.util';
import { IBankNameService } from './interfaces/bank_name.service.interface';

@Injectable()
export class BankNameService implements IBankNameService {
  private readonly LOGGER = new Logger(BankNameService.name);

  constructor(
    @InjectRepository(BankName)
    private readonly bankRepo: Repository<BankName>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) { }

  async create(dto: CreateBankNameDto): Promise<string> {
    try {
      const entity = MapperUtil.toEntity(dto, BankName);
      const saved = await this.bankRepo.save(entity);

      await this.cacheManager.set(`bank:${saved.name.toLowerCase()}`, saved, 0);

      this.LOGGER.log(`Bank "${dto.name}" saved successfully.`);
      return `Bank "${dto.name}" created successfully.`;
    } catch (err) {
      this.LOGGER.error(`Failed to create bank "${dto.name}"`, err.stack);
      throw new Error(`Unable to create bank "${dto.name}"`);
    }
  }

  async findAll(): Promise<BankNameDto[]> {
    const cached: BankNameDto[] | undefined = await this.cacheManager.get('banks:all');
    if (cached) return cached;

    const banks = await this.bankRepo.find();
    const dtos = MapperUtil.toDtoList(banks, BankNameDto);

    await this.cacheManager.set('banks:all', dtos, 0);
    return dtos;
  }

  async findByName(name: string): Promise<BankNameDto[]> {
    const cacheKey = `bank:search:${name.toLowerCase()}`;
    const cached: BankNameDto[] | undefined = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const banks = await this.bankRepo.find({
      where: { name: ILike(`%${name}%`) },
    });


    if (!banks.length) throw new NotFoundException(`No banks found matching "${name}"`);

    const dtos = MapperUtil.toDtoList(banks, BankNameDto);
    await this.cacheManager.set(cacheKey, dtos, 0);

    return dtos;
  }

  async getByName(name: string): Promise<BankName> {
    const cacheKey = `bank:entity:${name.toLowerCase()}`;
    const cached: BankName | undefined = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const bank = await this.bankRepo.findOne({ where: { name } });
    if (!bank) throw new NotFoundException(`Bank "${name}" not found`);

    await this.cacheManager.set(cacheKey, bank, 0);
    return bank;
  }
}
