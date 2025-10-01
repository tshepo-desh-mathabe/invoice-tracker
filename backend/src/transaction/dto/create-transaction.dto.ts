import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ClientDto } from 'src/client/dto/create-client.dto';
import { PaymentMethodDto } from 'src/payment_method/dto/create-payment_method.dto';
import { MethodType, TransactionStatus } from 'src/util/constans';

export class CreateTransactionDto {
    @ApiProperty()
    @IsString()
    trxnReference: string;
    
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    client: string;

    @ApiProperty()
    @IsNumber({ maxDecimalPlaces: 2 })
    amount: number;

    @ApiProperty({ enum: MethodType })
    @IsEnum(MethodType)
    paymentMethod: MethodType;

    @IsEnum(TransactionStatus)
    @ApiProperty({ enum: TransactionStatus })
    status: TransactionStatus;
}

export class TransactionDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    trxnReference: string

    @ApiProperty()
    client: ClientDto;

    @ApiProperty()
    amount: number;

    @ApiProperty()
    paymentMethod: PaymentMethodDto;

    @ApiProperty({ enum: TransactionStatus })
    status: TransactionStatus;

    @ApiProperty()
    isFinalState: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty()
    expiresAt?: Date;
}
