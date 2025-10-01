import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { PaymentMethodDto } from './dto/create-payment_method.dto';
import { IPaymentMethodService } from './interfaces/payment_method.service.interface';
import { ErrorResponseDto } from 'src/util/interfaces/error-response.interface';

@ApiTags('Payment Methods')
@Controller('payment-method')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: IPaymentMethodService) { }

  @Get()
  @ApiOperation({ summary: 'Get all payment methods' })
  @ApiOkResponse({
    description: 'List of available payment methods',
    type: [PaymentMethodDto],
  })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async findAll(): Promise<PaymentMethodDto[]> {
    return this.paymentMethodService.findAll();
  }
}
