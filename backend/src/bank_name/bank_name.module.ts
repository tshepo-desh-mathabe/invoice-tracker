import { Module } from '@nestjs/common';
import { BankNameService } from './bank_name.service';
import { BankNameController } from './bank_name.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankName } from './entities/bank_name.entity';
import { IBankNameService } from './interfaces/bank_name.service.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([BankName]),
  ],
  controllers: [BankNameController],
  providers: [
    {
      provide: IBankNameService,
      useClass: BankNameService,
    }
  ],
  exports: [IBankNameService],
})
export class BankNameModule { }
