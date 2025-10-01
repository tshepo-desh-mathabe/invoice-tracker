import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { BankNameDto } from './dto/create-bank_name.dto';
import { IBankNameService } from './interfaces/bank_name.service.interface';
import { ErrorResponseDto } from 'src/util/interfaces/error-response.interface';

@ApiTags('Banks')
@Controller('banks')
export class BankNameController {
  constructor(private readonly bankService: IBankNameService) { }

  // @Post()
  // @ApiOperation({ summary: 'Create a new bank' })
  // @ApiResponse({ status: 201, type: String })
  // async create(@Body() dto: CreateBankNameDto): Promise<string> {
  //   return this.bankService.create(dto);
  // }

  @Get()
  @ApiOperation({ summary: 'Get all banks' })
  @ApiOkResponse({ type: [BankNameDto] })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async findAll(): Promise<BankNameDto[]> {
    return this.bankService.findAll();
  }

  @Get('search/:name')
  @ApiOperation({ summary: 'Search banks by name' })
  @ApiOkResponse({ type: [BankNameDto] })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async findByName(@Param('name') name: string): Promise<BankNameDto[]> {
    return this.bankService.findByName(name);
  }
}
