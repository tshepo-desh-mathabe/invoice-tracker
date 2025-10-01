import { Module } from '@nestjs/common';
import { PaymentMethodService } from './payment_method.service';
import { PaymentMethodController } from './payment_method.controller';
import { PaymentMethod } from './entities/payment_method.entity';
import { IPaymentMethodService } from './interfaces/payment_method.service.interface';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentMethod])
  ],
  controllers: [PaymentMethodController],
  providers: [
    {
      provide: IPaymentMethodService,
      useClass: PaymentMethodService
    }
  ],
  exports: [IPaymentMethodService]
})
export class PaymentMethodModule { }