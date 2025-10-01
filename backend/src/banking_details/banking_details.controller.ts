import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse } from '@nestjs/swagger';
import { BankingDetailsDto, CreateBankingDetailsDto } from './dto/create-banking_detail.dto';
import { IBankingDetailsService } from './interfaces/banking_details.service.interface';
import { MapperUtil } from 'src/util/mapper.util';
import { ErrorResponseDto } from 'src/util/interfaces/error-response.interface';

@ApiTags('Banking Details')
@Controller('banking-details')
export class BankingDetailsController {
  constructor(private readonly bankingDetailsService: IBankingDetailsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new bank account' })
  @ApiCreatedResponse({ type: String })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async create(@Body() dto: CreateBankingDetailsDto): Promise<string> {
    const bankDetails = await this.bankingDetailsService.create(dto)
    return (`Bank account ${bankDetails.accountNumber} created successfully.`)
  }

  @Get(':accountNumber')
  @ApiOperation({ summary: 'Find bank account by account number' })
  @ApiParam({ name: 'accountNumber', type: String, description: 'The bank account number' })
  @ApiOkResponse({ type: BankingDetailsDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async findByAccountNumber(@Param('accountNumber') accountNumber: string): Promise<BankingDetailsDto> {
    const bankDetails = await this.bankingDetailsService.findByAccountNumber(accountNumber);
    return MapperUtil.toDto(bankDetails, BankingDetailsDto);
  }
}
