import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateInvoiceItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sku: string;

  @IsString()
  @ApiProperty({ example: 'Milk', description: 'Name of the product' })
  name: string;

  @IsString()
  @ApiProperty({ example: '50g', description: 'Product description' })
  description: string;

  @ApiProperty({ example: 2, description: 'Quantity of the product' })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ example: 199.99, description: 'Unit price of the product' })
  @IsNumber()
  @IsPositive()
  unitPrice: number;

  @ApiProperty({ example: 399.98, description: 'Total price (quantity * unitPrice)' })
  @IsNumber()
  @IsPositive()
  totalPrice: number;
}

export class InvoiceItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  totalPrice: number;
}
