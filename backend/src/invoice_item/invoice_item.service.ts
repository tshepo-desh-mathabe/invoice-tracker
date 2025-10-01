import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InvoiceItem } from './entities/invoice_item.entity';
import { CreateInvoiceItemDto, InvoiceItemDto } from './dto/create-invoice_item.dto';
import { MapperUtil } from 'src/util/mapper.util';
import { IInvoiceItemService } from './interfaces/invoice_item.service.interface';

@Injectable()
export class InvoiceItemService implements IInvoiceItemService {
  private readonly LOGGER = new Logger(InvoiceItemService.name);

  constructor(
    @InjectRepository(InvoiceItem)
    private readonly itemRepo: Repository<InvoiceItem>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) { }

  async create(dto: CreateInvoiceItemDto): Promise<{ message: string }> {
    this.LOGGER.log(`Creating invoice item with SKU: ${dto.sku} and name: ${dto.name}`);

    const entity = MapperUtil.toEntity(dto, InvoiceItem);
    const saved = await this.itemRepo.save(entity);

    await this.cacheManager.set(`invoiceItem:sku:${saved.sku}`, saved, 0);
    this.LOGGER.log(`Invoice item saved and cached with SKU: ${saved.sku}`);

    return { message: `Invoice item "${dto.name}" saved successfully.` };
  }

  async createBulk(dtos: CreateInvoiceItemDto[]): Promise<InvoiceItem[]> {
    this.LOGGER.log(`Creating ${dtos.length} invoice items in bulk`);

    const entities = MapperUtil.toEntityList(dtos, InvoiceItem);

    const savedItems = await this.itemRepo.save(entities);

    for (const item of savedItems) {
      await this.cacheManager.set(`invoiceItem:sku:${item.sku}`, item, 0);
    }

    this.LOGGER.log(`Saved and cached ${savedItems.length} invoice items successfully`);

    return savedItems;
  }




  async findBySku(sku: string): Promise<InvoiceItem> {
    const cacheKey = `invoiceItem:sku:${sku}`;
    const cachedInvoiceItem: InvoiceItem | undefined = await this.cacheManager.get(cacheKey);
    if (cachedInvoiceItem) {
      this.LOGGER.log(`Invoice item fetched from cache for SKU: ${sku}`);
      return cachedInvoiceItem;
    }

    const item = await this.itemRepo.findOne({ where: { sku } });
    if (!item) {
      this.LOGGER.warn(`Invoice item with SKU ${sku} not found`);
      throw new NotFoundException(`Item with SKU ${sku} not found.`);
    }

    await this.cacheManager.set(cacheKey, item, 0);
    this.LOGGER.log(`Invoice item cached for SKU: ${sku}`);

    return item;
  }

  async findByName(name: string): Promise<InvoiceItemDto[]> {
    const cacheKey = `invoiceItem:name:${name.toLowerCase()}`;
    const cached: InvoiceItemDto[] | undefined = await this.cacheManager.get(cacheKey);
    if (cached) {
      this.LOGGER.log(`Invoice items fetched from cache for name: ${name}`);
      return cached;
    }

    const items = await this.itemRepo
      .createQueryBuilder('item')
      .where('item.name ILIKE :name', { name: `%${name}%` })
      .getMany();

    if (!items.length) {
      this.LOGGER.warn(`No invoice items found matching name: ${name}`);
      throw new NotFoundException(`No items found matching "${name}".`);
    }

    const dtos = MapperUtil.toDtoList(items, InvoiceItemDto);
    await this.cacheManager.set(cacheKey, dtos, 0);
    this.LOGGER.log(`Invoice items cached for name: ${name}`);

    return dtos;
  }
}
