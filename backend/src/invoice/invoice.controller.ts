import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiNotFoundResponse, ApiOkResponse, ApiQuery, ApiCreatedResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/util/interfaces/error-response.interface';
import { CreateInvoiceDto, InvoiceDto } from './dto/create-invoice.dto';
import { IInvoiceService } from './interfaces/invoice.service.interface';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: IInvoiceService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiCreatedResponse({ description: 'Invoice created successfully', type: InvoiceDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async createInvoice(@Body() dto: CreateInvoiceDto, @Query('flag') flag: boolean = false): Promise<InvoiceDto> {
    return this.invoiceService.create(dto, flag);
  }

  @Get()
  @ApiOperation({ summary: 'Get invoices with optional filters' })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiOkResponse({
    description: 'List of invoices with total count',
    type: [InvoiceDto]
  })
  @ApiQuery({ name: 'trxnReference', required: false, type: String, description: 'Filter by transaction reference' })
  @ApiQuery({ name: 'untilCreateAt', required: false, type: String, description: 'Filter by invoice creation date up to this date (ISO 8601)' })
  @ApiQuery({ name: 'untilExpireAt', required: false, type: String, description: 'Filter by invoice expiration date up to this date (ISO 8601)' })
  @ApiQuery({ name: 'isFinalState', required: false, type: Boolean, description: 'Filter by transaction final state' })
  @ApiQuery({ name: 'paymentMethod', required: false, type: String, enum: ['CASH', 'EFT', 'CREDIT CARD', 'DEBIT CARD', 'CREDIT'], description: 'Filter by transaction payment method' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 0)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, enum: ['createdAt', 'expiresAt'], description: 'Sort by createdAt or expiresAt (default: expiresAt)' })
  async findInvoices(
    @Query('trxnReference') trxnReference?: string,
    @Query('untilCreateAt') untilCreateAt?: string,
    @Query('untilExpireAt') untilExpireAt?: string,
    @Query('isFinalState') isFinalState?: string,
    @Query('page') page = '0',
    @Query('limit') limit = '10',
    @Query('sortBy') sortBy: 'createdAt' | 'expiresAt' = 'expiresAt',
  ): Promise<{ invoices: InvoiceDto[]; total: number }> {
    return this.invoiceService.findInvoices({
      trxnReference,
      untilExpireAt: untilExpireAt ? new Date(untilExpireAt) : undefined,
      isFinalState: isFinalState ? isFinalState === 'true' : undefined,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sortBy,
    });
  }


}
