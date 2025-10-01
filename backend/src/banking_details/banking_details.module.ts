import { Module } from '@nestjs/common';
import { BankingDetailsService } from './banking_details.service';
import { BankingDetailsController } from './banking_details.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IBankingDetailsService } from './interfaces/banking_details.service.interface';
import { BankingDetails } from './entities/banking_detail.entity';
import { BankNameModule } from 'src/bank_name/bank_name.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BankingDetails]),
    BankNameModule
  ],
  controllers: [BankingDetailsController],
  providers: [{
    provide: IBankingDetailsService,
    useClass: BankingDetailsService
  }],
  exports: [IBankingDetailsService]
})
export class BankingDetailsModule {}