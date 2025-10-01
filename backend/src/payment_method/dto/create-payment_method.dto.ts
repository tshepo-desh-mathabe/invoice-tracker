import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { MethodType } from 'src/util/constans';

export class CreatePaymentMethodDto {
    @ApiProperty({ enum: MethodType })
    @IsNotEmpty()
    @IsEnum(MethodType)
    name: MethodType;
}

export class PaymentMethodDto {
    @ApiProperty()
    id: number;

    @ApiProperty({ enum: MethodType })
    name: MethodType;
}
