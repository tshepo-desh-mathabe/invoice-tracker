import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { ITransactionService } from './interfaces/transaction.service.interface';
import { CreateTransactionDto, TransactionDto } from './dto/create-transaction.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { MapperUtil } from 'src/util/mapper.util';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ErrorResponseDto } from 'src/util/interfaces/error-response.interface';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: ITransactionService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiCreatedResponse({ description: 'Transaction created successfully' })
  async create(@Body() dto: CreateTransactionDto): Promise<{ trxnReference: string }> {
    const trxnReference = await this.transactionService.create(dto);
    return { trxnReference };
  }

  @Get(':trxnReference')
  @ApiOperation({ summary: 'Get a transaction by its reference' })
  @ApiParam({ name: 'trxnReference', description: 'Transaction reference string' })
  @ApiOkResponse({ description: 'Transaction found', type: TransactionDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async findByReference(@Param('trxnReference') trxnReference: string): Promise<TransactionDto> {
    const trxn = await this.transactionService.findByReference(trxnReference);
    return MapperUtil.toDto(trxn, TransactionDto);
  }

  @Put()
  @ApiOperation({ summary: 'Update transaction by reference' })
  @ApiParam({ name: 'trxnReference', description: 'Transaction reference string' })
  @ApiBody({ type: UpdateTransactionDto, description: 'Partial transaction data to update' })
  @ApiOkResponse({ description: 'Transaction updated successfully', type: TransactionDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async updateByReference(@Body() updateData: UpdateTransactionDto): Promise<TransactionDto> {
    const updated = await this.transactionService.updateByReference(updateData);
    return MapperUtil.toDto(updated, TransactionDto);
  }
}
