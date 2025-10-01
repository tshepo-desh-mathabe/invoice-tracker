import { PartialType } from '@nestjs/mapped-types';
import { CreateBankNameDto } from './create-bank_name.dto';

export class UpdateBankNameDto extends PartialType(CreateBankNameDto) {}
