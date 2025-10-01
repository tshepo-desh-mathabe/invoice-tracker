import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Transaction } from './entities/transaction.entity';
import { TransactionStatus } from 'src/util/constans';
import { MapperUtil } from 'src/util/mapper.util';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ITransactionService } from './interfaces/transaction.service.interface';
import { IClientService } from 'src/client/interfaces/client.service.interface';
import { IPaymentMethodService } from 'src/payment_method/interfaces/payment_method.service.interface';
import { IConfigurationService } from 'src/configuration/interfaces/configuration.service.interface';
import { generateTrxnReference, getExpiryDate } from 'src/util/helper';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionService implements ITransactionService {
  private readonly LOGGER = new Logger(TransactionService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly clientService: IClientService,
    private readonly paymentMethod: IPaymentMethodService,
    private readonly configService: IConfigurationService,
  ) { }

  async create(dto: CreateTransactionDto): Promise<string> {
    try {
      const client = await this.clientService.findByEmail(dto.client);
      const paymentMethod = await this.paymentMethod.findByName(dto.paymentMethod);

      const tx = MapperUtil.toEntity(dto, Transaction);
      tx.client = client;
      tx.paymentMethod = paymentMethod;

      const expiryDays = await this.configService.getByName('trx.expiry.days', '6');
      tx.expiresAt = getExpiryDate(expiryDays.value);
      tx.trxnReference = generateTrxnReference();

      tx.isFinalState = tx.status !== TransactionStatus.PENDING;

      const saved = await this.transactionRepo.save(tx);

      await this.transactionRepo.save(saved);

      // --- Logging and caching added ---
      this.LOGGER.log(`Transaction created with reference: ${saved.trxnReference}`);
      await this.cacheManager.set(`transaction:${saved.trxnReference}`, saved, 9999);
      this.LOGGER.log(`Transaction cached for reference: ${saved.trxnReference}`);
      // ---------------------------------

      return saved.trxnReference;
    } catch (err) {
      this.LOGGER.error(`Failed to create transaction: ${err.message}`, err.stack);
      throw err;
    }
  }

  async findByReference(trxnReference: string): Promise<Transaction> {
    const cacheKey = `transaction:${trxnReference}`;
    const cached = await this.cacheManager.get<Transaction>(cacheKey);

    if (cached) {
      this.LOGGER.log(`Transaction fetched from cache for reference: ${trxnReference}`);
      return cached;
    }

    this.LOGGER.debug('hgfhgfhgfhfhgfhgf')
    const tx = await this.transactionRepo.findOne({
      where: { trxnReference },
      relations: ['client', 'paymentMethod'],
    });

    if (!tx) {
      this.LOGGER.warn(`Transaction not found with reference: ${trxnReference}`);
      throw new NotFoundException(`Transaction not found with reference: ${trxnReference}`);
    }

    await this.cacheManager.set(cacheKey, tx, 9999);
    this.LOGGER.log(`Transaction cached for reference: ${trxnReference}`);

    return tx;
  }

  async updateByReference(updateData: UpdateTransactionDto): Promise<Transaction> {
    const reference = updateData.trxnReference;
    try {
      const tx = await this.findByReference(updateData.trxnReference ?? '');

      if (!tx) throw new NotFoundException(`Transaction not found for trxnRef: ${reference}`);

      if (updateData.amount !== undefined) tx.amount = updateData.amount;
      if (updateData.status !== undefined) {
        tx.status = updateData.status;
        tx.isFinalState = updateData.status !== TransactionStatus.PENDING;
      }

      tx.updatedAt = new Date();

      const saved = await this.transactionRepo.save(tx);

      await this.cacheManager.set(`transaction:${reference}`, saved, 9999);
      this.LOGGER.log(`Transaction updated and cached for reference: ${reference}`);

      return saved;
    } catch (err) {
      this.LOGGER.error(`Failed to update transaction ${reference}: ${err.message}`, err.stack);
      throw new Error(`Unable to update transaction ${reference}`);
    }
  }
}
