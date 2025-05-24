import { IsString, IsDate, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { BillStatus } from '../enums/bill-status.enum';

export class UpdateBillDto {
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
