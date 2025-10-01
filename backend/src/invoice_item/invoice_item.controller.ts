import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IInvoiceItemService } from './interfaces/invoice_item.service.interface';
import {
  CreateInvoiceItemDto,
  InvoiceItemDto,
} from './dto/create-invoice_item.dto';
import { ErrorResponseDto } from 'src/util/interfaces/error-response.interface';

@ApiTags('Invoice Items')
@Controller('invoice-item')
export class InvoiceItemController {
  constructor(
    private readonly invoiceItemService: IInvoiceItemService
  ) { }

  @Post()
  @ApiNotFoundResponse()
  @ApiOperation({ summary: 'Create a new invoice item' })
  @ApiCreatedResponse({ description: 'Item saved successfully' })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async create(@Body() dto: CreateInvoiceItemDto): Promise<{ message: string }> {
    return this.invoiceItemService.create(dto);
  }

  @Get('name/:name')
  @ApiNotFoundResponse()
  @ApiOperation({ summary: 'Get invoice items by name (LIKE search)' })
  @ApiOkResponse({ type: [InvoiceItemDto] })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async getByName(@Param('name') name: string): Promise<InvoiceItemDto[]> {
    return this.invoiceItemService.findByName(name);
  }
}
