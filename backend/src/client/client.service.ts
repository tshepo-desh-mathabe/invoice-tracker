import { Injectable, Inject, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Client } from './entities/client.entity';
import { MapperUtil } from 'src/util/mapper.util';
import { CreateClientDto, ClientDto } from './dto/create-client.dto';
import { IClientService } from './interfaces/client.service.interface';
import { IBankingDetailsService } from 'src/banking_details/interfaces/banking_details.service.interface';

@Injectable()
export class ClientService implements IClientService {
  private readonly LOGGER = new Logger(ClientService.name);

  constructor(
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
    private readonly bankDetailsService: IBankingDetailsService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) { }

  async create(dto: CreateClientDto): Promise<string> {
    // Create bank details -- start
    let bankAccountDetails;
    try {
      bankAccountDetails = await this.bankDetailsService.findByAccountNumber(dto.accountNumber);
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.LOGGER.error(error.message);
        throw new BadRequestException('Somethis went wrong with this request.');
      }
    }

    this.LOGGER.debug('Current Bank Account Details:', bankAccountDetails);
    if (!bankAccountDetails) {
      // Creating user banking details
      try {
        bankAccountDetails = await this.bankDetailsService.create({
          bankName: dto.bankName,
          accountNumber: dto.accountNumber
        });

      } catch (error) {
        if (error instanceof NotFoundException) {
          this.LOGGER.error(error.message);
          throw new BadRequestException('Something went wrong creating client.');
        }
      }
    }
    // Create bank details -- end
    this.LOGGER.log(`Attempting to create client with email: ${dto.email}`);
    const existingClient = await this.findByEmail(dto.email).catch(() => {
      this.LOGGER.log(`No existing client found with email: ${dto.email}`);
      return null;
    });

    if (existingClient) {
      this.LOGGER.warn(`Client with email ${dto.email} already exists.`);
      return `User with email ${dto.email} already exists.`;
    }

    const client = MapperUtil.toEntity(dto, Client);
    client.bankingDetails = bankAccountDetails
    const saved = await this.clientRepo.save(client);
    this.LOGGER.log(`Client with email ${dto.email} saved successfully.`);

    // Cache indefinitely
    await this.cacheManager.set(`client:${saved.email}`, saved, 0);

    return `User with email ${dto.email} created successfully.`;
  }

  async findByEmail(email: string): Promise<Client> {
    const cacheKey = `client:${email.toLowerCase()}`;
    const cached = await this.cacheManager.get<Client>(cacheKey);

    if (cached) {
      this.LOGGER.log(`Client fetched from cache for email: ${email}`);
      return cached;
    }

    const client = await this.clientRepo.findOne({ where: { email } });
    if (!client) {
      this.LOGGER.warn(`Client with email ${email} not found.`);
      throw new NotFoundException(`Client with email "${email}" not found.`);
    }

    await this.cacheManager.set(cacheKey, client, 9000);
    this.LOGGER.log(`Client with email ${email} cached.`);

    return client;
  }

  async findByEmailOrPhone(term: string, flag?: 'EMAIL' | 'PHONE_NUMBER'): Promise<ClientDto[]> {
      this.LOGGER.warn(`Invalid flag provided: ${flag}`);
    if (!flag || (flag !== 'EMAIL' && flag !== 'PHONE_NUMBER')) {
      this.LOGGER.warn(`Invalid flag provided: ${flag}`);
      return [];
    }

    const cacheKey = `client:search:${flag}:${term.toLowerCase()}`;
    const cached = await this.cacheManager.get<Client[]>(cacheKey);

    if (cached) {
      this.LOGGER.log(`Search result fetched from cache for ${flag}: ${term}`);
      return MapperUtil.toDtoList(cached, ClientDto);
    }

    const query = this.clientRepo.createQueryBuilder('client');
    if (flag === 'EMAIL') {
      query.where('client.email ILIKE :term', { term: `%${term}%` });
    } else {
      query.where('client.phone_number ILIKE :term', { term: `%${term}%` });
    }

    const clients = await query.getMany();

    if (!clients.length) {
      this.LOGGER.warn(`No clients found with ${flag} like "${term}"`);
      throw new NotFoundException(`No clients found with ${flag} like "${term}"`);
    }

    // Cache entities instead of DTOs
    await this.cacheManager.set(cacheKey, clients, 9000);

    this.LOGGER.log(`Search result cached for ${flag}: ${term}`);
    return MapperUtil.toDtoList(clients, ClientDto);
  }

}
