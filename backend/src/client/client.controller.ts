import { Controller, Post, Get, Param, Body, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { CreateClientDto, ClientDto } from './dto/create-client.dto';
import { IClientService } from './interfaces/client.service.interface';
import { MapperUtil } from 'src/util/mapper.util';
import { ErrorResponseDto } from 'src/util/interfaces/error-response.interface';

@ApiTags('Clients')
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: IClientService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  @ApiCreatedResponse({ type: String })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async create(@Body() dto: CreateClientDto): Promise<string> {
    return this.clientService.create(dto);
  }

  @Get(':email')
  @ApiOperation({ summary: 'Get client by ID (currently uses email in service)' })
  @ApiOkResponse({ type: ClientDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async findById(@Param('email') email: string): Promise<ClientDto> {
    return MapperUtil.toDto(this.clientService.findByEmail(email), ClientDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all clients or search by email/phone' })
  @ApiOkResponse({ type: [ClientDto] })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async findAll(@Query('term') term?: string,
    @Query('flag') flag?: 'EMAIL' | 'PHONE_NUMBER'
  ): Promise<ClientDto[]> {
    if (term && flag) {
      return this.clientService.findByEmailOrPhone(term, flag);
    }
    throw new BadRequestException('Something is wrong with you request!');
  }
}
