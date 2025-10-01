import { Module } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { IConfigurationService } from './interfaces/configuration.service.interface';
import { Configuration } from './entities/configuration.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Configuration]),
  ],
  providers: [
    {
      provide: IConfigurationService,
      useClass: ConfigurationService
    }
  ],
  exports: [IConfigurationService]
})
export class ConfigurationModule { }
