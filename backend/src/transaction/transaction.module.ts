import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { Transaction } from './entities/transaction.entity';
import { PaymentMethod } from 'src/payment_method/entities/payment_method.entity';
import { ITransactionService } from './interfaces/transaction.service.interface';
import { Configuration } from 'src/configuration/entities/configuration.entity';
import { ClientModule } from 'src/client/client.module';
import { PaymentMethodModule } from 'src/payment_method/payment_method.module';
import { ConfigurationModule } from 'src/configuration/configuration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, PaymentMethod, Configuration]),
    ClientModule,
    ConfigurationModule,
    PaymentMethodModule
  ],
  controllers: [TransactionController],
  providers: [
    {
      provide: ITransactionService,
      useClass: TransactionService,
    },
  ],
  exports: [ITransactionService],
})
export class TransactionModule { }
