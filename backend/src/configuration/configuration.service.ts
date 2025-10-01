import { Injectable, Inject, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Configuration } from './entities/configuration.entity';
import { IConfigurationService } from './interfaces/configuration.service.interface';

@Injectable()
export class ConfigurationService implements IConfigurationService {
  private readonly LOGGER = new Logger(ConfigurationService.name);

  constructor(
    @InjectRepository(Configuration)
    private readonly configRepo: Repository<Configuration>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) { }

  async getByName(name: string, defaultValue?: string): Promise<Configuration> {
    const cacheKey = `configuration:${name}`;
    const cached = await this.cacheManager.get<Configuration>(cacheKey);

    if (cached) {
      this.LOGGER.log(`Configuration "${name}" fetched from cache`);
      // Only return if active
      if (cached.active) return cached;
      return { ...cached, value: defaultValue ?? '' };
    }

    const config = await this.configRepo.findOne({ where: { name } });

    if (!config) {
      this.LOGGER.warn(`Configuration "${name}" not found, returning default`);
      // Return a Configuration-like object with default value
      return {
        id: 0,
        name,
        value: defaultValue,
        active: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: 'system',
      } as Configuration;
    }

    // Cache it regardless of active status
    await this.cacheManager.set(cacheKey, config, 0);
    this.LOGGER.log(`Configuration "${name}" cached`);

    if (!config.active) {
      // Return with default value if inactive
      return { ...config, value: defaultValue ?? '' };
    }

    return config;
  }

}
