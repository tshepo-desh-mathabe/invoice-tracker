import { PartialType } from '@nestjs/mapped-types';
import { CreateBankingDetailsDto } from './create-banking_detail.dto';

export class UpdateBankingDetailDto extends PartialType(CreateBankingDetailsDto) {}
