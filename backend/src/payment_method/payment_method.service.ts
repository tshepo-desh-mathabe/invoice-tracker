import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PaymentMethod } from './entities/payment_method.entity';
import { PaymentMethodDto } from './dto/create-payment_method.dto';
import { MapperUtil } from 'src/util/mapper.util';
import { MethodType } from 'src/util/constans';

@Injectable()
export class PaymentMethodService {
  private readonly LOGGER = new Logger(PaymentMethodService.name);

  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepo: Repository<PaymentMethod>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) { }

  async findAll(): Promise<PaymentMethodDto[]> {
    const cacheKey = 'paymentMethods:all';
    const cached = await this.cacheManager.get<PaymentMethodDto[]>(cacheKey);

    if (cached) {
      this.LOGGER.log('Fetched all payment methods from cache.');
      return cached;
    }

    const methods = await this.paymentMethodRepo.find();
    const dtos = MapperUtil.toDtoList(methods, PaymentMethodDto);

    await this.cacheManager.set(cacheKey, dtos, 0);
    this.LOGGER.log('Cached all payment methods.');
    return dtos;
  }

  async findByName(name: MethodType): Promise<PaymentMethod> {
    const cacheKey = `paymentMethod:${name.toLowerCase()}`;
    const cached = await this.cacheManager.get<PaymentMethod>(cacheKey);

    if (cached) {
      this.LOGGER.log(`Fetched payment method "${name}" from cache.`);
      return cached;
    }

    const method = await this.paymentMethodRepo.findOne({ where: { name } });

    if (!method) {
      this.LOGGER.warn(`Payment method "${name}" not found.`);
      throw new NotFoundException(`Payment method "${name}" not found.`);
    }

    await this.cacheManager.set(cacheKey, method, 0);
    this.LOGGER.log(`Cached payment method "${name}".`);
    return method;
  }
}
