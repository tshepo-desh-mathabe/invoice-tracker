import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { MapperUtil } from 'src/util/mapper.util';
import { CreateInvoiceDto, InvoiceDto } from './dto/create-invoice.dto';
import { Invoice } from './entities/invoice.entity';
import { IInvoiceService } from './interfaces/invoice.service.interface';
import { ITransactionService } from 'src/transaction/interfaces/transaction.service.interface';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { FindInvoicesFilter } from './interfaces/invoice.filter.payload';
import { IConfigurationService } from 'src/configuration/interfaces/configuration.service.interface';
import { InvoiceItem } from 'src/invoice_item/entities/invoice_item.entity';

@Injectable()
export class InvoiceService implements IInvoiceService {
  private readonly LOGGER = new Logger(InvoiceService.name);

  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,

    private readonly transactionService: ITransactionService,
    private readonly configService: IConfigurationService,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) { }

  async create(dto: CreateInvoiceDto, flag: boolean): Promise<InvoiceDto> {
    if (!flag) {
      return await this.updateLogic(dto);
    }
    return await this.createLogic(dto);
  }

  async findByTransactionReference(trxnReference: string): Promise<InvoiceDto> {
    const cacheKey = `invoice:trxn:${trxnReference}`;
    const cached = await this.getFromCache<Invoice>(cacheKey);
    if (cached) {
      this.LOGGER.log(`Invoice fetched from cache for transaction: ${trxnReference}`);
      return MapperUtil.toDto(cached, InvoiceDto);
    }

    const transaction = await this.transactionService.findByReference(trxnReference);
    if (!transaction) throw new NotFoundException(`Transaction not found with reference: ${trxnReference}`);

    const invoice = await this.invoiceRepo.findOne({
      where: { transaction: { id: transaction.id } },
      relations: ['transaction', 'client', 'items'],
    });

    if (!invoice) throw new NotFoundException(`Invoice not found for transaction reference: ${trxnReference}`);

    await this.cacheManager.set(cacheKey, invoice, 9999);
    this.LOGGER.log(`Invoice cached for transaction reference: ${trxnReference}`);

    return MapperUtil.toDto(invoice, InvoiceDto);
  }

  async findInvoices(filter: FindInvoicesFilter = {}): Promise<{ invoices: InvoiceDto[]; total: number }> {
    const { page = 0, limit = 10 } = filter;
    const cacheKey = `invoices:filter:${JSON.stringify({ ...filter, page, limit })}`;
    const cached = await this.getFromCache<{ invoices: Invoice[]; total: number }>(cacheKey);
    if (cached) {
      this.LOGGER.log(`Invoices fetched from cache for filter: ${cacheKey}`);
      return {
        invoices: MapperUtil.toDtoList(cached.invoices, InvoiceDto),
        total: cached.total,
      };
    }

    const [invoices, total] = await this.queryInvoices(filter);

    await this.cacheManager.set(cacheKey, { invoices, total }, 3600);
    this.LOGGER.log(`Invoices cached with key: ${cacheKey}`);

    return {
      invoices: MapperUtil.toDtoList(invoices, InvoiceDto),
      total,
    };
  }

  private async updateLogic(dto: CreateInvoiceDto): Promise<InvoiceDto> {
    this.LOGGER.warn('Updating existing invoice...');
    const trxn: Transaction = await this.transactionService.findByReference(dto.trxnReference || '');

    if (trxn.status !== dto.status) {
      trxn.status = dto.status ?? trxn.status;
      trxn.amount = dto.amount ?? trxn.amount;
      trxn.updatedAt = new Date();
      await this.transactionService.updateByReference({
        trxnReference: dto.trxnReference,
        amount: dto.amount,
        status: dto.status
      });
    }

    this.LOGGER.debug('Fetching invoice for update...');
    let invoice = await this.invoiceRepo.findOne({
      where: { transaction: { id: trxn.id } },
      relations: ['transaction', 'client', 'items'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice not found for transaction reference: ${dto.trxnReference}`);
    }

    // update invoice fields
    invoice.amount = dto.amount ?? invoice.amount;
    invoice.status = dto.status ?? invoice.status;
    invoice.reason = dto.reason ?? invoice.reason;
    invoice.updatedAt = new Date();

    const savedInvoice = await this.invoiceRepo.save(invoice);
    await this.cacheManager.set(`invoice:${savedInvoice.id}`, savedInvoice, 3600);

    this.LOGGER.log(`Invoice updated with ID: ${savedInvoice.id}`);
    return MapperUtil.toDto(savedInvoice, InvoiceDto);
  }


  private async createLogic(dto: CreateInvoiceDto) {
    const { appliedVat, bankCharges } = await this.getCharges();
    dto.amount = this.calculateInvoiceAmount(dto.amount, appliedVat.value, bankCharges.value);

    try {
      const transaction = await this.getOrCreateTransaction(dto.transactionDto);
      const invoice = this.buildInvoiceEntity(dto, transaction, appliedVat, bankCharges);

      const savedInvoice = await this.saveAndCacheInvoice(invoice);

      // Map to DTO using MapperUtil
      const storeInvoice = this.mapInvoiceForDto(savedInvoice);
      return MapperUtil.toDto(storeInvoice, InvoiceDto);
    } catch (err) {
      this.LOGGER.error(`Failed to create invoice: ${err.message}`, err.stack);
      throw err;
    }
  }

  private async getCharges() {
    const appliedVat = await this.configService.getByName('trx.percentage.vat', '0.15');
    const bankCharges = await this.configService.getByName('trx.percentage.bank.charges', '0.01');
    return { appliedVat, bankCharges };
  }

  private calculateInvoiceAmount(baseAmount: number, vat: string, bankCharges: string): number {
    const amount = baseAmount + baseAmount * parseFloat(vat) + baseAmount * parseFloat(bankCharges);
    return Number(amount.toFixed(2));
  }

  private async getOrCreateTransaction(transactionDto: any): Promise<Transaction> {
    if (transactionDto?.trxnReference) {
      return this.transactionService.findByReference(transactionDto.trxnReference).catch(async () => {
        this.LOGGER.warn(`Transaction not found, creating new one.`);
        const trxnReference = await this.transactionService.create(transactionDto);
        return this.transactionService.findByReference(trxnReference);
      });
    }
    const trxnReference = await this.transactionService.create(transactionDto);
    return this.transactionService.findByReference(trxnReference);
  }

  private buildInvoiceEntity(
    dto: CreateInvoiceDto,
    transaction: Transaction,
    appliedVat: { value: string },
    bankCharges: { value: string },
  ): Invoice {
    const { itemsDto, transactionDto, ...invoiceData } = dto;
    const invoice = MapperUtil.toEntity(invoiceData, Invoice);

    invoice.transaction = transaction;
    invoice.amount = dto.amount ?? transaction.amount;
    invoice.status = dto.status ?? transaction.status;
    invoice.client = transaction.client;
    invoice.expiresAt = transaction.expiresAt;
    invoice.reason = dto.reason ?? `Applies VAT: ${appliedVat.value}, Bank Charges: ${bankCharges.value}`;

    invoice.items = itemsDto.map(itemDto => this.buildInvoiceItem(itemDto, invoice));

    this.LOGGER.debug('Invoice prepared', {
      transactionId: transaction.id,
      amount: invoice.amount,
      items: invoice.items.map(i => ({ sku: i.sku, name: i.name, totalPrice: i.totalPrice })),
    });

    return invoice;
  }

  private buildInvoiceItem(itemDto: any, invoice: Invoice): InvoiceItem {
    const item = MapperUtil.toEntity(itemDto, InvoiceItem);
    item.sku = itemDto.sku;
    item.invoice = invoice;
    item.totalPrice = Number((item.unitPrice * item.quantity).toFixed(2));
    return item;
  }

  private async saveAndCacheInvoice(invoice: Invoice): Promise<Invoice> {
    const savedInvoice = await this.invoiceRepo.save(invoice);
    this.LOGGER.log(`Invoice saved with ID: ${savedInvoice.id}`);
    await this.cacheManager.set(`invoice:${savedInvoice.id}`, savedInvoice, 3600);
    this.LOGGER.log(`Invoice cached with key: invoice:${savedInvoice.id}`);
    return savedInvoice;
  }

  private mapInvoiceForDto(invoice: Invoice) {
    return {
      id: invoice.id,
      trxnReference: invoice.transaction.trxnReference,
      clientEmail: invoice.client.email,
      amount: invoice.amount,
      status: invoice.status,
      reason: invoice.reason,
      expiresAt: invoice.expiresAt,
      items: invoice.items?.map(item => ({
        sku: item.sku,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })) ?? [],
    };
  }

  private async getFromCache<T>(key: string) {
    return this.cacheManager.get<T>(key);
  }

  private async queryInvoices(filter: FindInvoicesFilter): Promise<[Invoice[], number]> {
    const { trxnReference, untilExpireAt, isFinalState, page = 0, limit = 10, sortBy = 'expiresAt' } = filter;

    const query = this.invoiceRepo
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.transaction', 'transaction')
      .leftJoinAndSelect('invoice.client', 'client')
      .leftJoinAndSelect('invoice.items', 'items')
      .orderBy(`invoice.${sortBy}`, 'DESC');

    if (trxnReference) {
      this.LOGGER.debug('trxnReference', trxnReference)
      query.andWhere('transaction.trxnReference = :trxnReference', { trxnReference });
    }
    if (isFinalState !== undefined) {
      query.andWhere('transaction.isFinalState = :isFinalState', { isFinalState });
    }

    query.skip(page * limit).take(limit);

    return query.getManyAndCount();
  }
}