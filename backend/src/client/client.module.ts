import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { IClientService } from './interfaces/client.service.interface';
import { Client } from './entities/client.entity';
import { BankingDetails } from 'src/banking_details/entities/banking_detail.entity';
import { Invoice } from 'src/invoice/entities/invoice.entity';
import { BankingDetailsModule } from 'src/banking_details/banking_details.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client, BankingDetails, Invoice]),
    BankingDetailsModule
  ],
  controllers: [ClientController],
  providers: [
    {
      provide: IClientService,
      useClass: ClientService,
    },
  ],
  exports: [IClientService],
})
export class ClientModule {}
