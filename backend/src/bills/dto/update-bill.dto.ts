import {
  IsNumber,
  IsString,
  IsEnum,
  IsDate,
  Min,
  IsOptional,
} from 'class-validator';
import { PaymentMethod } from '../enums/payment-method.enum';
import { BillStatus } from '../enums/bill-status.enum';
import { Type } from 'class-transformer';

export class UpdateBillDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  month?: number;

  @IsNumber()
  @IsOptional()
  @Min(2000)
  year?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

  @IsEnum(BillStatus)
  @IsOptional()
  status?: BillStatus;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dueDate?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  issueDate?: Date;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  occupantId?: number;
}
