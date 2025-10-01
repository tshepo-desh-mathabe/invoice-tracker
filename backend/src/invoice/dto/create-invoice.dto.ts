import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsEnum, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ClientDto } from 'src/client/dto/create-client.dto';
import { CreateInvoiceItemDto, InvoiceItemDto } from 'src/invoice_item/dto/create-invoice_item.dto';
import { CreateTransactionDto } from 'src/transaction/dto/create-transaction.dto';
import { TransactionStatus } from 'src/util/constans';

export class CreateInvoiceDto {
  @ApiProperty()
  @IsString()
  trxnReference: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  clientEmail: string;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @ApiProperty({ enum: TransactionStatus })
  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @ApiProperty({ required: false })
  @IsString()
  reason?: string;

  @ApiProperty({ type: [CreateInvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  itemsDto: CreateInvoiceItemDto[];

  @ApiProperty({ type: () => CreateTransactionDto })
  @ValidateNested()
  @Type(() => CreateTransactionDto)
  transactionDto: CreateTransactionDto;
}

export class InvoiceDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  trxnReference: string;

  @ApiProperty()
  clientDto: ClientDto;

  @ApiProperty()
  amount: number;

  @ApiProperty({ enum: TransactionStatus })
  status: TransactionStatus;

  @ApiProperty({ required: false })
  reason?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty({ type: [InvoiceItemDto] })
  @Type(() => InvoiceItemDto)
  itemsDto: InvoiceItemDto[];
}
