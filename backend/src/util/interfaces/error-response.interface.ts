import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
    @ApiProperty()
    message: object;

    @ApiProperty()
    error: string;

    @ApiProperty()
    statusCode: number;
}
