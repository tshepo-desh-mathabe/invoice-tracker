import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { IInvoiceService } from './interfaces/invoice.service.interface';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from 'src/invoice_item/entities/invoice_item.entity';
import { TransactionModule } from 'src/transaction/transaction.module';
import { InvoiceItemModule } from 'src/invoice_item/invoice_item.module';
import { ConfigurationModule } from 'src/configuration/configuration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceItem]),
    TransactionModule,
    InvoiceItemModule,
    ConfigurationModule,
    InvoiceItemModule
  ],
  controllers: [InvoiceController],
  providers: [
    {
      provide: IInvoiceService,
      useClass: InvoiceService,
    },
    InvoiceService
  ],
  exports: [IInvoiceService],
})

export class InvoiceModule {}
