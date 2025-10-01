import { PartialType } from '@nestjs/swagger';
import { CreateInvoiceItemDto } from './create-invoice_item.dto';

export class UpdateInvoiceItemDto extends PartialType(CreateInvoiceItemDto) { }
