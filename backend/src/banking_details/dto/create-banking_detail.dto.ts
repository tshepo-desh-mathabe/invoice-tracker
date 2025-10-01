import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BankNameDto } from 'src/bank_name/dto/create-bank_name.dto';

export class CreateBankingDetailsDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    bankName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    accountNumber: string;
}

export class BankingDetailsDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    bankName: BankNameDto;

    @ApiProperty()
    accountNumber: string;
}
