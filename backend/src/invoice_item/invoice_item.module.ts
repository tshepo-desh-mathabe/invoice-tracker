import { Module } from '@nestjs/common';
import { InvoiceItemService } from './invoice_item.service';
import { InvoiceItemController } from './invoice_item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceItem } from './entities/invoice_item.entity';
import { IInvoiceItemService } from './interfaces/invoice_item.service.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvoiceItem])
  ],
  controllers: [InvoiceItemController],
  providers: [{
    provide: IInvoiceItemService,
    useClass: InvoiceItemService
  }],

  exports: [IInvoiceItemService],
})
export class InvoiceItemModule { }
