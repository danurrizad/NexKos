import {
  IsString,
  IsDate,
  IsOptional,
  IsEnum,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BillStatus } from '../enums/bill-status.enum';

export class UpdateBillDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  billingPeriod?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dueDate?: Date;

  @IsString()
  @IsOptional()
  note?: string;

  @IsOptional()
  @IsEnum(BillStatus)
  status?: BillStatus;
}
