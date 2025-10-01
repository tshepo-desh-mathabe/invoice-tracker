import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsNumber, IsPhoneNumber } from 'class-validator';
import { BankingDetailsDto } from 'src/banking_details/dto/create-banking_detail.dto';
import { InvoiceDto } from 'src/invoice/dto/create-invoice.dto';

export class CreateClientDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    @IsString()
    email: string;

    @ApiProperty()
    @IsPhoneNumber()
    @IsNotEmpty()
    @IsString()
    phoneNumber: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    bankName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    accountNumber: string;
}

export class ClientDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    fullName: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    phoneNumber: string;

    @ApiProperty()
    invoiceDtos: InvoiceDto[]

    @ApiProperty()
    bankingDetailsDto: BankingDetailsDto;
}
